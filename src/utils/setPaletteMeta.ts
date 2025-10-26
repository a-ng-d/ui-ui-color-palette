import {
  ColorConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../content/locales'

const getPaletteMeta = (
  colors: Array<ColorConfiguration>,
  themes: Array<ThemeConfiguration>,
  stars?: number
) => {
  const colorsNumber = colors.length,
    themesNumber = themes.filter(
      (theme) => theme.type === 'custom theme'
    ).length,
    shadeNumber = Object.values(themes[0].scale).length * colorsNumber

  let colorLabel: string, themeLabel: string, shadeLabel: string

  if (colorsNumber > 1)
    colorLabel = locales
      .get()
      .actions.sourceColorsNumber.several.replace(
        '{count}',
        colorsNumber.toString()
      )
  else
    colorLabel = locales
      .get()
      .actions.sourceColorsNumber.single.replace(
        '{count}',
        colorsNumber.toString()
      )

  if (themesNumber > 1)
    themeLabel = locales
      .get()
      .actions.colorThemesNumber.several.replace(
        '{count}',
        themesNumber.toString()
      )
  else
    themeLabel = locales
      .get()
      .actions.colorThemesNumber.single.replace(
        '{count}',
        themesNumber.toString()
      )

  if (shadeNumber > 1)
    shadeLabel = locales
      .get()
      .actions.shadesNumber.several.replace('{count}', shadeNumber.toString())
  else
    shadeLabel = locales
      .get()
      .actions.shadesNumber.single.replace('{count}', shadeNumber.toString())

  if (stars !== undefined)
    return `${colorLabel}${locales.get().separator}${shadeLabel}${locales.get().separator}${themeLabel}${locales.get().separator}⭐︎ ${stars}`

  return `${colorLabel}${locales.get().separator}${shadeLabel}${locales.get().separator}${themeLabel}`
}

export default getPaletteMeta
