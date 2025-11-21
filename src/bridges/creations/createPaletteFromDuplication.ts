import { uid } from 'uid'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'

interface Msg {
  data: {
    id: string
    locales: { [key: string]: string }
  }
}

const createPaletteFromDuplication = async (msg: Msg) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${msg.data.id}`)
  const now = new Date().toISOString()

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(msg.data.locales.errorMessage)

  const palette = JSON.parse(rawPalette) as FullConfiguration

  palette.base.name = msg.data.locales.paletteName
  palette.meta.id = uid()
  palette.meta.publicationStatus.isPublished = false
  palette.meta.publicationStatus.isShared = false
  palette.meta.dates.updatedAt = now
  palette.meta.dates.createdAt = now
  palette.meta.dates.publishedAt = ''
  palette.meta.dates.openedAt = now
  palette.meta.creatorIdentity.creatorId = ''
  palette.meta.creatorIdentity.creatorFullName = ''
  palette.meta.creatorIdentity.creatorAvatar = ''

  window.localStorage.setItem(
    `palette_${palette.meta.id}`,
    JSON.stringify(palette)
  )

  return iframe?.contentWindow?.postMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })
}

export default createPaletteFromDuplication
