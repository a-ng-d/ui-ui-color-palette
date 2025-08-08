import { Data } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const exportJsonAmznStyleDictionary = (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return iframe?.contentWindow?.postMessage({
      type: 'EXPORT_PALETTE_JSON',
      data: {
        id: '',
        context: 'TOKENS_AMZN_STYLE_DICTIONARY',
        code: locales.get().error.export,
      },
    })

  return iframe?.contentWindow?.postMessage({
    type: 'EXPORT_PALETTE_JSON',
    data: {
      context: 'TOKENS_AMZN_STYLE_DICTIONARY',
      code: new Data(JSON.parse(rawPalette)).makeStyleDictionaryTokens(),
    },
  })
}

export default exportJsonAmznStyleDictionary
