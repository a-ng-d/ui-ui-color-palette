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
  const colorsNumber = colors.length
  const themesNumber = themes.filter(
    (theme) => theme.type === 'custom theme'
  ).length
  const shadeNumber = Object.values(themes[0].scale).length * colorsNumber

  const colorLabel = locales('browse.meta.colors', {
    count: colorsNumber.toString(),
  })
  const themeLabel = locales('browse.meta.themes', {
    count: themesNumber.toString(),
  })
  const shadeLabel = locales('browse.meta.shades', {
    count: shadeNumber.toString(),
  })

  if (stars !== undefined)
    return `${colorLabel}${locales('separator')}${shadeLabel}${locales('separator')}${themeLabel}${locales('separator')}⭐︎ ${stars}`

  return `${colorLabel}${locales('separator')}${shadeLabel}${locales('separator')}${themeLabel}`
}

export default setPaletteMeta
