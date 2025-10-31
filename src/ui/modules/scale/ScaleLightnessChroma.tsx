import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  Contrast,
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  EasingConfiguration,
  ShiftConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { doScale } from '@a_ng_d/figmug-utils'
import {
  Button,
  Dropdown,
  DropdownOption,
  layouts,
  MultipleSlider,
  SectionTitle,
  Select,
  SemanticMessage,
  SimpleItem,
  SimpleSlider,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { defaultPreset, presets } from '../../../stores/presets'
import { $palette } from '../../../stores/palette'
import { trackScaleManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'
import type { AppStates } from '../../App'

interface ScaleProps extends BaseProps, WithConfigProps {
  id: string
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  onChangePreset: React.Dispatch<Partial<AppStates>>
  onChangeScale: () => void
  onAddStop: React.Dispatch<Partial<AppStates>>
  onRemoveStop: React.Dispatch<Partial<AppStates>>
  onChangeShift: (feature?: string, state?: string, value?: number) => void
  onChangeThemes?: (scale: ScaleConfiguration) => void
  onSwitchMode: () => void
}

export default class ScaleLightnessChroma extends PureComponent<ScaleProps> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static defaultProps: Partial<ScaleProps> = {
    distributionEasing: 'LINEAR',
  }

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
    SCALE_CONFIGURATION: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CONFIGURATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_CONTRAST_RATIO: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CONTRAST_RATIO',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_CHROMA: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CHROMA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_REVERSE: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_REVERSE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_RESET: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_RESET',
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
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ScaleProps) {
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

  // Handlers
  shiftHandler = (feature: string, state: string, value: number) => {
    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      this.palette.setKey('shift.chroma', value)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('shift.chroma', value)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      this.palette.setKey('shift.chroma', value)
      this.props.onChangeShift(feature, state, value)
    }

    const actions: {
      [action: string]: () => void
    } = {
      RELEASED: () => onReleaseStop(),
      SHIFTED: () => onChangeStop(),
      TYPED: () => onTypeStopValue(),
      UPDATING: () => onUpdatingStop(),
      DEFAULT: () => null,
    }

    return actions[state ?? 'DEFAULT']?.()
  }

  lightnessHandler = (
    state: string,
    results: {
      scale: Record<string, number>
      stops?: Array<number>
      min?: number
      max?: number
    },
    feature?: string
  ) => {
    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      this.palette.setKey('scale', results.scale)
      if (feature === 'ADD_STOP' || feature === 'DELETE_STOP')
        this.palette.setKey('preset.stops', results.stops ?? [])

      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        lightForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(value)
            .toFixed(1)
        )
        darkForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getContrastRatioForLightness(value)
            .toFixed(1)
        )
      })

      this.setState({
        ratioLightForeground: lightForegroundRatio,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('scale', results.scale)

      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        lightForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(value)
            .toFixed(1)
        )
        darkForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getContrastRatioForLightness(value)
            .toFixed(1)
        )
      })

      this.setState({
        ratioLightForeground: lightForegroundRatio,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        lightForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(value)
            .toFixed(1)
        )
        darkForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getContrastRatioForLightness(value)
            .toFixed(1)
        )
      })

      this.palette.setKey('scale', results.scale)

      this.setState({
        ratioLightForeground: lightForegroundRatio,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.props.onChangeScale()
    }

    const actions: {
      [action: string]: () => void
    } = {
      RELEASED: () => onReleaseStop(),
      SHIFTED: () => onChangeStop(),
      TYPED: () => onTypeStopValue(),
      UPDATING: () => onUpdatingStop(),
      DEFAULT: () => null,
    }

    return actions[state ?? 'DEFAULT']?.()
  }

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
        presets.find((preset) => preset.id === presetId) ?? defaultPreset

      this.palette.setKey('preset', preset)

      if (config.updateName)
        this.palette.setKey(
          'preset.name',
          `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
        )

      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      if (this.props.service === 'EDIT') {
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
        setTimeout(() => this.props.onChangeThemes?.(scale(preset)), 1000)
      }

      trackScaleManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
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
        defaultPreset

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      if (this.props.service === 'EDIT') {
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
        setTimeout(() => this.props.onChangeThemes?.(scale(preset)), 1000)
      }

      trackScaleManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
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
              isActive: ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).PRESETS[`PRESETS_${preset.id}`].isActive(),
              isBlocked: ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).PRESETS[`PRESETS_${preset.id}`].isBlocked(),
              isNew: ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).PRESETS[`PRESETS_${preset.id}`].isNew(),
              action: this.presetsHandler,
            })),
          }
        else
          return {
            label: preset[1][0].name,
            value: preset[1][0].id,
            feature: `PRESETS_${preset[1][0].id}`,
            type: 'OPTION',
            isActive: ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).PRESETS[`PRESETS_${preset[1][0].id}`].isActive(),
            isBlocked: ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).PRESETS[`PRESETS_${preset[1][0].id}`].isBlocked(),
            isNew: ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).PRESETS[`PRESETS_${preset[1][0].id}`].isNew(),
            action: this.presetsHandler,
          }
      }
    )

    if (this.props.preset.id === 'CUSTOM')
      options[options.length - 1].children = [
        {
          label: this.props.locales.scale.presets.legacy,
          value: 'CUSTOM',
          feature: 'PRESETS_CUSTOM',
          type: 'OPTION',
        },
        ...(options[options.length - 1].children ?? []),
      ]

    options.splice(1, 0, {
      type: 'SEPARATOR',
    })

    return options
  }

  customHandler = (e: Event) => {
    const stops = this.props.preset?.['stops'] ?? [1, 2]
    const preset = this.props.preset ?? defaultPreset

    const scale = (stps = stops) => {
      const currentScale = this.props.scale ?? {}

      const currentStops = Object.keys(currentScale)
        .map((id) => parseFloat(id))
        .sort((a, b) => a - b)

      if (currentStops.length < 2)
        return doScale(stps, 0, 100, this.props.distributionEasing)

      const minId = currentStops[0]
      const maxId = currentStops[currentStops.length - 1]

      const minIdValue = parseFloat(currentScale[minId].toString())
      const maxIdValue = parseFloat(currentScale[maxId].toString())

      const isInverted = minIdValue < maxIdValue

      const allValues = Object.values(currentScale).map((value) =>
        parseFloat(value.toString())
      )
      const scaleMin = Math.min(...allValues)
      const scaleMax = Math.max(...allValues)

      let tempEasing = this.props.distributionEasing

      if (
        isInverted &&
        tempEasing.includes('EASEIN_') &&
        !tempEasing.includes('INOUT')
      )
        tempEasing = tempEasing.replace(
          'EASEIN_',
          'EASEOUT_'
        ) as EasingConfiguration
      else if (
        isInverted &&
        tempEasing.includes('EASEOUT_') &&
        !tempEasing.includes('INOUT')
      )
        tempEasing = tempEasing.replace(
          'EASEOUT_',
          'EASEIN_'
        ) as EasingConfiguration

      const calculatedScale = doScale(stps, scaleMin, scaleMax, tempEasing)

      return isInverted
        ? Object.fromEntries(
            Object.entries(calculatedScale).map(([id, value]) => {
              return [id, scaleMax - (parseFloat(value.toString()) - scaleMin)]
            })
          )
        : calculatedScale
    }

    const addStop = () => {
      if (stops.length < 24) {
        stops.push(stops.slice(-1)[0] + stops[0])
        preset.stops = stops
        this.palette.setKey('scale', scale())

        this.props.onAddStop({
          preset: preset,
          scale: scale(),
        })
      }
    }

    const removeStop = () => {
      if (stops.length > 2) {
        stops.pop()
        preset.stops = stops
        this.palette.setKey('scale', scale())

        this.props.onRemoveStop({
          preset: preset,
          scale: scale(),
        })
      }
    }

    const actions: {
      [action: string]: () => void
    } = {
      ADD_STOP: () => addStop(),
      REMOVE_STOP: () => removeStop(),
      DEFAULT: () => null,
    }

    return actions[
      (e.target as HTMLInputElement).dataset.feature ?? 'DEFAULT'
    ]?.()
  }

  // Direct Actions
  onResetScale = () => {
    const preset = this.props.preset ?? defaultPreset

    this.scaleMessage.data.scale = doScale(preset.stops, preset.min, preset.max)
    this.scaleMessage.data.shift.chroma = 100

    this.palette.setKey('scale', this.scaleMessage.data.scale)
    this.palette.setKey('shift.chroma', 100)

    this.props.onChangeScale()
    this.props.onChangeShift('shift.chroma', 'SHIFTED', 100)

    if (this.props.service === 'EDIT')
      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'RESET_SCALE',
      }
    )
  }

  onReverseStops = () => {
    const currentScale = this.props.scale ?? {}

    const entries = Object.entries(currentScale).map(([key, value]) => ({
      id: parseFloat(key),
      value: parseFloat(value.toString()),
    }))

    const values = entries.map((entry) => entry.value)
    const scaleMin = Math.min(...values)
    const scaleMax = Math.max(...values)

    const invertedScale = Object.fromEntries(
      entries.map((entry) => {
        const invertedValue = scaleMin + scaleMax - entry.value
        return [entry.id, invertedValue]
      })
    )

    this.palette.setKey('scale', invertedScale)

    this.props.onChangeScale()

    if (this.props.service === 'EDIT') {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'REVERSE_STOPS',
      }
    )
  }

  // Templates
  Create = () => {
    return (
      <>
        <div
          className={doClassnames([
            layouts['stackbar'],
            layouts['stackbar--fill'],
          ])}
        >
          <SimpleItem
            id="update-preset"
            leftPartSlot={
              <SectionTitle
                label={this.props.locales.scale.title}
                indicator={Object.entries(
                  this.props.scale ?? {}
                ).length.toString()}
              />
            }
            rightPartSlot={
              <div className={layouts['snackbar--medium']}>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_PRESETS.isActive()}
                >
                  <Dropdown
                    id="presets"
                    options={this.presetsOptions()}
                    selected={this.props.preset.id}
                    alignment="RIGHT"
                    pin="TOP"
                    helper={{
                      label: this.props.locales.scale.presets.helper,
                    }}
                  />
                </Feature>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_PRESETS.isActive()}
                >
                  {this.props.preset.id.includes('CUSTOM') && (
                    <>
                      {this.props.preset.stops.length > 2 && (
                        <Button
                          type="icon"
                          icon="minus"
                          helper={{
                            label: this.props.locales.scale.actions.removeStop,
                          }}
                          feature="REMOVE_STOP"
                          action={this.customHandler}
                        />
                      )}
                      <Feature
                        isActive={ScaleLightnessChroma.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).PRESETS_CUSTOM_ADD.isActive()}
                      >
                        <Button
                          type="icon"
                          icon="plus"
                          isDisabled={this.props.preset.stops.length === 24}
                          helper={{
                            label: this.props.locales.scale.actions.addStop,
                          }}
                          feature="ADD_STOP"
                          action={
                            this.props.preset.stops.length >= 24
                              ? () => null
                              : this.customHandler
                          }
                        />
                      </Feature>
                    </>
                  )}
                </Feature>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_REVERSE.isActive()}
                >
                  <Button
                    type="icon"
                    icon="reverse"
                    helper={{
                      label: this.props.locales.scale.actions.reverseStops,
                    }}
                    feature="REVERSE_SCALE"
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_REVERSE.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_REVERSE.isNew()}
                    action={this.onReverseStops}
                  />
                </Feature>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_RESET.isActive()}
                >
                  <Button
                    type="icon"
                    icon="reset"
                    helper={{
                      label: this.props.locales.scale.actions.resetScale,
                    }}
                    feature="RESET_SCALE"
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_RESET.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_RESET.isNew()}
                    action={this.onResetScale}
                  />
                </Feature>
                <span className={texts.type}>
                  {this.props.locales.separator}
                </span>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_CONTRAST_RATIO.isActive()}
                >
                  <Select
                    id="switch-contrast-mode"
                    type="SWITCH_BUTTON"
                    label={this.props.locales.scale.contrast.label}
                    isChecked={false}
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_CONTRAST_RATIO.isNew()}
                    action={this.props.onSwitchMode}
                  />
                </Feature>
              </div>
            }
            alignment="CENTER"
            isListItem={false}
          />
          {ScaleLightnessChroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).PRESETS_CUSTOM_ADD.isReached(this.props.preset.stops.length - 1) &&
            this.props.preset.id.includes('CUSTOM') && (
              <div
                style={{
                  padding: '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
                }}
              >
                <SemanticMessage
                  type="INFO"
                  message={this.props.locales.info.maxNumberOfStops.replace(
                    '{maxCount}',
                    (
                      ScaleLightnessChroma.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).PRESETS_CUSTOM_ADD.limit ?? 0
                    ).toString()
                  )}
                  actionsSlot={
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED' ? (
                      <Button
                        type="secondary"
                        label={this.props.locales.plan.tryPro}
                        action={() =>
                          sendPluginMessage(
                            { pluginMessage: { type: 'GET_TRIAL' } },
                            '*'
                          )
                        }
                      />
                    ) : (
                      <Button
                        type="secondary"
                        label={this.props.locales.plan.getPro}
                        action={() =>
                          sendPluginMessage(
                            { pluginMessage: { type: 'GET_PRO_PLAN' } },
                            '*'
                          )
                        }
                      />
                    )
                  }
                />
              </div>
            )}
        </div>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CONFIGURATION.isActive()}
        >
          <MultipleSlider
            {...this.props}
            type="EDIT"
            stops={{
              list: this.props.preset.stops,
              min: Infinity,
              max: Infinity,
            }}
            range={{
              min: 0,
              max: 100,
            }}
            colors={{
              min: 'black',
              max: 'white',
            }}
            tips={{
              minMax: this.props.locales.scale.tips.distributeAsTooltip,
            }}
            isBlocked={ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isBlocked()}
            isNew={ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isNew()}
            onChange={this.lightnessHandler}
          />
        </Feature>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CHROMA.isActive()}
        >
          <SimpleSlider
            id="update-chroma"
            label={this.props.locales.scale.shift.chroma.label}
            value={this.props.shift.chroma}
            min={0}
            max={200}
            colors={{
              min: 'hsl(187, 0%, 75%)',
              max: 'hsl(187, 100%, 75%)',
            }}
            warning={
              this.props.service === 'CREATE' &&
              this.props.shift.chroma !== 100 &&
              ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                'EDIT',
                this.props.editor
              ).SCALE_CHROMA.isBlocked()
                ? {
                    label: this.props.locales.scale.shift.chroma.warning,
                  }
                : undefined
            }
            feature="SHIFT_CHROMA"
            isBlocked={ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CHROMA.isBlocked()}
            isNew={ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CHROMA.isNew()}
            onChange={this.shiftHandler}
          />
        </Feature>
      </>
    )
  }

  Edit = () => {
    return (
      <>
        <div
          className={doClassnames([
            layouts['stackbar'],
            layouts['stackbar--fill'],
          ])}
        >
          <SimpleItem
            id="watch-preset"
            leftPartSlot={
              <SectionTitle
                label={this.props.locales.scale.title}
                indicator={Object.entries(
                  this.props.scale ?? {}
                ).length.toString()}
              />
            }
            rightPartSlot={
              <div className={layouts['snackbar--medium']}>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_PRESETS.isActive()}
                >
                  <Dropdown
                    id="presets"
                    options={this.presetsOptions()}
                    selected={this.props.preset.id}
                    alignment="RIGHT"
                    pin="TOP"
                  />
                </Feature>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_REVERSE.isActive()}
                >
                  <Button
                    type="icon"
                    icon="reverse"
                    helper={{
                      label: this.props.locales.scale.actions.reverseStops,
                    }}
                    feature="REVERSE_SCALE"
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_REVERSE.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_REVERSE.isNew()}
                    action={this.onReverseStops}
                  />
                </Feature>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_RESET.isActive()}
                >
                  <Button
                    type="icon"
                    icon="reset"
                    helper={{
                      label: this.props.locales.scale.actions.resetScale,
                    }}
                    feature="RESET_SCALE"
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_RESET.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_RESET.isNew()}
                    action={this.onResetScale}
                  />
                </Feature>
                <span className={texts.type}>
                  {this.props.locales.separator}
                </span>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_CONTRAST_RATIO.isActive()}
                >
                  <Select
                    id="switch-contrast-mode"
                    type="SWITCH_BUTTON"
                    label={this.props.locales.scale.contrast.label}
                    isChecked={false}
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_CONTRAST_RATIO.isNew()}
                    action={this.props.onSwitchMode}
                  />
                </Feature>
              </div>
            }
            alignment="CENTER"
            isListItem={false}
          />
          {ScaleLightnessChroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).PRESETS_CUSTOM_ADD.isReached(this.props.preset.stops.length) &&
            this.props.preset.id.includes('CUSTOM') && (
              <div
                style={{
                  padding: '0 var(--size-pos-xsmall) var(--size-pos-xxxsmall)',
                }}
              >
                <SemanticMessage
                  type="INFO"
                  message={this.props.locales.info.maxNumberOfStops.replace(
                    '{maxCount}',
                    (
                      ScaleLightnessChroma.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).PRESETS_CUSTOM_ADD.limit ?? 0
                    ).toString()
                  )}
                  actionsSlot={
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED' ? (
                      <Button
                        type="secondary"
                        label={this.props.locales.plan.tryPro}
                        action={() =>
                          sendPluginMessage(
                            { pluginMessage: { type: 'GET_TRIAL' } },
                            '*'
                          )
                        }
                      />
                    ) : (
                      <Button
                        type="secondary"
                        label={this.props.locales.plan.getPro}
                        action={() =>
                          sendPluginMessage(
                            { pluginMessage: { type: 'GET_PRO_PLAN' } },
                            '*'
                          )
                        }
                      />
                    )
                  }
                />
              </div>
            )}
        </div>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CONFIGURATION.isActive()}
        >
          {this.props.preset.id.includes('CUSTOM') ? (
            <MultipleSlider
              {...this.props}
              type="FULLY_EDIT"
              stops={{
                list: this.props.preset.stops,
                min: 2,
                max: ScaleLightnessChroma.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).PRESETS_CUSTOM_ADD.isReached(this.props.preset.stops.length)
                  ? ScaleLightnessChroma.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PRESETS_CUSTOM_ADD.limit
                  : 24,
              }}
              range={{
                min: 0,
                max: 100,
                step: 0.1,
              }}
              colors={{
                min: 'black',
                max: 'white',
              }}
              tips={{
                minMax: this.props.locales.scale.tips.distributeAsTooltip,
              }}
              isBlocked={ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SCALE_CONFIGURATION.isBlocked()}
              isNew={ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SCALE_CONFIGURATION.isNew()}
              onChange={this.lightnessHandler}
            />
          ) : (
            <MultipleSlider
              {...this.props}
              type="EDIT"
              stops={{
                list: this.props.preset.stops,
                min: Infinity,
                max: Infinity,
              }}
              range={{
                min: 0,
                max: 100,
              }}
              colors={{
                min: 'black',
                max: 'white',
              }}
              tips={{
                minMax: this.props.locales.scale.tips.distributeAsTooltip,
              }}
              isBlocked={ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SCALE_CONFIGURATION.isBlocked()}
              isNew={ScaleLightnessChroma.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SCALE_CONFIGURATION.isNew()}
              onChange={this.lightnessHandler}
            />
          )}
        </Feature>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CHROMA.isActive()}
        >
          <SimpleSlider
            id="update-chroma"
            label={this.props.locales.scale.shift.chroma.label}
            value={this.props.shift.chroma}
            min={0}
            max={200}
            colors={{
              min: 'hsl(187, 0%, 75%)',
              max: 'hsl(187, 100%, 75%)',
            }}
            feature="SHIFT_CHROMA"
            isBlocked={ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CHROMA.isBlocked()}
            isNew={ScaleLightnessChroma.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CHROMA.isNew()}
            onChange={this.shiftHandler}
          />
        </Feature>
      </>
    )
  }

  // Render
  render() {
    if (this.props.service === 'EDIT') return <this.Edit />
    else return <this.Create />
  }
}
