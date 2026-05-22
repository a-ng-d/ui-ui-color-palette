import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus, doScale } from '@unoff/utils'
import {
  Button,
  Dropdown,
  DropdownOption,
  layouts,
  Menu,
  SemanticMessage,
  SimpleItem,
} from '@unoff/ui'
import {
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  EasingConfiguration,
  ShiftConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { computeScaleForStops } from '../../../utils/scaleStops'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import {
  BaseProps,
  Editor,
  PlanStatus,
  Service,
  Subservice,
} from '../../../types/app'
import { defaultPreset, presets } from '../../../stores/presets'
import { $palette } from '../../../stores/palette'
import { trackScaleManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'
import Lightness from './Lightness'
import Hue from './Hue'
import Chroma from './Chroma'

interface ScaleLCHProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  subservice: Subservice
  id: string
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  textColorsTheme: { lightColor: string; darkColor: string }
  onChangeScale: () => void
  onChangeShift: (feature?: string, state?: string, value?: number) => void
  onChangeThemes?: (scale: ScaleConfiguration) => void
  onChangeStops?: (stops: number[]) => void
  onSwitchMode: () => void
}

export default class ScaleLCH extends PureComponent<ScaleLCHProps> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette
  private timeouts: ReturnType<typeof setTimeout>[] = []

  static defaultProps: Partial<ScaleLCHProps> = {
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

  constructor(props: ScaleLCHProps) {
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
    this.timeouts.forEach(clearTimeout)
    this.timeouts = []
  }

  private get features() {
    return ScaleLCH.features(
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
                sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
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
              sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
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
            sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
          },
        },
        ...(options[options.length - 1].children ?? []),
      ]

    options.splice(1, 0, {
      type: 'SEPARATOR',
    })

    return options
  }

  customHandler = (e: Event) => {
    const stops = [...($palette.get().preset?.['stops'] ?? [1, 2])]
    const preset = { ...$palette.get().preset } ?? defaultPreset

    const addStop = () => {
      if (stops.length < 24) {
        stops.push(stops.slice(-1)[0] + stops[0])
        preset.stops = stops
        this.palette.setKey('preset', preset)
        this.palette.setKey(
          'scale',
          computeScaleForStops(
            stops,
            $palette.get().scale ?? {},
            this.props.distributionEasing
          )
        )

        this.scaleMessage.data = this.palette.value as ExchangeConfiguration
        this.scaleMessage.feature = 'ADD_STOP'
        this.props.onChangeStops?.(stops)

        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
      }
    }

    const removeStop = () => {
      if (stops.length > 2) {
        stops.pop()
        preset.stops = stops
        this.palette.setKey('preset', preset)
        this.palette.setKey(
          'scale',
          computeScaleForStops(
            stops,
            $palette.get().scale ?? {},
            this.props.distributionEasing
          )
        )

        this.scaleMessage.data = this.palette.value as ExchangeConfiguration
        this.scaleMessage.feature = 'DELETE_STOP'
        this.props.onChangeStops?.(stops)

        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
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

    if (preset.id === 'CUSTOM_1_10') preset.stops = [1, 2, 3, 4, 5, 6]
    else if (preset.id === 'CUSTOM_10_100')
      preset.stops = [10, 20, 30, 40, 50, 60]
    else if (preset.id === 'CUSTOM_100_1000')
      preset.stops = [100, 200, 300, 400, 500, 600]

    this.scaleMessage.data.scale = doScale(preset.stops, preset.min, preset.max)
    this.scaleMessage.data.shift.chroma = 100
    this.scaleMessage.data.shift.hue = 0

    this.palette.setKey('preset', preset)
    this.palette.setKey('scale', this.scaleMessage.data.scale)
    this.palette.setKey('shift.chroma', 100)
    this.palette.setKey('shift.hue', 0)

    this.props.onChangeScale()
    this.props.onChangeShift('SHIFT_CHROMA', 'SHIFTED', 100)
    this.props.onChangeShift('SHIFT_HUE', 'SHIFTED', 0)

    sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
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

    this.scaleMessage.data = this.palette.value as ExchangeConfiguration
    sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'REVERSE_STOPS',
      }
    )
  }

  // Templates
  ToolsButtons = () => {
    return (
      <>
        <Feature isActive={this.features.SCALE_PRESETS.isActive()}>
          {this.props.preset.id.includes('CUSTOM') && (
            <>
              {this.props.preset.stops.length > 2 && (
                <Button
                  type="icon"
                  icon="minus"
                  helper={{
                    label: this.props.t('scale.actions.removeStop'),
                  }}
                  feature="REMOVE_STOP"
                  action={this.customHandler}
                />
              )}
              <Feature isActive={this.features.PRESETS_CUSTOM_ADD.isActive()}>
                <Button
                  type="icon"
                  icon="plus"
                  isDisabled={this.props.preset.stops.length === 24}
                  helper={{
                    label: this.props.t('scale.actions.addStop'),
                  }}
                  feature="ADD_STOP"
                  isBlocked={this.features.PRESETS_CUSTOM_ADD.isReached(
                    this.props.preset.stops.length
                  )}
                  onBlock={() => {
                    sendPluginMessage(
                      {
                        pluginMessage: { type: 'GET_PRO' },
                      },
                      '*'
                    )
                  }}
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
        <Feature isActive={this.features.SCALE_REVERSE.isActive()}>
          <Button
            type="icon"
            icon="reverse"
            helper={{
              label: this.props.t('scale.actions.reverseStops'),
            }}
            feature="REVERSE_SCALE"
            isBlocked={this.features.SCALE_REVERSE.isBlocked()}
            isNew={this.features.SCALE_REVERSE.isNew()}
            onBlock={() => {
              sendPluginMessage(
                {
                  pluginMessage: { type: 'GET_PRO' },
                },
                '*'
              )
            }}
            action={this.onReverseStops}
          />
        </Feature>
        <Feature isActive={this.features.SCALE_RESET.isActive()}>
          <Button
            type="icon"
            icon="reset"
            helper={{
              label: this.props.t('scale.actions.resetScale'),
            }}
            feature="RESET_SCALE"
            isBlocked={this.features.SCALE_RESET.isBlocked()}
            isNew={this.features.SCALE_RESET.isNew()}
            onBlock={() => {
              sendPluginMessage(
                {
                  pluginMessage: { type: 'GET_PRO' },
                },
                '*'
              )
            }}
            action={this.onResetScale}
          />
        </Feature>
      </>
    )
  }

  MoreTools = () => {
    const menuOptions: Array<DropdownOption> = []

    if (this.props.preset.id.includes('CUSTOM')) {
      if (this.props.preset.stops.length > 2)
        menuOptions.push({
          label: this.props.t('scale.actions.removeStop'),
          value: 'REMOVE_STOP',
          feature: 'REMOVE_STOP',
          type: 'OPTION',
          action: this.customHandler,
        })

      if (
        this.features.PRESETS_CUSTOM_ADD.isActive() &&
        this.props.preset.stops.length < 24
      )
        menuOptions.push({
          label: this.props.t('scale.actions.addStop'),
          value: 'ADD_STOP',
          feature: 'ADD_STOP',
          type: 'OPTION',
          isBlocked: this.features.PRESETS_CUSTOM_ADD.isReached(
            this.props.preset.stops.length
          ),
          action: this.customHandler,
        })
    }

    if (this.features.SCALE_REVERSE.isActive())
      menuOptions.push({
        label: this.props.t('scale.actions.reverseStops'),
        value: 'REVERSE_STOPS',
        feature: 'REVERSE_SCALE',
        type: 'OPTION',
        isBlocked: this.features.SCALE_REVERSE.isBlocked(),
        isNew: this.features.SCALE_REVERSE.isNew(),
        onBlock: () => {
          sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
        },
        action: this.onReverseStops,
      })

    if (this.features.SCALE_RESET.isActive())
      menuOptions.push({
        label: this.props.t('scale.actions.resetScale'),
        value: 'RESET_SCALE',
        feature: 'RESET_SCALE',
        type: 'OPTION',
        isBlocked: this.features.SCALE_RESET.isBlocked(),
        isNew: this.features.SCALE_RESET.isNew(),
        onBlock: () => {
          sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
        },
        action: this.onResetScale,
      })

    return (
      <Menu
        id="more-tools-scale"
        icon="ellipses"
        options={menuOptions}
        alignment="BOTTOM_RIGHT"
        helper={{
          label: this.props.t('scale.actions.moreTools'),
        }}
        onBlock={() => {
          sendPluginMessage(
            {
              pluginMessage: { type: 'GET_PRO' },
            },
            '*'
          )
        }}
      />
    )
  }

  private renderHeader = (isReachedOffset = 0) => {
    const limit = this.features.PRESETS_CUSTOM_ADD.limit ?? 0

    return (
      <div
        className={doClassnames([
          layouts['stackbar'],
          layouts['stackbar--fill'],
        ])}
      >
        <SimpleItem
          id="update-preset"
          leftPartSlot={
            <Feature
              isActive={
                this.features.SCALE_PRESETS.isActive() &&
                this.props.documentWidth > 460
              }
            >
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
          }
          rightPartSlot={
            this.props.documentWidth > 460 ? (
              <div
                className={doClassnames([
                  layouts['snackbar--medium'],
                  layouts['snackbar--wrap'],
                  layouts['snackbar--right'],
                ])}
              >
                <this.ToolsButtons />
              </div>
            ) : (
              <div
                className={doClassnames([
                  layouts['snackbar--medium'],
                  layouts['snackbar--wrap'],
                  layouts['snackbar--right'],
                ])}
              >
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
                <this.MoreTools />
              </div>
            )
          }
          alignment="CENTER"
          isListItem={false}
        />
        {this.features.PRESETS_CUSTOM_ADD.isReached(
          this.props.preset.stops.length + isReachedOffset
        ) &&
          this.props.preset.id.includes('CUSTOM') && (
            <div
              style={{
                padding:
                  isReachedOffset === 0
                    ? '0 var(--size-pos-xsmall) var(--size-pos-xxxsmall)'
                    : '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
              }}
            >
              <SemanticMessage
                type="INFO"
                message={this.props.t('info.maxNumberOfStops', {
                  count: limit.toString(),
                })}
                actionsSlot={
                  this.props.config.plan.isTrialEnabled &&
                  this.props.trialStatus !== 'EXPIRED' ? (
                    <Button
                      type="secondary"
                      label={this.props.t('plan.tryPro')}
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
                      label={this.props.t('plan.getPro')}
                      action={() =>
                        sendPluginMessage(
                          { pluginMessage: { type: 'GET_PRO' } },
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
    )
  }

  Edit = () => {
    return (
      <>
        {this.renderHeader()}
        <Lightness
          {...this.props}
          id={this.props.id}
          preset={this.props.preset}
          scale={this.props.scale}
          distributionEasing={this.props.distributionEasing}
          textColorsTheme={this.props.textColorsTheme}
          documentWidth={this.props.documentWidth}
          onChangeScale={this.props.onChangeScale}
          onChangeThemes={this.props.onChangeThemes}
          onChangeStops={this.props.onChangeStops}
        />
        <Chroma
          {...this.props}
          id={this.props.id}
          shift={this.props.shift}
          onChangeShift={this.props.onChangeShift}
        />
        <Hue
          {...this.props}
          id={this.props.id}
          shift={this.props.shift}
          onChangeShift={this.props.onChangeShift}
        />
      </>
    )
  }

  // Render
  render() {
    return <this.Edit />
  }
}
