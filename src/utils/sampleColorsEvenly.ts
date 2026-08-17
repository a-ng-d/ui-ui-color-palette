export const sampleColorsEvenly = <T>(items: T[], maxCount: number): T[] => {
  if (maxCount <= 0 || items.length === 0) return []
  if (items.length <= maxCount) return items

  const step = items.length / maxCount
  return Array.from(
    { length: maxCount },
    (_, index) => items[Math.floor(index * step)]
  )
}
