import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  DominantColorResult,
  DominantColors,
  SourceColorConfiguration,
  ThirdParty,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  ColorItem,
  Layout,
  List,
  Message,
  Section,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { Dropzone } from '@a_ng_d/figmug-ui'
import { Card } from '@a_ng_d/figmug-ui'
import { texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import { PluginMessageData } from '../../../types/messages'
import {
  BaseProps,
  Context,
  Editor,
  PlanStatus,
  Service,
} from '../../../types/app'
import { trackImportEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ImagePaletteProps extends BaseProps, WithConfigProps {
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty | 'IMAGE'
  ) => void
  onChangeContexts: (context: Context) => void
}

interface ImagePaletteStates {
  dominantColors: Array<DominantColorResult>
  imageUrl: string
  imageTitle: string
}

export default class ImagePalette extends PureComponent<
  ImagePaletteProps,
  ImagePaletteStates
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SOURCE_IMAGE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_IMAGE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ImagePaletteProps) {
    super(props)
    this.state = {
      dominantColors: [],
      imageUrl: '',
      imageTitle: '',
    }
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  componentWillUnmount = () => {
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    const actions: {
      [action: string]: () => void
    } = {
      GET_IMAGE_HASH: async () => {
        const arrayBuffer = path.data.arrayBuffer
        const blob = new Blob([arrayBuffer as ArrayBuffer], {
          type: 'image/png',
        })
        const imageUrl = URL.createObjectURL(blob)
        const imageTitle = path.data.imageTitle

        const dominantColors: Array<DominantColorResult> =
          await DominantColors.extract(arrayBuffer as ArrayBuffer, 5)

        this.setState({
          imageUrl: imageUrl,
          imageTitle: imageTitle,
          dominantColors: dominantColors,
        })

        trackImportEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId === ''
            ? this.props.userIdentity.id === ''
              ? ''
              : this.props.userIdentity.id
            : this.props.userSession.userId,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPLOAD_IMAGE',
          }
        )
      },

      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Templates
  ImageZone = () => {
    if (this.state.imageUrl)
      return (
        <div
          style={{
            padding: 'var(--size-pos-small)',
          }}
        >
          <Card
            src={this.state.imageUrl}
            richText={
              <span className={texts.type}>{this.state.imageTitle}</span>
            }
            shouldFill={true}
            actions={
              <Button
                type="destructive"
                label={this.props.locales.source.imagePalette.removeImage}
                action={() => {
                  this.setState({
                    imageUrl: '',
                    dominantColors: [],
                    imageTitle: '',
                  })
                }}
              />
            }
            action={() => {
              this.setState({
                imageUrl: '',
                dominantColors: [],
                imageTitle: '',
              })
            }}
          />
        </div>
      )
    return (
      <div
        style={{
          padding: 'var(--size-pos-small)',
        }}
      >
        <Dropzone
          message={this.props.locales.source.imagePalette.dropzone.message}
          warningMessage={
            this.props.locales.source.imagePalette.dropzone.warning
          }
          errorMessage={this.props.locales.source.imagePalette.dropzone.error}
          cta={this.props.locales.source.imagePalette.dropzone.cta}
          acceptedMimeTypes={['image/png']}
          isMultiple={false}
          isBlocked={ImagePalette.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_IMAGE.isBlocked()}
          onImportFiles={async (files) => {
            const arrayBuffer = files[0].content
            const blob = new Blob([arrayBuffer as ArrayBuffer], {
              type: 'image/png',
            })
            const imageUrl = URL.createObjectURL(blob)
            const imageTitle = files[0].name

            const dominantColors = await DominantColors.extract(
              arrayBuffer as ArrayBuffer,
              5
            )

            this.setState({
              dominantColors: dominantColors,
              imageUrl: imageUrl,
              imageTitle: imageTitle,
            })

            trackImportEvent(
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
                feature: 'UPLOAD_IMAGE',
              }
            )
          }}
        />
      </div>
    )
  }

  ExtractedColor = () => {
    return (
      <>
        <Section
          title={
            <SimpleItem
              id="image-palette-list"
              leftPartSlot={
                <SectionTitle
                  label={this.props.locales.source.imagePalette.title}
                  indicator={this.state.dominantColors.length.toString()}
                />
              }
              rightPartSlot={
                this.state.dominantColors.length > 0 ? (
                  <Button
                    type="primary"
                    label={this.props.locales.source.imagePalette.addColors}
                    isBlocked={ImagePalette.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SOURCE_IMAGE.isBlocked()}
                    action={() => {
                      this.props.onChangeColorsFromImport(
                        this.state.dominantColors.map((color) => {
                          const gl = chroma(color.hex).gl()
                          return {
                            name: color.hex.toUpperCase().replace('#', ''),
                            rgb: {
                              r: gl[0],
                              g: gl[1],
                              b: gl[2],
                            },
                            hue: {
                              shift: 0,
                              isLocked: false,
                            },
                            chroma: {
                              shift: 0,
                              isLocked: false,
                            },
                            source: 'IMAGE',
                            id: uid(),
                            isRemovable: false,
                          }
                        }),
                        'IMAGE'
                      )

                      this.props.onChangeContexts('SOURCE_OVERVIEW')

                      trackImportEvent(
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
                          feature: 'IMPORT_DOMINANT_COLORS',
                        }
                      )
                    }}
                  />
                ) : undefined
              }
            />
          }
          body={[
            {
              node:
                this.state.dominantColors.length === 0 ? (
                  <Message
                    icon="info"
                    messages={[
                      this.props.locales.source.imagePalette.emptyMessage,
                    ]}
                  />
                ) : undefined,
              spacingModifier: 'NONE',
            },
            {
              node:
                this.state.dominantColors.length > 0 ? (
                  <List>
                    {this.state.dominantColors
                      .sort((a, b) => {
                        if (a.hex.localeCompare(b.hex) > 0) return 1
                        else if (a.hex.localeCompare(b.hex) < 0) return -1
                        else return 0
                      })
                      .map((sourceColor) => {
                        return (
                          <ColorItem
                            key={sourceColor.hex}
                            name={sourceColor.hex
                              .toUpperCase()
                              .replace('#', '')}
                            hex={sourceColor.hex}
                            id={sourceColor.hex}
                          />
                        )
                      })}
                  </List>
                ) : undefined,
              spacingModifier: 'NONE',
            },
          ]}
        />
      </>
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="image-palette"
        column={[
          {
            node: <this.ImageZone />,
            typeModifier: 'BLANK',
          },
          {
            node: <this.ExtractedColor />,
            typeModifier: 'LIST',
          },
        ]}
        isFullHeight
      />
    )
  }
}
