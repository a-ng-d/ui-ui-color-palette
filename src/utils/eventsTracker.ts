import mixpanel from 'mixpanel-figma'
import { ConsentConfiguration } from '@a_ng_d/figmug-ui'
import {
  ActionEvent,
  ColorThemeEvent,
  EditorEvent,
  ExportEvent,
  ImportEvent,
  PreviewEvent,
  PublicationEvent,
  ScaleEvent,
  SettingEvent,
  SourceColorEvent,
  TrialEvent,
} from '../types/events'
import globalConfig from '../global.config'

const eventsRecurringProperties = {
  Env: process.env.NODE_ENV === 'development' ? 'Dev' : 'Prod',
}

export const trackUserConsentEvent = (
  isEnabled: boolean,
  consent: Array<ConsentConfiguration>
) => {
  if (!isEnabled) return
  mixpanel.track('Consent Proof Sent', {
    'User Consent Version': globalConfig.versions.userConsentVersion,
    Consent: consent.map((c) => {
      return { [c.name]: c.isConsented }
    }),
    ...eventsRecurringProperties,
  })
}

export const trackEditorEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: EditorEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Editor Run', {
    Editor: options.editor,
    ...eventsRecurringProperties,
  })
}

export const trackSignInEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Signed In', { ...eventsRecurringProperties })
}

export const trackSignOutEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Signed Out', { ...eventsRecurringProperties })
}

export const trackTrialEnablementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: TrialEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Trial Enabled', {
    'Trial Start Date': new Date(options.date).toISOString(),
    'Trial End Date': new Date(
      options.date + options.trialTime * 3600 * 1000
    ).toISOString(),
    'Trail Time': options.trialTime + ' hours',
    'Trial Version': '3.2.0',
    ...eventsRecurringProperties,
  })
}

export const trackPurchaseEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Purchase Enabled', { ...eventsRecurringProperties })
}

export const trackPublicationEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: PublicationEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Palette Managed', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })
}

export const trackImportEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ImportEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Colors Imported', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })
}

export const trackScaleManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ScaleEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Scale Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })
}

export const trackPreviewManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: PreviewEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Preview Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })
}

export const trackSourceColorsManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: SourceColorEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Source Color Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })
}

export const trackColorThemesManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ColorThemeEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Color Theme Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })
}

export const trackSettingsManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: SettingEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Setting Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })
}

export const trackExportEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ExportEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Color Shades Exported', {
    ...eventsRecurringProperties,
    Feature: options.feature,
    'Color Space': options.colorSpace ?? 'NC',
  })
}

export const trackActionEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ActionEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.identify(id)
  mixpanel.track('Action Triggered', {
    ...eventsRecurringProperties,
    Feature: options.feature,
    Colors: options.colors === undefined ? 0 : options.colors,
    Stops: options.stops === undefined ? 0 : options.stops,
  })
}
