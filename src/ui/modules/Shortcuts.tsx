import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Bar, Button, Icon, layouts, Menu } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppStates } from '../App'
import {
  BaseProps,
  AnnouncementsDigest,
  PlanStatus,
  Service,
  Editor,
} from '../../types/app'
import {
  trackSignInEvent,
  trackSignOutEvent,
} from '../../external/tracking/eventsTracker'
import { signIn, signOut } from '../../external/auth/authentication'
import { ConfigContextType } from '../../config/ConfigContext'
import PlanControls from './PlanControls'

interface ShortcutsProps extends BaseProps, WithConfigProps {
  trialRemainingTime: number
  announcements: AnnouncementsDigest
  onReOpenAnnouncements: React.Dispatch<Partial<AppStates>>
  onReOpenOnboarding: React.Dispatch<Partial<AppStates>>
  onReOpenStore: React.Dispatch<Partial<AppStates>>
  onReOpenAbout: React.Dispatch<Partial<AppStates>>
  onReOpenReport: React.Dispatch<Partial<AppStates>>
  onReOpenPreferences: React.Dispatch<Partial<AppStates>>
  onReOpenLicense: React.Dispatch<Partial<AppStates>>
  onReOpenChat: React.Dispatch<Partial<AppStates>>
  onReOpenFeedback: React.Dispatch<Partial<AppStates>>
  onUpdateConsent: React.Dispatch<Partial<AppStates>>
}

interface ShortcutsStates {
  isUserMenuLoading: boolean
}

