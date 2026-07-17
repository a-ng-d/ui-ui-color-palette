import {
  ColorConfiguration,
  HexModel,
  SourceColorConfiguration,
  UserConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { ConsentConfiguration } from '@unoff/ui'
import { UserSession } from './user'

export interface ContrastReportShadeData {
  color: HexModel
  sourceColor: SourceColorConfiguration | ColorConfiguration
  index: number
  scaleName: string
  actualBackground: HexModel
  lightForeground: HexModel
  darkForeground: HexModel
  onPrevious?: () => void
  onNext?: () => void
}

export type Platform = 'figma' | 'penpot' | 'sketch' | 'framer'

export type Service = 'MANAGE' | 'GEN' | 'EXTRACT' | 'WHEEL' | 'EXPLORE'
export type Subservice = 'BROWSE' | 'OPEN'
export type Mode = 'EDIT' | 'INSPECT' | 'EXPORT'
export type Context =
  | 'LOCAL_PALETTES'
  | 'LOCAL_PALETTES_PAGE'
  | 'LOCAL_PALETTES_FILE'
  | 'REMOTE_PALETTES'
  | 'REMOTE_PALETTES_SELF'
  | 'REMOTE_PALETTES_COMMUNITY'
  | 'REMOTE_PALETTES_ORG'
  | 'REMOTE_PALETTES_STARRED'
  | 'SCALE'
  | 'COLORS'
  | 'THEMES'
  | 'IMPORTS'
  | 'EXPORT'
  | 'SETTINGS'
  | 'REPORT'
  | 'PROPERTIES'

export interface ContextItem {
  label: string
  id: Context
  isUpdated: boolean
  isNew?: boolean
  isActive: boolean
}

export interface BaseProps {
  service: Service
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  creditsCount: number
  creditsRenewalDate: number
  editor: Editor
  documentWidth: number
}

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

export interface LicenseTrigger {
  type: 'ACTIVATE' | 'JUMP' | 'CUSTOM_CHECKOUT'
  imageSrc?: string
  title?: string
  text?: string
  cta?: string
}

export type Editor =
  | 'figma'
  | 'figjam'
  | 'dev'
  | 'dev_vscode'
  | 'buzz'
  | 'penpot'
  | 'sketch'
  | 'framer'

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

export type ThirdParty = 'COOLORS' | 'REALTIME_COLORS' | 'COLOUR_LOVERS'

export type ScoreFilterStatus = 'ALL' | 'PASS' | 'FAIL'

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
