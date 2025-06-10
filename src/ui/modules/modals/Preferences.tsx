import { Dialog, List } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../../config/ConfigContext'
import { BaseProps, PlanStatus, TrialStatus } from '../../../types/app'
import Feature from '../../components/Feature'
import { WithConfigProps } from '../../components/WithConfig'
import SyncPreferences from '../SyncPreferences'

interface PreferencesProps extends BaseProps, WithConfigProps {
  trialStatus: TrialStatus
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Preferences extends PureComponent<PreferencesProps> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    USER_PREFERENCES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES',
      planStatus: planStatus,
    }),
  })

  // Render
  render() {
    const theme = document.documentElement.getAttribute('data-theme')
    let padding

    switch (theme) {
      case 'penpot':
        padding = '0 var(--size-xxsmall)'
        break
      case 'figma-ui3':
        padding = '0'
        break
      default:
        padding = 'var(--size-xxsmall)'
    }

    return (
      <Feature
        isActive={Preferences.features(
          this.props.planStatus,
          this.props.config
        ).USER_PREFERENCES.isActive()}
      >
        <Dialog
          title={this.props.locals.user.updatePreferences}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List padding={padding}>
            <SyncPreferences {...this.props} />
          </List>
        </Dialog>
      </Feature>
    )
  }
}
