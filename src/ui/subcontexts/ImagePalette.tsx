import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  DominantColorResult,
  DominantColors,
  SourceColorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  ColorItem,
  Layout,
  List,
  Message,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { Dropzone } from '@a_ng_d/figmug-ui'
import { Card } from '@a_ng_d/figmug-ui'
import { texts } from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { getClosestColorName } from '../../utils/colorNameHelper'
import { PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  Context,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import { trackImportEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface ImagePaletteProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  creditsCount: number
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: SourceColorConfiguration['source']
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
    SOURCE_IMAGE_UPLOAD: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_IMAGE_UPLOAD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_IMAGE_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_IMAGE_ADD',
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
    window.addEventListener('paste', this.handlePaste)
  }

  componentWillUnmount = () => {
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
    window.removeEventListener('paste', this.handlePaste)
  }

  // Handlers
  handlePaste = async (e: ClipboardEvent) => {
    if (!e.clipboardData) return

    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find((item) => item.type.startsWith('image/'))

    if (imageItem && imageItem.type === 'image/png')
      if (
        !ImagePalette.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE_IMAGE_UPLOAD.isReached(this.props.creditsCount * -1 - 1)
      ) {
        e.preventDefault()

        const file = imageItem.getAsFile()
        if (file) {
          const arrayBuffer = await file.arrayBuffer()
          const blob = new Blob([arrayBuffer], { type: 'image/png' })
          const imageUrl = URL.createObjectURL(blob)
          const imageTitle = `Pasted image ${new Date().toLocaleTimeString()}`

          const dominantColors = await DominantColors.extract(arrayBuffer, 5)

          if (this.props.config.plan.isProEnabled)
            $creditsCount.set(
              $creditsCount.get() - this.props.config.fees.imageColorsExtract
            )

          this.setState({
            dominantColors: dominantColors,
            imageUrl: imageUrl,
            imageTitle: imageTitle,
          })
        }
      }
  }

  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    const actions: {
      [action: string]: () => void
    } = {
      GET_IMAGE_HASH: async () => {
        if (
          !ImagePalette.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_IMAGE_UPLOAD.isReached(this.props.creditsCount * -1 - 1)
        ) {
          const arrayBuffer = path.data.arrayBuffer
          const blob = new Blob([arrayBuffer as ArrayBuffer], {
            type: 'image/png',
          })
          const imageUrl = URL.createObjectURL(blob)
          const imageTitle = path.data.imageTitle

          const dominantColors: Array<DominantColorResult> =
            await DominantColors.extract(arrayBuffer as ArrayBuffer, 5)

          if (this.props.config.plan.isProEnabled)
            $creditsCount.set(
              $creditsCount.get() - this.props.config.fees.imageColorsExtract
            )

          this.setState({
            imageUrl: imageUrl,
            imageTitle: imageTitle,
            dominantColors: dominantColors,
          })
        }
      },

      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onUsePalette = () => {
    this.props.onChangeColorsFromImport(
      this.state.dominantColors.map((color) => {
        const gl = chroma(color.hex).gl()
        return {
          name: getClosestColorName(color.hex),
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
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'EXTRACT_DOMINANT_COLORS',
      }
    )
  }

  // Templates
  ImageZone = () => {
    if (this.state.imageUrl)
      return (
        <Feature
          isActive={ImagePalette.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_IMAGE_UPLOAD.isActive()}
        >
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
                  label={this.props.t('source.imagePalette.removeImage')}
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
        </Feature>
      )
    return (
      <Feature
        isActive={ImagePalette.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE_IMAGE_UPLOAD.isActive()}
      >
        <div
          style={{
            padding: 'var(--size-pos-small)',
          }}
        >
          <Dropzone
            message={this.props.t('source.imagePalette.dropzone.message')}
            warningMessage={this.props.t(
              'source.imagePalette.dropzone.warning'
            )}
            errorMessage={this.props.t('source.imagePalette.dropzone.error')}
            cta={this.props.t('source.imagePalette.dropzone.cta')}
            acceptedMimeTypes={['image/png']}
            isMultiple={false}
            isBlocked={ImagePalette.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SOURCE_IMAGE_UPLOAD.isReached(this.props.creditsCount * -1 - 1)}
            isNew={ImagePalette.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SOURCE_IMAGE_UPLOAD.isNew()}
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

              if (this.props.config.plan.isProEnabled)
                $creditsCount.set(
                  $creditsCount.get() -
                    this.props.config.fees.imageColorsExtract
                )

              this.setState({
                dominantColors: dominantColors,
                imageUrl: imageUrl,
                imageTitle: imageTitle,
              })
            }}
          />
        </div>
      </Feature>
    )
  }

  ExtractedColor = () => {
    return (
      <>
        <SimpleItem
          id="image-palette-list"
          leftPartSlot={
            <SectionTitle
              label={this.props.t('source.imagePalette.title')}
              indicator={this.state.dominantColors.length.toString()}
              helper={this.props.t('source.imagePalette.helper', {
                fee: this.props.config.fees.imageColorsExtract.toString(),
              })}
            />
          }
          rightPartSlot={
            <Feature
              isActive={ImagePalette.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SOURCE_IMAGE_ADD.isActive()}
            >
              <Button
                type="icon"
                icon="plus"
                helper={{
                  label: this.props.t('source.imagePalette.addColors', {
                    fee: this.props.config.fees.imageColorsExtract.toString(),
                  }),
                  type: 'MULTI_LINE',
                }}
                isDisabled={this.state.dominantColors.length === 0}
                isBlocked={ImagePalette.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SOURCE_IMAGE_ADD.isBlocked()}
                isNew={ImagePalette.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SOURCE_IMAGE_ADD.isNew()}
                action={this.onUsePalette}
              />
            </Feature>
          }
          alignment="CENTER"
          isListItem={false}
        />
        {this.state.dominantColors.length === 0 ? (
          <Message
            icon="info"
            messages={[this.props.t('source.imagePalette.message')]}
          />
        ) : (
          <List isTopBorderEnabled>
            {this.state.dominantColors
              .sort((a, b) => {
                if (a.hex.localeCompare(b.hex) > 0) return 1
                else if (a.hex.localeCompare(b.hex) < 0) return -1
                else return 0
              })
              .map((sourceColor, index) => {
                return (
                  <ColorItem
                    key={sourceColor.hex}
                    name={getClosestColorName(sourceColor.hex)}
                    hex={sourceColor.hex}
                    id={`color-${index}`}
                  />
                )
              })}
          </List>
        )}
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
            typeModifier: 'FIXED',
            fixedWidth: '272px',
          },
        ]}
        isFullHeight
      />
    )
  }
}
