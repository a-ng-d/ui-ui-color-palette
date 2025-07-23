import { UserConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { ConsentConfiguration } from '@a_ng_d/figmug-ui'
import { UserSession } from './user'
import { Language, Translations } from './translations'

export type Platform = 'figma' | 'penpot' | 'sketch'

export type Service = 'BROWSE' | 'CREATE' | 'EDIT' | 'TRANSFER'

export interface ContextItem {
  label: string
  id: Context
  isUpdated: boolean
  isActive: boolean
}

export interface BaseProps {
  service: Service
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  trialStatus: TrialStatus
  editor: Editor
  locales: Translations
  lang: Language
}

export type Context =
  | 'LOCAL_PALETTES'
  | 'LOCAL_PALETTES_PAGE'
  | 'LOCAL_PALETTES_FILE'
  | 'REMOTE_PALETTES'
  | 'REMOTE_PALETTES_SELF'
  | 'REMOTE_PALETTES_COMMUNITY'
  | 'SOURCE'
  | 'SOURCE_OVERVIEW'
  | 'SOURCE_EXPLORE'
  | 'SCALE'
  | 'COLORS'
  | 'THEMES'
  | 'EXPORT'
  | 'SETTINGS'

export type FilterOptions =
  | 'ANY'
  | 'YELLOW'
  | 'ORANGE'
  | 'RED'
  | 'GREEN'
  | 'VIOLET'
  | 'BLUE'

export type PlanStatus = 'UNPAID' | 'PAID' | 'NOT_SUPPORTED'

export type TrialStatus = 'UNUSED' | 'PENDING' | 'EXPIRED' | 'SUSPENDED'

export type Editor =
  | 'figma'
  | 'figjam'
  | 'dev'
  | 'dev_vscode'
  | 'penpot'
  | 'sketch'

export type FetchStatus =
  | 'UNLOADED'
  | 'LOADING'
  | 'LOADED'
  | 'ERROR'
  | 'EMPTY'
  | 'COMPLETE'
  | 'SIGN_IN_FIRST'
  | 'NO_RESULT'

export type AnnouncementsStatus =
  | 'NO_ANNOUNCEMENTS'
  | 'DISPLAY_ANNOUNCEMENTS_NOTIFICATION'
  | 'DISPLAY_ANNOUNCEMENTS_DIALOG'

export type OnboardingStatus = 'NO_ONBOARDING' | 'DISPLAY_ONBOARDING_DIALOG'

export interface AnnouncementsDigest {
  version: string
  status: AnnouncementsStatus
}

export type ModalContext =
  | 'EMPTY'
  | 'NOTIFICATION'
  | 'PREFERENCES'
  | 'LICENSE'
  | 'PUBLICATION'
  | 'ANNOUNCEMENTS'
  | 'ONBOARDING'
  | 'REPORT'
  | 'CHAT'
  | 'FEEDBACK'
  | 'STORE'
  | 'ABOUT'
  | 'TRY'
  | 'PRICING'
  | 'WELCOME_TO_PRO'
  | 'WELCOME_TO_TRIAL'

export type Plans = Array<'ONE' | 'FIGMA' | 'ONE_FIGMA'>

export type ThirdParty = 'COOLORS' | 'REALTIME_COLORS' | 'COLOUR_LOVERS'

export type NamingConvention = 'ONES' | 'TENS' | 'HUNDREDS'

export interface ImportUrl {
  value: string
  state: 'DEFAULT' | 'ERROR' | undefined
  canBeSubmitted: boolean
  helper:
    | {
        type: 'INFO' | 'ERROR'
        message: string
      }
    | undefined
}