export default class Shortcuts extends PureComponent<
  ShortcutsProps,
  ShortcutsStates
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    USER: new FeatureStatus({
      features: config.features,
      featureName: 'USER',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_PREFERENCES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_LICENSE: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LICENSE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    HELP_ANNOUNCEMENTS: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_ANNOUNCEMENTS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    HELP_ONBOARDING: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_ONBOARDING',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    HELP_EMAIL: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_EMAIL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    HELP_CHAT: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_CHAT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    INVOLVE_REPOSITORY: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_REPOSITORY',
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
    INVOLVE_ISSUES: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_ISSUES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    INVOLVE_REQUESTS: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_REQUESTS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    INVOLVE_COMMUNITY: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_COMMUNITY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    MORE_STORE: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_STORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    MORE_ABOUT: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_ABOUT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    MORE_NETWORK: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_NETWORK',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    MORE_AUTHOR: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_AUTHOR',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    HELP_DOCUMENTATION: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_DOCUMENTATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'PRO_PLAN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_CONSENT: new FeatureStatus({
      features: config.features,
      featureName: 'USER_CONSENT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    RESIZE_UI: new FeatureStatus({
      features: config.features,
      featureName: 'RESIZE_UI',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    BACKSTAGE_AUTHENTICATION: new FeatureStatus({
      features: config.features,
      featureName: 'BACKSTAGE_AUTHENTICATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ShortcutsProps) {
    super(props)
    this.state = {
      isUserMenuLoading: false,
    }
  }

  // Direct Actions
  onHold = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const shiftX = target.offsetWidth - e.layerX
    const shiftY = target.offsetHeight - e.layerY
    window.onmousemove = (e) => this.onResize(e, shiftX, shiftY)
    window.onmouseup = this.onRelease
  }

  onResize = (e: MouseEvent, shiftX: number, shiftY: number) => {
    const windowSize = {
      w: 640,
      h: 420,
    }
    const origin = {
      x: e.screenX - e.clientX,
      y: e.screenY - e.clientY,
    }
    const shift = {
      x: shiftX,
      y: shiftY,
    }
    const cursor = {
      x: e.screenX,
      y: e.screenY,
    }
    const scaleX = Math.abs(origin.x - cursor.x - shift.x),
      scaleY = Math.abs(origin.y - cursor.y - shift.y)

    if (scaleX > 640) windowSize.w = scaleX
    else windowSize.w = 640
    if (scaleY > 420) windowSize.h = scaleY
    else windowSize.h = 420

    parent.postMessage(
      {
        pluginMessage: {
          type: 'RESIZE_UI',
          data: {
            width: windowSize.w,
            height: windowSize.h,
          },
        },
      },
      '*'
    )
  }

  onRelease = () => (window.onmousemove = null)

  // Render
  render() {
    return (
      <>
        <Bar
          rightPartSlot={
            <>
              <div
                className={doClassnames([
                  'shortcuts',
                  layouts['snackbar--medium'],
                ])}
              >
                <Feature
                  isActive={Shortcuts.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).HELP_DOCUMENTATION.isActive()}
                >
                  <Button
                    type="icon"
                    icon="library"
                    helper={{
                      label:
                        this.props.locales.shortcuts.tooltips.documentation,
                      pin: 'TOP',
                    }}
                    isBlocked={Shortcuts.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).HELP_DOCUMENTATION.isBlocked()}
                    isNew={Shortcuts.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).HELP_DOCUMENTATION.isNew()}
                    action={() =>
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'OPEN_IN_BROWSER',
                            data: {
                              url: this.props.config.urls.documentationUrl,
                            },
                          },
                        },
                        '*'
                      )
                    }
                  />
                </Feature>
                <Feature
                  isActive={Shortcuts.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).USER.isActive()}
                >
                  {this.props.userSession.connectionStatus === 'CONNECTED' ? (
                    <Menu
                      id="user-menu"
                      customIcon={
                        this.props.userSession.userAvatar ? (
                          <img
                            src={this.props.userSession.userAvatar}
                            style={{
                              height: 'calc(100% - var(--size-pos-xxsmall))',
                              borderRadius: 'var(--border-radius-full)',
                            }}
                            alt="User Avatar"
                          />
                        ) : (
                          <Icon
                            type="PICTO"
                            iconName="user"
                          />
                        )
                      }
                      options={[
                        {
                          label: this.props.locales.user.welcomeMessage.replace(
                            '{username}',
                            this.props.userSession.userFullName
                          ),
                          type: 'TITLE',
                          action: () => null,
                        },
                        {
                          type: 'SEPARATOR',
                        },
                        {
                          label: this.props.locales.user.signOut,
                          type: 'OPTION',
                          action: async () => {
                            this.setState({ isUserMenuLoading: true })
                            signOut({
                              authUrl: this.props.config.urls.authUrl,
                              platformUrl: this.props.config.urls.platformUrl,
                              pluginId: this.props.config.env.pluginId,
                            })
                              .then(() => {
                                parent.postMessage(
                                  {
                                    pluginMessage: {
                                      type: 'POST_MESSAGE',
                                      data: {
                                        type: 'INFO',
                                        message:
                                          this.props.locales.info.signOut,
                                      },
                                    },
                                  },
                                  '*'
                                )

                                trackSignOutEvent(
                                  this.props.config.env.isMixpanelEnabled,
                                  this.props.userSession.userId === ''
                                    ? this.props.userIdentity.id === ''
                                      ? ''
                                      : this.props.userIdentity.id
                                    : this.props.userSession.userId,
                                  this.props.userConsent.find(
                                    (consent) => consent.id === 'mixpanel'
                                  )?.isConsented ?? false
                                )
                              })
                              .finally(() => {
                                this.setState({ isUserMenuLoading: false })
                              })
                              .catch(() => {
                                parent.postMessage(
                                  {
                                    pluginMessage: {
                                      type: 'POST_MESSAGE',
                                      data: {
                                        type: 'ERROR',
                                        message:
                                          this.props.locales.error.generic,
                                      },
                                    },
                                  },
                                  '*'
                                )
                              })
                          },
                        },
                        {
                          label: this.props.locales.user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_CONSENT.isNew(),
                          action: () =>
                            this.props.onUpdateConsent({
                              mustUserConsent: true,
                            }),
                        },
                        {
                          label: this.props.locales.user.updatePreferences,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_PREFERENCES.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_PREFERENCES.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_PREFERENCES.isNew(),
                          action: () =>
                            this.props.onReOpenPreferences({
                              modalContext: 'PREFERENCES',
                            }),
                        },
                        {
                          label: this.props.locales.user.manageLicense,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_LICENSE.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_LICENSE.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_LICENSE.isNew(),
                          action: () =>
                            this.props.onReOpenLicense({
                              modalContext: 'LICENSE',
                            }),
                        },
                      ]}
                      alignment="TOP_RIGHT"
                      helper={{
                        label: this.props.locales.shortcuts.tooltips.userMenu,
                        pin: 'TOP',
                      }}
                    />
                  ) : (
                    <Menu
                      id="user-menu"
                      icon="user"
                      options={[
                        {
                          label: this.props.locales.user.signIn,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).BACKSTAGE_AUTHENTICATION.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).BACKSTAGE_AUTHENTICATION.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).BACKSTAGE_AUTHENTICATION.isNew(),
                          action: async () => {
                            this.setState({ isUserMenuLoading: true })
                            signIn({
                              disinctId: this.props.userIdentity.id,
                              authWorkerUrl:
                                this.props.config.urls.authWorkerUrl,
                              authUrl: this.props.config.urls.authUrl,
                              platformUrl: this.props.config.urls.platformUrl,
                              pluginId: this.props.config.env.pluginId,
                            })
                              .then(() => {
                                parent.postMessage(
                                  {
                                    pluginMessage: {
                                      type: 'POST_MESSAGE',
                                      data: {
                                        type: 'SUCCESS',
                                        message:
                                          this.props.locales.user.welcomeMessage.replace(
                                            '{username}',
                                            this.props.userSession.userFullName
                                          ),
                                      },
                                    },
                                  },
                                  '*'
                                )

                                trackSignInEvent(
                                  this.props.config.env.isMixpanelEnabled,
                                  this.props.userSession.userId === ''
                                    ? this.props.userIdentity.id === ''
                                      ? ''
                                      : this.props.userIdentity.id
                                    : this.props.userSession.userId,
                                  this.props.userConsent.find(
                                    (consent) => consent.id === 'mixpanel'
                                  )?.isConsented ?? false
                                )
                              })
                              .finally(() => {
                                this.setState({ isUserMenuLoading: false })
                              })
                              .catch((error) => {
                                parent.postMessage(
                                  {
                                    pluginMessage: {
                                      type: 'POST_MESSAGE',
                                      data: {
                                        type: 'ERROR',
                                        message:
                                          error.message ===
                                          'Authentication timeout'
                                            ? this.props.locales.error.timeout
                                            : this.props.locales.error
                                                .authentication,
                                      },
                                    },
                                  },
                                  '*'
                                )
                              })
                          },
                        },
                        {
                          label: this.props.locales.user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_CONSENT.isNew(),
                          action: () =>
                            this.props.onUpdateConsent({
                              mustUserConsent: true,
                            }),
                        },
                        {
                          label: this.props.locales.user.updatePreferences,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_PREFERENCES.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_PREFERENCES.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_PREFERENCES.isNew(),
                          action: () =>
                            this.props.onReOpenPreferences({
                              modalContext: 'PREFERENCES',
                            }),
                        },
                        {
                          label: this.props.locales.user.manageLicense,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_LICENSE.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_LICENSE.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).USER_LICENSE.isNew(),
                          action: () =>
                            this.props.onReOpenLicense({
                              modalContext: 'LICENSE',
                            }),
                        },
                      ]}
                      state={
                        this.state.isUserMenuLoading ? 'LOADING' : 'DEFAULT'
                      }
                      alignment="TOP_RIGHT"
                      helper={{
                        label: this.props.locales.shortcuts.tooltips.userMenu,
                        pin: 'TOP',
                      }}
                    />
                  )}
                </Feature>
                <Menu
                  id="help-support-menu"
                  icon="ellipses"
                  options={[
                    {
                      label: this.props.locales.shortcuts.news,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_ANNOUNCEMENTS.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_ANNOUNCEMENTS.isBlocked(),
                      isNew:
                        this.props.announcements.status ===
                        'DISPLAY_ANNOUNCEMENTS_NOTIFICATION'
                          ? true
                          : false,
                      action: () =>
                        this.props.onReOpenAnnouncements({
                          modalContext: 'ANNOUNCEMENTS',
                        }),
                    },
                    {
                      label: this.props.locales.shortcuts.onboarding,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_ONBOARDING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_ONBOARDING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_ONBOARDING.isNew(),
                      action: () =>
                        this.props.onReOpenOnboarding({
                          modalContext: 'ONBOARDING',
                        }),
                    },
                    {
                      label: this.props.locales.shortcuts.email,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_EMAIL.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_EMAIL.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_EMAIL.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              data: {
                                url: this.props.config.urls.supportEmail,
                              },
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: this.props.locales.shortcuts.chat,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_CHAT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_CHAT.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).HELP_CHAT.isNew(),
                      action: () =>
                        this.props.onReOpenChat({
                          modalContext: 'CHAT',
                        }),
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label: this.props.locales.shortcuts.community,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_COMMUNITY.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_COMMUNITY.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_COMMUNITY.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              data: {
                                url: this.props.config.urls.communityUrl,
                              },
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: this.props.locales.shortcuts.request,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_REQUESTS.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_REQUESTS.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_REQUESTS.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              data: {
                                url: this.props.config.urls.requestsUrl,
                              },
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: this.props.locales.report.title,
                      type: 'OPTION',
                      isActive:
                        Shortcuts.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).INVOLVE_ISSUES.isActive() &&
                        this.props.config.env.isSentryEnabled,
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_ISSUES.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_ISSUES.isNew(),
                      action: () =>
                        this.props.onReOpenReport({
                          modalContext: 'REPORT',
                        }),
                    },
                    {
                      label: this.props.locales.shortcuts.feedback,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_FEEDBACK.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_FEEDBACK.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_FEEDBACK.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              data: {
                                url: this.props.config.urls.feedbackUrl,
                              },
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: this.props.locales.shortcuts.repository,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_REPOSITORY.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_REPOSITORY.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).INVOLVE_REPOSITORY.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              data: {
                                url: this.props.config.urls.repositoryUrl,
                              },
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      type: 'SEPARATOR',
                    },

                    {
                      label: this.props.locales.shortcuts.store,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_STORE.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_STORE.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_STORE.isNew(),
                      action: () =>
                        this.props.onReOpenStore({
                          modalContext: 'STORE',
                        }),
                    },
                    {
                      label: this.props.locales.about.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_ABOUT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_ABOUT.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_ABOUT.isNew(),
                      action: () =>
                        this.props.onReOpenAbout({
                          modalContext: 'ABOUT',
                        }),
                    },
                    {
                      label: this.props.locales.shortcuts.follow,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_NETWORK.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_NETWORK.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_NETWORK.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              data: {
                                url: this.props.config.urls.networkUrl,
                              },
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: this.props.locales.shortcuts.author,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_AUTHOR.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_AUTHOR.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).MORE_AUTHOR.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              data: {
                                url: this.props.config.urls.authorUrl,
                              },
                            },
                          },
                          '*'
                        ),
                    },
                  ]}
                  alignment="TOP_RIGHT"
                  helper={{
                    label: this.props.locales.shortcuts.tooltips.helpMenu,
                    pin: 'TOP',
                  }}
                  isNew={
                    this.props.announcements.status ===
                    'DISPLAY_ANNOUNCEMENTS_NOTIFICATION'
                      ? true
                      : false
                  }
                />
              </div>
              <Feature
                isActive={Shortcuts.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).RESIZE_UI.isActive()}
              >
                <div
                  className="box-resizer-grip"
                  onMouseDown={this.onHold.bind(this)}
                >
                  <Icon
                    type="PICTO"
                    iconName="resize-grip"
                  />
                </div>
              </Feature>
            </>
          }
          leftPartSlot={
            <Feature
              isActive={Shortcuts.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).PRO_PLAN.isActive()}
            >
              <PlanControls {...this.props} />
            </Feature>
          }
          shouldReflow
          border={['TOP']}
        />
      </>
    )
  }
}
