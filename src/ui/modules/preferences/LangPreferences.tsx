import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import {
  Dropdown,
  FormItem,
  Section,
  SectionTitle,
  SimpleItem,
} from '@unoff/ui'
import { TolgeeInstance, useTolgee } from '@tolgee/react'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { Language } from '../../../types/translations'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { updatePresets } from '../../../stores/presets'
import { updateUserConsent } from '../../../stores/consent'
import { trackLanguageEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

interface LangPreferencesProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  isLast?: boolean
}

interface LangPreferencesState {
  userLanguage: Language
}

export default class LangPreferences extends PureComponent<
  LangPreferencesProps,
  LangPreferencesState
> {
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
    USER_LANGUAGE_ES_ES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE_ES_ES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_LANGUAGE_JA_JP: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE_JA_JP',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_LANGUAGE_KO_KR: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LANGUAGE_KO_KR',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return LangPreferences.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  static defaultProps = {
    isLast: false,
  }

  constructor(props: LangPreferencesProps) {
    super(props)
  }

  // Handlers
  changeUserLanguageHandler = (lang: Language, tolgee: TolgeeInstance) => {
    tolgee.changeLanguage(lang).then(() => {
      updatePresets(this.props.t)
      updateUserConsent(this.props.t)
    })

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'UPDATE_LANGUAGE',
          data: {
            lang: lang,
          },
        },
      },
      '*'
    )

    trackLanguageEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      { lang: lang }
    )
  }

  // Render
  render() {
    const tolgee = useTolgee(['language'])

    return (
      <Feature isActive={this.features.USER_LANGUAGE.isActive()}>
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle label={this.props.t('user.language.title')} />
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
                  label={this.props.t('user.language.label')}
                  shouldFill
                  isBlocked={this.features.USER_LANGUAGE.isBlocked()}
                >
                  <Dropdown
                    id="user-language"
                    options={[
                      {
                        label: this.props.t('user.language.englishUS'),
                        value: 'en-US',
                        type: 'OPTION' as const,
                        isActive: this.features.USER_LANGUAGE_EN_US.isActive(),
                        isBlocked:
                          this.features.USER_LANGUAGE_EN_US.isBlocked(),
                        isNew: this.features.USER_LANGUAGE_EN_US.isNew(),
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
                        action: () =>
                          this.changeUserLanguageHandler('en-US', tolgee),
                      },
                      {
                        label: this.props.t('user.language.spanishES'),
                        value: 'es-ES',
                        type: 'OPTION' as const,
                        isActive: this.features.USER_LANGUAGE_ES_ES.isActive(),
                        isBlocked:
                          this.features.USER_LANGUAGE_ES_ES.isBlocked(),
                        isNew: this.features.USER_LANGUAGE_ES_ES.isNew(),
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
                        action: () =>
                          this.changeUserLanguageHandler('es-ES', tolgee),
                      },
                      {
                        label: this.props.t('user.language.frenchFR'),
                        value: 'fr-FR',
                        type: 'OPTION' as const,
                        isActive: this.features.USER_LANGUAGE_FR_FR.isActive(),
                        isBlocked:
                          this.features.USER_LANGUAGE_FR_FR.isBlocked(),
                        isNew: this.features.USER_LANGUAGE_FR_FR.isNew(),
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
                        action: () =>
                          this.changeUserLanguageHandler('fr-FR', tolgee),
                      },
                      {
                        label: this.props.t('user.language.portugueseBR'),
                        value: 'pt-BR',
                        type: 'OPTION' as const,
                        isActive: this.features.USER_LANGUAGE_PT_BR.isActive(),
                        isBlocked:
                          this.features.USER_LANGUAGE_PT_BR.isBlocked(),
                        isNew: this.features.USER_LANGUAGE_PT_BR.isNew(),
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
                        action: () =>
                          this.changeUserLanguageHandler('pt-BR', tolgee),
                      },
                      {
                        label: this.props.t('user.language.chineseCN'),
                        value: 'zh-Hans-CN',
                        type: 'OPTION' as const,
                        isActive: this.features.USER_LANGUAGE_ZH_CN.isActive(),
                        isBlocked:
                          this.features.USER_LANGUAGE_ZH_CN.isBlocked(),
                        isNew: this.features.USER_LANGUAGE_ZH_CN.isNew(),
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
                        action: () =>
                          this.changeUserLanguageHandler('zh-Hans-CN', tolgee),
                      },
                      {
                        label: this.props.t('user.language.japaneseJP'),
                        value: 'ja-JP',
                        type: 'OPTION' as const,
                        isActive: this.features.USER_LANGUAGE_JA_JP.isActive(),
                        isBlocked:
                          this.features.USER_LANGUAGE_JA_JP.isBlocked(),
                        isNew: this.features.USER_LANGUAGE_JA_JP.isNew(),
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
                        action: () =>
                          this.changeUserLanguageHandler('ja-JP', tolgee),
                      },
                      {
                        label: this.props.t('user.language.koreanKR'),
                        value: 'ko-KR',
                        type: 'OPTION' as const,
                        isActive: this.features.USER_LANGUAGE_KO_KR.isActive(),
                        isBlocked:
                          this.features.USER_LANGUAGE_KO_KR.isBlocked(),
                        isNew: this.features.USER_LANGUAGE_KO_KR.isNew(),
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
                        action: () =>
                          this.changeUserLanguageHandler('ko-KR', tolgee),
                      },
                    ]}
                    selected={tolgee.getLanguage() as Language}
                    isBlocked={this.features.USER_LANGUAGE.isBlocked()}
                    isNew={this.features.USER_LANGUAGE.isNew()}
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
                    isFill
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
