import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  TextColorsThemeConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import {
  FormItem,
  Input,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ContrastSettingsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  themes?: Array<ThemeConfiguration>
  isLast?: boolean
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

export default class ContrastSettings extends PureComponent<ContrastSettingsProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SETTINGS_TEXT_COLORS_THEME: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_TEXT_COLORS_THEME',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  private get features() {
    return ContrastSettings.features(
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
  LightTextColorsTheme = () => {
    return (
      <Feature isActive={this.features.SETTINGS_TEXT_COLORS_THEME.isActive()}>
        <FormItem
          id="update-text-light-color"
          label={this.props.t('settings.contrast.textColors.textLightColor')}
          isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
        >
          <Input
            id="update-text-light-color"
            type="COLOR"
            value={this.props.textColorsTheme?.lightColor ?? '#FFFFFF'}
            isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
            isNew={this.features.SETTINGS_TEXT_COLORS_THEME.isNew()}
            feature="UPDATE_TEXT_LIGHT_COLOR"
            onPick={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
            onValid={this.props.onChangeSettings}
          />
        </FormItem>
      </Feature>
    )
  }

  DarkTextColorsTheme = () => {
    return (
      <Feature isActive={this.features.SETTINGS_TEXT_COLORS_THEME.isActive()}>
        <FormItem
          id="update-text-dark-color"
          label={this.props.t('settings.contrast.textColors.textDarkColor')}
          isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
        >
          <Input
            id="update-text-dark-color"
            type="COLOR"
            value={this.props.textColorsTheme?.darkColor ?? '#OOOOOO'}
            isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
            isNew={this.features.SETTINGS_TEXT_COLORS_THEME.isNew()}
            feature="UPDATE_TEXT_DARK_COLOR"
            onPick={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
            onValid={this.props.onChangeSettings}
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
              <SectionTitle
                label={this.props.t('settings.contrast.title')}
                helper={
                  this.activeThemeName !== undefined
                    ? this.props.t('settings.themeBinding.message', {
                        themeName: this.activeThemeName,
                      })
                    : undefined
                }
              />
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
                message={this.props.t(
                  'settings.contrast.textColors.textThemeColorsDescription'
                )}
              />
            ),
          },
        ]}
        border={!this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
