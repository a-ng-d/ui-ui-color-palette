import { uid } from 'uid'
import {
  SystemConfiguration,
  TaxonomyBinding,
  TaxonomySchema,
} from '@yelbolt/engine-ui-color-palette'
import { StructurePatch } from '../types/structureChat'
import mergeBindings, { arePathsEqual, isRefValid } from './mergeBindings'

const PLACEHOLDER_PREFIX = 'new:'

export interface StructurePaletteScope {
  colors: Array<{ id: string }>
  stops: Array<string | number>
}

export interface ApplyStructurePatchResult {
  system: SystemConfiguration
  applied: number
  skipped: number
  schemaChanged: boolean
  pruned: number
}

export interface StructurePatchSummary {
  groupsAdded: number
  groupsRemoved: number
  membersAdded: number
  membersChanged: number
  bindingsUpserted: number
  bindingsRemoved: number
  bindingsPruned: number
}

const isPlaceholder = (id: string): boolean => id.startsWith(PLACEHOLDER_PREFIX)

const isPathValid = (path: Array<string>, schema: TaxonomySchema): boolean =>
  path.length === schema.groups.length &&
  path.every((segment, i) =>
    schema.groups[i].members.some((member) => member.id === segment)
  )

const resolvePlaceholders = (patch: StructurePatch): StructurePatch => {
  const ids = new Map<string, string>()
  const resolve = (id: string): string => {
    if (!isPlaceholder(id)) return id
    if (!ids.has(id)) ids.set(id, uid())
    return ids.get(id) as string
  }

  return {
    ...(patch.schema !== undefined
      ? {
          schema: {
            groups: patch.schema.groups.map((group) => ({
              ...group,
              id: resolve(group.id),
              members: group.members.map((member) => ({
                ...member,
                id: resolve(member.id),
              })),
            })),
          },
        }
      : {}),
    ...(patch.bindings !== undefined
      ? {
          bindings: {
            ...(patch.bindings.upsert !== undefined
              ? {
                  upsert: patch.bindings.upsert.map((entry) => ({
                    ...entry,
                    path: entry.path.map(resolve),
                  })),
                }
              : {}),
            ...(patch.bindings.remove !== undefined
              ? { remove: patch.bindings.remove.map((p) => p.map(resolve)) }
              : {}),
          },
        }
      : {}),
  }
}

const isStringArray = (value: unknown): value is Array<string> =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const sanitizeStructurePatch = (raw: unknown): StructurePatch | null => {
  if (!isRecord(raw)) return null

  const patch: StructurePatch = {}

  if (raw.schema !== undefined && raw.schema !== null) {
    if (!isRecord(raw.schema) || !Array.isArray(raw.schema.groups)) return null

    const ids = new Set<string>()
    const groups: TaxonomySchema['groups'] = []

    for (const group of raw.schema.groups as Array<unknown>) {
      if (
        !isRecord(group) ||
        typeof group.id !== 'string' ||
        typeof group.name !== 'string' ||
        !Array.isArray(group.members) ||
        ids.has(group.id)
      )
        return null
      ids.add(group.id)

      const members: TaxonomySchema['groups'][number]['members'] = []
      for (const member of group.members as Array<unknown>) {
        if (
          !isRecord(member) ||
          typeof member.id !== 'string' ||
          typeof member.name !== 'string' ||
          ids.has(member.id)
        )
          return null
        ids.add(member.id)
        members.push({ id: member.id, name: member.name })
      }
      if (members.length === 0) return null
      if (
        new Set(members.map((m) => m.name.trim().toLowerCase())).size !==
        members.length
      )
        return null
      groups.push({ id: group.id, name: group.name, members })
    }
    if (groups.length === 0) return null
    if (
      new Set(groups.map((g) => g.name.trim().toLowerCase())).size !==
      groups.length
    )
      return null
    patch.schema = { groups }
  }

  if (raw.bindings !== undefined && raw.bindings !== null) {
    if (!isRecord(raw.bindings)) return null
    const bindings: NonNullable<StructurePatch['bindings']> = {}

    if (raw.bindings.upsert !== undefined) {
      if (!Array.isArray(raw.bindings.upsert)) return null
      const upsert: NonNullable<typeof bindings.upsert> = []
      for (const entry of raw.bindings.upsert as Array<unknown>) {
        if (
          !isRecord(entry) ||
          !isStringArray(entry.path) ||
          (entry.ref !== undefined && typeof entry.ref !== 'string') ||
          (entry.description !== undefined &&
            typeof entry.description !== 'string') ||
          (entry.isExcluded !== undefined &&
            typeof entry.isExcluded !== 'boolean')
        )
          return null
        upsert.push({
          path: entry.path,
          ...(entry.ref !== undefined ? { ref: entry.ref } : {}),
          ...(entry.description !== undefined
            ? { description: entry.description }
            : {}),
          ...(entry.isExcluded !== undefined
            ? { isExcluded: entry.isExcluded }
            : {}),
        })
      }
      bindings.upsert = upsert
    }

    if (raw.bindings.remove !== undefined) {
      if (
        !Array.isArray(raw.bindings.remove) ||
        !(raw.bindings.remove as Array<unknown>).every(isStringArray)
      )
        return null
      bindings.remove = raw.bindings.remove as Array<Array<string>>
    }
    patch.bindings = bindings
  }

  return patch.schema === undefined && patch.bindings === undefined
    ? null
    : patch
}

