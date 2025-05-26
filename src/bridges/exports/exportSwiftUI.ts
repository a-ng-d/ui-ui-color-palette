import { Case } from '@a_ng_d/figmug-utils'
import { PaletteData } from '@a_ng_d/utils-ui-color-palette'
import { locals } from '../../content/locals'

const exportSwiftUI = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_SWIFTUI',
      data: {
        id: '',
        context: 'APPLE_SWIFTUI',
        code: locals.get().error.export,
      },
    })

  const paletteData: PaletteData = JSON.parse(rawPalette).data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    swift: Array<string> = []

  workingThemes.forEach((theme) => {
    theme.colors.forEach((color) => {
      const source = color.shades.find((shade) => shade.type === 'source color')
      const Colors: Array<string> = []

      Colors.push(
        `// ${
          workingThemes[0].type === 'custom theme' ? theme.name + ' - ' : ''
        }${color.name}`
      )
      color.shades.reverse().forEach((shade) => {
        Colors.push(
          shade.isTransparent
            ? `public let ${
                workingThemes[0].type === 'custom theme'
                  ? new Case(theme.name + ' ' + color.name).doCamelCase()
                  : new Case(color.name).doCamelCase()
              }${
                shade.name === 'source' ? 'Source' : shade.name
              } = Color(red: ${source?.gl[0].toFixed(
                3
              )}, green: ${source?.gl[1].toFixed(3)}, blue: ${shade.gl[2].toFixed(
                3
              )}).opacity(${shade.alpha ?? 1})`
            : `public let ${
                workingThemes[0].type === 'custom theme'
                  ? new Case(theme.name + ' ' + color.name).doCamelCase()
                  : new Case(color.name).doCamelCase()
              }${
                shade.name === 'source' ? 'Source' : shade.name
              } = Color(red: ${shade.gl[0].toFixed(
                3
              )}, green: ${shade.gl[1].toFixed(3)}, blue: ${shade.gl[2].toFixed(
                3
              )})`
        )
      })
      Colors.push('')
      Colors.forEach((color) => swift.push(color))
    })
  })

  swift.pop()

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_SWIFTUI',
    data: {
      id: '',
      context: 'APPLE_SWIFTUI',
      code: `import SwiftUI\n\npublic extension Color {\n  static let Token = Color.TokenColor()\n  struct TokenColor {\n    ${swift.join(
        '\n    '
      )}\n  }\n}`,
    },
  })
}

export default exportSwiftUI
