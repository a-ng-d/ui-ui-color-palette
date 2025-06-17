import {
  ColorConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { locals } from '../content/locales'

const getPaletteMeta = (
  colors: Array<ColorConfiguration>,
  themes: Array<ThemeConfiguration>
) => {
  const colorsNumber = colors.length,
    themesNumber = themes.filter(
      (theme) => theme.type === 'custom theme'
    ).length,
    shadeNumber = Object.values(themes[0].scale).length * colorsNumber

  let colorLabel: string, themeLabel: string, shadeLabel: string

  if (colorsNumber > 1)
    colorLabel = locals
      .get()
      .actions.sourceColorsNumber.several.replace(
        '{$1}',
        colorsNumber.toString()
      )
  else
    colorLabel = locals
      .get()
      .actions.sourceColorsNumber.single.replace(
        '{$1}',
        colorsNumber.toString()
      )

  if (themesNumber > 1)
    themeLabel = locals
      .get()
      .actions.colorThemesNumber.several.replace(
        '{$1}',
        themesNumber.toString()
      )
  else
    themeLabel = locals
      .get()
      .actions.colorThemesNumber.single.replace('{$1}', themesNumber.toString())

  if (shadeNumber > 1)
    shadeLabel = locals
      .get()
      .actions.shadesNumber.several.replace('{$1}', shadeNumber.toString())
  else
    shadeLabel = locals
      .get()
      .actions.shadesNumber.single.replace('{$1}', shadeNumber.toString())

  return `${colorLabel}${locals.get().separator}${shadeLabel}${locals.get().separator}${themeLabel}`
}

export default getPaletteMeta
