import { tolgee } from '../loadUI'
import globalConfig from '../../global.config'

const checkUserPreferences = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const isWCAGDisplayed = window.localStorage.getItem('is_wcag_displayed')
  const isAPCADisplayed = window.localStorage.getItem('is_apca_displayed')
  const isWCAGIntervalDisplayed = window.localStorage.getItem(
    'is_wcag_interval_displayed'
  )
  const isAPCAIntervalDisplayed = window.localStorage.getItem(
    'is_apca_interval_displayed'
  )
  const canDeepSyncStyles = window.localStorage.getItem('can_deep_sync_styles')
  const canDeepSyncVariables = window.localStorage.getItem(
    'can_deep_sync_variables'
  )
  const canDeepSyncTokens = window.localStorage.getItem('can_deep_sync_tokens')
  const isSuggestedLanguageDisplayed = window.localStorage.getItem(
    'is_suggested_language_displayed'
  )
  const isOnboardingRead = window.localStorage.getItem('is_onboarding_read')
  const userLanguage = window.localStorage.getItem('user_language')
  const userTheme = window.localStorage.getItem('user_theme')
  const palettesView = window.localStorage.getItem('palettes_view')

  if (isWCAGDisplayed === null)
    window.localStorage.setItem('is_wcag_displayed', 'true')

  if (isAPCADisplayed === null)
    window.localStorage.setItem('is_apca_displayed', 'true')

  if (isWCAGIntervalDisplayed === null)
    window.localStorage.setItem('is_wcag_interval_displayed', 'false')

  if (isAPCAIntervalDisplayed === null)
    window.localStorage.setItem('is_apca_interval_displayed', 'false')

  if (canDeepSyncStyles === null)
    window.localStorage.setItem('can_deep_sync_styles', 'false')

  if (canDeepSyncVariables === null)
    window.localStorage.setItem('can_deep_sync_variables', 'false')

  if (canDeepSyncTokens === null)
    window.localStorage.setItem('can_deep_sync_tokens', 'false')

  if (isSuggestedLanguageDisplayed === null)
    window.localStorage.setItem('is_suggested_language_displayed', 'true')

  if (isOnboardingRead === null)
    window.localStorage.setItem('is_onboarding_read', 'false')

  if (userLanguage === null)
    window.localStorage.setItem('user_language', globalConfig.lang)

  if (userTheme === null) window.localStorage.setItem('user_theme', 'system')

  if (palettesView === null)
    window.localStorage.setItem('palettes_view', 'LIST')

  tolgee.changeLanguage(userLanguage ?? globalConfig.lang)

  return iframe?.contentWindow?.postMessage(
    {
      type: 'CHECK_USER_PREFERENCES',
      data: {
        isWCAGDisplayed:
          isWCAGDisplayed === null ? true : isWCAGDisplayed === 'true',
        isAPCADisplayed:
          isAPCADisplayed === null ? true : isAPCADisplayed === 'true',
        isWCAGIntervalDisplayed:
          isWCAGIntervalDisplayed === null
            ? false
            : isWCAGIntervalDisplayed === 'true',
        isAPCAIntervalDisplayed:
          isAPCAIntervalDisplayed === null
            ? false
            : isAPCAIntervalDisplayed === 'true',
        canDeepSyncStyles:
          canDeepSyncStyles === null ? false : canDeepSyncStyles === 'true',
        canDeepSyncVariables:
          canDeepSyncVariables === null
            ? false
            : canDeepSyncVariables === 'true',
        canDeepSyncTokens:
          canDeepSyncTokens === null ? false : canDeepSyncTokens === 'true',
        isSuggestedLanguageDisplayed:
          isSuggestedLanguageDisplayed === null
            ? true
            : isSuggestedLanguageDisplayed === 'true',
        isOnboardingRead: isOnboardingRead === 'true',
        userLanguage: userLanguage ?? globalConfig.lang,
        userTheme: userTheme ?? 'system',
        palettesView: palettesView ?? 'LIST',
      },
    },
    '*'
  )
}

export default checkUserPreferences
