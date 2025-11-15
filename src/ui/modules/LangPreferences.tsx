import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Dropdown,
  FormItem,
  Section,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { Language } from '../../types/translations'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $userLanguage } from '../../stores/preferences'
import { ConfigContextType } from '../../config/ConfigContext'

interface LangPreferencesProps extends BaseProps, WithConfigProps {
  isLast?: boolean
}

interface LangPreferencesStates {
  userLanguage: Language
}

export default class LangPreferences extends PureComponent<
  LangPreferencesProps,
  LangPreferencesStates
> {
  private subscribeUserLanguage: (() => void) | undefined

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    USER_LANGUAGE: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_LANGUAGE_EN_US: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE_EN_US',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_LANGUAGE_FR_FR: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE_FR_FR',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_LANGUAGE_PT_BR: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE_PT_BR',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_LANGUAGE_ZH_CN: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE_ZH_CN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  constructor(props: LangPreferencesProps) {
    super(props)
    this.state = {
      userLanguage: $userLanguage.get() || 'en-US',
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribeUserLanguage = $userLanguage.subscribe((value) => {
      this.setState({ userLanguage: value })
    })
  }

  componentWillUnmount = () => {
    if (this.subscribeUserLanguage) this.subscribeUserLanguage()
  }

  // Render
  render() {
    return (
      <Feature
        isActive={LangPreferences.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).USER_LANGUAGE.isActive()}
      >
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle label={this.props.locales.user.language.title} />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <FormItem
                  id="user-language"
                  label={this.props.locales.user.language.label}
                  shouldFill
                >
                  <Dropdown
                    id="user-language"
                    options={[
                      {
                        label: this.props.locales.user.language.englishUS,
                        value: 'en-US',
                        type: 'OPTION' as const,
                        isActive: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_EN_US.isActive(),
                        isBlocked: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_EN_US.isBlocked(),
                        isNew: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_EN_US.isNew(),
                        action: () => $userLanguage.set('en-US'),
                      },
                      {
                        label: this.props.locales.user.language.chineseCN,
                        value: 'zh-CN',
                        type: 'OPTION' as const,
                        isActive: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_ZH_CN.isActive(),
                        isBlocked: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_ZH_CN.isBlocked(),
                        isNew: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_ZH_CN.isNew(),
                        action: () => $userLanguage.set('zh-CN'),
                      },
                      {
                        label: this.props.locales.user.language.frenchFR,
                        value: 'fr-FR',
                        type: 'OPTION' as const,
                        isActive: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_FR_FR.isActive(),
                        isBlocked: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_FR_FR.isBlocked(),
                        isNew: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_FR_FR.isNew(),
                        action: () => $userLanguage.set('fr-FR'),
                      },
                      {
                        label: this.props.locales.user.language.portugueseBR,
                        value: 'pt-BR',
                        type: 'OPTION' as const,
                        isActive: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_PT_BR.isActive(),
                        isBlocked: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_PT_BR.isBlocked(),
                        isNew: LangPreferences.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).USER_LANGUAGE_PT_BR.isNew(),
                        action: () => $userLanguage.set('pt-BR'),
                      },
                    ]}
                    selected={this.state.userLanguage}
                    isBlocked={LangPreferences.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).USER_LANGUAGE.isBlocked()}
                    isNew={LangPreferences.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).USER_LANGUAGE.isNew()}
                  />
                </FormItem>
              ),
            },
          ]}
          border={!this.props.isLast ? ['BOTTOM'] : undefined}
        />
      </Feature>
    )
  }
}
