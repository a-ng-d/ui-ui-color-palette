export const rafThrottle = <Args extends unknown[]>(
  fn: (...args: Args) => void
): ((...args: Args) => void) & { cancel: () => void } => {
  let frameId: number | undefined
  let pendingArgs: Args | undefined

  const throttled = (...args: Args) => {
    pendingArgs = args
    if (frameId !== undefined) return
    frameId = requestAnimationFrame(() => {
      frameId = undefined
      const latestArgs = pendingArgs
      pendingArgs = undefined
      if (latestArgs) fn(...latestArgs)
    })
  }

  throttled.cancel = () => {
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId)
      frameId = undefined
    }
    pendingArgs = undefined
  }

  return throttled
}
