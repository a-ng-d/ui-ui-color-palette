import { PureComponent, ChangeEvent } from 'preact/compat'
import {
  ColorConfiguration,
  ColorSpaceConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { layouts, Button, Dropdown, DropdownOption, Menu } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  Mode,
  PlanStatus,
  Service,
} from '../../../types/app'
import lsc from '../../../content/images/lock_source_colors.gif'
import { ConfigContextType } from '../../../config/ConfigContext'

interface SettingsControlsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  mode: Mode
  preset: PresetConfiguration
  colors: Array<SourceColorConfiguration> | Array<ColorConfiguration> | []
  areSourceColorsLocked: LockedSourceColorsConfiguration
  themes: Array<ThemeConfiguration>
  themeOptions: Array<DropdownOption>
  colorSpace: ColorSpaceConfiguration
  onAddColor?: () => void
  onAddStop?: () => void
  onColorSettingsHandler: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLLIElement>
  ) => void
}

export default class SettingsControls extends PureComponent<SettingsControlsProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    COLORS_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_ADD',
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
    PREVIEW_LOCK_SOURCE_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_LOCK_SOURCE_COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    THEMES_SWITCH: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES_SWITCH',
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
  })

  private get features() {
    return SettingsControls.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Render
  render() {
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
            this.features.SETTINGS_COLOR_SPACE.isActive() &&
            this.props.mode === 'EDIT'
          }
        >
          <Menu
            id="update-color-space"
            icon="blend-empty"
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
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
                  const isTrial =
                    this.props.config.plan.isTrialEnabled &&
                    this.props.trialStatus !== 'EXPIRED'
                  sendPluginMessage(
                    {
                      pluginMessage: isTrial
                        ? { type: 'GET_TRIAL' }
                        : {
                            type: 'GET_PRO',
                            data: { origin: 'UPDATE_COLOR_SPACE' },
                          },
                    },
                    '*'
                  )
                },
                action: this.props.onColorSettingsHandler,
              },
            ]}
            helper={{
              label: this.props.t('settings.color.colorSpace.label'),
              pin: 'TOP',
            }}
            selected={this.props.colorSpace}
            alignment="TOP_RIGHT"
            isBlocked={this.features.SETTINGS_COLOR_SPACE.isBlocked()}
            isNew={this.features.SETTINGS_COLOR_SPACE.isNew()}
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
                        data: { origin: 'SETTINGS_COLOR_SPACE' },
                      },
                },
                '*'
              )
            }}
          />
        </Feature>
        <Feature
          isActive={
            this.features.PREVIEW_LOCK_SOURCE_COLORS.isActive() &&
            this.props.mode === 'EDIT'
          }
        >
          <Button
            type="icon"
            icon={this.props.areSourceColorsLocked ? 'lock-on' : 'lock-off'}
            preview={{
              image: lsc,
              text: this.props.t('preview.lock.preview'),
              pin: 'TOP',
            }}
            feature={`LOCK_SOURCE_COLORS_${!this.props.areSourceColorsLocked ? 'ON' : 'OFF'}`}
            helper={{
              label: this.props.t('preview.lock.label'),
              pin: 'TOP',
            }}
            isBlocked={
              this.features.PREVIEW_LOCK_SOURCE_COLORS.isBlocked() &&
              !this.props.areSourceColorsLocked
            }
            isNew={this.features.PREVIEW_LOCK_SOURCE_COLORS.isNew()}
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
                        data: { origin: 'PREVIEW_LOCK_SOURCE_COLORS' },
                      },
                },
                '*'
              )
            }}
            action={this.props.onColorSettingsHandler}
          />
        </Feature>
        <Feature isActive={this.features.THEMES_SWITCH.isActive()}>
          <Dropdown
            id="switch-theme"
            options={this.props.themeOptions}
            selected={this.props.themes.find((theme) => theme.isEnabled)?.id}
            helper={{
              label: this.props.t('themes.switchTheme.label'),
              pin: 'TOP',
            }}
            alignment="RIGHT"
            pin="BOTTOM"
            shouldReflow={{
              isEnabled: true,
              icon: 'theme',
            }}
          />
        </Feature>
        <Feature isActive={this.props.mode === 'EDIT'}>
          <Menu
            type="PRIMARY"
            label={this.props.t('preview.actions.insert')}
            options={[
              {
                label: this.props.t('preview.insert.color'),
                value: 'ADD_COLOR',
                type: 'OPTION',
                isActive: this.features.COLORS_ADD.isActive(),
                isBlocked: this.features.COLORS_ADD.isReached(
                  this.props.colors.length
                ),
                isNew: this.features.COLORS_ADD.isNew(),
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
                            data: { origin: 'COLORS_ADD' },
                          },
                    },
                    '*'
                  )
                },
                action: () => this.props.onAddColor?.(),
              },
              {
                label: this.props.t('preview.insert.stop'),
                value: 'ADD_STOP',
                type: 'OPTION',
                isActive:
                  this.props.preset.id.includes('CUSTOM') &&
                  this.features.PRESETS_CUSTOM_ADD.isActive(),
                isBlocked: this.features.PRESETS_CUSTOM_ADD.isReached(
                  this.props.preset.stops.length
                ),
                isNew: this.features.PRESETS_CUSTOM_ADD.isNew(),
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
                            data: { origin: 'PRESETS_CUSTOM_ADD' },
                          },
                    },
                    '*'
                  )
                },
                action: () => this.props.onAddStop?.(),
              },
            ]}
            alignment="TOP_RIGHT"
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
                        data: { origin: 'PREVIEW_INSERT' },
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
}
