import { Case } from '@a_ng_d/figmug-utils'
import { PaletteData } from '@a_ng_d/utils-ui-color-palette'
import chroma from 'chroma-js'
import { locals } from '../../content/locals'

const exportKt = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_KT',
      data: {
        id: '',
        context: 'ANDROID_COMPOSE',
        code: locals.get().error.export,
      },
    })

  const paletteData: PaletteData = JSON.parse(rawPalette).data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    kotlin: Array<string> = []

  workingThemes.forEach((theme) => {
    theme.colors.forEach((color) => {
      const source = color.shades.find((shade) => shade.type === 'source color')
      const colors: Array<string> = []

      colors.push(
        `// ${
          workingThemes[0].type === 'custom theme' ? theme.name + ' - ' : ''
        }${color.name}`
      )
      color.shades.reverse().forEach((shade) => {
        colors.push(
          `val ${
            workingThemes[0].type === 'custom theme'
              ? new Case(theme.name + ' ' + color.name).doSnakeCase()
              : new Case(color.name).doSnakeCase()
          }_${shade.name} = Color(${
            shade.isTransparent
              ? chroma(source?.hex ?? '#000000')
                  .alpha(shade.alpha ?? 1)
                  .hex()
                  .replace('#', '0xFF')
                  .toUpperCase()
              : shade.hex.replace('#', '0xFF').toUpperCase()
          })`
        )
      })
      colors.push('')
      colors.forEach((color) => kotlin.push(color))
    })
  })

  kotlin.pop()

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_KT',
    data: {
      id: '',
      context: 'ANDROID_COMPOSE',
      code: `import androidx.compose.ui.graphics.Color\n\n${kotlin.join('\n')}`,
    },
  })
}

export default exportKt
