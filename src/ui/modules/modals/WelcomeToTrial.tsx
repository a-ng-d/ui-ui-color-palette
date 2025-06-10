import { Dialog, texts } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../../config/ConfigContext'
import t from '../../../content/images/trial.webp'
import { BaseProps, PlanStatus } from '../../../types/app'
import Feature from '../../components/Feature'
import { WithConfigProps } from '../../components/WithConfig'

interface WelcomeToTrialProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class WelcomeToTrial extends PureComponent<WelcomeToTrialProps> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'PRO_PLAN',
      planStatus: planStatus,
    }),
  })

  // Render
  render() {
    return (
      <Feature
        isActive={WelcomeToTrial.features(
          this.props.planStatus,
          this.props.config
        ).PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locals.proPlan.welcome.title}
          actions={{
            primary: {
              label: this.props.locals.proPlan.welcome.cta,
              action: this.props.onClose,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={t}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locals.proPlan.welcome.trial.replace(
                '{$1}',
                this.props.config.plan.trialTime
              )}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
