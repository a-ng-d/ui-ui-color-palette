export const getDocumentAttribute = (name: string): string | null =>
  typeof document !== 'undefined'
    ? document.documentElement.getAttribute(name)
    : null
