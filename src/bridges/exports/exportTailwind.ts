import { Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportTailwind = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_TAILWIND',
      data: {
        id: '',
        context: 'TAILWIND',
        code: locales.get().error.export,
      },
    })

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_TAILWIND',
    data: {
      context: 'TAILWIND',
      code: new Data(JSON.parse(rawPalette)).makeTailwindConfig(),
    },
  })
}

export default exportTailwind
