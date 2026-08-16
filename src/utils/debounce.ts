export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number
): ((...args: Args) => void) & { cancel: () => void } => {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: Args) => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, delayMs)
  }

  debounced.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  return debounced
}
