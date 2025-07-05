import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus, Service } from '../../../types/app'
import pp from '../../../content/images/pro_plan.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface WelcomeToProProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class WelcomeToPro extends PureComponent<WelcomeToProProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service
  ) => ({
    PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'PRO_PLAN',
      planStatus: planStatus,
      currentService: service,
    }),
  })

  // Render
  render() {
    return (
      <Feature
        isActive={WelcomeToPro.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locales.proPlan.welcome.title}
          actions={{
            primary: {
              label: this.props.locales.proPlan.welcome.cta,
              action: this.props.onClose,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={pp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locales.proPlan.welcome.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
