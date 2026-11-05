import { TaxonomyBinding } from '@yelbolt/engine-ui-color-palette'
import { EMPTY_REF_VALUE } from './emptyRef'

export interface BindingPatch {
  path: Array<string>
  ref?: string
  description?: string
  isExcluded?: boolean
}

export interface MergeBindingsOptions {
  descriptionMode?: 'OVERWRITE' | 'FILL_EMPTY'
}

export const arePathsEqual = (a: Array<string>, b: Array<string>): boolean =>
  a.length === b.length && a.every((segment, i) => segment === b[i])

export const makePathKey = (path: Array<string>): string => path.join('|')

export const isRefValid = (
  ref: string,
  colorIds: Set<string>,
  stops: Set<string>
): boolean => {
  const separatorIndex = ref.indexOf(':')
  if (separatorIndex === -1) return false

  return (
    colorIds.has(ref.slice(0, separatorIndex)) &&
    stops.has(ref.slice(separatorIndex + 1))
  )
}

const mergeOne = (
  binding: TaxonomyBinding,
  patch: BindingPatch,
  descriptionMode: 'OVERWRITE' | 'FILL_EMPTY'
): TaxonomyBinding => {
  const next: TaxonomyBinding = { ...binding }

  if (patch.ref !== undefined) next.ref = patch.ref
  if (patch.isExcluded !== undefined) next.isExcluded = patch.isExcluded
  if (patch.description !== undefined)
    if (descriptionMode === 'OVERWRITE' || !binding.description)
      next.description = patch.description

  return next
}

const mergeBindings = (
  bindings: Array<TaxonomyBinding>,
  patches: Array<BindingPatch>,
  options: MergeBindingsOptions = {}
): Array<TaxonomyBinding> => {
  const descriptionMode = options.descriptionMode ?? 'OVERWRITE'
  const next = [...bindings]
  const indexByKey = new Map<string, number>()

  next.forEach((binding, index) =>
    indexByKey.set(makePathKey(binding.path), index)
  )

  patches.forEach((patch) => {
    const key = makePathKey(patch.path)
    const index = indexByKey.get(key)

    if (index === undefined) {
      indexByKey.set(key, next.length)
      next.push(
        mergeOne(
          { path: patch.path, ref: EMPTY_REF_VALUE },
          patch,
          descriptionMode
        )
      )
    } else next[index] = mergeOne(next[index], patch, descriptionMode)
  })

  return next
}

export default mergeBindings
