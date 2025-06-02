import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { PaletteMessage } from '../../types/messages'

const updatePalette = async (msg: PaletteMessage, isAlreadyUpdated = false) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    window.localStorage.getItem(`palette_${msg.id}`) ?? '{}'
  )

  msg.items.forEach((item) => {
    const flatPalette = flattenObject(palette)

    if (Object.keys(flatPalette).includes(item.key)) {
      const pathParts = item.key.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: Record<string, any> = palette

      for (let i = 0; i < pathParts.length - 1; i++)
        current = current[pathParts[i]]

      current[pathParts[pathParts.length - 1]] = item.value
    }
  })

  if (!isAlreadyUpdated) {
    palette.meta.dates.updatedAt = now
    iframe?.contentWindow?.postMessage({
      type: 'UPDATE_PALETTE_DATE',
      data: now,
    })
  }

  palette.data = new Data(palette).makePaletteData(palette.data)

  iframe?.contentWindow?.postMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })

  return window.localStorage.setItem(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )
}

const flattenObject = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  prefix = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
    const pre = prefix.length ? `${prefix}.` : ''

    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    )
      Object.assign(acc, flattenObject(obj[key], pre + key))
    else acc[pre + key] = obj[key]

    return acc
  }, {})
}

export default updatePalette
