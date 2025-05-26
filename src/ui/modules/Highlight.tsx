import { Dialog, Icon, SemanticMessage, texts } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { BaseProps, HighlightDigest } from '../../types/app'
import { WithConfigProps } from '../components/WithConfig'

interface HighlightProps extends BaseProps, WithConfigProps {
  highlight: HighlightDigest
  onCloseHighlight: (e: MouseEvent) => void
}

interface HighlightStates {
  position: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  announcements: Array<any>
  status: 'LOADING' | 'LOADED' | 'ERROR'
  isImageLoaded: boolean
}

export default class Highlight extends PureComponent<
  HighlightProps,
  HighlightStates
> {
  constructor(props: HighlightProps) {
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
      `${this.props.config.urls.announcementsWorkerUrl}/?action=get_announcements&database_id=${import.meta.env.VITE_NOTION_ANNOUNCEMENTS_ID}`
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
      this.props.onCloseHighlight(e as MouseEvent)
      this.setState({ position: 0 })
    }
  }

  // Render
  render() {
    if (this.state.status === 'LOADING')
      return (
        <Dialog
          title={this.props.locals.shortcuts.news}
          isLoading
          onClose={this.props.onCloseHighlight}
        />
      )
    else if (this.state.status === 'ERROR')
      return (
        <Dialog
          title={this.props.locals.shortcuts.news}
          isMessage
          onClose={this.props.onCloseHighlight}
        >
          <SemanticMessage
            type="WARNING"
            message={this.props.locals.error.announcements}
          />
        </Dialog>
      )
    else
      return (
        <Dialog
          title={
            this.state.announcements[this.state.position].properties.Titre
              .title[0].plain_text
          }
          tag={
            this.state.announcements[this.state.position].properties.Type.select
              .name
          }
          actions={{
            primary: {
              label:
                this.state.position + 1 < this.state.announcements.length
                  ? this.props.locals.highlight.cta.next
                  : this.props.locals.highlight.cta.gotIt,
              action: (e: MouseEvent) => this.goNextSlide(e),
            },
            secondary: (() => {
              if (
                this.state.announcements[this.state.position].properties.URL
                  .url !== null
              )
                return {
                  label: this.props.locals.highlight.cta.learnMore,
                  action: () =>
                    window
                      .open(
                        this.state.announcements[this.state.position].properties
                          .URL.url,
                        '_blank'
                      )
                      ?.focus(),
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
            this.props.onCloseHighlight(e)
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
      )
  }
}
