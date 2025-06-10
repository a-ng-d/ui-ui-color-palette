import { UserConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { ConsentConfiguration } from '@a_ng_d/figmug-ui'
import { UserSession } from './user'
import { Translations } from './translation'

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
  editor: Editor
  locals: Translations
  lang: Language
}

export type Context =
  | 'LOCAL_PALETTES'
  | 'LOCAL_PALETTES_PAGE'
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

export type TrialStatus = 'UNUSED' | 'PENDING' | 'EXPIRED'

export type Editor = 'figma' | 'figjam' | 'dev' | 'dev_vscode' | 'penpot'

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

export type Language = 'en-US'

export interface Window {
  width: number
  height: number
}

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
  | 'TRY'
  | 'STORE'
  | 'ABOUT'
  | 'WELCOME_TO_PRO'
  | 'WELCOME_TO_TRIAL'

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
