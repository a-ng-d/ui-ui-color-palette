export const CREDITS_TWEEN_DURATION = 700
export const CREDITS_BADGE_DURATION = 1200

export const easeOutCubic = (t: number): number => {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - clamped, 3)
}

export const interpolateCredits = (
  from: number,
  to: number,
  progress: number
): number => from + (to - from) * easeOutCubic(progress)

export const displayedCredits = (
  from: number,
  to: number,
  elapsed: number,
  duration: number = CREDITS_TWEEN_DURATION
): number => {
  if (duration <= 0 || elapsed >= duration) return to
  return Math.round(interpolateCredits(from, to, elapsed / duration))
}
