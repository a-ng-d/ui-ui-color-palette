import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Notification } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { NotificationMessage } from '../../../types/messages'
import { BaseProps, PlanStatus } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface NotificationBannerProps extends BaseProps, WithConfigProps {
  notification: NotificationMessage
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class NotificationBanner extends PureComponent<NotificationBannerProps> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    NOTIFICATIONS: new FeatureStatus({
      features: config.features,
      featureName: 'NOTIFICATIONS',
      planStatus: planStatus,
    }),
  })

  // Render
  render() {
    return (
      <Feature
        isActive={NotificationBanner.features(
          this.props.planStatus,
          this.props.config
        ).NOTIFICATIONS.isActive()}
      >
        <Notification
          type={this.props.notification.type || 'INFO'}
          message={this.props.notification.message}
          timer={this.props.notification.timer}
          onClose={this.props.onClose}
        />
      </Feature>
    )
  }
}
