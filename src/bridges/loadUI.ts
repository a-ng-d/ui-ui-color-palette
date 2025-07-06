import { locales } from '../content/locales'
import updateThemes from './updates/updateThemes'
import updateSettings from './updates/updateSettings'
import updateScale from './updates/updateScale'
import updatePalette from './updates/updatePalette'
import updateColors from './updates/updateColors'
import jumpToPalette from './jumpToPalette'
import getPalettesOnCurrentPage from './getPalettesOnCurrentPage'
import exportXml from './exports/exportXml'
import exportUIKit from './exports/exportUIKit'
import exportTailwind from './exports/exportTailwind'
import exportSwiftUI from './exports/exportSwiftUI'
import exportKt from './exports/exportKt'
import exportJsonTokensStudio from './exports/exportJsonTokensStudio'
import exportJsonDtcg from './exports/exportJsonDtcg'
import exportJsonAmznStyleDictionary from './exports/exportJsonAmznStyleDictionary'
import exportJson from './exports/exportJson'
import exportCsv from './exports/exportCsv'
import exportCss from './exports/exportCss'
import enableTrial from './enableTrial'
import deletePalette from './creations/deletePalette'
import createPalette from './creations/createPalette'
import createFromRemote from './creations/createFromRemote'
import createFromDuplication from './creations/createFromDuplication'
import checkUserPreferences from './checks/checkUserPreferences'
import checkUserLicense from './checks/checkUserLicense'
import checkUserConsent from './checks/checkUserConsent'
import checkTrialStatus from './checks/checkTrialStatus'
import checkAnnouncementsStatus from './checks/checkAnnouncementsStatus'

