import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, Icon, SemanticMessage, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import {
  BaseProps,
  AnnouncementsDigest,
  PlanStatus,
  Service,
  Editor,
} from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface AnnouncementsProps extends BaseProps, WithConfigProps {
  announcements: AnnouncementsDigest
  onCloseAnnouncements: (e: MouseEvent) => void
}

interface AnnouncementsStates {
  position: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  announcements: Array<any>
  status: 'LOADING' | 'LOADED' | 'ERROR'
  isImageLoaded: boolean
}

export default class Announcements extends PureComponent<
  AnnouncementsProps,
  AnnouncementsStates
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    HELP_ANNOUNCEMENTS: new FeatureStatus({
      features: config.features,
      featureName: 'HELP_ANNOUNCEMENTS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: AnnouncementsProps) {
    super(props)
    this.state = {
      position: 0,
      announcements: [],
      status: 'LOADING',
      isImageLoaded: false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    fetch(
      `${this.props.config.urls.announcementsWorkerUrl}/?action=get_announcements&database_id=${this.props.config.env.announcementsDbId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'The database could not be queried') {
          interface AnnouncementProperties {
            Plateformes: {
              multi_select: Array<{
                name: string
              }>
            }
          }

          interface Announcement {
            properties: AnnouncementProperties
          }

          switch (this.props.config.env.platform) {
            case 'figma':
              data.announcements = data.announcements.filter(
                (announcement: Announcement) =>
                  announcement.properties['Plateformes'].multi_select.some(
                    (role: { name: string }) => role.name === 'Figma'
                  )
              )
              break
            case 'penpot':
              data.announcements = data.announcements.filter(
                (announcement: Announcement) =>
                  announcement.properties['Plateformes'].multi_select.some(
                    (role: { name: string }) => role.name === 'Penpot'
                  )
              )
              break
            case 'sketch':
              data.announcements = data.announcements.filter(
                (announcement: Announcement) =>
                  announcement.properties['Plateformes'].multi_select.some(
                    (role: { name: string }) => role.name === 'Sketch'
                  )
              )
              break
          }

          this.setState({
            announcements: data.announcements,
            status: 'LOADED',
          })
        } else this.setState({ status: 'ERROR' })
      })
      .catch(() => {
        this.setState({ status: 'ERROR' })
      })
  }

  // Direct Actions
  goNextSlide = (e: MouseEvent) => {
    if (this.state.position + 1 < this.state.announcements.length)
      this.setState({ position: this.state.position + 1, isImageLoaded: false })
    else {
      this.props.onCloseAnnouncements(e as MouseEvent)
      this.setState({ position: 0 })
    }
  }

  // Render
  render() {
    if (this.state.status === 'LOADING')
      return (
        <Feature
          isActive={Announcements.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).HELP_ANNOUNCEMENTS.isActive()}
        >
          <Dialog
            title={this.props.locales.shortcuts.news}
            isLoading
            onClose={this.props.onCloseAnnouncements}
          />
        </Feature>
      )
    else if (this.state.status === 'ERROR')
      return (
        <Feature
          isActive={Announcements.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).HELP_ANNOUNCEMENTS.isActive()}
        >
          <Dialog
            title={this.props.locales.shortcuts.news}
            isMessage
            onClose={this.props.onCloseAnnouncements}
          >
            <SemanticMessage
              type="WARNING"
              message={this.props.locales.error.announcements}
            />
          </Dialog>
        </Feature>
      )
    else if (this.state.announcements.length === 0)
      return (
        <Feature
          isActive={Announcements.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).HELP_ANNOUNCEMENTS.isActive()}
        >
          <Dialog
            title={this.props.locales.shortcuts.news}
            isMessage
            onClose={(e: MouseEvent) => {
              if (
                this.props.announcements.version !== undefined &&
                this.props.announcements.version !== '' &&
                this.props.announcements.version !== null
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
              this.props.onCloseAnnouncements(e)
            }}
          >
            <SemanticMessage
              type="INFO"
              message={this.props.locales.info.announcements}
            />
          </Dialog>
        </Feature>
      )
    else
      return (
        <Feature
          isActive={Announcements.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).HELP_ANNOUNCEMENTS.isActive()}
        >
          <Dialog
            title={
              this.state.announcements[this.state.position].properties.Titre
                .title[0].plain_text
            }
            tag={
              this.state.announcements[this.state.position].properties.Type
                .select.name
            }
            actions={{
              primary: {
                label:
                  this.state.position + 1 < this.state.announcements.length
                    ? this.props.locales.announcements.cta.next
                    : this.props.locales.announcements.cta.gotIt,
                action: (e: MouseEvent) => this.goNextSlide(e),
              },
              secondary: (() => {
                if (
                  this.state.announcements[this.state.position].properties.URL
                    .url !== null
                )
                  return {
                    label: this.props.locales.announcements.cta.learnMore,
                    action: () =>
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'OPEN_IN_BROWSER',
                            data: {
                              url: this.state.announcements[this.state.position]
                                .properties.URL.url,
                            },
                          },
                        },
                        '*'
                      ),
                  }
                else return undefined
              })(),
            }}
            indicator={
              this.state.announcements.length > 1
                ? `${this.state.position + 1} of ${this.state.announcements.length}`
                : undefined
            }
            onClose={(e: MouseEvent) => {
              if (
                this.props.announcements.version !== undefined &&
                this.props.announcements.version !== '' &&
                this.props.announcements.version !== null
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
              this.props.onCloseAnnouncements(e)
            }}
          >
            <div
              className="dialog__cover"
              style={{
                position: 'relative',
              }}
            >
              {!this.state.isImageLoaded && (
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    inset: '0 0 0 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    type="PICTO"
                    iconName="spinner"
                  />
                </div>
              )}
              <img
                src={
                  this.state.announcements[this.state.position].properties.Image
                    .files[0].file.url
                }
                style={{
                  width: '100%',
                  visibility: this.state.isImageLoaded ? 'visible' : 'hidden',
                  aspectRatio: '8 / 5',
                }}
                loading="lazy"
                onLoad={() => this.setState({ isImageLoaded: true })}
              />
            </div>
            <div className="dialog__text">
              <p className={texts.type}>
                {
                  this.state.announcements[this.state.position].properties
                    .Description.rich_text[0].plain_text
                }
              </p>
            </div>
          </Dialog>
        </Feature>
      )
  }
}
