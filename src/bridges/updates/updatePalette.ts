import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { PaletteMessage } from '../../types/messages'

const updatePalette = async ({
  msg,
  isAlreadyUpdated = false,
  shouldLoadPalette = true,
}: {
  msg: PaletteMessage
  isAlreadyUpdated?: boolean
  shouldLoadPalette?: boolean
}) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    window.localStorage.getItem(`palette_${msg.id}`) ?? '{}'
  )

  msg.items.forEach((item) => {
    const pathParts = item.key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: Record<string, any> = palette

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) current[pathParts[i]] = {}
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = item.value
  })

  if (!isAlreadyUpdated) {
    palette.meta.dates.updatedAt = now
    iframe?.contentWindow?.postMessage({
      type: 'UPDATE_PALETTE_DATE',
      data: now,
    })
  }

  if (shouldLoadPalette)
    iframe?.contentWindow?.postMessage({
      type: 'LOAD_PALETTE',
      data: palette,
    })

  return window.localStorage.setItem(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )
}



export default updatePalette
