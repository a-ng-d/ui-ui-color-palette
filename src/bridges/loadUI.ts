import { locals } from '../content/locals'
import { Window } from '../types/app'
import checkHighlightStatus from './checks/checkHighlightStatus'
import checkPlanStatus from './checks/checkPlanStatus'
import checkUserConsent from './checks/checkUserConsent'
import checkUserPreferences from './checks/checkUserPreferences'
import createPaletteFromDuplication from './creations/createFromDuplication'
import createPalette from './creations/createPalette'
import deletePalette from './creations/deletePalette'
import exportCss from './exports/exportCss'
import exportCsv from './exports/exportCsv'
import exportJson from './exports/exportJson'
import exportJsonAmznStyleDictionary from './exports/exportJsonAmznStyleDictionary'
import exportJsonDtcg from './exports/exportJsonDtcg'
import exportJsonTokensStudio from './exports/exportJsonTokensStudio'
import exportKt from './exports/exportKt'
import exportSwiftUI from './exports/exportSwiftUI'
import exportTailwind from './exports/exportTailwind'
import exportUIKit from './exports/exportUIKit'
import exportXml from './exports/exportXml'
import getPalettesOnCurrentPage from './getPalettesOnCurrentPage'
import getProPlan from './getProPlan'
import updateColors from './updates/updateColors'
import updatePalette from './updates/updatePalette'
import updateScale from './updates/updateScale'
import updateSettings from './updates/updateSettings'
import updateThemes from './updates/updateThemes'

const iframe = document.querySelector(
  '#ui-container'
) as HTMLIFrameElement | null
const windowSize: Window = {
  width: parseFloat(
    window.localStorage.getItem('plugin_window_width') ?? '640'
  ),
  height: parseFloat(
    window.localStorage.getItem('plugin_window_height') ?? '400'
  ),
}

if (iframe) {
  iframe.width = windowSize.width.toString()
  iframe.height = windowSize.height.toString()

  iframe.onload = () => {
    checkUserConsent()
      .then(() => checkPlanStatus())
      .then(() => checkUserPreferences())

    iframe?.contentWindow?.postMessage({
      type: 'CHECK_USER_AUTHENTICATION',
      id: '',
      fullName: '',
      avatar: '',
      data: {
        accessToken: window.localStorage.getItem('supabase_access_token'),
        refreshToken: window.localStorage.getItem('supabase_refresh_token'),
      },
    })
  }
}

// UI > Canvas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.addEventListener('message', async (msg: any) => {
  const path = msg.data.pluginMessage

  const actions: { [action: string]: () => void } = {
    RESIZE_UI: () => {
      if (iframe) {
        iframe.width = path.data.width.toString()
        iframe.height = path.data.height.toString()
      }

      window.localStorage.setItem(
        'plugin_window_width',
        path.data.width.toString()
      )
      window.localStorage.setItem(
        'plugin_window_height',
        path.data.height.toString()
      )
    },
    CHECK_USER_CONSENT: () => checkUserConsent(),
    CHECK_HIGHLIGHT_STATUS: () => checkHighlightStatus(path.data.version),
    //
    UPDATE_SCALE: () => updateScale(path),
    UPDATE_COLORS: () => updateColors(path),
    UPDATE_THEMES: () => updateThemes(path),
    UPDATE_SETTINGS: () => updateSettings(path),
    UPDATE_PALETTE: () => updatePalette(path),
    UPDATE_SCREENSHOT: async () => {
      iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      console.log('Update screenshot', path)
    },
    UPDATE_DOCUMENT: () => {
      iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      console.log('Update document', path)
    },
    UPDATE_LANGUAGE: () => {
      window.localStorage.setItem('user_language', path.data.lang)
      locals.set(path.data.lang)
    },
    //
    CREATE_PALETTE: () =>
      createPalette(path).finally(() =>
        iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      ),
    CREATE_PALETTE_FROM_DOCUMENT: () =>
      console.log('Create palette from document', path),
    SYNC_LOCAL_STYLES: () => {
      iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      console.log('Sync local styles', path)
    },
    CREATE_DOCUMENT: () => {
      iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      console.log('Create document', path)
    },
    //
    EXPORT_PALETTE: () => {
      path.export === 'TOKENS_DTCG' && exportJsonDtcg(path.id, path.colorSpace)
      path.export === 'TOKENS_GLOBAL' && exportJson(path.id)
      path.export === 'TOKENS_AMZN_STYLE_DICTIONARY' &&
        exportJsonAmznStyleDictionary(path.id)
      path.export === 'TOKENS_TOKENS_STUDIO' && exportJsonTokensStudio(path.id)
      path.export === 'CSS' && exportCss(path.id, path.colorSpace)
      path.export === 'TAILWIND' && exportTailwind(path.id)
      path.export === 'APPLE_SWIFTUI' && exportSwiftUI(path.id)
      path.export === 'APPLE_UIKIT' && exportUIKit(path.id)
      path.export === 'ANDROID_COMPOSE' && exportKt(path.id)
      path.export === 'ANDROID_XML' && exportXml(path.id)
      path.export === 'CSV' && exportCsv(path.id)
    },
    //
    SEND_MESSAGE: () => null, //figma.notify(path.message),
    SET_ITEMS: () => {
      path.items.forEach((item: { key: string; value: unknown }) => {
        if (typeof item.value === 'object')
          window.localStorage.setItem(item.key, JSON.stringify(item.value))
        else if (
          typeof item.value === 'boolean' ||
          typeof item.value === 'number'
        )
          window.localStorage.setItem(item.key, item.value.toString())
        else window.localStorage.setItem(item.key, item.value as string)
      })
    },
    GET_ITEMS: async () =>
      path.items.map(async (item: string) =>
        iframe?.contentWindow?.postMessage({
          type: `GET_ITEM_${item.toUpperCase()}`,
          value: window.localStorage.getItem(item),
        })
      ),
    DELETE_ITEMS: () =>
      path.items.forEach(async (item: string) =>
        window.localStorage.setItem(item, '')
      ),
    SET_DATA: () =>
      path.items.forEach((item: { key: string; value: string }) =>
        window.localStorage.setItem(item.key, JSON.stringify(item.value))
      ),
    //
    GET_PALETTES: async () => await getPalettesOnCurrentPage(),
    JUMP_TO_PALETTE: async () => {
      const palette = window.localStorage.getItem(`palette_${path.id}`)
      if (palette !== undefined && palette !== null)
        iframe?.contentWindow?.postMessage({
          type: 'LOAD_PALETTE',
          data: JSON.parse(palette),
        })
    },
    DUPLICATE_PALETTE: async () =>
      await createPaletteFromDuplication(path.id)
        .finally(async () => await getPalettesOnCurrentPage())
        .catch((error) => {
          throw error
        }),
    DELETE_PALETTE: async () =>
      await deletePalette(path.id)
        .finally(async () => await getPalettesOnCurrentPage())
        .catch((error) => {
          throw error
        }),
    //
    GET_PRO_PLAN: async () => await getProPlan(),
    //
    DEFAULT: () => null,
  }

  try {
    return actions[path.type]?.()
  } catch {
    return actions['DEFAULT']?.()
  }
})
