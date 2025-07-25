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
} from '../../types/events'
import { getMixpanel, getMixpanelEnv } from './client'

const eventsRecurringProperties = {
  Env: getMixpanelEnv(),
}

export const trackUserConsentEvent = (
  isEnabled: boolean,
  version: string,
  consent: Array<ConsentConfiguration>
) => {
  const mixpanel = getMixpanel()

  if (!isEnabled) return

  if (mixpanel)
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
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Editor Run', {
      Editor: options.editor,
      ...eventsRecurringProperties,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackSignInEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel) mixpanel.track('Signed In', { ...eventsRecurringProperties })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackSignOutEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel) mixpanel.track('Signed Out', { ...eventsRecurringProperties })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackTrialEnablementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: TrialEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Trial Enabled', {
      'Trial Start Date': new Date(options.date).toISOString(),
      'Trial End Date': new Date(
        options.date + options.trialTime * 3600 * 1000
      ).toISOString(),
      'Trial Time': options.trialTime + ' hours',
      'Trial Version': '3.2.0',
      ...eventsRecurringProperties,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackPurchaseEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Purchase Enabled', { ...eventsRecurringProperties })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackPublicationEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: PublicationEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Palette Managed', {
      ...eventsRecurringProperties,
      Feature: options.feature,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackImportEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ImportEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Colors Imported', {
      ...eventsRecurringProperties,
      Feature: options.feature,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackScaleManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ScaleEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Scale Updated', {
      ...eventsRecurringProperties,
      Feature: options.feature,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackPreviewManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: PreviewEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Preview Updated', {
      ...eventsRecurringProperties,
      Feature: options.feature,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackSourceColorsManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: SourceColorEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Source Color Updated', {
      ...eventsRecurringProperties,
      Feature: options.feature,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackColorThemesManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ColorThemeEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Color Theme Updated', {
      ...eventsRecurringProperties,
      Feature: options.feature,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackSettingsManagementEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: SettingEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Setting Updated', {
      ...eventsRecurringProperties,
      Feature: options.feature,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackExportEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ExportEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Color Shades Exported', {
      ...eventsRecurringProperties,
      Feature: options.feature,
      'Color Space': options.colorSpace ?? 'NC',
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackActionEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: ActionEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Action Triggered', {
      ...eventsRecurringProperties,
      Feature: options.feature,
      Colors: options.colors === undefined ? 0 : options.colors,
      Stops: options.stops === undefined ? 0 : options.stops,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}
