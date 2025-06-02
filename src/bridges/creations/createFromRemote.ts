import { BaseConfiguration, Data } from '@a_ng_d/utils-ui-color-palette'
import { locals } from '../../content/locals'
import {
  MetaConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'

interface Msg {
  data: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }
}

const createFromRemote = async (msg: Msg) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const localPalette = window.localStorage.getItem(
    `palette_${msg.data.meta.id}`
  )

  if (localPalette)
    return iframe?.contentWindow?.postMessage({
      type: 'POST_MESSAGE',
      data: {
        type: 'INFO',
        message: locals.get().info.addToLocal,
      },
    })

  const palette = new Data({
    base: {
      name: msg.data.base.name,
      description: msg.data.base.description,
      preset: msg.data.base.preset,
      shift: msg.data.base.shift,
      areSourceColorsLocked: msg.data.base.areSourceColorsLocked,
      colors: msg.data.base.colors,
      colorSpace: msg.data.base.colorSpace,
      algorithmVersion: msg.data.base.algorithmVersion,
    },
    themes: msg.data.themes,
    meta: {
      id: msg.data.meta.id,
      dates: {
        createdAt: msg.data.meta.dates.createdAt,
        updatedAt: msg.data.meta.dates.updatedAt,
        publishedAt: msg.data.meta.dates.publishedAt,
        openedAt: new Date().toISOString(),
      },
      creatorIdentity: {
        creatorId: msg.data.meta.creatorIdentity.creatorId,
        creatorFullName: msg.data.meta.creatorIdentity.creatorFullName,
        creatorAvatar: msg.data.meta.creatorIdentity.creatorAvatar,
      },
      publicationStatus: {
        isShared: msg.data.meta.publicationStatus.isShared,
        isPublished: msg.data.meta.publicationStatus.isPublished,
      },
    },
  }).makePaletteFullData()

  window.localStorage.setItem(
    `palette_${palette.meta.id}`,
    JSON.stringify(palette)
  )

  return iframe?.contentWindow?.postMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })
}

export default createFromRemote
