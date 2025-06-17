import { Language } from '../../types/app'
import { locales } from '../../content/locales'

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
  const isVsCodeMessageDisplayed = window.localStorage.getItem(
    'is_vscode_message_displayed'
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

  if (isVsCodeMessageDisplayed === null)
    window.localStorage.setItem('is_vscode_message_displayed', 'true')

  if (userLanguage === null)
    window.localStorage.setItem('user_language', 'en-US')

  locales.set((userLanguage as Language) ?? 'en-US')

  return iframe?.contentWindow?.postMessage(
    {
      type: 'CHECK_USER_PREFERENCES',
      data: {
        isWCAGDisplayed: isWCAGDisplayed === 'true',
        isAPCADisplayed: isAPCADisplayed === 'true',
        canDeepSyncStyles: canDeepSyncStyles === 'true',
        canDeepSyncVariables: canDeepSyncVariables === 'true',
        isVsCodeMessageDisplayed:
          isVsCodeMessageDisplayed === null ||
          isVsCodeMessageDisplayed === undefined
            ? true
            : isVsCodeMessageDisplayed === 'true',
        userLanguage: userLanguage ?? 'en-US',
      },
    },
    '*'
  )
}

export default checkUserPreferences
