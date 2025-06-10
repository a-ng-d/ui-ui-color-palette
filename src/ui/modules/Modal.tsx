import { PureComponent } from 'preact/compat'
import React from 'react'
import {
  BaseProps,
  AnnouncementsDigest,
  ModalContext,
  TrialStatus,
} from '../../types/app'
import type { AppStates } from '../App'
import { WithConfigProps } from '../components/WithConfig'
import About from './modals/About'
import Onboarding from './modals/Onboarding'
import { NotificationMessage } from '../../types/messages'
import Publication from './modals/Publication'
import Announcements from './modals/Announcements'
import WelcomeToTrial from './modals/WelcomeToTrial'
import WelcomeToPro from './modals/WelcomeToPro'
import TryPro from './modals/TryPro'
import Store from './modals/Store'
import Report from './modals/Report'
import License from './modals/License'
import Preferences from './modals/Preferences'
import NotificationBanner from './modals/NotificationBanner'

interface ModalProps extends BaseProps, WithConfigProps {
  rawData: AppStates
  context: ModalContext
  notification: NotificationMessage
  trialStatus: TrialStatus
  announcements: AnnouncementsDigest
  onChangePublication: React.Dispatch<Partial<AppStates>>
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
          )}
          {this.props.context === 'ONBOARDING' && (
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
          )}
          {this.props.context === 'PREFERENCES' && (
            <Preferences {...this.props} />
          )}
          {this.props.context === 'LICENSE' && <License {...this.props} />}
          {this.props.context === 'REPORT' && <Report {...this.props} />}
          {this.props.context === 'STORE' && <Store {...this.props} />}
          {this.props.context === 'ABOUT' && <About {...this.props} />}
          {this.props.context === 'TRY' && <TryPro {...this.props} />}
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
