import React from 'react'
import {
  ColorSpaceConfiguration,
  VisionSimulationModeConfiguration,
  LockedSourceColorsConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { layouts, texts, Button, Dropdown, Select } from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import lsc from '../../../content/images/lock_source_colors.gif'
import { ConfigContextType } from '../../../config/ConfigContext'

interface SettingsControlsProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  isDrawerCollapsed: boolean
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  canResetColors: boolean
  onColorSettingsHandler: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLLIElement>
  ) => void
  onResetSourceColors?: () => void
}

export default class SettingsControls extends React.PureComponent<SettingsControlsProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW_LOCK_SOURCE_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_LOCK_SOURCE_COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
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
  })

  // Render
  render() {
    const features = SettingsControls.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )

    return (
      <div
        className={doClassnames([
          layouts['snackbar--medium'],
          layouts['snackbar--right'],
          layouts['snackbar--wrap'],
        ])}
      >
        <Feature
          isActive={
            features.PREVIEW_LOCK_SOURCE_COLORS.isActive() &&
            !this.props.isDrawerCollapsed
          }
        >
          <Select
            id="lock-source-colors"
            label={this.props.t('preview.lock.label')}
            type="SWITCH_BUTTON"
            preview={{
              image: lsc,
              text: this.props.t('preview.lock.preview'),
              pin: 'TOP',
            }}
            feature="LOCK_SOURCE_COLORS"
            shouldReflow
            isChecked={this.props.areSourceColorsLocked}
            isBlocked={
              features.PREVIEW_LOCK_SOURCE_COLORS.isBlocked() &&
              !this.props.areSourceColorsLocked
            }
            isNew={features.PREVIEW_LOCK_SOURCE_COLORS.isNew()}
            action={this.props.onColorSettingsHandler}
            onUnblock={() => {
              sendPluginMessage(
                {
                  pluginMessage: { type: 'GET_PRO' },
                },
                '*'
              )
            }}
          />
        </Feature>
        <Feature
          isActive={
            features.SETTINGS_COLOR_SPACE.isActive() &&
            !this.props.isDrawerCollapsed
          }
        >
          <Dropdown
            id="update-color-space"
            options={[
              {
                label: this.props.t('settings.color.colorSpace.lch'),
                value: 'LCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: features.SETTINGS_COLOR_SPACE_LCH.isActive(),
                isBlocked: features.SETTINGS_COLOR_SPACE_LCH.isBlocked(),
                isNew: features.SETTINGS_COLOR_SPACE_LCH.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t('settings.color.colorSpace.oklch'),
                value: 'OKLCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: features.SETTINGS_COLOR_SPACE_OKLCH.isActive(),
                isBlocked: features.SETTINGS_COLOR_SPACE_OKLCH.isBlocked(),
                isNew: features.SETTINGS_COLOR_SPACE_OKLCH.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t('settings.color.colorSpace.lab'),
                value: 'LAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: features.SETTINGS_COLOR_SPACE_LAB.isActive(),
                isBlocked: features.SETTINGS_COLOR_SPACE_LAB.isBlocked(),
                isNew: features.SETTINGS_COLOR_SPACE_LAB.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t('settings.color.colorSpace.oklab'),
                value: 'OKLAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: features.SETTINGS_COLOR_SPACE_OKLAB.isActive(),
                isBlocked: features.SETTINGS_COLOR_SPACE_OKLAB.isBlocked(),
                isNew: features.SETTINGS_COLOR_SPACE_OKLAB.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t('settings.color.colorSpace.hsl'),
                value: 'HSL',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: features.SETTINGS_COLOR_SPACE_HSL.isActive(),
                isBlocked: features.SETTINGS_COLOR_SPACE_HSL.isBlocked(),
                isNew: features.SETTINGS_COLOR_SPACE_HSL.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t('settings.color.colorSpace.hsluv'),
                value: 'HSLUV',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: features.SETTINGS_COLOR_SPACE_HSLUV.isActive(),
                isBlocked: features.SETTINGS_COLOR_SPACE_HSLUV.isBlocked(),
                isNew: features.SETTINGS_COLOR_SPACE_HSLUV.isNew(),
                action: this.props.onColorSettingsHandler,
              },
            ]}
            selected={this.props.colorSpace}
            pin="BOTTOM"
            alignment="RIGHT"
            helper={{
              label: this.props.t('preview.actions.colorSpace'),
            }}
            shouldReflow={{
              isEnabled: true,
              icon: 'theme',
            }}
            isBlocked={features.SETTINGS_COLOR_SPACE.isBlocked()}
            isNew={features.SETTINGS_COLOR_SPACE.isNew()}
          />
        </Feature>
        <Feature
          isActive={
            features.SETTINGS_VISION_SIMULATION_MODE.isActive() &&
            !this.props.isDrawerCollapsed
          }
        >
          <Dropdown
            id="update-color-blind-mode"
            options={[
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.noneAlternative'
                ),
                value: 'NONE',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                isNew: features.SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                action: this.props.onColorSettingsHandler,
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
                  features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.protanopia'
                ),
                value: 'PROTANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.deuteranomaly'
                ),
                value: 'DEUTERANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.deuteranopia'
                ),
                value: 'DEUTERANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.tritanomaly'
                ),
                value: 'TRITANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.tritanopia'
                ),
                value: 'TRITANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.achromatomaly'
                ),
                value: 'ACHROMATOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                action: this.props.onColorSettingsHandler,
              },
              {
                label: this.props.t(
                  'settings.color.visionSimulationMode.achromatopsia'
                ),
                value: 'ACHROMATOPSIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive:
                  features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                isBlocked:
                  features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                isNew:
                  features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                action: this.props.onColorSettingsHandler,
              },
            ]}
            selected={this.props.visionSimulationMode}
            pin="BOTTOM"
            alignment="RIGHT"
            helper={{
              label: this.props.t('preview.actions.visionSimulationMode'),
            }}
            shouldReflow={{
              isEnabled: true,
              icon: 'effects',
            }}
            isBlocked={features.SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
            isNew={features.SETTINGS_VISION_SIMULATION_MODE.isNew()}
          />
        </Feature>
        {this.props.onResetSourceColors && !this.props.isDrawerCollapsed && (
          <div className={layouts['snackbar--medium']}>
            <span
              className={doClassnames([
                texts['type'],
                texts['type--secondary'],
              ])}
            >
              {this.props.t('separator')}
            </span>
            <Button
              type="icon"
              icon="trash"
              action={this.props.onResetSourceColors}
              isDisabled={!this.props.canResetColors}
              helper={{
                label: this.props.t('preview.actions.resetImportedColors'),
              }}
            />
          </div>
        )}
      </div>
    )
  }
}
