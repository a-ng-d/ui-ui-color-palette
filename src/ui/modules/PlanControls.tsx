import React, { PureComponent } from 'react'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, layouts, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface PlanControlsProps extends BaseProps, WithConfigProps {
  trialRemainingTime: number
}

export default class PlanControls extends PureComponent<PlanControlsProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    ACTIVITIES_RUN: new FeatureStatus({
      features: config.features,
      featureName: 'ACTIVITIES_RUN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    INVOLVE_FEEDBACK: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_FEEDBACK',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
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
    <div className={doClassnames([layouts['snackbar--medium']])}>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.locales.plan.getPro}
        action={() =>
          parent.postMessage({ pluginMessage: { type: 'GET_PRO_PLAN' } }, '*')
        }
      />
      <span className={doClassnames([texts.type, texts['type--secondary']])}>
        {this.props.locales.separator}
      </span>
      <div
        className={doClassnames([
          texts.type,
          texts['type--secondary'],
          texts['type--truncated'],
        ])}
      >
        {Math.ceil(this.props.trialRemainingTime) > 72 && (
          <span>
            {this.props.locales.plan.trialTimeDays.plural.replace(
              '{count}',
              Math.ceil(this.props.trialRemainingTime) > 72
                ? Math.ceil(this.props.trialRemainingTime / 24).toString()
                : Math.ceil(this.props.trialRemainingTime).toString()
            )}
          </span>
        )}
        {Math.ceil(this.props.trialRemainingTime) <= 72 &&
          Math.ceil(this.props.trialRemainingTime) > 1 && (
            <span>
              {this.props.locales.plan.trialTimeHours.plural.replace(
                '{count}',
                Math.ceil(this.props.trialRemainingTime).toString()
              )}
            </span>
          )}
        {Math.ceil(this.props.trialRemainingTime) <= 1 && (
          <span>{this.props.locales.plan.trialTimeHours.single}</span>
        )}
      </div>
    </div>
  )

  FreePlan = () => (
    <>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.locales.plan.tryPro}
        action={() => {
          this.props.config.plan.isTrialEnabled
            ? parent.postMessage({ pluginMessage: { type: 'GET_TRIAL' } }, '*')
            : parent.postMessage(
                { pluginMessage: { type: 'GET_PRO_PLAN' } },
                '*'
              )
        }}
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
        label={this.props.locales.plan.getPro}
        action={() =>
          parent.postMessage({ pluginMessage: { type: 'GET_PRO_PLAN' } }, '*')
        }
      />
      <span className={doClassnames([texts.type, texts['type--secondary']])}>
        {this.props.locales.separator}
      </span>
      <div
        className={doClassnames([
          texts.type,
          texts['type--secondary'],
          texts['type--truncated'],
        ])}
      >
        <span>{this.props.locales.plan.trialEnded}</span>
      </div>
      <Feature
        isActive={PlanControls.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).INVOLVE_FEEDBACK.isActive()}
      >
        <span className={doClassnames([texts.type, texts['type--secondary']])}>
          {this.props.locales.separator}
        </span>
        <Button
          type="tertiary"
          label={this.props.locales.plan.trialFeedback}
          isBlocked={PlanControls.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).INVOLVE_FEEDBACK.isBlocked()}
          isNew={PlanControls.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).INVOLVE_FEEDBACK.isNew()}
          action={() =>
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'OPEN_IN_BROWSER',
                  data: {
                    url: this.props.config.urls.trialFeedbackUrl,
                  },
                },
              },
              '*'
            )
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
          {this.props.trialStatus === 'PENDING' &&
            this.props.planStatus === 'PAID' && <this.PendingTrial />}
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
                label={this.props.locales.plan.getPro}
                action={() =>
                  parent.postMessage(
                    { pluginMessage: { type: 'GET_PRO_PLAN' } },
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
