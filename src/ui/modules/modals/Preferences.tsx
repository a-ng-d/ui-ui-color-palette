import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, List } from '@a_ng_d/figmug-ui'
import SyncPreferences from '../SyncPreferences'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PreferencesProps extends BaseProps, WithConfigProps {
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
