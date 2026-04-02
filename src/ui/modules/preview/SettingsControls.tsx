import React from 'react'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { layouts, Button, Dropdown, DropdownOption } from '@unoff/ui'
import {
  LockedSourceColorsConfiguration,
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
  areSourceColorsLocked: LockedSourceColorsConfiguration
  themes: Array<ThemeConfiguration>
  themeOptions: Array<DropdownOption>
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
      </div>
    )
  }
}
