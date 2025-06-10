import React from 'react'
import { PureComponent } from 'preact/compat'
import * as Sentry from '@sentry/browser'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, FormItem, Input } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ReportProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface ReportStates {
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  userFullName: string
  userEmail: string
  userMessage: string
}

export default class Report extends PureComponent<ReportProps, ReportStates> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    INVOLVE_ISSUES: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_ISSUES',
      planStatus: planStatus,
    }),
  })

  constructor(props: ReportProps) {
    super(props)
    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
      userFullName: '',
      userEmail: '',
      userMessage: '',
    }
  }

  // Handlers
  reportHandler = () => {
    this.setState({ isPrimaryActionLoading: true })
    try {
      Sentry.sendFeedback(
        {
          name: this.state.userFullName,
          email: this.state.userEmail,
          message: this.state.userMessage,
        },
        {
          includeReplay: true,
        }
      )
        .then(() => {
          this.setState({
            userFullName: '',
            userEmail: '',
            userMessage: '',
          })
          parent.postMessage(
            {
              pluginMessage: {
                type: 'POST_MESSAGE',
                data: {
                  type: 'SUCCESS',
                  message: this.props.locals.success.report,
                },
              },
            },
            '*'
          )
        })
        .finally(() => this.setState({ isPrimaryActionLoading: false }))
        .catch(() => {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'POST_MESSAGE',
                data: {
                  type: 'ERROR',
                  message: this.props.locals.error.generic,
                },
              },
            },
            '*'
          )
        })
    } catch (error) {
      this.setState({ isPrimaryActionLoading: false })
      parent.postMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: this.props.locals.error.generic,
            },
          },
        },
        '*'
      )
    }
  }

  // Render
  render() {
    return (
      <Feature
        isActive={Report.features(
          this.props.planStatus,
          this.props.config
        ).INVOLVE_ISSUES.isActive()}
      >
        <Dialog
          title={this.props.locals.report.title}
          actions={{
            primary: {
              label: this.props.locals.report.cta,
              state: (() => {
                if (this.state.userMessage === '') return 'DISABLED'
                if (this.state.isPrimaryActionLoading) return 'LOADING'

                return 'DEFAULT'
              })(),
              action: this.reportHandler,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__form">
            <div className="dialog__form__item">
              <FormItem
                label={this.props.locals.report.fullName.label}
                id="type-fullname"
                shouldFill
              >
                <Input
                  type="TEXT"
                  id="type-fullname"
                  value={this.state.userFullName}
                  isAutoFocus
                  placeholder={this.props.locals.report.fullName.placeholder}
                  onChange={(e) =>
                    this.setState({
                      userFullName: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
            </div>
            <div className="dialog__form__item">
              <FormItem
                label={this.props.locals.report.email.label}
                id="type-email"
                shouldFill
              >
                <Input
                  type="TEXT"
                  id="type-email"
                  value={this.state.userEmail}
                  placeholder={this.props.locals.report.email.placeholder}
                  onChange={(e) =>
                    this.setState({
                      userEmail: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
            </div>
            <div className="dialog__form__item">
              <FormItem
                label={this.props.locals.report.message.label}
                id="type-message"
                shouldFill
              >
                <Input
                  type="LONG_TEXT"
                  id="type-message"
                  placeholder={this.props.locals.report.message.placeholder}
                  value={this.state.userMessage}
                  isGrowing
                  onChange={(e) =>
                    this.setState({
                      userMessage: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
            </div>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
