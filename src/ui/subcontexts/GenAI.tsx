import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import { SourceColorConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  ColorItem,
  FormItem,
  Input,
  Layout,
  List,
  Message,
  Section,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { SemanticMessage } from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import {
  BaseProps,
  Context,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import { trackImportEvent } from '../../external/tracking/eventsTracker'
import { getMistral, MistralColorPalette } from '../../external/mistral'
import { ConfigContextType } from '../../config/ConfigContext'

interface GenAiProps extends BaseProps, WithConfigProps, WithTranslationProps {
  sourceColors: Array<SourceColorConfiguration>
  creditsCount: number
  onChangeColorsFromImport: (
    colors: Array<SourceColorConfiguration>,
    source: SourceColorConfiguration['source']
  ) => void
  onChangeContexts: (context: Context) => void
}

interface GenAiStates {
  prompt: string
  isLoading: boolean
  error: string | null
  generatedPalette: MistralColorPalette | null
  previewPrompt: string | null
}

export default class GenAi extends PureComponent<GenAiProps, GenAiStates> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SOURCE_AI_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_AI_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_AI_REQUEST: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_AI_REQUEST',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: GenAiProps) {
    super(props)
    this.state = {
      prompt: '',
      isLoading: false,
      error: null,
      generatedPalette: null,
      previewPrompt: null,
    }
  }

  // Get predefined prompts
  getPrompts = () => {
    return {
      vibes: [
        {
          key: 'cyberpunk',
          label: this.props.t('source.genAi.form.presets.labels.cyberpunk'),
          prompt: this.props.t('source.genAi.form.presets.vibes.cyberpunk'),
        },
        {
          key: 'minimalist',
          label: this.props.t('source.genAi.form.presets.labels.minimalist'),
          prompt: this.props.t('source.genAi.form.presets.vibes.minimalist'),
        },
        {
          key: 'pastel',
          label: this.props.t('source.genAi.form.presets.labels.pastel'),
          prompt: this.props.t('source.genAi.form.presets.vibes.pastel'),
        },
        {
          key: 'corporate',
          label: this.props.t('source.genAi.form.presets.labels.corporate'),
          prompt: this.props.t('source.genAi.form.presets.vibes.corporate'),
        },
        {
          key: 'nature',
          label: this.props.t('source.genAi.form.presets.labels.nature'),
          prompt: this.props.t('source.genAi.form.presets.vibes.nature'),
        },
        {
          key: 'vintage',
          label: this.props.t('source.genAi.form.presets.labels.vintage'),
          prompt: this.props.t('source.genAi.form.presets.vibes.vintage'),
        },
      ],
      usecases: [
        {
          key: 'landing',
          label: this.props.t('source.genAi.form.presets.labels.landing'),
          prompt: this.props.t('source.genAi.form.presets.usecases.landing'),
        },
        {
          key: 'blog',
          label: this.props.t('source.genAi.form.presets.labels.blog'),
          prompt: this.props.t('source.genAi.form.presets.usecases.blog'),
        },
        {
          key: 'resume',
          label: this.props.t('source.genAi.form.presets.labels.resume'),
          prompt: this.props.t('source.genAi.form.presets.usecases.resume'),
        },
        {
          key: 'portfolio',
          label: this.props.t('source.genAi.form.presets.labels.portfolio'),
          prompt: this.props.t('source.genAi.form.presets.usecases.portfolio'),
        },
        {
          key: 'documentation',
          label: this.props.t('source.genAi.form.presets.labels.documentation'),
          prompt: this.props.t(
            'source.genAi.form.presets.usecases.documentation'
          ),
        },
        {
          key: 'ecommerce',
          label: this.props.t('source.genAi.form.presets.labels.ecommerce'),
          prompt: this.props.t('source.genAi.form.presets.usecases.ecommerce'),
        },
      ],
    }
  }

  // Handlers
  handlePromptChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    this.setState({ prompt: target.value, previewPrompt: null })
  }

  handlePromptPreview = (prompt: string) => {
    this.setState({ previewPrompt: prompt })
  }

  handlePromptSelect = (prompt: string) => {
    this.setState({ prompt, previewPrompt: null })
  }

  handlePromptClearPreview = () => {
    this.setState({ previewPrompt: null })
  }

  generatePalette = async () => {
    const mistralClient = getMistral()

    if (!mistralClient) {
      this.setState({
        error: this.props.t('error.unavailableAi'),
      })
      return
    }

    this.setState({ isLoading: true, error: null })

    try {
      const palette = await mistralClient.generateColorPalette(
        this.state.prompt
      )

      this.setState({ generatedPalette: palette, isLoading: false })

      if (this.props.config.plan.isProEnabled)
        $creditsCount.set(
          $creditsCount.get() - this.props.config.fees.aiColorsGenerate
        )
    } catch (error) {
      console.error(error)
      this.setState({
        error: this.props.t('error.unavailableAi'),
        isLoading: false,
      })
    }
  }

  convertMistralToSourceColors = (
    palette: MistralColorPalette
  ): Array<SourceColorConfiguration> => {
    const colors: Array<SourceColorConfiguration> = []

    const colorTypes = [
      {
        key: 'primary',
        name: palette.primary.name,
        displayKey: this.props.t('source.genAi.colorTypes.primary'),
      },
      {
        key: 'text',
        name: palette.text.name,
        displayKey: this.props.t('source.genAi.colorTypes.text'),
      },
      {
        key: 'success',
        name: palette.success.name,
        displayKey: this.props.t('source.genAi.colorTypes.success'),
      },
      {
        key: 'warning',
        name: palette.warning.name,
        displayKey: this.props.t('source.genAi.colorTypes.warning'),
      },
      {
        key: 'alert',
        name: palette.alert.name,
        displayKey: this.props.t('source.genAi.colorTypes.alert'),
      },
    ]

    colorTypes.forEach((colorType) => {
      const color = palette[colorType.key as keyof MistralColorPalette]
      colors.push({
        name: `${colorType.displayKey}${this.props.t('separator')}${color.name}`,
        rgb: {
          r: color.rgb.r / 255,
          g: color.rgb.g / 255,
          b: color.rgb.b / 255,
        },
        hue: {
          shift: 0,
          isLocked: false,
        },
        chroma: {
          shift: 0,
          isLocked: false,
        },
        source: 'AI',
        id: uid(),
        isRemovable: false,
      })
    })

    return colors
  }

  onUsePalette = () => {
    if (!this.state.generatedPalette) return

    const sourceColors = this.convertMistralToSourceColors(
      this.state.generatedPalette
    )
    this.props.onChangeColorsFromImport(sourceColors, 'AI')
    this.props.onChangeContexts('SOURCE_OVERVIEW')

    trackImportEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'GENERATE_AI_COLORS',
      }
    )
  }

  // Templates
  PromptButtons = () => {
    const prompts = this.getPrompts()
    const allPrompts = [...prompts.vibes, ...prompts.usecases]

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--size-pos-xxsmall',
          padding: 'var(--size-pos-xxxsmall) var(--size-null)',
        }}
      >
        {allPrompts.map((item) => (
          <Button
            key={item.key}
            type="secondary"
            label={item.label}
            action={() => this.handlePromptSelect(item.prompt)}
          />
        ))}
      </div>
    )
  }

  ColorPreview = () => {
    if (!this.state.generatedPalette)
      return (
        <>
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                indicator="0"
                label={this.props.t('source.genAi.title')}
              />
            }
            rightPartSlot={
              <Feature
                isActive={GenAi.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SOURCE_AI_ADD.isActive()}
              >
                <Button
                  type="icon"
                  icon="plus"
                  helper={{
                    label: this.props.t('source.genAi.actions.addColors'),
                    type: 'MULTI_LINE',
                  }}
                  isDisabled={true}
                  isBlocked={GenAi.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SOURCE_AI_ADD.isBlocked()}
                  isNew={GenAi.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SOURCE_AI_ADD.isNew()}
                  action={this.onUsePalette}
                />
              </Feature>
            }
            isListItem={false}
            alignment="CENTER"
          />
          <Message
            icon="info"
            messages={[this.props.t('source.genAi.emptyMessage')]}
          />
        </>
      )

    const colors = [
      {
        ...this.state.generatedPalette.primary,
        type: this.props.t('source.genAi.colorTypes.primary'),
      },
      {
        ...this.state.generatedPalette.text,
        type: this.props.t('source.genAi.colorTypes.text'),
      },
      {
        ...this.state.generatedPalette.success,
        type: this.props.t('source.genAi.colorTypes.success'),
      },
      {
        ...this.state.generatedPalette.warning,
        type: this.props.t('source.genAi.colorTypes.warning'),
      },
      {
        ...this.state.generatedPalette.alert,
        type: this.props.t('source.genAi.colorTypes.alert'),
      },
    ]

    return (
      <>
        <SimpleItem
          leftPartSlot={
            <SectionTitle
              indicator="5"
              label={this.props.t('source.genAi.title')}
            />
          }
          rightPartSlot={
            <Feature
              isActive={GenAi.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).SOURCE_AI_ADD.isActive()}
            >
              <Button
                type="icon"
                icon="plus"
                helper={{
                  label: this.props.t('source.genAi.actions.addColors'),
                  type: 'MULTI_LINE',
                }}
                isDisabled={false}
                isBlocked={GenAi.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SOURCE_AI_ADD.isReached(
                  (this.props.creditsCount -
                    this.props.config.fees.aiColorsGenerate) *
                    -1 -
                    1
                )}
                isNew={GenAi.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SOURCE_AI_ADD.isNew()}
                action={this.onUsePalette}
              />
            </Feature>
          }
          isListItem={false}
          alignment="CENTER"
        />
        <List isTopBorderEnabled>
          {colors.map((color, index) => {
            return (
              <ColorItem
                key={index}
                name={`${color.type}${this.props.t('separator')}${color.name}`}
                hex={chroma(color.rgb.r, color.rgb.g, color.rgb.b)
                  .hex()
                  .toUpperCase()}
                id={`color-${index}`}
              />
            )
          })}
        </List>
      </>
    )
  }

  // Render
  render() {
    const mistralClient = getMistral()

    return (
      <Layout
        id="gen-ai"
        column={[
          {
            node: (
              <Feature
                isActive={GenAi.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SOURCE_AI_REQUEST.isActive()}
              >
                <Section
                  body={[
                    ...(this.state.error
                      ? [
                          {
                            node: (
                              <FormItem>
                                <div
                                  style={{
                                    padding:
                                      'var(--size-pos-xxxsmall) var(--size-null)',
                                  }}
                                >
                                  <SemanticMessage
                                    type="ERROR"
                                    message={this.state.error}
                                  />
                                </div>
                              </FormItem>
                            ),
                          },
                        ]
                      : []),
                    {
                      node: (
                        <FormItem id="ai-prompt">
                          <Input
                            id="ai-prompt"
                            type="LONG_TEXT"
                            placeholder={
                              this.state.previewPrompt ||
                              this.props.t(
                                'source.genAi.form.prompt.placeholder'
                              )
                            }
                            value={this.state.prompt}
                            isGrowing
                            isAutoFocus
                            onChange={this.handlePromptChange}
                            onValid={(e) => {
                              if (
                                (e.key === 'Enter' && e.ctrlKey) ||
                                (e.key === 'Enter' && e.metaKey)
                              )
                                if (
                                  mistralClient &&
                                  this.state.prompt.trim() !== ''
                                )
                                  this.generatePalette()
                            }}
                          />
                        </FormItem>
                      ),
                    },
                    {
                      node: (
                        <FormItem>
                          <this.PromptButtons />
                        </FormItem>
                      ),
                    },
                    {
                      node: (
                        <FormItem>
                          <Button
                            type="primary"
                            label={this.props.t(
                              'source.genAi.actions.generate'
                            )}
                            isLoading={this.state.isLoading}
                            isDisabled={
                              !this.state.prompt.trim() || !mistralClient
                            }
                            isBlocked={GenAi.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).SOURCE_AI_REQUEST.isReached(
                              (this.props.creditsCount -
                                this.props.config.fees.aiColorsGenerate) *
                                -1 -
                                1
                            )}
                            action={this.generatePalette}
                          />
                        </FormItem>
                      ),
                    },
                  ]}
                />
              </Feature>
            ),
            typeModifier: 'LIST',
          },
          {
            node: <this.ColorPreview />,
            typeModifier: 'FIXED',
            fixedWidth: '272px',
          },
        ]}
        isFullHeight
        isFullWidth
      />
    )
  }
}
