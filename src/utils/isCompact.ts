export const COMPACT_BREAKPOINT = 1280

export const resolveIsCompact = (documentWidth: number): boolean =>
  documentWidth < COMPACT_BREAKPOINT
