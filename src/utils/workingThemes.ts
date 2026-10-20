import { ThemeConfiguration } from '@yelbolt/engine-ui-color-palette'

export const getWorkingThemes = (themes: Array<ThemeConfiguration>) =>
  themes.length > 1
    ? themes.filter((theme) => theme.type === 'custom theme')
    : themes.filter((theme) => theme.type === 'default theme')
