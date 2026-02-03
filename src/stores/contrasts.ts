import { map } from 'nanostores'

export interface ContrastScore {
  colorId: string
  colorName: string
  scaleName: string
  shadeIndex: number
  lightWCAG: number
  darkWCAG: number
  lightAPCA: number
  darkAPCA: number
  lightWCAGFriendly: string
  darkWCAGFriendly: string
}

export const $contrastScores = map<Record<string, ContrastScore>>({})

export const setContrastScore = (score: ContrastScore) => {
  const key = `${score.colorId}-${score.shadeIndex}`
  const currentScores = $contrastScores.get()

  const existingScore = currentScores[key]
  if (existingScore) {
    const hasChanged =
      existingScore.lightWCAG !== score.lightWCAG ||
      existingScore.darkWCAG !== score.darkWCAG ||
      existingScore.lightAPCA !== score.lightAPCA ||
      existingScore.darkAPCA !== score.darkAPCA

    if (!hasChanged) return
  }

  $contrastScores.setKey(key, score)
}

export const removeContrastScore = (colorId: string, shadeIndex: number) => {
  const key = `${colorId}-${shadeIndex}`
  const currentScores = $contrastScores.get()
  const newScores = { ...currentScores }
  delete newScores[key]
  $contrastScores.set(newScores)
}

export const clearContrastScores = () => {
  $contrastScores.set({})
}

export const getContrastScore = (
  colorId: string,
  shadeIndex: number
): ContrastScore | undefined => {
  const key = `${colorId}-${shadeIndex}`
  return $contrastScores.get()[key]
}

export const getAllContrastScores = (): ContrastScore[] => {
  return Object.values($contrastScores.get())
}

export const getContrastRangesByColumn = (): Map<
  string,
  {
    scaleName: string
    shadeIndex: number
    lightWCAG: { min: number; max: number; range: number }
    darkWCAG: { min: number; max: number; range: number }
    lightAPCA: { min: number; max: number; range: number }
    darkAPCA: { min: number; max: number; range: number }
  }
> => {
  const allScores = getAllContrastScores()
  const rangesByColumn = new Map<
    string,
    {
      scaleName: string
      shadeIndex: number
      lightWCAG: { min: number; max: number; range: number }
      darkWCAG: { min: number; max: number; range: number }
      lightAPCA: { min: number; max: number; range: number }
      darkAPCA: { min: number; max: number; range: number }
    }
  >()

  const groupedByScale = new Map<
    string,
    {
      scaleName: string
      shadeIndex: number
      scores: ContrastScore[]
    }
  >()

  allScores.forEach((score) => {
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
    const lightWCAGScores = group.scores.map((s) => s.lightWCAG)
    const darkWCAGScores = group.scores.map((s) => s.darkWCAG)
    const lightAPCAScores = group.scores.map((s) => s.lightAPCA)
    const darkAPCAScores = group.scores.map((s) => s.darkAPCA)

    if (lightWCAGScores.length > 0) {
      const lightWCAGMin = Math.min(...lightWCAGScores)
      const lightWCAGMax = Math.max(...lightWCAGScores)
      const darkWCAGMin = Math.min(...darkWCAGScores)
      const darkWCAGMax = Math.max(...darkWCAGScores)
      const lightAPCAMin = Math.min(...lightAPCAScores)
      const lightAPCAMax = Math.max(...lightAPCAScores)
      const darkAPCAMin = Math.min(...darkAPCAScores)
      const darkAPCAMax = Math.max(...darkAPCAScores)

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
    }
  })

  return rangesByColumn
}
