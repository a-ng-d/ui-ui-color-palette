import {
  BaseConfiguration,
  Data,
  MetaConfiguration,
  ThemeConfiguration,
  normalizeShift,
} from '@yelbolt/engine-ui-color-palette'
import { tolgee } from '../loadUI'

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

  if (localPalette) throw new Error(tolgee.t('error.addToLocal'))

  const palette = new Data({
    base: {
      name: msg.data.base.name,
      description: msg.data.base.description,
      preset: msg.data.base.preset,
      shift: {
        chroma: normalizeShift(msg.data.base.shift?.chroma, 'CHROMA'),
        hue: normalizeShift(msg.data.base.shift?.hue, 'HUE'),
      },
      areSourceColorsLocked: msg.data.base.areSourceColorsLocked,
      colors: msg.data.base.colors.map((color) => ({
        ...color,
        hue: {
          ...color.hue,
          shift: normalizeShift(color.hue?.shift, 'HUE'),
        },
        chroma: {
          ...color.chroma,
          shift: normalizeShift(color.chroma?.shift, 'CHROMA'),
        },
      })),
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
