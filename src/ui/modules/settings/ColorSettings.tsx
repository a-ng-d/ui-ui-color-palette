import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  VisionSimulationModeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Dropdown,
  FormItem,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ColorSettingsProps extends BaseProps, WithConfigProps {
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion?: AlgorithmVersionConfiguration
  isLast?: boolean
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
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
    SETTINGS_COLOR_SPACE_HSLUV: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSLUV',
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

  // Templates
  ColorSpace = () => {
    return (
      <Feature
        isActive={ColorSettings.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SETTINGS_COLOR_SPACE.isActive()}
      >
        <FormItem
          id="update-color-space"
          label={this.props.locales.settings.color.colorSpace.label}
          isBlocked={ColorSettings.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SETTINGS_COLOR_SPACE.isBlocked()}
        >
          <Dropdown
            id="update-color-space"
            options={[
              {
                label: this.props.locales.settings.color.colorSpace.lch,
                value: 'LCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_LCH.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_LCH.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_LCH.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.locales.settings.color.colorSpace.oklch,
                value: 'OKLCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_OKLCH.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_OKLCH.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_OKLCH.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.locales.settings.color.colorSpace.lab,
                value: 'LAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_LAB.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_LAB.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_LAB.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.locales.settings.color.colorSpace.oklab,
                value: 'OKLAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_OKLAB.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_OKLAB.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_OKLAB.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.locales.settings.color.colorSpace.hsl,
                value: 'HSL',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_HSL.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_HSL.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_HSL.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.locales.settings.color.colorSpace.hsluv,
                value: 'HSLUV',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_HSLUV.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_HSLUV.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE_HSLUV.isNew(),
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.colorSpace}
            isBlocked={ColorSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SETTINGS_COLOR_SPACE.isBlocked()}
            isNew={ColorSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SETTINGS_COLOR_SPACE.isNew()}
          />
        </FormItem>
        {this.props.colorSpace === 'HSL' && (
          <SemanticMessage
            type="WARNING"
            message={this.props.locales.warning.hslColorSpace}
          />
        )}
      </Feature>
    )
  }

  VisionSimulationMode = () => {
    return (
      <Feature
        isActive={ColorSettings.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SETTINGS_VISION_SIMULATION_MODE.isActive()}
      >
        <FormItem
          id="update-color-blind-mode"
          label={this.props.locales.settings.color.visionSimulationMode.label}
          isBlocked={ColorSettings.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
        >
          <Dropdown
            id="update-color-blind-mode"
            options={[
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode.none,
                value: 'NONE',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                type: 'SEPARATOR',
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .colorBlind,
                type: 'TITLE',
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .protanomaly,
                value: 'PROTANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .protanopia,
                value: 'PROTANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .deuteranomaly,
                value: 'DEUTERANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .deuteranopia,
                value: 'DEUTERANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .tritanomaly,
                value: 'TRITANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .tritanopia,
                value: 'TRITANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .achromatomaly,
                value: 'ACHROMATOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  this.props.locales.settings.color.visionSimulationMode
                    .achromatopsia,
                value: 'ACHROMATOPSIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.visionSimulationMode}
            warning={
              this.props.service === 'CREATE' &&
              ColorSettings.features(
                this.props.planStatus,
                this.props.config,
                'EDIT',
                this.props.editor
              )[
                `SETTINGS_VISION_SIMULATION_MODE_${this.props.visionSimulationMode}`
              ].isBlocked()
                ? {
                    label:
                      this.props.locales.settings.color.visionSimulationMode
                        .warning,
                  }
                : undefined
            }
            isBlocked={ColorSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
            isNew={ColorSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SETTINGS_VISION_SIMULATION_MODE.isNew()}
          />
        </FormItem>
      </Feature>
    )
  }

  ChromaVelocity = () => {
    return (
      <Feature
        isActive={ColorSettings.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SETTINGS_ALGORITHM.isActive()}
      >
        <FormItem
          id="update-algorithm"
          label={this.props.locales.settings.color.algorithmVersion.label}
          isBlocked={ColorSettings.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SETTINGS_ALGORITHM.isBlocked()}
        >
          <Dropdown
            id="update-algorithm"
            options={[
              {
                label: this.props.locales.settings.color.algorithmVersion.v1,
                value: 'v1',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V1.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V1.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V1.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.locales.settings.color.algorithmVersion.v2,
                value: 'v2',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V2.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V2.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V2.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: this.props.locales.settings.color.algorithmVersion.v3,
                value: 'v3',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V3.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V3.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_ALGORITHM_V3.isNew(),
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.algorithmVersion}
            isBlocked={ColorSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SETTINGS_ALGORITHM.isBlocked()}
            isNew={ColorSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SETTINGS_ALGORITHM.isNew()}
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
              <SectionTitle label={this.props.locales.settings.color.title} />
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
