import { PureComponent } from 'preact/compat'
import {
  EasingConfiguration,
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { Button, DropdownOption, layouts, Menu } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { computeScaleForStops } from '../../../utils/scaleStops'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { defaultPreset } from '../../../stores/presets'
import { $palette } from '../../../stores/palette'
import { trackScaleManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

interface StopToolsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  distributionEasing: EasingConfiguration
  onChangeScale: () => void
  onChangeStops?: (stops: number[]) => void
}

export default class StopTools extends PureComponent<StopToolsProps> {
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
    SCALE_REVERSE: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_REVERSE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: StopToolsProps) {
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
    return StopTools.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Handlers
  customHandler = (e: Event) => {
    const stops = [...($palette.get().preset?.['stops'] ?? [1, 2])]
    const preset = $palette.get().preset ?? defaultPreset

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
      <div
        className={doClassnames([
          layouts['snackbar--medium'],
          layouts['snackbar--right'],
          layouts['snackbar--wrap'],
        ])}
      >
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
              const isTrial =
                this.props.config.plan.isTrialEnabled &&
                this.props.trialStatus !== 'EXPIRED'
              sendPluginMessage(
                {
                  pluginMessage: isTrial
                    ? { type: 'GET_TRIAL' }
                    : {
                        type: 'GET_PRO',
                        data: { origin: 'REVERSE_SCALE' },
                      },
                },
                '*'
              )
            }}
            action={this.onReverseStops}
          />
        </Feature>
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
                    const isTrial =
                      this.props.config.plan.isTrialEnabled &&
                      this.props.trialStatus !== 'EXPIRED'
                    sendPluginMessage(
                      {
                        pluginMessage: isTrial
                          ? { type: 'GET_TRIAL' }
                          : {
                              type: 'GET_PRO',
                              data: { origin: 'ADD_STOP' },
                            },
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
      </div>
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
                      data: { origin: 'ADD_STOP' },
                    },
              },
              '*'
            )
          },
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
          const isTrial =
            this.props.config.plan.isTrialEnabled &&
            this.props.trialStatus !== 'EXPIRED'
          sendPluginMessage(
            {
              pluginMessage: isTrial
                ? { type: 'GET_TRIAL' }
                : {
                    type: 'GET_PRO',
                    data: { origin: 'REVERSE_SCALE' },
                  },
            },
            '*'
          )
        },
        action: this.onReverseStops,
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
          const isTrial =
            this.props.config.plan.isTrialEnabled &&
            this.props.trialStatus !== 'EXPIRED'
          sendPluginMessage(
            {
              pluginMessage: isTrial
                ? { type: 'GET_TRIAL' }
                : {
                    type: 'GET_PRO',
                    data: { origin: 'MORE_TOOLS' },
                  },
            },
            '*'
          )
        }}
      />
    )
  }

  // Render
  render() {
    return this.props.documentWidth > 460 ? (
      <this.ToolsButtons />
    ) : (
      <this.MoreTools />
    )
  }
}
