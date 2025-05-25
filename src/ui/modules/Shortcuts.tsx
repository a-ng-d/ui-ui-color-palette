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
    SHORTCUTS_USER: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_USER',
      planStatus: planStatus,
    }),
    SHORTCUTS_HIGHLIGHT: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_HIGHLIGHT',
      planStatus: planStatus,
    }),
    SHORTCUTS_ONBOARDING: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_ONBOARDING',
      planStatus: planStatus,
    }),
    SHORTCUTS_REPOSITORY: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_REPOSITORY',
      planStatus: planStatus,
    }),
    SHORTCUTS_EMAIL: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_EMAIL',
      planStatus: planStatus,
    }),
    SHORTCUTS_FEEDBACK: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_FEEDBACK',
      planStatus: planStatus,
    }),
    SHORTCUTS_REPORTING: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_REPORTING',
      planStatus: planStatus,
    }),
    SHORTCUTS_REQUESTS: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_REQUESTS',
      planStatus: planStatus,
    }),
    SHORTCUTS_STORE: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_STORE',
      planStatus: planStatus,
    }),
    SHORTCUTS_ABOUT: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_ABOUT',
      planStatus: planStatus,
    }),
    SHORTCUTS_NETWORKING: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_NETWORKING',
      planStatus: planStatus,
    }),
    SHORTCUTS_AUTHOR: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_AUTHOR',
      planStatus: planStatus,
    }),
    SHORTCUTS_DOCUMENTATION: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS_DOCUMENTATION',
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
                  ).SHORTCUTS_DOCUMENTATION.isActive()}
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
                    ).SHORTCUTS_DOCUMENTATION.isBlocked()}
                    isNew={Shortcuts.features(
                      this.props.planStatus,
                      this.props.config
                    ).SHORTCUTS_DOCUMENTATION.isNew()}
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
                  ).SHORTCUTS_USER.isActive()}
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
                          label: 'Change your preferences',
                          type: 'OPTION',
                          isActive: true,
                          isBlocked: false,
                          isNew: false,
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
                          label: 'Change your preferences',
                          type: 'OPTION',
                          isActive: true,
                          isBlocked: false,
                          isNew: false,
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
                      ).SHORTCUTS_HIGHLIGHT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_HIGHLIGHT.isBlocked(),
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
                      ).SHORTCUTS_ONBOARDING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_ONBOARDING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_ONBOARDING.isNew(),
                      action: () => this.props.onReOpenOnboarding(),
                    },
                    {
                      label: this.props.locals.shortcuts.repository,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_REPOSITORY.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_REPOSITORY.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_REPOSITORY.isNew(),
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
                      ).SHORTCUTS_REQUESTS.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_REQUESTS.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_REQUESTS.isNew(),
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
                      ).SHORTCUTS_FEEDBACK.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_FEEDBACK.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_FEEDBACK.isNew(),
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
                      ).SHORTCUTS_REPORTING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_REPORTING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_REPORTING.isNew(),
                      action: this.props.onReOpenReport,
                    },
                    {
                      label: this.props.locals.shortcuts.email,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_EMAIL.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_EMAIL.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_EMAIL.isNew(),
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
                      ).SHORTCUTS_STORE.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_STORE.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_STORE.isNew(),
                      action: this.props.onReOpenStore,
                    },
                    {
                      label: this.props.locals.about.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_ABOUT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_ABOUT.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_ABOUT.isNew(),
                      action: this.props.onReOpenAbout,
                    },
                    {
                      label: this.props.locals.shortcuts.follow,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_NETWORKING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_NETWORKING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_NETWORKING.isNew(),
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
                      ).SHORTCUTS_AUTHOR.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_AUTHOR.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus,
                        this.props.config
                      ).SHORTCUTS_AUTHOR.isNew(),
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
