export const getPortalTarget = (id: string): HTMLElement | null =>
  typeof document !== 'undefined' ? document.getElementById(id) : null
