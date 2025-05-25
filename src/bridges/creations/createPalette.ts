import { Data } from '@a_ng_d/utils-ui-color-palette'
import { uid } from 'uid'
import { locals } from '../../content/locals'
import {
  ColorConfiguration,
  ExchangeConfiguration,
  MetaConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'

interface Msg {
  data: {
    sourceColors: Array<SourceColorConfiguration>
    exchange: ExchangeConfiguration
    themes?: Array<ThemeConfiguration>
    isRemote?: boolean
    paletteMeta?: MetaConfiguration
  }
}

const createPalette = async (msg: Msg) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const colors: Array<ColorConfiguration> = msg.data.sourceColors
    .map((sourceColor) => {
      return {
        name: sourceColor.name,
        description: '',
        rgb: sourceColor.rgb,
        id: uid(),
        hue: {
          shift: 0,
          isLocked: false,
        },
        chroma: {
          shift: msg.data.exchange.shift.chroma,
          isLocked: false,
        },
        alpha: {
          isEnabled: false,
          backgroundColor: '#FFFFFF',
        },
      }
    })
    .sort((a, b) => {
      if (a.name.localeCompare(b.name) > 0) return 1
      else if (a.name.localeCompare(b.name) < 0) return -1
      else return 0
    })

  const themes: Array<ThemeConfiguration> = [
    {
      name: locals.get().themes.switchTheme.defaultTheme,
      description: '',
      scale: msg.data.exchange.scale,
      paletteBackground: '#FFFFFF',
      visionSimulationMode: 'NONE',
      textColorsTheme: msg.data.exchange.textColorsTheme,
      isEnabled: true,
      id: '00000000000',
      type: 'default theme',
    },
  ]

  const palette = new Data({
    base: {
      name: msg.data.exchange.name,
      description: msg.data.exchange.description,
      preset: msg.data.exchange.preset,
      shift: msg.data.exchange.shift,
      areSourceColorsLocked: msg.data.exchange.areSourceColorsLocked,
      colors: colors,
      colorSpace: msg.data.exchange.colorSpace,
      algorithmVersion: msg.data.exchange.algorithmVersion,
    },
    themes: themes,
    meta: {
      id: uid(),
      dates: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: '',
      },
      creatorIdentity: {
        creatorId: msg.data.paletteMeta?.creatorIdentity?.creatorId ?? '',
        creatorFullName:
          msg.data.paletteMeta?.creatorIdentity?.creatorFullName ?? '',
        creatorAvatar:
          msg.data.paletteMeta?.creatorIdentity?.creatorAvatar ?? '',
      },
      publicationStatus: {
        isShared: false,
        isPublished: false,
      },
    },
  }).makePaletteFullData()

  window.localStorage.setItem(
    `palette_${palette.meta.id}`,
    JSON.stringify(palette)
  )

  iframe?.contentWindow?.postMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })

  return true
}

export default createPalette
