import React from 'react'
import { PureComponent } from 'preact/compat'
import WelcomeToTrial from '../modules/modals/WelcomeToTrial'
import WelcomeToPro from '../modules/modals/WelcomeToPro'
import TryPro from '../modules/modals/TryPro'
import Store from '../modules/modals/Store'
import Report from '../modules/modals/Report'
import Publication from '../modules/modals/Publication'
import Pricing from '../modules/modals/Pricing'
import Preferences from '../modules/modals/Preferences'
import Onboarding from '../modules/modals/Onboarding'
import NotificationBanner from '../modules/modals/NotificationBanner'
import License from '../modules/modals/License'
import Feedback from '../modules/modals/Feedback'
import Chat from '../modules/modals/Chat'
import Announcements from '../modules/modals/Announcements'
import About from '../modules/modals/About'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { NotificationMessage } from '../../types/messages'
import {
  BaseProps,
  AnnouncementsDigest,
  ModalContext,
  Plans,
} from '../../types/app'
import {
  trackAnnouncementsEvent,
  trackOnboardingEvent,
} from '../../external/tracking/eventsTracker'
import type { AppStates } from '../App'

interface ModalProps extends BaseProps, WithConfigProps, WithTranslationProps {
  rawData: AppStates
  context: ModalContext
  notification: NotificationMessage
  announcements: AnnouncementsDigest
  plans: Plans
  onChangePublication: React.Dispatch<Partial<AppStates>>
  onManageLicense: React.Dispatch<Partial<AppStates>>
  onSkipAndResetPalette: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Modal extends PureComponent<ModalProps> {
  // Render
  render() {
    if (this.props.context !== 'EMPTY')
      return (
        <>
          {this.props.context === 'PUBLICATION' && (
            <Publication
              {...this.props}
              onClosePublication={this.props.onClose}
            />
          )}
          {this.props.context === 'NOTIFICATION' && (
            <NotificationBanner {...this.props} />
          )}
          {this.props.context === 'ANNOUNCEMENTS' && (
            <Announcements
              {...this.props}
              onCloseAnnouncements={() => {
                this.props.onClose()

                trackAnnouncementsEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'END_TOUR',
                  }
                )
              }}
            />
          )}
          {this.props.context === 'ONBOARDING' && (
            <Onboarding
              {...this.props}
              onCloseOnboarding={() => {
                this.props.onClose()

                trackOnboardingEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'END_TOUR',
                  }
                )
              }}
            />
          )}
          {this.props.context === 'PREFERENCES' && (
            <Preferences {...this.props} />
          )}
          {this.props.context === 'LICENSE' && <License {...this.props} />}
          {this.props.context === 'REPORT' && <Report {...this.props} />}
          {this.props.context === 'CHAT' && <Chat {...this.props} />}
          {this.props.context === 'FEEDBACK' && <Feedback {...this.props} />}
          {this.props.context === 'STORE' && <Store {...this.props} />}
          {this.props.context === 'ABOUT' && <About {...this.props} />}
          {this.props.context === 'TRY' && <TryPro {...this.props} />}
          {this.props.context === 'PRICING' && (
            <Pricing
              {...this.props}
              sourceColors={this.props.rawData.sourceColors}
              scale={this.props.rawData.scale}
              preset={this.props.rawData.preset}
            />
          )}
          {this.props.context === 'WELCOME_TO_TRIAL' && (
            <WelcomeToTrial {...this.props} />
          )}
          {this.props.context === 'WELCOME_TO_PRO' && (
            <WelcomeToPro {...this.props} />
          )}
        </>
      )
    return null
  }
}
