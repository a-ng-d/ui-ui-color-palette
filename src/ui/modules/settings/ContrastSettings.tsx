import React from 'react'
import { PureComponent } from 'preact/compat'
import { TextColorsThemeConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  FormItem,
  Input,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ContrastSettingsProps extends BaseProps, WithConfigProps {
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  isLast?: boolean
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

export default class ContrastSettings extends PureComponent<ContrastSettingsProps> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    SETTINGS_TEXT_COLORS_THEME: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_TEXT_COLORS_THEME',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  // Templates
  LightTextColorsTheme = () => {
    return (
      <Feature
        isActive={ContrastSettings.features(
          this.props.planStatus,
          this.props.config
        ).SETTINGS_TEXT_COLORS_THEME.isActive()}
      >
        <FormItem
          id="update-text-light-color"
          label={this.props.locals.settings.contrast.textColors.textLightColor}
          isBlocked={ContrastSettings.features(
            this.props.planStatus,
            this.props.config
          ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
        >
          <Input
            id="update-text-light-color"
            type="COLOR"
            value={this.props.textColorsTheme?.lightColor ?? '#FFFFFF'}
            isBlocked={ContrastSettings.features(
              this.props.planStatus,
              this.props.config
            ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
            isNew={ContrastSettings.features(
              this.props.planStatus,
              this.props.config
            ).SETTINGS_TEXT_COLORS_THEME.isNew()}
            feature="UPDATE_TEXT_LIGHT_COLOR"
            onChange={this.props.onChangeSettings}
            onFocus={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
          />
        </FormItem>
      </Feature>
    )
  }

  DarkTextColorsTheme = () => {
    return (
      <Feature
        isActive={ContrastSettings.features(
          this.props.planStatus,
          this.props.config
        ).SETTINGS_TEXT_COLORS_THEME.isActive()}
      >
        <FormItem
          id="update-text-dark-color"
          label={this.props.locals.settings.contrast.textColors.textDarkColor}
          isBlocked={ContrastSettings.features(
            this.props.planStatus,
            this.props.config
          ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
        >
          <Input
            id="update-text-dark-color"
            type="COLOR"
            value={this.props.textColorsTheme?.darkColor ?? '#OOOOOO'}
            isBlocked={ContrastSettings.features(
              this.props.planStatus,
              this.props.config
            ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
            isNew={ContrastSettings.features(
              this.props.planStatus,
              this.props.config
            ).SETTINGS_TEXT_COLORS_THEME.isNew()}
            feature="UPDATE_TEXT_DARK_COLOR"
            onChange={this.props.onChangeSettings}
            onFocus={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
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
              <SectionTitle label={this.props.locals.settings.contrast.title} />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={[
          {
            node: <this.LightTextColorsTheme />,
          },
          {
            node: <this.DarkTextColorsTheme />,
          },
          {
            node: (
              <SemanticMessage
                type="INFO"
                message={
                  this.props.locals.settings.contrast.textColors
                    .textThemeColorsDescription
                }
              />
            ),
          },
        ]}
        border={!this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
