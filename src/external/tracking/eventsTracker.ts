import { ConsentConfiguration } from '@a_ng_d/figmug-ui'
import {
  ActionEvent,
  AuthenticationEvent,
  ColorThemeEvent,
  EditorEvent,
  ExportEvent,
  ImportEvent,
  PreviewEvent,
  PublicationEvent,
  PurchaseEvent,
  ScaleEvent,
  SettingEvent,
  SourceColorEvent,
  TrialEvent,
} from '../../types/events'
import { getMixpanel, getMixpanelEnv } from './client'

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
      Env: getMixpanelEnv(),
      Consent: consent.map((c) => {
        return { [c.name]: c.isConsented }
      }),
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
      Env: getMixpanelEnv(),
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackSignInEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: AuthenticationEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Signed In', {
      Env: getMixpanelEnv(),
      Editor: options.editor,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackSignOutEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: AuthenticationEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Signed Out', {
      Editor: options.editor,
      Env: getMixpanelEnv(),
    })

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
      Env: getMixpanelEnv(),
      Editor: options.editor,
      'Trial Start Date': new Date(options.date).toISOString(),
      'Trial End Date': new Date(
        options.date + options.trialTime * 3600 * 1000
      ).toISOString(),
      'Trial Time': options.trialTime + ' hours',
      'Trial Version': '3.2.0',
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}

export const trackPurchaseEvent = (
  isEnabled: boolean,
  id: string,
  consent: boolean,
  options: PurchaseEvent
) => {
  const mixpanel = getMixpanel()

  if (!consent || !isEnabled) return
  if (mixpanel)
    mixpanel.track('Purchase Enabled', {
      Env: getMixpanelEnv(),
      Editor: options.editor,
    })

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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
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
      Env: getMixpanelEnv(),
      Feature: options.feature,
      Colors: options.colors === undefined ? 0 : options.colors,
      Stops: options.stops === undefined ? 0 : options.stops,
    })

  if (id === '') return
  if (mixpanel) mixpanel.identify(id)
}
