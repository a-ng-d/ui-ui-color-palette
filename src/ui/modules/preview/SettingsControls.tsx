import React from 'react'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { layouts, Button, Dropdown, DropdownOption, Menu } from '@unoff/ui'
import {
  ColorConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
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
  onAddColor?: () => void
  onAddStop?: () => void
  onColorSettingsHandler: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLLIElement>
  ) => void
}

export default class SettingsControls extends React.PureComponent<SettingsControlsProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS',
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
              sendPluginMessage(
                {
                  pluginMessage: { type: 'GET_PRO' },
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
                isActive: this.features.COLORS.isActive(),
                isBlocked: this.features.COLORS.isReached(
                  this.props.colors.length
                ),
                isNew: this.features.COLORS.isNew(),
                onBlock: () => {
                  sendPluginMessage(
                    {
                      pluginMessage: { type: 'GET_PRO' },
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
                  sendPluginMessage(
                    {
                      pluginMessage: { type: 'GET_PRO' },
                    },
                    '*'
                  )
                },
                action: () => this.props.onAddStop?.(),
              },
            ]}
            alignment="TOP_RIGHT"
            onBlock={() => {
              sendPluginMessage(
                {
                  pluginMessage: { type: 'GET_PRO' },
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
