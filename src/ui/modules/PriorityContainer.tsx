import {
  Button,
  Card,
  Dialog,
  FormItem,
  Input,
  List,
  Notification,
  SemanticMessage,
  texts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import * as Sentry from '@sentry/browser'
import { createPortal, PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../config/ConfigContext'
import cp from '../../content/images/choose_plan.webp'
import isb from '../../content/images/isb_product_thumbnail.webp'
import pp from '../../content/images/pro_plan.webp'
import t from '../../content/images/trial.webp'
import p from '../../content/images/publication.webp'
import {
  BaseProps,
  HighlightDigest,
  PlanStatus,
  PriorityContext,
  TrialStatus,
} from '../../types/app'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'
import About from './About'
import Highlight from './Highlight'
import Onboarding from './Onboarding'
import SyncPreferences from './SyncPreferences'
import { NotificationMessage } from '../../types/messages'
import { signIn } from '../../external/auth/authentication'
import { trackSignInEvent } from '../../utils/eventsTracker'
import Publication from './Publication'
import activateUserLicenseKey from '../../external/license/activateUserLicenseKey'

interface PriorityContainerProps extends BaseProps, WithConfigProps {
  rawData: AppStates
  context: PriorityContext
  notification: NotificationMessage
  trialStatus: TrialStatus
  highlight: HighlightDigest
  onChangePublication: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PriorityContainerStates {
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  licenseStatus: 'NO_LICENSE' | 'VALID' | 'ERROR'
  userFullName: string
  userEmail: string
  userMessage: string
  userLicenseKey: string
}

export default class PriorityContainer extends PureComponent<
  PriorityContainerProps,
  PriorityContainerStates
> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    NOTIFICATIONS: new FeatureStatus({
      features: config.features,
      featureName: 'NOTIFICATIONS',
      planStatus: planStatus,
    }),
    USER_PREFERENCES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES',
      planStatus: planStatus,
    }),
    PUBLICATION: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLICATION',
      planStatus: planStatus,
    }),
    USER_LICENSE: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LICENSE',
      planStatus: planStatus,
    }),
    HELP_HIGHLIGHT: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_HIGHLIGHT',
      planStatus: planStatus,
    }),
    HELP_ONBOARDING: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_ONBOARDING',
      planStatus: planStatus,
    }),
    INVOLVE_ISSUES: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_ISSUES',
      planStatus: planStatus,
    }),
    MORE_STORE: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_STORE',
      planStatus: planStatus,
    }),
    MORE_ABOUT: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_ABOUT',
      planStatus: planStatus,
    }),
  })

  constructor(props: PriorityContainerProps) {
    super(props)
    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
      licenseStatus: 'NO_LICENSE',
      userFullName: '',
      userEmail: '',
      userMessage: '',
      userLicenseKey: '',
    }
  }

  // Lifecycle
  componentDidMount = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_DATA',
          items: ['user_license_key'],
        },
      },
      '*'
    )
    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const path = e.data

    const actions: {
      [action: string]: () => void
    } = {
      GET_DATA_USER_LICENSE_KEY: () => {
        console.log
        if (path.value !== null || path.value === undefined)
          this.setState({ userLicenseKey: path.value, licenseStatus: 'VALID' })
        else this.setState({ userLicenseKey: '', licenseStatus: 'NO_LICENSE' })
      },
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  reportHandler = () => {
    this.setState({ isPrimaryActionLoading: true })
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
  }

  isValidLicenseKeyFormat = (key: string): boolean => {
    const licenseKeyRegex =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    return licenseKeyRegex.test(key)
  }

  // Templates
  Publication = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).PUBLICATION.isActive()}
      >
        {this.props.userSession.connectionStatus === 'UNCONNECTED'
          ? createPortal(
              <Dialog
                title={this.props.locals.publication.titleSignIn}
                actions={{
                  primary: {
                    label: this.props.locals.publication.signIn,
                    state: this.state.isPrimaryActionLoading
                      ? 'LOADING'
                      : 'DEFAULT',
                    action: async () => {
                      this.setState({ isPrimaryActionLoading: true })
                      signIn(
                        this.props.userIdentity.id,
                        this.props.config.urls.authWorkerUrl,
                        this.props.config.urls.authUrl
                      )
                        .then(() => {
                          trackSignInEvent(
                            this.props.userIdentity.id,
                            this.props.userConsent.find(
                              (consent) => consent.id === 'mixpanel'
                            )?.isConsented ?? false
                          )
                        })
                        .finally(() => {
                          this.setState({ isPrimaryActionLoading: false })
                        })
                        .catch((error) => {
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'POST_MESSAGE',
                                data: {
                                  type: 'ERROR',
                                  message:
                                    error.message === 'Authentication timeout'
                                      ? this.props.locals.error.timeout
                                      : this.props.locals.error.authentication,
                                },
                              },
                            },
                            '*'
                          )
                        })
                    },
                  },
                }}
                onClose={this.props.onClose}
              >
                <div className="dialog__cover">
                  <img
                    src={p}
                    style={{
                      width: '100%',
                    }}
                  />
                </div>
                <div className="dialog__text">
                  <p className={texts.type}>
                    {this.props.locals.publication.message}
                  </p>
                </div>
              </Dialog>,
              document.getElementById('modal') ?? document.createElement('app')
            )
          : createPortal(
              <Publication
                {...this.props}
                isPrimaryActionLoading={this.state.isPrimaryActionLoading}
                isSecondaryActionLoading={this.state.isSecondaryActionLoading}
                onLoadPrimaryAction={(e) =>
                  this.setState({ isPrimaryActionLoading: e })
                }
                onLoadSecondaryAction={(e) =>
                  this.setState({ isSecondaryActionLoading: e })
                }
                onClosePublication={this.props.onClose}
              />,
              document.getElementById('modal') ?? document.createElement('app')
            )}
      </Feature>
    )
  }

  Notification = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
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

  Highlight = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).HELP_HIGHLIGHT.isActive()}
      >
        <Highlight
          {...this.props}
          onCloseHighlight={() => {
            if (
              this.props.highlight.version !== undefined ||
              this.props.highlight.version !== ''
            )
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'SET_ITEMS',
                    items: [
                      {
                        key: 'highlight_version',
                        value: this.props.highlight.version,
                      },
                    ],
                  },
                },
                '*'
              )
            this.props.onClose()
          }}
        />
      </Feature>
    )
  }

  OnBoarding = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).HELP_ONBOARDING.isActive()}
      >
        <Onboarding
          {...this.props}
          onCloseOnboarding={() => {
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'SET_ITEMS',
                  items: [
                    {
                      key: 'is_onboarding_read',
                      value: 'true',
                    },
                  ],
                },
              },
              '*'
            )
            this.props.onClose()
          }}
        />
      </Feature>
    )
  }

  Preferences = () => {
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
        isActive={PriorityContainer.features(
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

  License = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_DATA',
          items: ['user_license_key'],
        },
      },
      '*'
    )
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
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).USER_LICENSE.isActive()}
      >
        <Dialog
          title={this.props.locals.user.updateLicense}
          pin="RIGHT"
          actions={{
            primary: {
              label: this.props.locals.user.license.cta,
              state: (() => {
                if (
                  !this.isValidLicenseKeyFormat(this.state.userLicenseKey) ||
                  this.state.userLicenseKey === ''
                )
                  return 'DISABLED'
                if (this.state.isPrimaryActionLoading) return 'LOADING'

                return 'DEFAULT'
              })(),
              action: async () => {
                this.setState({ isPrimaryActionLoading: true })
                activateUserLicenseKey(
                  this.props.config.urls.storeApiUrl,
                  this.state.userLicenseKey
                )
                  .then(() => {
                    parent.postMessage(
                      {
                        pluginMessage: {
                          type: 'POST_MESSAGE',
                          data: {
                            type: 'SUCCESS',
                            message: this.props.locals.success.license,
                          },
                        },
                      },
                      '*'
                    )
                  })
                  .finally(() => {
                    this.setState({ isPrimaryActionLoading: false })
                  })
                  .then(() => {
                    this.setState({
                      licenseStatus: 'ERROR',
                    })
                  })
              },
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__form">
            {this.state.licenseStatus === 'NO_LICENSE' && (
              <SemanticMessage
                type="INFO"
                message={this.props.locals.user.license.key.message}
              />
            )}
            {this.state.licenseStatus === 'ERROR' && (
              <SemanticMessage
                type="ERROR"
                message={this.props.locals.error.license}
              />
            )}
            <FormItem
              label={this.props.locals.user.license.key.label}
              id="type-license"
              helper={{
                type: 'INFO',
                message: this.props.locals.user.license.key.helper,
              }}
              shouldFill
            >
              <Input
                type="TEXT"
                id="type-license"
                value={this.state.userLicenseKey}
                isAutoFocus
                placeholder={this.props.locals.user.license.key.placeholder}
                onChange={(e) =>
                  this.setState({
                    userLicenseKey: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </FormItem>
          </div>
        </Dialog>
      </Feature>
    )
  }

  Report = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
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

  Store = () => {
    const theme = document.documentElement.getAttribute('data-theme')
    let padding

    switch (theme) {
      case 'penpot':
        padding = 'var(--size-xxsmall) var(--size-small)'
        break
      case 'figma-ui3':
        padding = 'var(--size-xxsmall)'
        break
      default:
        padding = 'var(--size-xxsmall)'
    }

    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).MORE_STORE.isActive()}
      >
        <Dialog
          title={this.props.locals.store.title}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List
            padding={padding}
            isFullWidth
          >
            <Card
              src={isb}
              label={this.props.locals.store.isb.label}
              shouldFill
              action={() => {
                window.open(this.props.config.urls.isbUrl, '_blank')?.focus()
              }}
            >
              <Button
                type="primary"
                label={this.props.locals.store.isb.cta}
                action={() => {
                  window.open(this.props.config.urls.isbUrl, '_blank')?.focus()
                }}
              />
            </Card>
          </List>
        </Dialog>
      </Feature>
    )
  }

  About = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).MORE_ABOUT.isActive()}
      >
        <Dialog
          title={this.props.locals.about.title}
          onClose={this.props.onClose}
        >
          <About {...this.props} />
        </Dialog>
      </Feature>
    )
  }

  TryPro = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).GET_PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locals.proPlan.trial.title.replace(
            '{$1}',
            this.props.config.plan.trialTime
          )}
          actions={{
            primary: {
              label: this.props.locals.proPlan.trial.cta.replace(
                '{$1}',
                this.props.config.plan.trialTime
              ),
              action: () =>
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'ENABLE_TRIAL',
                      data: {
                        trialTime: this.props.config.plan.trialTime,
                        trialVersion: this.props.config.versions.trialVersion,
                      },
                    },
                  },
                  '*'
                ),
            },
            secondary: {
              label: this.props.locals.proPlan.trial.option,
              action: () =>
                parent.postMessage(
                  { pluginMessage: { type: 'GET_PRO_PLAN' } },
                  '*'
                ),
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={cp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locals.proPlan.trial.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  WelcomeToTrial = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).GET_PRO_PLAN.isActive()}
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

  WelcomeToPro = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).GET_PRO_PLAN.isActive()}
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
              src={pp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locals.proPlan.welcome.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.context === 'PUBLICATION' && <this.Publication />}
        {this.props.context === 'NOTIFICATION' && <this.Notification />}
        {this.props.context === 'HIGHLIGHT' && <this.Highlight />}
        {this.props.context === 'ONBOARDING' && <this.OnBoarding />}
        {this.props.context === 'PREFERENCES' && <this.Preferences />}
        {this.props.context === 'LICENSE' && <this.License />}
        {this.props.context === 'REPORT' && <this.Report />}
        {this.props.context === 'STORE' && <this.Store />}
        {this.props.context === 'ABOUT' && <this.About />}
        {this.props.context === 'TRY' && <this.TryPro />}
        {this.props.context === 'WELCOME_TO_TRIAL' && <this.WelcomeToTrial />}
        {this.props.context === 'WELCOME_TO_PRO' && <this.WelcomeToPro />}
      </>
    )
  }
}
