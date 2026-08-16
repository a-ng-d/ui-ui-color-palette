import { PureComponent, ChangeEvent, KeyboardEvent } from 'preact/compat'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import {
  Dropdown,
  FormItem,
  IconChip,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ColorSettingsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion?: AlgorithmVersionConfiguration
  themes?: Array<ThemeConfiguration>
  isLast?: boolean
  onChangeSettings: (
    e:
      | ChangeEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

export default class ColorSettings extends PureComponent<ColorSettingsProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SETTINGS_COLOR_SPACE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_LCH: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_LCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_OKLCH: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_LAB: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_LAB',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_OKLAB: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLAB',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_HSL: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_HSV: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSV',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_HSLUV: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSLUV',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_CMYK: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_CMYK',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_NONE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_NONE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_ALGORITHM: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_ALGORITHM',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_ALGORITHM_V1: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_ALGORITHM_V1',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_ALGORITHM_V2: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_ALGORITHM_V2',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_ALGORITHM_V3: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_ALGORITHM_V3',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  private get features() {
    return ColorSettings.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  private get activeThemeName(): string | undefined {
    const activeTheme = (this.props.themes ?? []).find(
      (theme) => theme.isEnabled
    )
    if (activeTheme === undefined) return undefined
    return activeTheme.type === 'default theme' ? undefined : activeTheme.name
  }

  // Templates
  ColorSpace = () => {
    return (
      <Feature isActive={this.features.SETTINGS_COLOR_SPACE.isActive()}>
        <FormItem
          id="update-color-space"
          label={this.props.t('settings.color.colorSpace.label')}
          isBlocked={this.features.SETTINGS_COLOR_SPACE.isBlocked()}
        >
          <Dropdown
            id="update-color-space"
            options={[
              {
                label: this.props.t('settings.color.colorSpace.lch'),
                value: 'LCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_LCH.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_LCH.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_LCH.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.t('settings.color.colorSpace.oklch'),
                value: 'OKLCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_OKLCH.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_OKLCH.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_OKLCH.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.t('settings.color.colorSpace.lab'),
                value: 'LAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_LAB.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_LAB.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_LAB.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.t('settings.color.colorSpace.oklab'),
                value: 'OKLAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_OKLAB.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_OKLAB.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_OKLAB.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                type: 'SEPARATOR',
              },
              {
                label: this.props.t('settings.color.colorSpace.hsl'),
                value: 'HSL',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_HSL.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_HSL.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_HSL.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.t('settings.color.colorSpace.hsv'),
                value: 'HSV',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_HSV.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_HSV.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_HSV.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.t('settings.color.colorSpace.hsluv'),
                value: 'HSLUV',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_HSLUV.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_HSLUV.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_HSLUV.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                type: 'SEPARATOR',
              },
              {
                label: this.props.t('settings.color.colorSpace.cmyk'),
                value: 'CMYK',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: this.features.SETTINGS_COLOR_SPACE_CMYK.isActive(),
                isBlocked: this.features.SETTINGS_COLOR_SPACE_CMYK.isBlocked(),
                isNew: this.features.SETTINGS_COLOR_SPACE_CMYK.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.colorSpace}
            alignment="RIGHT"
            isFill
            isBlocked={this.features.SETTINGS_COLOR_SPACE.isBlocked()}
            isNew={this.features.SETTINGS_COLOR_SPACE.isNew()}
            onBlock={() => {
              sendPluginMessage(
                {
                  pluginMessage: {
                    type:
                      this.props.config.plan.isTrialEnabled &&
                      this.props.trialStatus !== 'EXPIRED'
                        ? 'GET_TRIAL'
                        : 'GET_PRO',
                  },
                },
                '*'
              )
            }}
          />
        </FormItem>
        {this.props.colorSpace === 'HSL' && (
          <SemanticMessage
            type="WARNING"
            message={this.props.t('warning.hslColorSpace')}
          />
        )}
      </Feature>
    )
  }

  VisionSimulationMode = () => {
    return (
      <Feature
        isActive={this.features.SETTINGS_VISION_SIMULATION_MODE.isActive()}
      >
        <FormItem
          id="update-color-blind-mode"
          label={this.props.t('settings.color.visionSimulationMode.label')}
          isBlocked={this.features.SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: 'var(--size-pos-xxsmall)',
            }}
          >
            <div
              style={{
                flex: '1 1 auto',
                minWidth: 0,
              }}
            >
              <Dropdown
                id="update-color-blind-mode"
                options={[
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.none'
                    ),
                    value: 'NONE',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    type: 'SEPARATOR',
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.colorBlind'
                    ),
                    type: 'TITLE',
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.protanomaly'
                    ),
                    value: 'PROTANOMALY',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.protanopia'
                    ),
                    value: 'PROTANOPIA',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.deuteranomaly'
                    ),
                    value: 'DEUTERANOMALY',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.deuteranopia'
                    ),
                    value: 'DEUTERANOPIA',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.tritanomaly'
                    ),
                    value: 'TRITANOMALY',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.tritanopia'
                    ),
                    value: 'TRITANOPIA',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.achromatomaly'
                    ),
                    value: 'ACHROMATOMALY',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                  {
                    label: this.props.t(
                      'settings.color.visionSimulationMode.achromatopsia'
                    ),
                    value: 'ACHROMATOPSIA',
                    feature: 'UPDATE_COLOR_BLIND_MODE',
                    type: 'OPTION',
                    isActive:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                    isBlocked:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                    isNew:
                      this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                    onBlock: () => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    },
                    action: this.props.onChangeSettings,
                  },
                ]}
                selected={this.props.visionSimulationMode}
                alignment="RIGHT"
                isFill
                isBlocked={this.features.SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
                isNew={this.features.SETTINGS_VISION_SIMULATION_MODE.isNew()}
                onBlock={() => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                }}
              />
            </div>
            {this.activeThemeName !== undefined && (
              <IconChip
                iconType="PICTO"
                iconName="info"
                text={this.props.t('settings.themeBinding.message', {
                  themeName: this.activeThemeName,
                })}
                type="MULTI_LINE"
              />
            )}
          </div>
        </FormItem>
      </Feature>
    )
  }

  ChromaVelocity = () => {
    return (
      <Feature isActive={this.features.SETTINGS_ALGORITHM.isActive()}>
        <FormItem
          id="update-algorithm"
          label={this.props.t('settings.color.algorithmVersion.label')}
          isBlocked={this.features.SETTINGS_ALGORITHM.isBlocked()}
        >
          <Dropdown
            id="update-algorithm"
            options={[
              {
                label: this.props.t('settings.color.algorithmVersion.v1'),
                value: 'v1',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: this.features.SETTINGS_ALGORITHM_V1.isActive(),
                isBlocked: this.features.SETTINGS_ALGORITHM_V1.isBlocked(),
                isNew: this.features.SETTINGS_ALGORITHM_V1.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.t('settings.color.algorithmVersion.v2'),
                value: 'v2',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: this.features.SETTINGS_ALGORITHM_V2.isActive(),
                isBlocked: this.features.SETTINGS_ALGORITHM_V2.isBlocked(),
                isNew: this.features.SETTINGS_ALGORITHM_V2.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.t('settings.color.algorithmVersion.v3'),
                value: 'v3',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: this.features.SETTINGS_ALGORITHM_V3.isActive(),
                isBlocked: this.features.SETTINGS_ALGORITHM_V3.isBlocked(),
                isNew: this.features.SETTINGS_ALGORITHM_V3.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                },
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.algorithmVersion}
            alignment="RIGHT"
            isFill
            isBlocked={this.features.SETTINGS_ALGORITHM.isBlocked()}
            isNew={this.features.SETTINGS_ALGORITHM.isNew()}
            onBlock={() => {
              sendPluginMessage(
                {
                  pluginMessage: {
                    type:
                      this.props.config.plan.isTrialEnabled &&
                      this.props.trialStatus !== 'EXPIRED'
                        ? 'GET_TRIAL'
                        : 'GET_PRO',
                  },
                },
                '*'
              )
            }}
          />
        </FormItem>
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle label={this.props.t('settings.color.title')} />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={[
          {
            node: <this.ColorSpace />,
          },
          {
            node: <this.VisionSimulationMode />,
          },
          {
            node: <this.ChromaVelocity />,
          },
        ]}
        border={!this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
