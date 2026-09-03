import { SystemConfiguration } from '@yelbolt/engine-ui-color-palette'

export const readSystem = (id: string): SystemConfiguration => {
  const raw = window.localStorage.getItem(`palette_${id}_system`)

  if (!raw) return { schema: { groups: [] }, bindings: [] }

  return JSON.parse(raw)
}

export const writeSystem = (id: string, system: SystemConfiguration): void => {
  window.localStorage.setItem(`palette_${id}_system`, JSON.stringify(system))
}
