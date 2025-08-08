import { Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportCsv = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_CSV',
      data: {
        context: 'CSV',
        code: locales.get().error.export,
      },
    })

  const csv = new Data(JSON.parse(rawPalette)).makeCsv()

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_CSV',
    data: {
      context: 'CSV',
      code:
        csv[0].colors.length === 0
          ? [
              {
                name: 'empty',
                colors: [{ csv: locales.get().warning.emptySourceColors }],
              },
            ]
          : csv,
    },
  })
}

export default exportCsv
