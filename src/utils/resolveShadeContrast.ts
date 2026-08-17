import chroma from 'chroma-js'
import {
  Color,
  ColorConfiguration,
  Contrast,
  HexModel,
  LockedSourceColorsConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@yelbolt/engine-ui-color-palette'

export interface ShadeContrastResult {
  background: HexModel
  lightForeground: HexModel
  darkForeground: HexModel
  lightWCAG: number
  darkWCAG: number
  lightAPCA: number
  darkAPCA: number
  lightWCAGFriendly: string
  darkWCAGFriendly: string
  lightRecommendedUsage: ReturnType<Contrast['getRecommendedUsage']>
  darkRecommendedUsage: ReturnType<Contrast['getRecommendedUsage']>
}

export const resolveShadeContrast = ({
  sourceColor,
  scaledColor,
  index,
  minDistanceIndex,
  areSourceColorsLocked,
  visionSimulationMode,
  textColorsTheme,
  shouldCalculateWCAG,
  shouldCalculateAPCA,
}: {
  sourceColor: SourceColorConfiguration | ColorConfiguration
  scaledColor: HexModel
  index: number
  minDistanceIndex: number
  areSourceColorsLocked: LockedSourceColorsConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  shouldCalculateWCAG: boolean
  shouldCalculateAPCA: boolean
}): ShadeContrastResult => {
  const sourceColorHex = chroma([
    sourceColor.rgb.r * 255,
    sourceColor.rgb.g * 255,
    sourceColor.rgb.b * 255,
  ]).hex()

  const background: HexModel =
    index === minDistanceIndex &&
    areSourceColorsLocked &&
    !('alpha' in sourceColor && sourceColor.alpha.isEnabled)
      ? (new Color({
          sourceColor: chroma(sourceColorHex).rgb(),
          visionSimulationMode,
        }).setColor() as HexModel)
      : scaledColor

  const darkForeground = new Color({
    sourceColor: chroma(textColorsTheme.darkColor).rgb(),
    visionSimulationMode,
  }).setColor() as HexModel
  const lightForeground = new Color({
    sourceColor: chroma(textColorsTheme.lightColor).rgb(),
    visionSimulationMode,
  }).setColor() as HexModel

  const lightForegroundContrast = new Contrast({
    backgroundColor: chroma(background).rgb(false),
    textColor: lightForeground,
  })
  const darkForegroundContrast = new Contrast({
    backgroundColor: chroma(background).rgb(false),
    textColor: darkForeground,
  })

  let lightWCAG = 0
  let darkWCAG = 0
  let lightAPCA = 0
  let darkAPCA = 0
  let lightWCAGFriendly = ''
  let darkWCAGFriendly = ''
  let lightRecommendedUsage: ReturnType<Contrast['getRecommendedUsage']> =
    'UNKNOWN'
  let darkRecommendedUsage: ReturnType<Contrast['getRecommendedUsage']> =
    'UNKNOWN'

  if (shouldCalculateWCAG) {
    lightWCAG = lightForegroundContrast.getWCAGContrast()
    darkWCAG = darkForegroundContrast.getWCAGContrast()
    lightWCAGFriendly = lightForegroundContrast.getWCAGScore()
    darkWCAGFriendly = darkForegroundContrast.getWCAGScore()
  }

  if (shouldCalculateAPCA) {
    lightAPCA = lightForegroundContrast.getAPCAContrast()
    darkAPCA = darkForegroundContrast.getAPCAContrast()
    lightRecommendedUsage = lightForegroundContrast.getRecommendedUsage()
    darkRecommendedUsage = darkForegroundContrast.getRecommendedUsage()
  }

  return {
    background,
    lightForeground,
    darkForeground,
    lightWCAG,
    darkWCAG,
    lightAPCA,
    darkAPCA,
    lightWCAGFriendly,
    darkWCAGFriendly,
    lightRecommendedUsage,
    darkRecommendedUsage,
  }
}
