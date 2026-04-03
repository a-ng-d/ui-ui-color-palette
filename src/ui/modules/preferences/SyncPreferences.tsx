import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import {
  FormItem,
  Section,
  SectionTitle,
  Select,
  SemanticMessage,
  SimpleItem,
} from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import {
  $canStylesDeepSync,
  $canTokensDeepSync,
  $canVariablesDeepSync,
} from '../../../stores/preferences'
import { ConfigContextType } from '../../../config/ConfigContext'

interface SyncPreferencesProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  isLast?: boolean
}

interface SyncPreferencesState {
  canStylesDeepSync: boolean
  canVariablesDeepSync: boolean
  canTokensDeepSync: boolean
}

export default class SyncPreferences extends PureComponent<
  SyncPreferencesProps,
  SyncPreferencesState
> {
  private subscribeStyles: (() => void) | undefined
  private subscribeVariables: (() => void) | undefined
  private subscribeTokens: (() => void) | undefined
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    USER_PREFERENCES_SYNC_DEEP_STYLES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES_SYNC_DEEP_STYLES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_PREFERENCES_SYNC_DEEP_VARIABLES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_PREFERENCES_SYNC_DEEP_TOKENS: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES_SYNC_DEEP_TOKENS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return SyncPreferences.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  static defaultProps = {
    isLast: false,
  }

  constructor(props: SyncPreferencesProps) {
    super(props)
    this.state = {
      canStylesDeepSync: $canStylesDeepSync.get() || false,
      canVariablesDeepSync: $canVariablesDeepSync.get() || false,
      canTokensDeepSync: $canTokensDeepSync.get() || false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribeStyles = $canStylesDeepSync.subscribe((value) => {
      this.setState({ canStylesDeepSync: value })
    })
    this.subscribeVariables = $canVariablesDeepSync.subscribe((value) => {
      this.setState({ canVariablesDeepSync: value })
    })
    this.subscribeTokens = $canTokensDeepSync.subscribe((value) => {
      this.setState({ canTokensDeepSync: value })
    })
  }

  componentWillUnmount = () => {
    if (this.subscribeStyles) this.subscribeStyles()
    if (this.subscribeVariables) this.subscribeVariables()
    if (this.subscribeTokens) this.subscribeTokens()
  }

  // Templates
  StylesDeepSync = () => {
    return (
      <Feature
        isActive={this.features.USER_PREFERENCES_SYNC_DEEP_STYLES.isActive()}
      >
        <Select
          id="update-styles-deep-sync"
          type="SWITCH_BUTTON"
          name="update-styles-deep-sync"
          label={this.props.t('user.preferences.sync.styles.label')}
          isChecked={this.state.canStylesDeepSync}
          isBlocked={
            !this.state.canStylesDeepSync &&
            this.features.USER_PREFERENCES_SYNC_DEEP_STYLES.isReached(
              (this.props.creditsCount -
                this.props.config.fees.localStylesSync) *
                -1 -
                1
            )
          }
          isNew={this.features.USER_PREFERENCES_SYNC_DEEP_STYLES.isNew()}
          feature="UPDATE_STYLES_DEEP_SYNC"
          action={() => {
            $canStylesDeepSync.set(!this.state.canStylesDeepSync)
            sendPluginMessage(
              {
                pluginMessage: {
                  type: 'SET_ITEMS',
                  items: [
                    {
                      key: 'can_deep_sync_styles',
                      value: !this.state.canStylesDeepSync,
                    },
                  ],
                },
              },
              '*'
            )
          }}
        />
      </Feature>
    )
  }

  VariablesDeepSync = () => {
    return (
      <Feature
        isActive={this.features.USER_PREFERENCES_SYNC_DEEP_VARIABLES.isActive()}
      >
        <Select
          id="update-variables-deep-sync"
          type="SWITCH_BUTTON"
          name="update-variables-deep-sync"
          label={this.props.t('user.preferences.sync.variables.label')}
          isChecked={this.state.canVariablesDeepSync}
          isBlocked={
            !this.state.canVariablesDeepSync &&
            this.features.USER_PREFERENCES_SYNC_DEEP_VARIABLES.isReached(
              (this.props.creditsCount -
                this.props.config.fees.localVariablesSync) *
                -1 -
                1
            )
          }
          isNew={this.features.USER_PREFERENCES_SYNC_DEEP_VARIABLES.isNew()}
          feature="UPDATE_VARIABLES_DEEP_SYNC"
          action={() => {
            $canVariablesDeepSync.set(!this.state.canVariablesDeepSync)
            sendPluginMessage(
              {
                pluginMessage: {
                  type: 'SET_ITEMS',
                  items: [
                    {
                      key: 'can_deep_sync_variables',
                      value: !this.state.canVariablesDeepSync,
                    },
                  ],
                },
              },
              '*'
            )
          }}
        />
      </Feature>
    )
  }

  TokensDeepSync = () => {
    return (
      <Feature
        isActive={this.features.USER_PREFERENCES_SYNC_DEEP_TOKENS.isActive()}
      >
        <Select
          id="update-tokens-deep-sync"
          type="SWITCH_BUTTON"
          name="update-tokens-deep-sync"
          label={this.props.t('user.preferences.sync.tokens.label')}
          isChecked={this.state.canTokensDeepSync}
          isBlocked={
            !this.state.canTokensDeepSync &&
            this.features.USER_PREFERENCES_SYNC_DEEP_TOKENS.isReached(
              (this.props.creditsCount -
                this.props.config.fees.localTokensSync) *
                -1 -
                1
            )
          }
          isNew={this.features.USER_PREFERENCES_SYNC_DEEP_TOKENS.isNew()}
          feature="UPDATE_TOKENS_DEEP_SYNC"
          action={() => {
            $canTokensDeepSync.set(!this.state.canTokensDeepSync)
            sendPluginMessage(
              {
                pluginMessage: {
                  type: 'SET_ITEMS',
                  items: [
                    {
                      key: 'can_deep_sync_tokens',
                      value: !this.state.canTokensDeepSync,
                    },
                  ],
                },
              },
              '*'
            )
          }}
        />
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <Feature
        isActive={
          this.features.USER_PREFERENCES_SYNC_DEEP_VARIABLES.isActive() ||
          this.features.USER_PREFERENCES_SYNC_DEEP_STYLES.isActive() ||
          this.features.USER_PREFERENCES_SYNC_DEEP_TOKENS.isActive()
        }
      >
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.t('user.preferences.sync.title')}
                />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <SemanticMessage
                  type="INFO"
                  message={this.props.t('user.preferences.sync.message')}
                />
              ),
            },
            ...(this.features.USER_PREFERENCES_SYNC_DEEP_STYLES.isActive()
              ? [
                  {
                    node: (
                      <FormItem shouldFill>
                        <this.StylesDeepSync />
                      </FormItem>
                    ),
                  },
                ]
              : []),
            ...(this.features.USER_PREFERENCES_SYNC_DEEP_VARIABLES.isActive()
              ? [
                  {
                    node: (
                      <FormItem shouldFill>
                        <this.VariablesDeepSync />
                      </FormItem>
                    ),
                  },
                ]
              : []),
            ...(this.features.USER_PREFERENCES_SYNC_DEEP_TOKENS.isActive()
              ? [
                  {
                    node: (
                      <FormItem shouldFill>
                        <this.TokensDeepSync />
                      </FormItem>
                    ),
                  },
                ]
              : []),
          ]}
          border={!this.props.isLast ? ['BOTTOM'] : undefined}
        />
      </Feature>
    )
  }
}
