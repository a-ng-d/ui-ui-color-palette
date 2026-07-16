import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  EasingConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames, doScale, FeatureStatus } from '@unoff/utils'
import {
  Bar,
  Button,
  Dropdown,
  Layout,
  layouts,
  List,
  SectionTitle,
  Select,
} from '@unoff/ui'
import { ManagePaletteState } from '../services/ManagePalette'
import ScaleLCH from '../modules/scale/ScaleLCH'
import ScaleCR from '../modules/scale/ScaleCR'
import KeyboardShortcuts from '../modules/scale/KeyboardShortcuts'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { computeScaleForStops } from '../../utils/scaleStops'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  PlanStatus,
  Service,
  Subservice,
} from '../../types/app'
import { $palette, $themes } from '../../stores/palette'
import { trackScaleManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface ScaleProps extends BaseProps, WithConfigProps, WithTranslationProps {
  subservice: Subservice
  id: string
  sourceColors?: Array<SourceColorConfiguration>
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  themes: Array<ThemeConfiguration>
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  actions?: string
  onChangeScale: () => void
  onChangeShift: (feature?: string, state?: string, value?: number) => void
  onChangeDistributionEasing: React.Dispatch<Partial<ManagePaletteState>>
}

interface ScaleState {
  isTipsOpen: boolean
  isContrastMode: boolean
}

export default class Scale extends PureComponent<ScaleProps, ScaleState> {
  private theme: string | null

  static defaultProps: Partial<ScaleProps> = {
    distributionEasing: 'LINEAR',
  }

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SCALE_CONTRAST_RATIO: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CONTRAST_RATIO',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_LINEAR: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_LINEAR',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_IN: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_IN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_OUT: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_OUT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_SINE: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_SINE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_QUAD: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_QUAD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_CUBIC: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_CUBIC',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_DISTRIBUTION_APPLY: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_APPLY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_HELPER_TIPS: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HELPER_TIPS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Scale.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ScaleProps) {
    super(props)
    this.state = {
      isTipsOpen: false,
      isContrastMode: false,
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Handlers
  themesHandler = (e: ScaleConfiguration) => {
    const newThemes = $themes.get().map((theme) => ({
      ...theme,
      scale: e,
    }))

    $themes.set(newThemes)

    const id = this.props.id
    setTimeout(() => {
      sendPluginMessage(
        {
          pluginMessage: {
            type: 'UPDATE_PALETTE',
            id,
            items: [{ key: 'themes', value: $themes.get() }],
          },
        },
        '*'
      )
    }, 1000)
  }

  stopsHandler = (stops: number[]) => {
    const newThemes = $themes.get().map((theme) => ({
      ...theme,
      scale: computeScaleForStops(
        stops,
        theme.isEnabled ? $palette.get().scale : theme.scale,
        this.props.distributionEasing
      ),
    }))

    $themes.set(newThemes)

    const id = this.props.id
    setTimeout(() => {
      sendPluginMessage(
        {
          pluginMessage: {
            type: 'UPDATE_PALETTE',
            id,
            items: [{ key: 'themes', value: $themes.get() }],
          },
        },
        '*'
      )
    }, 1000)
  }

  // Direct Actions
  onChangeDistributionEasingCurve = (e: Event) => {
    const value = (e.target as HTMLElement).dataset.value ?? 'LINEAR'

    const currentEasing = this.props.distributionEasing
    const explodedEasing = currentEasing.split('_')

    if (value !== 'LINEAR' && explodedEasing.length === 1) {
      explodedEasing[0] = value
      explodedEasing[1] = 'SINE'
    } else if (value !== 'LINEAR' && explodedEasing.length > 1)
      explodedEasing[0] = value
    else {
      explodedEasing[0] = 'LINEAR'
      if (explodedEasing.length > 1) explodedEasing.pop()
    }

    this.props.onChangeDistributionEasing({
      distributionEasing: explodedEasing.join('_') as EasingConfiguration,
    })

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: explodedEasing.join('_') as EasingConfiguration,
      }
    )
  }

  onChangeDistributionEasingVelocity = (e: Event) => {
    const value = (e.target as HTMLElement).dataset.value ?? ''

    const currentEasing = this.props.distributionEasing
    const explodedEasing = currentEasing.split('_')

    explodedEasing[1] = value

    this.props.onChangeDistributionEasing({
      distributionEasing: explodedEasing.join('_') as EasingConfiguration,
    })

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: explodedEasing.join('_') as EasingConfiguration,
      }
    )
  }

  onSwitchContrasteMode = () => {
    this.setState({
      isContrastMode: !this.state.isContrastMode,
    })

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: this.state.isContrastMode
          ? 'CONTRAST_MODE_ON'
          : 'CONTRAST_MODE_OFF',
      }
    )
  }

  onApplyDistributionEasing = (
    scale: ScaleConfiguration,
    distributionEasing: EasingConfiguration
  ) => {
    const stops = Object.keys(scale)
      .map((id) => parseFloat(id))
      .sort((a, b) => a - b)

    const minId = stops[0]
    const maxId = stops[stops.length - 1]

    const minIdValue = parseFloat(scale[minId].toString())
    const maxIdValue = parseFloat(scale[maxId].toString())

    const isInverted = minIdValue < maxIdValue

    let tempEasing = distributionEasing

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

    const allValues = Object.values(scale).map((value) =>
      parseFloat(value.toString())
    )
    const scaleMin = Math.min(...allValues)
    const scaleMax = Math.max(...allValues)

    const calculatedScale = doScale(stops, scaleMin, scaleMax, tempEasing)

    return isInverted
      ? Object.fromEntries(
          Object.entries(calculatedScale).map(([id, value]) => {
            return [id, scaleMax - (parseFloat(value.toString()) - scaleMin)]
          })
        )
      : calculatedScale
  }

  // Templates
  DistributionEasing = () => {
    return (
      <div
        className={doClassnames([
          layouts['snackbar--tight'],
          layouts['snackbar--wrap'],
        ])}
      >
        <Dropdown
          id="update-distribution-easing-curve"
          options={[
            {
              label: this.props.t('scale.easing.linear'),
              value: 'LINEAR',
              type: 'OPTION',
              isActive:
                this.features.SCALE_HELPER_DISTRIBUTION_LINEAR.isActive(),
              isBlocked:
                this.features.SCALE_HELPER_DISTRIBUTION_LINEAR.isBlocked(),
              onBlock: () => {
                sendPluginMessage(
                  {
                    pluginMessage: { type: 'GET_PRO' },
                  },
                  '*'
                )
              },
              isNew: this.features.SCALE_HELPER_DISTRIBUTION_LINEAR.isNew(),
              action: this.onChangeDistributionEasingCurve,
            },
            {
              type: 'SEPARATOR',
            },
            {
              label: this.props.t('scale.easing.easeIn'),
              value: 'EASEIN',
              type: 'OPTION',
              isActive:
                this.features.SCALE_HELPER_DISTRIBUTION_EASE_IN.isActive(),
              isBlocked:
                this.features.SCALE_HELPER_DISTRIBUTION_EASE_IN.isBlocked(),
              isNew: this.features.SCALE_HELPER_DISTRIBUTION_EASE_IN.isNew(),
              onBlock: () => {
                sendPluginMessage(
                  {
                    pluginMessage: { type: 'GET_PRO' },
                  },
                  '*'
                )
              },
              action: this.onChangeDistributionEasingCurve,
            },
            {
              label: this.props.t('scale.easing.easeOut'),
              value: 'EASEOUT',
              type: 'OPTION',
              isActive:
                this.features.SCALE_HELPER_DISTRIBUTION_EASE_OUT.isActive(),
              isBlocked:
                this.features.SCALE_HELPER_DISTRIBUTION_EASE_OUT.isBlocked(),
              isNew: this.features.SCALE_HELPER_DISTRIBUTION_EASE_OUT.isNew(),
              onBlock: () => {
                sendPluginMessage(
                  {
                    pluginMessage: { type: 'GET_PRO' },
                  },
                  '*'
                )
              },
              action: this.onChangeDistributionEasingCurve,
            },
            {
              label: this.props.t('scale.easing.easeInOut'),
              value: 'EASEINOUT',
              type: 'OPTION',
              isActive:
                this.features.SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isActive(),
              isBlocked:
                this.features.SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isBlocked(),
              isNew:
                this.features.SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isNew(),
              onBlock: () => {
                sendPluginMessage(
                  {
                    pluginMessage: { type: 'GET_PRO' },
                  },
                  '*'
                )
              },
              action: this.onChangeDistributionEasingCurve,
            },
          ]}
          selected={this.props.distributionEasing.split('_')[0]}
          pin="BOTTOM"
          helper={{
            label: this.props.t('scale.easing.label'),
          }}
          isBlocked={this.features.SCALE_HELPER_DISTRIBUTION.isBlocked()}
          isNew={this.features.SCALE_HELPER_DISTRIBUTION.isNew()}
          onBlock={() => {
            sendPluginMessage(
              {
                pluginMessage: { type: 'GET_PRO' },
              },
              '*'
            )
          }}
        />
        {this.props.distributionEasing !== 'LINEAR' && (
          <Dropdown
            id="update-distribution-easing-velocity"
            options={[
              {
                label: this.props.t('scale.easing.sine'),
                value: 'SINE',
                type: 'OPTION',
                isActive:
                  this.features.SCALE_HELPER_DISTRIBUTION_SINE.isActive(),
                isBlocked:
                  this.features.SCALE_HELPER_DISTRIBUTION_SINE.isBlocked(),
                isNew: this.features.SCALE_HELPER_DISTRIBUTION_SINE.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: { type: 'GET_PRO' },
                    },
                    '*'
                  )
                },
                action: this.onChangeDistributionEasingVelocity,
              },
              {
                label: this.props.t('scale.easing.quad'),
                value: 'QUAD',
                type: 'OPTION',
                isActive:
                  this.features.SCALE_HELPER_DISTRIBUTION_QUAD.isActive(),
                isBlocked:
                  this.features.SCALE_HELPER_DISTRIBUTION_QUAD.isBlocked(),
                isNew: this.features.SCALE_HELPER_DISTRIBUTION_QUAD.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: { type: 'GET_PRO' },
                    },
                    '*'
                  )
                },
                action: this.onChangeDistributionEasingVelocity,
              },
              {
                label: this.props.t('scale.easing.cubic'),
                value: 'CUBIC',
                type: 'OPTION',
                isActive:
                  this.features.SCALE_HELPER_DISTRIBUTION_CUBIC.isActive(),
                isBlocked:
                  this.features.SCALE_HELPER_DISTRIBUTION_CUBIC.isBlocked(),
                isNew: this.features.SCALE_HELPER_DISTRIBUTION_CUBIC.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: { type: 'GET_PRO' },
                    },
                    '*'
                  )
                },
                action: this.onChangeDistributionEasingVelocity,
              },
            ]}
            selected={this.props.distributionEasing.split('_')[1]}
            pin="BOTTOM"
            isBlocked={this.features.SCALE_HELPER_DISTRIBUTION.isBlocked()}
            isNew={this.features.SCALE_HELPER_DISTRIBUTION.isNew()}
            onBlock={() => {
              sendPluginMessage(
                {
                  pluginMessage: { type: 'GET_PRO' },
                },
                '*'
              )
            }}
          />
        )}
        <Feature
          isActive={this.features.SCALE_HELPER_DISTRIBUTION_APPLY.isActive()}
        >
          <Button
            type="icon"
            icon="refresh"
            helper={{
              label: this.props.t('scale.actions.applyEasing'),
            }}
            isBlocked={this.features.SCALE_HELPER_DISTRIBUTION_APPLY.isBlocked()}
            isNew={this.features.SCALE_HELPER_DISTRIBUTION_APPLY.isNew()}
            onBlock={() => {
              sendPluginMessage(
                {
                  pluginMessage: { type: 'GET_PRO' },
                },
                '*'
              )
            }}
            action={() => {
              const newScale = this.onApplyDistributionEasing(
                this.props.scale,
                this.props.distributionEasing
              )

              $palette.setKey('scale', newScale)
              this.props.onChangeScale()

              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'UPDATE_SCALE',
                    id: this.props.id,
                    data: $palette.value,
                  },
                },
                '*'
              )
            }}
          />
        </Feature>
      </div>
    )
  }

  Edit = () => {
    return (
      <Layout
        id="scale"
        column={[
          {
            node: (
              <>
                <Bar
                  id="scale-header"
                  leftPartSlot={
                    <SectionTitle
                      label={
                        this.state.isContrastMode
                          ? this.props.t('scale.contrast.title')
                          : this.props.t('scale.title')
                      }
                      indicator={Object.entries(
                        this.props.scale ?? {}
                      ).length.toString()}
                    />
                  }
                  rightPartSlot={
                    <div
                      className={doClassnames([layouts['snackbar--medium']])}
                    >
                      <Feature
                        isActive={this.features.SCALE_CONTRAST_RATIO.isActive()}
                      >
                        <Select
                          id="switch-contrast-mode"
                          type="SWITCH_BUTTON"
                          label={this.props.t('scale.contrast.label')}
                          shouldReflow
                          isChecked={this.state.isContrastMode}
                          isNew={this.features.SCALE_CONTRAST_RATIO.isNew()}
                          action={this.onSwitchContrasteMode}
                        />
                      </Feature>
                    </div>
                  }
                  clip={['LEFT']}
                  border={['BOTTOM']}
                />
                <List
                  isFullHeight
                  isFullWidth
                >
                  {!this.state.isContrastMode ? (
                    <ScaleLCH
                      {...this.props}
                      onChangeThemes={this.themesHandler}
                      onChangeStops={this.stopsHandler}
                      onSwitchMode={this.onSwitchContrasteMode}
                    />
                  ) : (
                    <ScaleCR
                      {...this.props}
                      onSwitchMode={this.onSwitchContrasteMode}
                    />
                  )}
                  <Feature isActive={this.features.SCALE_HELPER.isActive()}>
                    <Bar
                      id="update-easing"
                      leftPartSlot={
                        <Feature
                          isActive={this.features.SCALE_HELPER_DISTRIBUTION.isActive()}
                        >
                          <this.DistributionEasing />
                        </Feature>
                      }
                      rightPartSlot={
                        <Feature
                          isActive={this.features.SCALE_HELPER_TIPS.isActive()}
                        >
                          <Button
                            type="icon"
                            icon="help"
                            helper={{
                              label: this.props.t('scale.keyboardShortcuts'),
                            }}
                            isBlocked={this.features.SCALE_HELPER_TIPS.isBlocked()}
                            isNew={this.features.SCALE_HELPER_TIPS.isNew()}
                            onBlock={() => {
                              sendPluginMessage(
                                {
                                  pluginMessage: { type: 'GET_PRO' },
                                },
                                '*'
                              )
                            }}
                            action={() => {
                              this.setState({
                                isTipsOpen: true,
                              })
                            }}
                          />
                        </Feature>
                      }
                    />
                    <KeyboardShortcuts
                      {...this.props}
                      isOpen={this.state.isTipsOpen}
                      onClose={() => this.setState({ isTipsOpen: false })}
                    />
                  </Feature>
                </List>
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }

  // Render
  render() {
    return <this.Edit />
  }
}
