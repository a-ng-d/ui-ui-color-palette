import { ColorSpaceConfiguration, Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportLess = (id: string, colorSpace: ColorSpaceConfiguration) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_LESS',
      data: {
        id: '',
        context: 'LESS',
        colorSpace: colorSpace,
        code: locales.get().error.export,
      },
    })

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_LESS',
    data: {
      context: 'LESS',
      colorSpace: colorSpace,
      code: new Data(JSON.parse(rawPalette)).makeLessVariables(colorSpace),
    },
  })
}

export default exportLess
