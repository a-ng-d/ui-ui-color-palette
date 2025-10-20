import colorNames from 'color-names'
import chroma from 'chroma-js'

export function getClosestColorName(hexColor: string): string {
  const normalizedHex = hexColor.startsWith('#') ? hexColor : `#${hexColor}`

  const colorDict = colorNames as Record<string, string>
  if (colorDict[normalizedHex.toLowerCase()])
    return colorDict[normalizedHex.toLowerCase()]

  try {
    const inputColor = chroma(normalizedHex)
    const inputLab = inputColor.lab()

    let closestDistance = Infinity
    let closestName = normalizedHex.toUpperCase().replace('#', '')

    for (const [hex, name] of Object.entries(colorDict))
      try {
        const candidateColor = chroma(hex)
        const candidateLab = candidateColor.lab()

        const distance = Math.sqrt(
          Math.pow(inputLab[0] - candidateLab[0], 2) +
            Math.pow(inputLab[1] - candidateLab[1], 2) +
            Math.pow(inputLab[2] - candidateLab[2], 2)
        )

        if (distance < closestDistance) {
          closestDistance = distance
          closestName = name
        }
      } catch (error) {
        continue
      }

    return closestName
  } catch (error) {
    console.error(error)
    return normalizedHex.toUpperCase().replace('#', '')
  }
}
