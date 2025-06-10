import { Button, layouts, texts } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import React, { PureComponent } from 'react'
import { ConfigContextType } from '../../config/ConfigContext'
import { BaseProps, PlanStatus, TrialStatus } from '../../types/app'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'

interface PlanControlsProps extends BaseProps, WithConfigProps {
  trialStatus: TrialStatus
  trialRemainingTime: number
  onGetProPlan: () => void
}

export default class PlanControls extends PureComponent<PlanControlsProps> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    ACTIVITIES_RUN: new FeatureStatus({
      features: config.features,
      featureName: 'ACTIVITIES_RUN',
      planStatus: planStatus,
    }),
    INVOLVE_FEEDBACK: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_FEEDBACK',
      planStatus: planStatus,
    }),
  })

  constructor(props: PlanControlsProps) {
    super(props)
    this.state = {
      isUserMenuLoading: false,
    }
  }

  // Templates
  RemainingTime = () => (
    <div
      className={doClassnames([
        texts.type,
        texts['type--secondary'],
        texts['type--truncated'],
      ])}
    >
      {Math.ceil(this.props.trialRemainingTime) > 72 && (
        <span>
          {this.props.locals.plan.trialTimeDays.plural.replace(
            '{$1}',
            Math.ceil(this.props.trialRemainingTime) > 72
              ? Math.ceil(this.props.trialRemainingTime / 24)
              : Math.ceil(this.props.trialRemainingTime)
          )}
        </span>
      )}
      {Math.ceil(this.props.trialRemainingTime) <= 72 &&
        Math.ceil(this.props.trialRemainingTime) > 1 && (
          <span>
            {this.props.locals.plan.trialTimeHours.plural.replace(
              '{$1}',
              Math.ceil(this.props.trialRemainingTime)
            )}
          </span>
        )}
      {Math.ceil(this.props.trialRemainingTime) <= 1 && (
        <span>{this.props.locals.plan.trialTimeHours.single}</span>
      )}
    </div>
  )

  FreePlan = () => (
    <>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.locals.plan.tryPro}
        action={this.props.onGetProPlan}
      />
    </>
  )

  PendingTrial = () => <this.RemainingTime />

  ExpiredTrial = () => (
    <>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.locals.plan.getPro}
        action={this.props.onGetProPlan}
      />
      <span className={doClassnames([texts.type, texts['type--secondary']])}>
        {this.props.locals.separator}
      </span>
      <div
        className={doClassnames([
          texts.type,
          texts['type--secondary'],
          texts['type--truncated'],
        ])}
      >
        <span>{this.props.locals.plan.trialEnded}</span>
      </div>
      <Feature
        isActive={PlanControls.features(
          this.props.planStatus,
          this.props.config
        ).INVOLVE_FEEDBACK.isActive()}
      >
        <span className={doClassnames([texts.type, texts['type--secondary']])}>
          {this.props.locals.separator}
        </span>
        <Button
          type="tertiary"
          label={this.props.locals.plan.trialFeedback}
          isBlocked={PlanControls.features(
            this.props.planStatus,
            this.props.config
          ).INVOLVE_FEEDBACK.isBlocked()}
          isNew={PlanControls.features(
            this.props.planStatus,
            this.props.config
          ).INVOLVE_FEEDBACK.isNew()}
          action={() =>
            window
              .open(this.props.config.urls.trialFeedbackUrl, '_blank')
              ?.focus()
          }
        />
      </Feature>
    </>
  )

  // Render
  render() {
    if (this.props.config.plan.isTrialEnabled)
      return (
        <div className={doClassnames(['pro-zone', layouts['snackbar--tight']])}>
          {this.props.trialStatus === 'UNUSED' &&
            this.props.planStatus === 'UNPAID' && <this.FreePlan />}
          {this.props.trialStatus === 'PENDING' && <this.PendingTrial />}
          {this.props.trialStatus === 'EXPIRED' &&
            this.props.planStatus === 'UNPAID' && <this.ExpiredTrial />}
        </div>
      )
    else if (this.props.config.plan.isProEnabled)
      return (
        <div className={doClassnames(['pro-zone', layouts['snackbar--tight']])}>
          {this.props.planStatus === 'UNPAID' &&
            this.props.trialStatus === 'UNUSED' && (
              <Button
                type="alternative"
                size="small"
                icon="lock-off"
                label={this.props.locals.plan.getPro}
                action={() =>
                  parent.postMessage(
                    { pluginMessage: { type: 'PRO_PLAN' } },
                    '*'
                  )
                }
              />
            )}
        </div>
      )
    else return null
  }
}
