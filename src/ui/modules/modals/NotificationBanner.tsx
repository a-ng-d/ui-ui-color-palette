import { Notification } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../../config/ConfigContext'
import { BaseProps, PlanStatus } from '../../../types/app'
import Feature from '../../components/Feature'
import { WithConfigProps } from '../../components/WithConfig'
import { NotificationMessage } from '../../../types/messages'

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
