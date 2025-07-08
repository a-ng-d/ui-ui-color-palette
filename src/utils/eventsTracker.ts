import mixpanel from 'mixpanel-browser'
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
  Env: globalConfig.env.isDev ? 'Dev' : 'Prod',
}

export const trackUserConsentEvent = (
  isEnabled: boolean,
  version: string,
  consent: Array<ConsentConfiguration>
) => {
  if (!isEnabled) return
  mixpanel.track('Consent Proof Sent', {
    'User Consent Version': version,
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
  mixpanel.track('Editor Run', {
    Editor: options.editor,
    ...eventsRecurringProperties,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackSignInEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Signed In', { ...eventsRecurringProperties })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackSignOutEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Signed Out', { ...eventsRecurringProperties })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackTrialEnablementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: TrialEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Trial Enabled', {
    'Trial Start Date': new Date(options.date).toISOString(),
    'Trial End Date': new Date(
      options.date + options.trialTime * 3600 * 1000
    ).toISOString(),
    'Trail Time': options.trialTime + ' hours',
    'Trial Version': '3.2.0',
    ...eventsRecurringProperties,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackPurchaseEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Purchase Enabled', { ...eventsRecurringProperties })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackPublicationEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: PublicationEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Palette Managed', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackImportEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ImportEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Colors Imported', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackScaleManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ScaleEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Scale Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackPreviewManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: PreviewEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Preview Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackSourceColorsManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: SourceColorEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Source Color Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackColorThemesManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ColorThemeEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Color Theme Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackSettingsManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: SettingEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Setting Updated', {
    ...eventsRecurringProperties,
    Feature: options.feature,
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackExportEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ExportEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Color Shades Exported', {
    ...eventsRecurringProperties,
    Feature: options.feature,
    'Color Space': options.colorSpace ?? 'NC',
  })

  if (id === '') return
  mixpanel.identify(id)
}

export const trackActionEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ActionEvent
) => {
  if (!consent || !isEnabled) return
  mixpanel.track('Action Triggered', {
    ...eventsRecurringProperties,
    Feature: options.feature,
    Colors: options.colors === undefined ? 0 : options.colors,
    Stops: options.stops === undefined ? 0 : options.stops,
  })

  if (id === '') return
  mixpanel.identify(id)
}
