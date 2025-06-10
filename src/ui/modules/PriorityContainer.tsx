import {
  Button,
  Card,
  Dialog,
  FormItem,
  Input,
  List,
  Message,
  Notification,
  SemanticMessage,
  SimpleItem,
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
  AnnouncementsDigest,
  PlanStatus,
  PriorityContext,
  TrialStatus,
} from '../../types/app'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'
import About from './About'
import Onboarding from './Onboarding'
import SyncPreferences from './SyncPreferences'
import { NotificationMessage } from '../../types/messages'
import { signIn } from '../../external/auth/authentication'
import { trackSignInEvent } from '../../utils/eventsTracker'
import Publication from './Publication'
import activateUserLicenseKey from '../../external/license/activateUserLicenseKey'
import Announcements from './Announcements'
import desactivateUserLicenseKey from '../../external/license/desactivateUserLicenseKey'

interface PriorityContainerProps extends BaseProps, WithConfigProps {
  rawData: AppStates
  context: PriorityContext
  notification: NotificationMessage
  trialStatus: TrialStatus
  announcements: AnnouncementsDigest
  onChangePublication: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PriorityContainerStates {
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  hasLicense: boolean
  licenseStatus: 'READY' | 'ERROR' | 'OK'
  userFullName: string
  userEmail: string
  userMessage: string
  userLicenseKey: string
  userInstanceId: string
  userInstanceName: string
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
    HELP_ANNOUNCEMENTS: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_ANNOUNCEMENTS',
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
      hasLicense: false,
      licenseStatus: 'READY',
      userFullName: '',
      userEmail: '',
      userMessage: '',
      userLicenseKey: '',
      userInstanceId: '',
      userInstanceName: '',
    }
  }

  // Lifecycle
  componentDidMount = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_DATA',
          items: ['user_license_key', 'user_license_instance_id'],
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
        if (
          path.value !== null &&
          path.value !== undefined &&
          path.value !== ''
        )
          this.setState({ userLicenseKey: path.value, hasLicense: true })
        else this.setState({ userLicenseKey: '', hasLicense: false })
      },
      GET_DATA_USER_LICENSE_INSTANCE_ID: () => {
        if (
          path.value !== null &&
          path.value !== undefined &&
          path.value !== ''
        )
          this.setState({ userInstanceId: path.value, hasLicense: true })
        else this.setState({ userInstanceId: '', hasLicense: false })
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

  licenseHandler = () => {
    if (!this.state.hasLicense) {
      return {
        label: this.props.locals.user.license.cta.activate,
        state:
          !this.isValidLicenseKeyFormat(this.state.userLicenseKey) ||
          this.state.userLicenseKey === '' ||
          this.state.userInstanceName === ''
            ? ('DISABLED' as const)
            : this.state.isPrimaryActionLoading
              ? ('LOADING' as const)
              : ('DEFAULT' as const),
        action: () => {
          this.setState({ isPrimaryActionLoading: true })
          activateUserLicenseKey({
            storeApiUrl: this.props.config.urls.storeApiUrl,
            licenseKey: this.state.userLicenseKey,
            instanceName: this.state.userInstanceName,
          })
            .then((data) => {
              this.setState({
                userLicenseKey: data.license_key,
                userInstanceId: data.instance_id,
                licenseStatus: 'OK',
              })
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'WELCOME_TO_PRO',
                  },
                },
                '*'
              )
            })
            .finally(() => {
              this.setState({ isPrimaryActionLoading: false })
            })
            .catch(() => {
              this.setState({
                licenseStatus: 'ERROR',
              })
            })
        },
      }
    }
    return {
      label: this.props.locals.user.license.cta.manage,
      action: () => {
        window.open('https://app.lemonsqueezy.com/my-orders', '_blank')?.focus()
      },
    }
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

  Announcements = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus,
          this.props.config
        ).HELP_ANNOUNCEMENTS.isActive()}
      >
        <Announcements
          {...this.props}
          onCloseAnnouncements={() => {
            if (
              this.props.announcements.version !== undefined ||
              this.props.announcements.version !== ''
            )
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'SET_ITEMS',
                    items: [
                      {
                        key: 'announcements_version',
                        value: this.props.announcements.version,
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
          title={this.props.locals.user.manageLicense}
          pin="RIGHT"
          actions={{
            primary: this.licenseHandler(),
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__form">
            {!this.state.hasLicense ? (
              <>
                {this.state.licenseStatus === 'READY' && (
                  <SemanticMessage
                    type="INFO"
                    message={this.props.locals.user.license.messages.activate}
                  />
                )}
                {this.state.licenseStatus === 'ERROR' && (
                  <SemanticMessage
                    type="ERROR"
                    message={this.props.locals.error.activatedLicense}
                  />
                )}
                <FormItem
                  label={this.props.locals.user.license.key.label}
                  id="type-license-key"
                  shouldFill
                >
                  <Input
                    type="TEXT"
                    id="type-license-key"
                    value={this.state.userLicenseKey}
                    placeholder={this.props.locals.user.license.key.placeholder}
                    onChange={(e) =>
                      this.setState({
                        userLicenseKey: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </FormItem>
                <FormItem
                  label={this.props.locals.user.license.name.label}
                  id="type-instance-name"
                  helper={{
                    type: 'INFO',
                    message: this.props.locals.user.license.name.helper,
                  }}
                  shouldFill
                >
                  <Input
                    type="TEXT"
                    id="type-instance-name"
                    value={this.state.userInstanceName}
                    placeholder={
                      this.props.locals.user.license.name.placeholder
                    }
                    onChange={(e) =>
                      this.setState({
                        userInstanceName: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </FormItem>
              </>
            ) : (
              <>
                {this.state.licenseStatus === 'ERROR' && (
                  <SemanticMessage
                    type="ERROR"
                    message={this.props.locals.error.unlinkedLicense}
                  />
                )}
                <SimpleItem
                  leftPartSlot={
                    <Message
                      icon="key"
                      messages={[this.state.userLicenseKey]}
                    />
                  }
                  rightPartSlot={
                    this.state.licenseStatus !== 'ERROR' ? (
                      <Button
                        type="destructive"
                        label={this.props.locals.user.license.cta.unlink}
                        isLoading={this.state.isPrimaryActionLoading}
                        action={() => {
                          this.setState({ isPrimaryActionLoading: true })
                          desactivateUserLicenseKey({
                            storeApiUrl: this.props.config.urls.storeApiUrl,
                            licenseKey: this.state.userLicenseKey,
                            instanceId: this.state.userInstanceId,
                          })
                            .then(() => {
                              parent.postMessage(
                                {
                                  pluginMessage: {
                                    type: 'POST_MESSAGE',
                                    data: {
                                      type: 'SUCCESS',
                                      message:
                                        this.props.locals.success
                                          .unlinkedLicense,
                                    },
                                  },
                                },
                                '*'
                              )
                              parent.postMessage(
                                {
                                  pluginMessage: {
                                    type: 'LEAVE_PRO_PLAN',
                                  },
                                },
                                '*'
                              )
                              this.setState({
                                userLicenseKey: '',
                                userInstanceId: '',
                                hasLicense: false,
                              })
                            })
                            .finally(() => {
                              this.setState({ isSecondaryActionLoading: false })
                            })
                            .catch(() => {
                              this.setState({
                                licenseStatus: 'ERROR',
                              })
                            })
                        }}
                      />
                    ) : (
                      <Button
                        type="secondary"
                        label={this.props.locals.user.license.cta.unlinkLocally}
                        action={() => {
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'DELETE_DATA',
                                items: [
                                  'user_license_key',
                                  'user_license_instance_id',
                                ],
                              },
                            },
                            '*'
                          )
                          this.setState({
                            userLicenseKey: '',
                            userInstanceId: '',
                            hasLicense: false,
                          })
                        }}
                      />
                    )
                  }
                />
              </>
            )}
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
    if (this.props.context !== 'EMPTY')
      return (
        <>
          {this.props.context === 'PUBLICATION' && <this.Publication />}
          {this.props.context === 'NOTIFICATION' && <this.Notification />}
          {this.props.context === 'ANNOUNCEMENTS' && <this.Announcements />}
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
    return null
  }
}
