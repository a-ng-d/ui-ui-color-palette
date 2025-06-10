import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  FormItem,
  Section,
  SectionTitle,
  Select,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { BaseProps, PlanStatus } from '../../types/app'
import {
  $canStylesDeepSync,
  $canVariablesDeepSync,
} from '../../stores/preferences'
import { ConfigContextType } from '../../config/ConfigContext'

interface SyncPreferencesProps extends BaseProps, WithConfigProps {
  isLast?: boolean
}

interface SyncPreferencesStates {
  canStylesDeepSync: boolean
  canVariablesDeepSync: boolean
}

export default class SyncPreferences extends PureComponent<
  SyncPreferencesProps,
  SyncPreferencesStates
> {
  private subscribeStyles: (() => void) | undefined
  private subscribeVariables: (() => void) | undefined

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    USER_PREFERENCES_SYNC_DEEP_STYLES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES_SYNC_DEEP_STYLES',
      planStatus: planStatus,
    }),
    USER_PREFERENCES_SYNC_DEEP_VARIABLES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  constructor(props: SyncPreferencesProps) {
    super(props)
    this.state = {
      canStylesDeepSync: false,
      canVariablesDeepSync: false,
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
  }

  componentWillUnmount = () => {
    if (this.subscribeStyles) this.subscribeStyles()
    if (this.subscribeVariables) this.subscribeVariables()
  }

  // Templates
  StylesDeepSync = () => {
    return (
      <Feature
        isActive={SyncPreferences.features(
          this.props.planStatus,
          this.props.config
        ).USER_PREFERENCES_SYNC_DEEP_STYLES.isActive()}
      >
        <Select
          id="update-styles-deep-sync"
          type="SWITCH_BUTTON"
          name="update-styles-deep-sync"
          label={this.props.locals.user.preferences.sync.styles.label}
          isChecked={this.state.canStylesDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus,
            this.props.config
          ).USER_PREFERENCES_SYNC_DEEP_STYLES.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus,
            this.props.config
          ).USER_PREFERENCES_SYNC_DEEP_STYLES.isNew()}
          feature="UPDATE_STYLES_DEEP_SYNC"
          action={() => {
            $canStylesDeepSync.set(!this.state.canStylesDeepSync)
            parent.postMessage(
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
        isActive={SyncPreferences.features(
          this.props.planStatus,
          this.props.config
        ).USER_PREFERENCES_SYNC_DEEP_VARIABLES.isActive()}
      >
        <Select
          id="update-variables-deep-sync"
          type="SWITCH_BUTTON"
          name="update-variables-deep-sync"
          label={this.props.locals.user.preferences.sync.variables.label}
          isChecked={this.state.canVariablesDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus,
            this.props.config
          ).USER_PREFERENCES_SYNC_DEEP_VARIABLES.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus,
            this.props.config
          ).USER_PREFERENCES_SYNC_DEEP_VARIABLES.isNew()}
          feature="UPDATE_VARIABLES_DEEP_SYNC"
          action={() => {
            $canVariablesDeepSync.set(!this.state.canVariablesDeepSync)
            parent.postMessage(
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

  // Render
  render() {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={this.props.locals.user.preferences.sync.title}
              />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={[
          {
            node: (
              <FormItem shouldFill>
                <this.StylesDeepSync />
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem shouldFill>
                <this.VariablesDeepSync />
              </FormItem>
            ),
          },
          {
            node: (
              <SemanticMessage
                type="INFO"
                message={this.props.locals.user.preferences.sync.message}
              />
            ),
          },
        ]}
        border={this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
