import React from 'react'
import { createPortal, PureComponent } from 'preact/compat'
import {
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  EasingConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, doScale, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Dialog,
  Dropdown,
  FormItem,
  KeyboardShortcutItem,
  Layout,
  layouts,
  List,
  SectionTitle,
  texts,
} from '@a_ng_d/figmug-ui'
import ScaleLightnessChroma from '../modules/scale/ScaleLightnessChroma'
import ScaleContrastRatio from '../modules/scale/ScaleContrastRatio'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $palette } from '../../stores/palette'
import { trackScaleManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { AppStates } from '../App'

interface ScaleProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  sourceColors?: Array<SourceColorConfiguration>
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  themes: Array<ThemeConfiguration>
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  actions?: string
  onChangePreset: React.Dispatch<Partial<AppStates>>
  onChangeScale: () => void
  onAddStop: React.Dispatch<Partial<AppStates>>
  onRemoveStop: React.Dispatch<Partial<AppStates>>
  onChangeShift: (feature?: string, state?: string, value?: number) => void
  onChangeDistributionEasing: React.Dispatch<Partial<AppStates>>
  onChangeThemes: React.Dispatch<Partial<AppStates>>
}

interface ScaleStates {
  isTipsOpen: boolean
  isContrastMode: boolean
}

export default class Scale extends PureComponent<ScaleProps, ScaleStates> {
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
    const scale = e
    const newThemes = this.props.themes.map((theme) => {
      return {
        ...theme,
        scale: scale,
      }
    })

