import {
  ColorConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'

const setPaletteMeta = ({
  colors,
  themes,
  stars,
  locales,
}: {
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  stars?: number
  locales: (key: string, params?: Record<string, string>) => string
}) => {
  const colorsNumber = colors.length,
    themesNumber = themes.filter(
      (theme) => theme.type === 'custom theme'
    ).length,
    shadeNumber = Object.values(themes[0].scale).length * colorsNumber

  let colorLabel: string, themeLabel: string, shadeLabel: string

  if (colorsNumber > 1)
    colorLabel = locales('actions.sourceColorsNumber.several', {
      count: colorsNumber.toString(),
    })
  else
    colorLabel = locales('actions.sourceColorsNumber.single', {
      count: colorsNumber.toString(),
    })

  if (themesNumber > 1)
    themeLabel = locales('actions.colorThemesNumber.several', {
      count: themesNumber.toString(),
    })
  else
    themeLabel = locales('actions.colorThemesNumber.single', {
      count: themesNumber.toString(),
    })

  if (shadeNumber > 1)
    shadeLabel = locales('actions.shadesNumber.several', {
      count: shadeNumber.toString(),
    })
  else
    shadeLabel = locales('actions.shadesNumber.single', {
      count: shadeNumber.toString(),
    })

  if (stars !== undefined)
    return `${colorLabel}${locales('separator')}${shadeLabel}${locales('separator')}${themeLabel}${locales('separator')}⭐︎ ${stars}`

  return `${colorLabel}${locales('separator')}${shadeLabel}${locales('separator')}${themeLabel}`
}

export default setPaletteMeta