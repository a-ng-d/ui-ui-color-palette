import { ColorSpaceConfiguration, Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportCss = (id: string, colorSpace: ColorSpaceConfiguration) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_CSS',
      data: {
        id: '',
        context: 'CSS',
        colorSpace: colorSpace,
        code: locales.get().error.export,
      },
    })

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_CSS',
    data: {
      context: 'CSS',
      colorSpace: colorSpace,
      code: new Data(JSON.parse(rawPalette)).makeCssCustomProps(colorSpace),
    },
  })
}

export default exportCss
