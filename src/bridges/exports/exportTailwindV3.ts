import { Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportTailwindV3 = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_JS',
      data: {
        context: 'TAILWIND_V3',
        code: locales.get().error.export,
      },
    })

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_JS',
    data: {
      context: 'TAILWIND_V3',
      code: new Data(JSON.parse(rawPalette)).makeTailwindV3Config(),
    },
  })
}

export default exportTailwindV3