    this.props.onChangeThemes({
      themes: newThemes,
    })

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'UPDATE_PALETTE',
          id: this.props.id,
          items: [
            {
              key: 'themes',
              value: newThemes,
            },
          ],
        },
      },
      '*'
    )
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
      <FormItem
        id="update-distribution-easing"
        label={this.props.t('scale.easing.label')}
        shouldFill={false}
        isBlocked={Scale.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SCALE_HELPER_DISTRIBUTION.isBlocked()}
      >
        <div className={layouts['snackbar--tight']}>
          <Dropdown
            id="update-distribution-easing-curve"
            options={[
              {
                label: this.props.t('scale.easing.linear'),
                value: 'LINEAR',
                type: 'OPTION',
                isActive: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_LINEAR.isActive(),
                isBlocked: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_LINEAR.isBlocked(),
                isNew: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_LINEAR.isNew(),
                action: this.onChangeDistributionEasingCurve,
              },
              {
                type: 'SEPARATOR',
              },
              {
                label: this.props.t('scale.easing.easeIn'),
                value: 'EASEIN',
                type: 'OPTION',
                isActive: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isActive(),
                isBlocked: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isBlocked(),
                isNew: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isNew(),
                action: this.onChangeDistributionEasingCurve,
              },
              {
                label: this.props.t('scale.easing.easeOut'),
                value: 'EASEOUT',
                type: 'OPTION',
                isActive: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isActive(),
                isBlocked: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isBlocked(),
                isNew: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isNew(),
                action: this.onChangeDistributionEasingCurve,
              },
              {
                label: this.props.t('scale.easing.easeInOut'),
                value: 'EASEINOUT',
                type: 'OPTION',
                isActive: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isActive(),
                isBlocked: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isBlocked(),
                isNew: Scale.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isNew(),
                action: this.onChangeDistributionEasingCurve,
              },
            ]}
            selected={this.props.distributionEasing.split('_')[0]}
            pin="BOTTOM"
            isBlocked={Scale.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_HELPER_DISTRIBUTION.isBlocked()}
            isNew={Scale.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_HELPER_DISTRIBUTION.isNew()}
          />
          {this.props.distributionEasing !== 'LINEAR' && (
            <Dropdown
              id="update-distribution-easing-velocity"
              options={[
                {
                  label: this.props.t('scale.easing.sine'),
                  value: 'SINE',
                  type: 'OPTION',
                  isActive: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_SINE.isActive(),
                  isBlocked: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_SINE.isBlocked(),
                  isNew: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_SINE.isNew(),
                  action: this.onChangeDistributionEasingVelocity,
                },
                {
                  label: this.props.t('scale.easing.quad'),
                  value: 'QUAD',
                  type: 'OPTION',
                  isActive: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_QUAD.isActive(),
                  isBlocked: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_QUAD.isBlocked(),
                  isNew: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_QUAD.isNew(),
                  action: this.onChangeDistributionEasingVelocity,
                },
                {
                  label: this.props.t('scale.easing.cubic'),
                  value: 'CUBIC',
                  type: 'OPTION',
                  isActive: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_CUBIC.isActive(),
                  isBlocked: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_CUBIC.isBlocked(),
                  isNew: Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER_DISTRIBUTION_CUBIC.isNew(),
                  action: this.onChangeDistributionEasingVelocity,
                },
              ]}
              selected={this.props.distributionEasing.split('_')[1]}
              pin="BOTTOM"
              isBlocked={Scale.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SCALE_HELPER_DISTRIBUTION.isBlocked()}
              isNew={Scale.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SCALE_HELPER_DISTRIBUTION.isNew()}
            />
          )}
          <Feature
            isActive={Scale.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_HELPER_DISTRIBUTION_APPLY.isActive()}
          >
            <Button
              type="icon"
              icon="refresh"
              helper={{
                label: this.props.t('scale.actions.applyEasing'),
                pin: 'TOP',
                type: 'MULTI_LINE',
              }}
              action={() => {
                const newScale = this.onApplyDistributionEasing(
                  this.props.scale,
                  this.props.distributionEasing
                )

                $palette.setKey('scale', newScale)
                this.props.onChangeScale()

                if (this.props.service === 'EDIT')
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
      </FormItem>
    )
  }

  KeyboardShortcuts = () => {
    let padding

    switch (this.theme) {
      case 'figma':
        padding = '0 var(--size-pos-xxsmall)'
        break
      case 'penpot':
        padding = '0 var(--size-pos-xxsmall)'
        break
      case 'sketch':
        padding = '0 var(--size-pos-xxsmall)'
        break
      case 'framer':
        padding = '0 var(--size-pos-xxsmall)'
        break
      default:
        padding = 'var(--size-pos-xxsmall)'
    }

    const isMacOrWinKeyboard =
      navigator.userAgent.indexOf('Mac') !== -1 ? '⌘' : '⌃'

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'OPEN_KEYBOARD_SHORTCUTS',
      }
    )

    return createPortal(
      <Dialog
        title={this.props.t('scale.tips.title')}
        onClose={() =>
          this.setState({
            isTipsOpen: false,
          })
        }
      >
        <div style={{ flex: 1, padding: padding }}>
          <Layout
            id="keyboard-shortcuts"
            column={[
              {
                node: (
                  <List>
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.move')}
                      shortcuts={[
                        [
                          isMacOrWinKeyboard,
                          this.props.t('scale.tips.inputs.drag'),
                        ],
                      ]}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.distribute')}
                      shortcuts={[
                        [
                          this.props.t('scale.tips.inputs.shift'),
                          this.props.t('scale.tips.inputs.drag'),
                        ],
                      ]}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.select')}
                      shortcuts={[[this.props.t('scale.tips.inputs.click')]]}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.unselect')}
                      shortcuts={[[this.props.t('scale.tips.inputs.escape')]]}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.navPrevious')}
                      shortcuts={[
                        [
                          this.props.t('scale.tips.inputs.shift'),
                          this.props.t('scale.tips.inputs.tab'),
                        ],
                      ]}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.navNext')}
                      shortcuts={[[this.props.t('scale.tips.inputs.tab')]]}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.type')}
                      shortcuts={[
                        [this.props.t('scale.tips.inputs.dbClick')],
                        [this.props.t('scale.tips.inputs.enter')],
                      ]}
                      separator={this.props.t('scale.tips.inputs.or')}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.shiftLeft')}
                      shortcuts={[
                        [this.props.t('scale.tips.inputs.left')],
                        [
                          isMacOrWinKeyboard,
                          this.props.t('scale.tips.inputs.left'),
                        ],
                      ]}
                      separator={this.props.t('scale.tips.inputs.or')}
                    />
                    <KeyboardShortcutItem
                      label={this.props.t('scale.tips.shiftRight')}
                      shortcuts={[
                        [this.props.t('scale.tips.inputs.right')],
                        [
                          isMacOrWinKeyboard,
                          this.props.t('scale.tips.inputs.right'),
                        ],
                      ]}
                      separator={this.props.t('scale.tips.inputs.or')}
                    />
                  </List>
                ),
                typeModifier: 'DISTRIBUTED',
              },
              {
                node:
                  this.props.service === 'EDIT' ? (
                    <>
                      <Bar
                        id="watch-custom-keyboard-shortcuts"
                        leftPartSlot={
                          <SectionTitle
                            label={this.props.t('scale.tips.custom')}
                          />
                        }
                        shouldReflow
                      />
                      <List>
                        <KeyboardShortcutItem
                          label={this.props.t('scale.tips.add')}
                          shortcuts={[
                            [this.props.t('scale.tips.inputs.click')],
                          ]}
                        />
                        <KeyboardShortcutItem
                          label={this.props.t('scale.tips.remove')}
                          shortcuts={[
                            [this.props.t('scale.tips.inputs.backspace')],
                          ]}
                        />
                      </List>
                    </>
                  ) : undefined,
                typeModifier: 'LIST',
              },
            ]}
            isFullWidth
          />
        </div>
      </Dialog>,
      document.getElementById('modal') ?? document.createElement('app')
    )
  }

  Create = () => {
    return (
      <Layout
        id="scale"
        column={[
          {
            node: (
              <>
                {!this.state.isContrastMode ? (
                  <ScaleLightnessChroma
                    {...this.props}
                    onSwitchMode={this.onSwitchContrasteMode}
                  />
                ) : (
                  <ScaleContrastRatio
                    {...this.props}
                    onSwitchMode={this.onSwitchContrasteMode}
                  />
                )}
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER.isActive()}
                >
                  <Bar
                    id="update-easing"
                    leftPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SCALE_HELPER_DISTRIBUTION.isActive()}
                      >
                        <this.DistributionEasing />
                      </Feature>
                    }
                    rightPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SCALE_HELPER_TIPS.isActive()}
                      >
                        <div className={layouts['snackbar--tight']}>
                          <Button
                            type="tertiary"
                            label={this.props.t('scale.howTo')}
                            action={() =>
                              sendPluginMessage(
                                {
                                  pluginMessage: {
                                    type: 'OPEN_IN_BROWSER',
                                    data: {
                                      url: this.props.config.urls.howToUseUrl,
                                    },
                                  },
                                },
                                '*'
                              )
                            }
                          />
                          <span
                            className={doClassnames([
                              texts.type,
                              texts['type--secondary'],
                            ])}
                          >
                            {this.props.t('separator')}
                          </span>
                          <Button
                            type="tertiary"
                            label={this.props.t('scale.keyboardShortcuts')}
                            action={() =>
                              this.setState({
                                isTipsOpen: true,
                              })
                            }
                          />
                        </div>
                      </Feature>
                    }
                    shouldReflow
                  />
                  {this.state.isTipsOpen && <this.KeyboardShortcuts />}
                </Feature>
              </>
            ),
            typeModifier: 'DISTRIBUTED',
          },
        ]}
        isFullHeight
      />
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
                {!this.state.isContrastMode ? (
                  <ScaleLightnessChroma
                    {...this.props}
                    onChangeThemes={this.themesHandler}
                    onSwitchMode={this.onSwitchContrasteMode}
                  />
                ) : (
                  <ScaleContrastRatio
                    {...this.props}
                    onSwitchMode={this.onSwitchContrasteMode}
                  />
                )}
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_HELPER.isActive()}
                >
                  <Bar
                    id="update-easing"
                    leftPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SCALE_HELPER_DISTRIBUTION.isActive()}
                      >
                        <this.DistributionEasing />
                      </Feature>
                    }
                    rightPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SCALE_HELPER_TIPS.isActive()}
                      >
                        <div className={layouts['snackbar--tight']}>
                          <Button
                            type="tertiary"
                            label={this.props.t('scale.howTo')}
                            action={() =>
                              sendPluginMessage(
                                {
                                  pluginMessage: {
                                    type: 'OPEN_IN_BROWSER',
                                    data: {
                                      url: this.props.config.urls.howToUseUrl,
                                    },
                                  },
                                },
                                '*'
                              )
                            }
                          />
                          <span
                            className={doClassnames([
                              texts.type,
                              texts['type--secondary'],
                            ])}
                          >
                            {this.props.t('separator')}
                          </span>
                          <Button
                            type="tertiary"
                            label={this.props.t('scale.keyboardShortcuts')}
                            action={() =>
                              this.setState({
                                isTipsOpen: true,
                              })
                            }
                          />
                        </div>
                      </Feature>
                    }
                    shouldReflow
                  />
                  {this.state.isTipsOpen && <this.KeyboardShortcuts />}
                </Feature>
              </>
            ),
            typeModifier: 'DISTRIBUTED',
          },
        ]}
        isFullHeight
      />
    )
  }

  // Render
  render() {
    if (this.props.service === 'EDIT') return <this.Edit />
    else return <this.Create />
  }
}