export const summarizeStructurePatch = (
  system: SystemConfiguration,
  patch: StructurePatch
): StructurePatchSummary => {
  const summary: StructurePatchSummary = {
    groupsAdded: 0,
    groupsRemoved: 0,
    membersAdded: 0,
    membersChanged: 0,
    bindingsUpserted: patch.bindings?.upsert?.length ?? 0,
    bindingsRemoved: patch.bindings?.remove?.length ?? 0,
    bindingsPruned: 0,
  }

  if (patch.schema !== undefined) {
    const nextSchema = patch.schema
    summary.bindingsPruned = (system.bindings ?? []).filter(
      (binding) => !isPathValid(binding.path, nextSchema)
    ).length
    summary.groupsRemoved = system.schema.groups.filter(
      (group) => !patch.schema?.groups.some((item) => item.id === group.id)
    ).length

    const currentGroups = new Map(
      system.schema.groups.map((group) => [group.id, group])
    )

    patch.schema.groups.forEach((group) => {
      const current = currentGroups.get(group.id)

      if (current === undefined) {
        summary.groupsAdded++
        summary.membersAdded += group.members.length
        return
      }

      const currentMembers = new Map(
        current.members.map((member) => [member.id, member])
      )
      group.members.forEach((member) => {
        const currentMember = currentMembers.get(member.id)
        if (currentMember === undefined) summary.membersAdded++
        else if (currentMember.name !== member.name) summary.membersChanged++
      })
      currentMembers.forEach((_, id) => {
        if (!group.members.some((member) => member.id === id))
          summary.membersChanged++
      })
    })
  }

  return summary
}

const applyStructurePatch = (
  system: SystemConfiguration,
  patch: StructurePatch,
  palette: StructurePaletteScope
): ApplyStructurePatchResult => {
  const resolved = resolvePlaceholders(patch)
  const colorIds = new Set(palette.colors.map((color) => color.id))
  const stops = new Set(palette.stops.map((stop) => stop.toString()))

  let applied = 0
  let skipped = 0
  let pruned = 0
  let schema = system.schema
  let bindings: Array<TaxonomyBinding> = system.bindings ?? []

  if (resolved.schema !== undefined) {
    schema = resolved.schema
    const nextSchema = schema
    const before = bindings.length
    bindings = bindings.filter((binding) =>
      isPathValid(binding.path, nextSchema)
    )
    pruned = before - bindings.length
  }

  const upserts = (resolved.bindings?.upsert ?? []).filter((entry) => {
    const isValid =
      isPathValid(entry.path, schema) &&
      (entry.ref === undefined || isRefValid(entry.ref, colorIds, stops))
    if (isValid) applied++
    else skipped++
    return isValid
  })
  bindings = mergeBindings(bindings, upserts, { descriptionMode: 'OVERWRITE' })
  ;(resolved.bindings?.remove ?? []).forEach((path) => {
    const before = bindings.length
    bindings = bindings.filter((binding) => !arePathsEqual(binding.path, path))
    if (bindings.length < before) applied++
    else skipped++
  })

  const schemaChanged = JSON.stringify(schema) !== JSON.stringify(system.schema)

  return {
    system: { ...system, schema, bindings },
    applied,
    skipped,
    schemaChanged,
    pruned,
  }
}

export default applyStructurePatch
