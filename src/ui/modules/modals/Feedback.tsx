import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface FeedbackProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Feedback extends PureComponent<FeedbackProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service
  ) => ({
    INVOLVES_FEEDBACK: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVES_FEEDBACK',
      planStatus: planStatus,
      currentService: service,
    }),
  })

  // Render
  render() {
    return (
      <Feature
        isActive={Feedback.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).INVOLVES_FEEDBACK.isActive()}
      >
        <Dialog
          title={this.props.locales.shortcuts.feedback}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <iframe
            src={this.props.config.urls.feedbackUrl}
            width="100%"
            height="auto"
            frameBorder="0"
            allowFullScreen
          />
        </Dialog>
      </Feature>
    )
  }
}
