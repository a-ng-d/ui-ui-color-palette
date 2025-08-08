import { Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportUIKit = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_UIKIT',
      data: {
        context: 'APPLE_UIKIT',
        code: locales.get().error.export,
      },
    })

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_SWIFT',
    data: {
      context: 'APPLE_UIKIT',
      code: new Data(JSON.parse(rawPalette)).makeUIKit(),
    },
  })
}

export default exportUIKit
