import { locals } from '../../content/locals'
import { Language } from '../../types/app'

const checkUserPreferences = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const isWCAGDisplayed = window.localStorage.getItem('is_wcag_displayed')
  const isAPCADisplayed = window.localStorage.getItem('is_apca_displayed')
  const canDeepSyncPalette = window.localStorage.getItem(
    'can_deep_sync_palette'
  )
  const canDeepSyncStyles = window.localStorage.getItem('can_deep_sync_styles')
  const userLanguage = window.localStorage.getItem('user_language')

  if (isWCAGDisplayed === null)
    window.localStorage.setItem('is_wcag_displayed', 'true')

  if (isAPCADisplayed === null)
    window.localStorage.setItem('is_apca_displayed', 'true')

  if (canDeepSyncPalette === null)
    window.localStorage.setItem('can_deep_sync_palette', 'false')

  if (canDeepSyncStyles === null)
    window.localStorage.setItem('can_deep_sync_styles', 'false')

  if (userLanguage === null)
    window.localStorage.setItem('user_language', 'en-US')

  locals.set((userLanguage as Language) ?? 'en-US')

  return iframe?.contentWindow?.postMessage(
    {
      type: 'CHECK_USER_PREFERENCES',
      data: {
        isWCAGDisplayed: isWCAGDisplayed === 'true',
        isAPCADisplayed: isAPCADisplayed === 'true',
        canDeepSyncPalette: canDeepSyncPalette === 'true',
        canDeepSyncStyles: canDeepSyncStyles === 'true',
        userLanguage: userLanguage ?? 'en-US',
      },
    },
    '*'
  )
}

export default checkUserPreferences