interface Window {
  width: number
  height: number
}

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
      .then(() => checkTrialStatus())
      .then(() => checkUserPreferences())
      .then(() => checkUserLicense())

    iframe?.contentWindow?.postMessage({
      type: 'CHECK_USER_AUTHENTICATION',
      data: {
        id: '',
        fullName: '',
        avatar: '',
        accessToken: window.localStorage.getItem('supabase_access_token'),
        refreshToken: window.localStorage.getItem('supabase_refresh_token'),
      },
    })
    iframe?.contentWindow?.postMessage({
      type: 'CHECK_ANNOUNCEMENTS_VERSION',
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
    CHECK_ANNOUNCEMENTS_STATUS: () =>
      checkAnnouncementsStatus(path.data.version),
    //
    UPDATE_SCALE: () => updateScale(path),
    UPDATE_COLORS: () => updateColors(path),
    UPDATE_THEMES: () => updateThemes(path),
    UPDATE_SETTINGS: () => updateSettings(path),
    UPDATE_PALETTE: () =>
      updatePalette({
        msg: path,
        isAlreadyUpdated: path.isAlreadyUpdated,
        shouldLoadPalette: path.shouldLoadPalette,
      }),
    UPDATE_DOCUMENT: () => {
      iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      console.log('Update document', path)
    },
    UPDATE_LANGUAGE: () => {
      window.localStorage.setItem('user_language', path.data.lang)
      locales.set(path.data.lang)
    },
    //
    CREATE_PALETTE: () =>
      createPalette(path).finally(() =>
        iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      ),
    CREATE_PALETTE_FROM_DOCUMENT: () =>
      console.log('Create palette from document', path),
    CREATE_PALETTE_FROM_REMOTE: () =>
      createFromRemote(path)
        .catch((error) =>
          iframe?.contentWindow?.postMessage({
            type: 'POST_MESSAGE',
            data: {
              type: 'INFO',
              message: error.message,
            },
          })
        )
        .finally(() =>
          iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
        ),
    SYNC_LOCAL_STYLES: () => {
      iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      iframe?.contentWindow?.postMessage({
        type: 'POST_MESSAGE',
        data: {
          type: 'INFO',
          message: 'The local styles have been synced',
        },
      })
      console.log('Sync local styles', path)
    },
    SYNC_LOCAL_VARIABLES: () => {
      iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      iframe?.contentWindow?.postMessage({
        type: 'POST_MESSAGE',
        data: {
          type: 'INFO',
          message: 'The local variables have been synced',
        },
      })
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
    POST_MESSAGE: () => {
      iframe?.contentWindow?.postMessage({
        type: 'POST_MESSAGE',
        data: {
          type: path.data.type,
          message: path.data.message,
        },
      })
    },
    SET_ITEMS: () => {
      path.items.forEach((item: { key: string; value: unknown }) => {
        if (typeof item.value === 'object')
          window.localStorage.setItem(item.key, JSON.stringify(item.value))
        else if (
          typeof item.value === 'boolean' ||
          typeof item.value === 'number'
        )
          window.localStorage.setItem(item.key, String(item.value))
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
        window.localStorage.removeItem(item)
      ),
    SET_DATA: () =>
      path.items.forEach((item: { key: string; value: string }) => {
        if (typeof item.value === 'object')
          window.localStorage.setItem(item.key, JSON.stringify(item.value))
        else if (
          typeof item.value === 'boolean' ||
          typeof item.value === 'number'
        )
          window.localStorage.setItem(item.key, String(item.value))
        else window.localStorage.setItem(item.key, item.value as string)
      }),
    GET_DATA: () =>
      path.items.map((item: string) =>
        iframe?.contentWindow?.postMessage({
          type: `GET_DATA_${item.toUpperCase()}`,
          value: window.localStorage.getItem(item),
        })
      ),
    DELETE_DATA: () =>
      path.items.forEach((item: string) =>
        window.localStorage.removeItem(item)
      ),
    //
    OPEN_IN_BROWSER: () => window.open(msg.url, '_blank'),
    GET_PALETTES: async () => getPalettesOnCurrentPage(),
    JUMP_TO_PALETTE: async () =>
      jumpToPalette(path.id).catch((error) =>
        iframe?.contentWindow?.postMessage({
          type: 'POST_MESSAGE',
          data: {
            type: 'ERROR',
            message: error.message,
          },
        })
      ),
    DUPLICATE_PALETTE: async () =>
      createFromDuplication(path.id)
        .finally(async () => {
          getPalettesOnCurrentPage()
          iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
        })
        .catch((error) => {
          iframe?.contentWindow?.postMessage({
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: error.message,
            },
          })
        }),
    DELETE_PALETTE: async () =>
      deletePalette(path.id).finally(async () => {
        getPalettesOnCurrentPage()
        iframe?.contentWindow?.postMessage({ type: 'STOP_LOADER' })
      }),
    //
    ENABLE_TRIAL: async () => {
      enableTrial(path.data.trialTime, path.data.trialVersion).then(() =>
        checkTrialStatus()
      )
    },
    GET_TRIAL: async () =>
      iframe?.contentWindow?.postMessage({
        type: 'GET_TRIAL',
      }),
    GET_PRO_PLAN: async () =>
      iframe?.contentWindow?.postMessage({
        type: 'GET_PRICING',
        data: {
          plans: ['ONE', 'FIGMA'],
        },
      }),
    PAY_PRO_PLAN: async () => console.log('Pay Pro Plan', path),
    ENABLE_PRO_PLAN: async () =>
      iframe?.contentWindow?.postMessage({
        type: 'ENABLE_PRO_PLAN',
      }),
    LEAVE_PRO_PLAN: async () =>
      iframe?.contentWindow?.postMessage({
        type: 'LEAVE_PRO_PLAN',
      }),
    WELCOME_TO_PRO: async () =>
      iframe?.contentWindow?.postMessage({
        type: 'WELCOME_TO_PRO',
      }),
    SIGN_OUT: () =>
      iframe?.contentWindow?.postMessage({
        type: 'SIGN_OUT',
        data: {
          connectionStatus: 'UNCONNECTED',
          userFullName: '',
          userAvatar: '',
          userId: undefined,
        },
      }),
    //
    DEFAULT: () => null,
  }

  try {
    return actions[path.type]?.()
  } catch {
    return actions['DEFAULT']?.()
  }
})
