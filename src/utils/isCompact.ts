export const MOBILE_BREAKPOINT = 460
export const COMPACT_BREAKPOINT = 1280

export const resolveIsMobile = (documentWidth: number): boolean =>
  documentWidth < MOBILE_BREAKPOINT

export const resolveIsCompact = (documentWidth: number): boolean =>
  documentWidth >= MOBILE_BREAKPOINT && documentWidth < COMPACT_BREAKPOINT
