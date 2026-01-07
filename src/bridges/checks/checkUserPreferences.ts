import { tolgee } from '../loadUI'
import globalConfig from '../../global.config'

const checkUserPreferences = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const isWCAGDisplayed = window.localStorage.getItem('is_wcag_displayed')
  const isAPCADisplayed = window.localStorage.getItem('is_apca_displayed')
  const canDeepSyncStyles = window.localStorage.getItem('can_deep_sync_styles')
  const canDeepSyncVariables = window.localStorage.getItem(
    'can_deep_sync_variables'
  )
  const isSuggestedLanguageDisplayed = window.localStorage.getItem(
    'is_suggested_language_displayed'
  )
  const userLanguage = window.localStorage.getItem('user_language')

  if (isWCAGDisplayed === null)
    window.localStorage.setItem('is_wcag_displayed', 'true')

  if (isAPCADisplayed === null)
    window.localStorage.setItem('is_apca_displayed', 'true')

  if (canDeepSyncStyles === null)
    window.localStorage.setItem('can_deep_sync_styles', 'false')

  if (canDeepSyncVariables === null)
    window.localStorage.setItem('can_deep_sync_variables', 'false')

  if (isSuggestedLanguageDisplayed === null)
    window.localStorage.setItem('is_suggested_language_displayed', 'true')

  if (userLanguage === null)
    window.localStorage.setItem('user_language', globalConfig.lang)

  tolgee.changeLanguage(userLanguage ?? globalConfig.lang)

  return iframe?.contentWindow?.postMessage(
    {
      type: 'CHECK_USER_PREFERENCES',
      data: {
        isWCAGDisplayed:
          isWCAGDisplayed === null ? true : isWCAGDisplayed === 'true',
        isAPCADisplayed:
          isAPCADisplayed === null ? true : isAPCADisplayed === 'true',
        canDeepSyncStyles:
          canDeepSyncStyles === null ? false : canDeepSyncStyles === 'true',
        canDeepSyncVariables:
          canDeepSyncVariables === null
            ? false
            : canDeepSyncVariables === 'true',
        isSuggestedLanguageDisplayed:
          isSuggestedLanguageDisplayed === null
            ? true
            : isSuggestedLanguageDisplayed === 'true',
        userLanguage: userLanguage ?? globalConfig.lang,
      },
    },
    '*'
  )
}

export default checkUserPreferences
