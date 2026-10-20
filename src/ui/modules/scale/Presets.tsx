import { PureComponent } from 'preact/compat'
import {
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus, doScale } from '@unoff/utils'
import { Dropdown, DropdownOption } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { defaultPreset, presets } from '../../../stores/presets'
import { $palette } from '../../../stores/palette'
import { trackScaleManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PresetsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  preset: PresetConfiguration
  onChangeThemes?: (scale: ScaleConfiguration) => void
}

export default class Presets extends PureComponent<PresetsProps> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SCALE_PRESETS: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_PRESETS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PRESETS: (() => {
      return Object.fromEntries(
        Object.entries(presets).map(([, preset]) => [
          `PRESETS_${preset.id}`,
          new FeatureStatus({
            features: config.features,
            featureName: `PRESETS_${preset.id}`,
            planStatus: planStatus,
            currentService: service,
            currentEditor: editor,
          }),
        ])
      )
    })(),
  })

  constructor(props: PresetsProps) {
    super(props)
    this.palette = $palette
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      id: this.props.id,
      data: this.palette.value as ExchangeConfiguration,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribePalette = $palette.subscribe((value) => {
      this.scaleMessage.data = value as ExchangeConfiguration
    })
  }

  componentWillUnmount = () => {
    if (this.subscribePalette) this.subscribePalette()
  }

  private get features() {
    return Presets.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Handlers
  presetsHandler = (e: Event) => {
    const scale = (preset: PresetConfiguration) =>
      doScale(
        preset.stops ?? [],
        preset.min ?? 0,
        preset.max ?? 100,
        preset.easing
      )

    const presetConfigs = {
      MATERIAL: {
        trackingFeature: 'SWITCH_MATERIAL' as const,
        updateName: true,
      },
      MATERIAL_3: {
        trackingFeature: 'SWITCH_MATERIAL_3' as const,
        updateName: true,
      },
      TAILWIND: {
        trackingFeature: 'SWITCH_TAILWIND' as const,
        updateName: false,
      },
      ANT: { trackingFeature: 'SWITCH_ANT' as const, updateName: false },
      BOOTSTRAP: {
        trackingFeature: 'SWITCH_BOOTSTRAP' as const,
        updateName: false,
      },
      RADIX: { trackingFeature: 'SWITCH_RADIX' as const, updateName: false },
      UNTITLED_UI: {
        trackingFeature: 'SWITCH_UNTITLED_UI' as const,
        updateName: false,
      },
      OPEN_COLOR: {
        trackingFeature: 'SWITCH_OPEN_COLOR' as const,
        updateName: false,
      },
      ADS: { trackingFeature: 'SWITCH_ADS' as const, updateName: true },
      ADS_NEUTRAL: {
        trackingFeature: 'SWITCH_ADS_NEUTRAL' as const,
        updateName: true,
      },
      SPECTRUM: {
        trackingFeature: 'SWITCH_SPECTRUM' as const,
        updateName: true,
      },
      SPECTRUM_NEUTRAL: {
        trackingFeature: 'SWITCH_SPECTRUM_NEUTRAL' as const,
        updateName: true,
      },
      CARBON: { trackingFeature: 'SWITCH_CARBON' as const, updateName: false },
      BASE: { trackingFeature: 'SWITCH_BASE' as const, updateName: false },
      POLARIS: {
        trackingFeature: 'SWITCH_POLARIS' as const,
        updateName: false,
      },
      FLUENT: { trackingFeature: 'SWITCH_FLUENT' as const, updateName: false },
    }

    const setPreset = (presetId: keyof typeof presetConfigs) => {
      const config = presetConfigs[presetId]
      const preset =
        presets.find((preset) => preset.id === presetId) ??
        (defaultPreset as PresetConfiguration)

      this.palette.setKey('preset', preset)

      if (config.updateName)
        this.palette.setKey(
          'preset.name',
          `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
        )

      this.palette.setKey('scale', scale(preset))

      this.scaleMessage.feature = 'CHANGE_PRESET'
      this.props.onChangeThemes?.(scale(preset))

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')

      trackScaleManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: config.trackingFeature,
        }
      )
    }

    const setCustomPreset = (
      convention: '' | '_1_10' | '_10_100' | '_100_1000'
    ) => {
      const preset: PresetConfiguration =
        presets.find((preset) => preset.id === `CUSTOM${convention}`) ??
        (defaultPreset as PresetConfiguration)

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

      this.scaleMessage.feature = 'CHANGE_PRESET'
      this.props.onChangeThemes?.(scale(preset))

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')

      trackScaleManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: `SWITCH_CUSTOM${convention}`,
        }
      )
    }

    const actions: {
      [action: string]: () => void
    } = {
      CUSTOM_1_10: () => setCustomPreset('_1_10'),
      CUSTOM_10_100: () => setCustomPreset('_10_100'),
      CUSTOM_100_1000: () => setCustomPreset('_100_1000'),
      MATERIAL: () => setPreset('MATERIAL'),
      MATERIAL_3: () => setPreset('MATERIAL_3'),
      TAILWIND: () => setPreset('TAILWIND'),
      ANT: () => setPreset('ANT'),
      BOOTSTRAP: () => setPreset('BOOTSTRAP'),
      RADIX: () => setPreset('RADIX'),
      UNTITLED_UI: () => setPreset('UNTITLED_UI'),
      OPEN_COLOR: () => setPreset('OPEN_COLOR'),
      ADS: () => setPreset('ADS'),
      ADS_NEUTRAL: () => setPreset('ADS_NEUTRAL'),
      SPECTRUM: () => setPreset('SPECTRUM'),
      SPECTRUM_NEUTRAL: () => setPreset('SPECTRUM_NEUTRAL'),
      CARBON: () => setPreset('CARBON'),
      BASE: () => setPreset('BASE'),
      POLARIS: () => setPreset('POLARIS'),
      FLUENT: () => setPreset('FLUENT'),
      DEFAULT: () => null,
    }

    return actions[(e.target as HTMLElement).dataset.value ?? 'DEFAULT']?.()
  }

  presetsOptions = () => {
    const orderedPresets = presets.reduce(
      (acc: { [key: string]: PresetConfiguration[] }, preset) => {
        const { family, name } = preset
        if (family !== undefined) {
          if (!acc[family]) acc[family] = []
          acc[family].push(preset)
        } else {
          if (!acc[name]) acc[name] = []
          acc[name].push(preset)
        }
        return acc
      },
      {} as { [key: string]: PresetConfiguration[] }
    )

    const options: Array<DropdownOption> = Object.entries(orderedPresets).map(
      (preset) => {
        if (preset[1].length > 1)
          return {
            label: preset[0],
            value: preset[0].toUpperCase().split(' ').join('_'),
            type: 'GROUP',
            children: preset[1].map((preset: PresetConfiguration) => ({
              label: preset.name,
              value: preset.id,
              feature: `PRESETS_${preset.id}`,
              type: 'OPTION',
              isActive:
                this.features.PRESETS[`PRESETS_${preset.id}`].isActive(),
              isBlocked:
                this.features.PRESETS[`PRESETS_${preset.id}`].isBlocked(),
              isNew: this.features.PRESETS[`PRESETS_${preset.id}`].isNew(),
              onBlock: () => {
                const isTrial =
                  this.props.config.plan.isTrialEnabled &&
                  this.props.trialStatus !== 'EXPIRED'
                sendPluginMessage(
                  {
                    pluginMessage: isTrial
                      ? { type: 'GET_TRIAL' }
                      : {
                          type: 'GET_PRO',
                          data: { origin: `PRESETS_${preset.id}` },
                        },
                  },
                  '*'
                )
              },
              action: this.presetsHandler,
            })),
          }
        else
          return {
            label: preset[1][0].name,
            value: preset[1][0].id,
            feature: `PRESETS_${preset[1][0].id}`,
            type: 'OPTION',
            isActive:
              this.features.PRESETS[`PRESETS_${preset[1][0].id}`].isActive(),
            isBlocked:
              this.features.PRESETS[`PRESETS_${preset[1][0].id}`].isBlocked(),
            isNew: this.features.PRESETS[`PRESETS_${preset[1][0].id}`].isNew(),
            onBlock: () => {
              const isTrial =
                this.props.config.plan.isTrialEnabled &&
                this.props.trialStatus !== 'EXPIRED'
              sendPluginMessage(
                {
                  pluginMessage: isTrial
                    ? { type: 'GET_TRIAL' }
                    : {
                        type: 'GET_PRO',
                        data: { origin: `PRESETS_${preset[1][0].id}` },
                      },
                },
                '*'
              )
            },
            action: this.presetsHandler,
          }
      }
    )

    if (this.props.preset.id === 'CUSTOM')
      options[options.length - 1].children = [
        {
          label: this.props.t('scale.presets.legacy'),
          value: 'CUSTOM',
          feature: 'PRESETS_CUSTOM',
          type: 'OPTION',
          onBlock: () => {
            const isTrial =
              this.props.config.plan.isTrialEnabled &&
              this.props.trialStatus !== 'EXPIRED'
            sendPluginMessage(
              {
                pluginMessage: isTrial
                  ? { type: 'GET_TRIAL' }
                  : {
                      type: 'GET_PRO',
                      data: { origin: 'PRESETS_CUSTOM' },
                    },
              },
              '*'
            )
          },
        },
        ...(options[options.length - 1].children ?? []),
      ]

    options.splice(1, 0, {
      type: 'SEPARATOR',
    })

    return options
  }

  // Render
  render() {
    return (
      <Feature isActive={this.features.SCALE_PRESETS.isActive()}>
        <Dropdown
          id="presets"
          options={this.presetsOptions()}
          selected={this.props.preset.id}
          alignment="RIGHT"
          pin="TOP"
          helper={{
            label: this.props.t('scale.presets.helper'),
          }}
          shouldReflow={{
            isEnabled: true,
            icon: 'adjust',
          }}
        />
      </Feature>
    )
  }
}
