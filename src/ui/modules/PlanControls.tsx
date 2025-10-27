import React, { PureComponent } from 'react'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, IconChip, layouts, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import { ConfigContextType } from '../../config/ConfigContext'

interface PlanControlsStates {
  creditsCount: number
}

interface PlanControlsProps extends BaseProps, WithConfigProps {
  trialRemainingTime: number
  creditsRenewalDate: number
}

export default class PlanControls extends PureComponent<
  PlanControlsProps,
  PlanControlsStates
> {
  private subscribeCredits: (() => void) | null = null

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
      creditsCount: $creditsCount.value,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribeCredits = $creditsCount.subscribe((value) => {
      let adjustedValue = value
      if (adjustedValue < 0) adjustedValue = 0
      this.setState({ creditsCount: adjustedValue })
    })
  }

  componentWillUnmount = () => {
    if (this.subscribeCredits) this.subscribeCredits()
  }

  // Templates
  RemainingTime = () => (
    <div
      className={doClassnames([
        texts.type,
        texts['type--secondary'],
        texts['type--truncated'],
        layouts['snackbar--tight'],
      ])}
    >
      <span>{this.props.locales.separator}</span>
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
  )

  RemainingCredits = () => (
    <div
      className={doClassnames([
        texts.type,
        texts['type--secondary'],
        layouts['snackbar--tight'],
      ])}
    >
      <span>{this.props.locales.separator}</span>
      {this.state.creditsCount > 0 && (
        <span>
          {this.props.locales.plan.credits.plural.replace(
            '{count}',
            Math.ceil(this.state.creditsCount).toString()
          )}
        </span>
      )}
      {this.state.creditsCount === 1 && (
        <span>{this.props.locales.plan.credits.single}</span>
      )}
      {this.state.creditsCount === 0 && (
        <>
          <span>{this.props.locales.plan.credits.none}</span>
          <IconChip
            iconType="PICTO"
            iconName="warning"
            text={this.props.locales.plan.credits.renew.replace(
              '{date}',
              new Date(this.props.creditsRenewalDate).toLocaleString(
                this.props.lang,
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )
            )}
            pin="TOP"
            type="MULTI_LINE"
          />
        </>
      )}
    </div>
  )

  EndedTrial = () => (
    <div
      className={doClassnames([
        texts.type,
        texts['type--secondary'],
        layouts['snackbar--tight'],
      ])}
    >
      <span>{this.props.locales.separator}</span>
      <div className={doClassnames([texts['type--truncated']])}>
        <span>{this.props.locales.plan.trialEnded}</span>
      </div>
    </div>
  )

  trialFeedback = () => (
    <Feature
      isActive={PlanControls.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).INVOLVE_FEEDBACK.isActive()}
    >
      <div
        className={doClassnames([
          texts.type,
          texts['type--secondary'],
          layouts['snackbar--tight'],
        ])}
      >
        <span>{this.props.locales.separator}</span>
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
            sendPluginMessage(
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
      </div>
    </Feature>
  )

  FreePlan = () => (
    <div className={doClassnames([layouts['snackbar--tight']])}>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.locales.plan.tryPro}
        action={() => {
          this.props.config.plan.isTrialEnabled
            ? sendPluginMessage({ pluginMessage: { type: 'GET_TRIAL' } }, '*')
            : sendPluginMessage(
                { pluginMessage: { type: 'GET_PRO_PLAN' } },
                '*'
              )
        }}
      />
      <this.RemainingCredits />
    </div>
  )

  PendingTrial = () => (
    <div className={doClassnames([layouts['snackbar--tight']])}>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.locales.plan.getPro}
        action={() =>
          sendPluginMessage({ pluginMessage: { type: 'GET_PRO_PLAN' } }, '*')
        }
      />
      <this.RemainingTime />
    </div>
  )

  ExpiredTrial = () => (
    <div className={doClassnames([layouts['snackbar--tight']])}>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.locales.plan.getPro}
        action={() =>
          sendPluginMessage({ pluginMessage: { type: 'GET_PRO_PLAN' } }, '*')
        }
      />
      <this.RemainingCredits />
      <this.EndedTrial />
      <this.trialFeedback />
    </div>
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
                  sendPluginMessage(
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
