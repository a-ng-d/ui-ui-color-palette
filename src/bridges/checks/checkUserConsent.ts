import { userConsentVersion } from '../../config'
import { userConsent } from '../../utils/userConsent'

const checkUserConsent = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const currentUserConsentVersion = window.localStorage.getItem(
    'user_consent_version'
  )

  const userConsentData = await Promise.all(
    userConsent.map(async (consent) => {
      return {
        ...consent,
        isConsented:
          window.localStorage.getItem(`${consent.id}_user_consent`) === 'true',
      }
    })
  )

  return iframe?.contentWindow?.postMessage({
    type: 'CHECK_USER_CONSENT',
    data: {
      mustUserConsent:
        currentUserConsentVersion !== userConsentVersion ||
        currentUserConsentVersion === undefined,
      userConsent: userConsentData,
    },
  })
}

export default checkUserConsent
