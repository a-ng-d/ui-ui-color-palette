import { Bar, Button, Icon, layouts, Menu } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../config/ConfigContext'
import {
  BaseProps,
  HighlightDigest,
  PlanStatus,
  TrialStatus,
} from '../../types/app'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'
import PlanControls from './PlanControls'

interface ShortcutsProps extends BaseProps, WithConfigProps {
  trialStatus: TrialStatus
  trialRemainingTime: number
  highlight: HighlightDigest
  onReOpenHighlight: () => void
  onReOpenOnboarding: () => void
  onReOpenStore: () => void
  onReOpenAbout: () => void
  onReOpenReport: () => void
  onGetProPlan: () => void
  onUpdateConsent: () => void
  onOpenPreferences: () => void
}

interface ShortcutsStates {
  isUserMenuLoading: boolean
}

export default class Shortcuts extends PureComponent<
  ShortcutsProps,
  ShortcutsStates
> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    USER: new FeatureStatus({
      features: config.features,
      featureName: 'USER',
      planStatus: planStatus,
    }),
    USER_PREFERENCES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES',
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
    INVOLVE_REPOSITORY: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_REPOSITORY',
      planStatus: planStatus,
    }),
    HELP_EMAIL: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_EMAIL',
      planStatus: planStatus,
    }),
    INVOLVE_FEEDBACK: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_FEEDBACK',
      planStatus: planStatus,
    }),
    INVOLVE_ISSUES: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_ISSUES',
      planStatus: planStatus,
    }),
    INVOLVE_REQUESTS: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_REQUESTS',
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
    MORE_NETWORK: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_NETWORK',
      planStatus: planStatus,
    }),
    MORE_AUTHOR: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_AUTHOR',
      planStatus: planStatus,
    }),
    HELP_DOCUMENTATION: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_DOCUMENTATION',
      planStatus: planStatus,
    }),
    GET_PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    CONSENT: new FeatureStatus({
      features: config.features,
      featureName: 'CONSENT',
      planStatus: planStatus,
    }),
    RESIZE_UI: new FeatureStatus({
      features: config.features,
      featureName: 'RESIZE_UI',
      planStatus: planStatus,
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
      h: 400,
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

    if (scaleX > 540) windowSize.w = scaleX
    else windowSize.w = 540
    if (scaleY > 432) windowSize.h = scaleY
    else windowSize.h = 432

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
    let fragment = null

    if (
      this.props.config.plan.isTrialEnabled ||
      this.props.trialStatus !== 'UNUSED'
    )
      fragment = <PlanControls {...this.props} />
    else if (
      this.props.planStatus === 'UNPAID' &&
      this.props.trialStatus === 'UNUSED'
    )
      fragment = (
        <Button
          type="alternative"
          size="small"
          icon="lock-off"
          label={this.props.locals.plan.getPro}
          action={() =>
            parent.postMessage({ pluginMessage: { type: 'GET_PRO_PLAN' } }, '*')
          }
        />
      )

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
                    this.props.config
                  ).HELP_DOCUMENTATION.isActive()}
                >
                  <Button
                    type="icon"
                    icon="library"
                    helper={{
                      label: this.props.locals.shortcuts.tooltips.documentation,
                      pin: 'TOP',
                    }}
                    isBlocked={Shortcuts.features(
                      this.props.planStatus,
                      this.props.config
                    ).HELP_DOCUMENTATION.isBlocked()}
                    isNew={Shortcuts.features(
                      this.props.planStatus,
                      this.props.config
                    ).HELP_DOCUMENTATION.isNew()}
                    action={() =>
                      window
                        .open(this.props.config.urls.documentationUrl, '_blank')
                        ?.focus()
                    }
                  />
                </Feature>
                <Feature
                  isActive={Shortcuts.features(
                    this.props.planStatus,
                    this.props.config
                  ).USER.isActive()}
                >
                  {this.props.userSession.connectionStatus === 'CONNECTED' ? (
                    <Menu
                      id="user-menu"
                      icon="user"
                      options={[
                        {
                          label: this.props.locals.user.welcomeMessage.replace(
                            '$[]',
                            this.props.userSession.userFullName
                          ),
                          type: 'TITLE',
                          action: () => null,
                        },
                        {
                          type: 'SEPARATOR',
                        },
                        {
                          label: this.props.locals.user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).CONSENT.isNew(),
                          action: this.props.onUpdateConsent,
                        },
                        {
                          label: this.props.locals.user.updatePreferences,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).USER_PREFERENCES.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).USER_PREFERENCES.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).USER_PREFERENCES.isNew(),
                          action: this.props.onOpenPreferences,
                        },
                      ]}
                      alignment="TOP_RIGHT"
                      helper={{
                        label: this.props.locals.shortcuts.tooltips.userMenu,
                        pin: 'TOP',
                      }}
                    />
                  ) : (
                    <Menu
                      id="user-menu"
                      icon="user"
                      options={[
                        {
                          label: this.props.locals.user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).CONSENT.isNew(),
                          action: this.props.onUpdateConsent,
                        },
                        {
                          label: this.props.locals.user.updatePreferences,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).USER_PREFERENCES.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).USER_PREFERENCES.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus,
                            this.props.config
                          ).USER_PREFERENCES.isNew(),
                          action: this.props.onOpenPreferences,
                        },
                      ]}
                      state={
                        this.state.isUserMenuLoading ? 'LOADING' : 'DEFAULT'
                      }
                      alignment="TOP_RIGHT"
                      helper={{
                        label: this.props.locals.shortcuts.tooltips.userMenu,
                        pin: 'TOP',
                      }}
                    />
                  )}
                </Feature>
                <Menu
                  id="shortcuts-menu"
                  icon="ellipses"
                  options={[
                    {
                      label: this.props.locals.shortcuts.news,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_HIGHLIGHT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_HIGHLIGHT.isBlocked(),
                      isNew:
                        this.props.highlight.status ===
                        'DISPLAY_HIGHLIGHT_NOTIFICATION'
                          ? true
                          : false,
                      action: () => this.props.onReOpenHighlight(),
                    },
                    {
                      label: this.props.locals.shortcuts.onboarding,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_ONBOARDING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_ONBOARDING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_ONBOARDING.isNew(),
                      action: () => this.props.onReOpenOnboarding(),
                    },
                    {
                      label: this.props.locals.shortcuts.repository,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_REPOSITORY.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_REPOSITORY.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_REPOSITORY.isNew(),
                      action: () =>
                        window
                          .open(this.props.config.urls.repositoryUrl, '_blank')
                          ?.focus(),
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label: this.props.locals.shortcuts.request,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_REQUESTS.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_REQUESTS.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_REQUESTS.isNew(),
                      action: () =>
                        window
                          .open(this.props.config.urls.requestsUrl, '_blank')
                          ?.focus(),
                    },
                    {
                      label: this.props.locals.shortcuts.feedback,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_FEEDBACK.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_FEEDBACK.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_FEEDBACK.isNew(),
                      action: () => {
                        window
                          .open(this.props.config.urls.feedbackUrl, '_blank')
                          ?.focus()
                      },
                    },
                    {
                      label: this.props.locals.report.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_ISSUES.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_ISSUES.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).INVOLVE_ISSUES.isNew(),
                      action: this.props.onReOpenReport,
                    },
                    {
                      label: this.props.locals.shortcuts.email,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_EMAIL.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_EMAIL.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).HELP_EMAIL.isNew(),
                      action: () =>
                        window
                          .open(this.props.config.urls.supportEmail, '_blank')
                          ?.focus(),
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label: this.props.locals.shortcuts.store,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_STORE.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_STORE.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_STORE.isNew(),
                      action: this.props.onReOpenStore,
                    },
                    {
                      label: this.props.locals.about.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_ABOUT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_ABOUT.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_ABOUT.isNew(),
                      action: this.props.onReOpenAbout,
                    },
                    {
                      label: this.props.locals.shortcuts.follow,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_NETWORK.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_NETWORK.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_NETWORK.isNew(),
                      action: () =>
                        window
                          .open(this.props.config.urls.networkUrl, '_blank')
                          ?.focus(),
                    },
                    {
                      label: this.props.locals.shortcuts.author,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_AUTHOR.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_AUTHOR.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).MORE_AUTHOR.isNew(),
                      action: () =>
                        window
                          .open(this.props.config.urls.authorUrl, '_blank')
                          ?.focus(),
                    },
                  ]}
                  alignment="TOP_RIGHT"
                  helper={{
                    label: this.props.locals.shortcuts.tooltips.helpMenu,
                    pin: 'TOP',
                  }}
                  isNew={
                    this.props.highlight.status ===
                    'DISPLAY_HIGHLIGHT_NOTIFICATION'
                      ? true
                      : false
                  }
                />
              </div>
              <Feature
                isActive={Shortcuts.features(
                  this.props.planStatus,
                  this.props.config
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
                this.props.config
              ).GET_PRO_PLAN.isActive()}
            >
              {fragment}
            </Feature>
          }
        />
      </>
    )
  }
}
