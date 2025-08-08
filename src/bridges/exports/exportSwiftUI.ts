import { Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportSwiftUI = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_SWIFTUI',
      data: {
        context: 'APPLE_SWIFTUI',
        code: locales.get().error.export,
      },
    })

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_SWIFT',
    data: {
      context: 'APPLE_SWIFTUI',
      code: new Data(JSON.parse(rawPalette)).makeSwiftUI(),
    },
  })
}

export default exportSwiftUI
