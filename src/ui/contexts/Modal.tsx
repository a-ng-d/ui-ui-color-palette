import React from 'react'
import { PureComponent } from 'preact/compat'
import WelcomeToTrial from '../modules/modals/WelcomeToTrial'
import WelcomeToPro from '../modules/modals/WelcomeToPro'
import TryPro from '../modules/modals/TryPro'
import Store from '../modules/modals/Store'
import Report from '../modules/modals/Report'
import Publication from '../modules/modals/Publication'
import Preferences from '../modules/modals/Preferences'
import Onboarding from '../modules/modals/Onboarding'
import NotificationBanner from '../modules/modals/NotificationBanner'
import License from '../modules/modals/License'
import Feedback from '../modules/modals/Feedback'
import Chat from '../modules/modals/Chat'
import Announcements from '../modules/modals/Announcements'
import About from '../modules/modals/About'
import { WithConfigProps } from '../components/WithConfig'
import { NotificationMessage } from '../../types/messages'
import { BaseProps, AnnouncementsDigest, ModalContext } from '../../types/app'
import type { AppStates } from '../App'

interface ModalProps extends BaseProps, WithConfigProps {
  rawData: AppStates
  context: ModalContext
  notification: NotificationMessage
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
          {this.props.context === 'CHAT' && <Chat {...this.props} />}
          {this.props.context === 'FEEDBACK' && <Feedback {...this.props} />}
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
