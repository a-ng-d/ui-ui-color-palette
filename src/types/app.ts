import { ConsentConfiguration } from '@a_ng_d/figmug-ui'
import { UserConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { UserSession } from './user'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locals: any
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

export type HighlightStatus =
  | 'NO_HIGHLIGHT'
  | 'DISPLAY_HIGHLIGHT_NOTIFICATION'
  | 'DISPLAY_HIGHLIGHT_DIALOG'

export type OnboardingStatus = 'NO_ONBOARDING' | 'DISPLAY_ONBOARDING_DIALOG'

export type Language = 'en-US'

export interface Window {
  width: number
  height: number
}

export interface HighlightDigest {
  version: string
  status: HighlightStatus
}

export type PriorityContext =
  | 'EMPTY'
  | 'NOTIFICATION'
  | 'PREFERENCES'
  | 'LICENSE'
  | 'PUBLICATION'
  | 'HIGHLIGHT'
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
