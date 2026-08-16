export interface ShadeContrastScoreEntry {
  scaleName: string
  shadeIndex: number
  lightWCAG: number
  darkWCAG: number
  lightAPCA: number
  darkAPCA: number
}

export interface ContrastRange {
  min: number
  max: number
  range: number
}

export interface ContrastColumnRanges {
  scaleName: string
  shadeIndex: number
  lightWCAG: ContrastRange
  darkWCAG: ContrastRange
  lightAPCA: ContrastRange
  darkAPCA: ContrastRange
}

export const getContrastRangesByColumn = (
  scores: ShadeContrastScoreEntry[],
  options?: {
    calculateWCAG?: boolean
    calculateAPCA?: boolean
  }
): Map<string, ContrastColumnRanges> => {
  const shouldCalculateWCAG = options?.calculateWCAG ?? true
  const shouldCalculateAPCA = options?.calculateAPCA ?? true

  const rangesByColumn = new Map<string, ContrastColumnRanges>()

  const groupedByScale = new Map<
    string,
    {
      scaleName: string
      shadeIndex: number
      scores: ShadeContrastScoreEntry[]
    }
  >()

  scores.forEach((score) => {
    const key = score.scaleName
    if (!groupedByScale.has(key))
      groupedByScale.set(key, {
        scaleName: score.scaleName,
        shadeIndex: score.shadeIndex,
        scores: [],
      })
    const group = groupedByScale.get(key)
    if (group) group.scores.push(score)
  })

  groupedByScale.forEach((group, scaleName) => {
    if (group.scores.length === 0) return

    let lightWCAGMin = 0,
      lightWCAGMax = 0,
      darkWCAGMin = 0,
      darkWCAGMax = 0
    let lightAPCAMin = 0,
      lightAPCAMax = 0,
      darkAPCAMin = 0,
      darkAPCAMax = 0

    if (shouldCalculateWCAG) {
      const lightWCAGScores = group.scores
        .map((s) => s.lightWCAG)
        .filter((s) => s > 0)
      const darkWCAGScores = group.scores
        .map((s) => s.darkWCAG)
        .filter((s) => s > 0)

      if (lightWCAGScores.length > 0) {
        lightWCAGMin = Math.min(...lightWCAGScores)
        lightWCAGMax = Math.max(...lightWCAGScores)
      }
      if (darkWCAGScores.length > 0) {
        darkWCAGMin = Math.min(...darkWCAGScores)
        darkWCAGMax = Math.max(...darkWCAGScores)
      }
    }

    if (shouldCalculateAPCA) {
      const lightAPCAScores = group.scores.map((s) => s.lightAPCA)
      const darkAPCAScores = group.scores.map((s) => s.darkAPCA)

      if (lightAPCAScores.length > 0) {
        lightAPCAMin = Math.min(...lightAPCAScores)
        lightAPCAMax = Math.max(...lightAPCAScores)
      }
      if (darkAPCAScores.length > 0) {
        darkAPCAMin = Math.min(...darkAPCAScores)
        darkAPCAMax = Math.max(...darkAPCAScores)
      }
    }

    rangesByColumn.set(scaleName, {
      scaleName: group.scaleName,
      shadeIndex: group.shadeIndex,
      lightWCAG: {
        min: lightWCAGMin,
        max: lightWCAGMax,
        range: lightWCAGMax - lightWCAGMin,
      },
      darkWCAG: {
        min: darkWCAGMin,
        max: darkWCAGMax,
        range: darkWCAGMax - darkWCAGMin,
      },
      lightAPCA: {
        min: lightAPCAMin,
        max: lightAPCAMax,
        range: lightAPCAMax - lightAPCAMin,
      },
      darkAPCA: {
        min: darkAPCAMin,
        max: darkAPCAMax,
        range: darkAPCAMax - darkAPCAMin,
      },
    })
  })

  return rangesByColumn
}
