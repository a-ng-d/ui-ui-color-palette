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

interface GenAiProps extends BaseProps, WithConfigProps {
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
    const label = this.props.locales.source.genAi.form.presets.labels
    const vibes = this.props.locales.source.genAi.form.presets.vibes
    const usecases = this.props.locales.source.genAi.form.presets.usecases

    return {
      vibes: [
        { key: 'cyberpunk', label: label.cyberpunk, prompt: vibes.cyberpunk },
        {
          key: 'minimalist',
          label: label.minimalist,
          prompt: vibes.minimalist,
        },
        { key: 'pastel', label: label.pastel, prompt: vibes.pastel },
        { key: 'corporate', label: label.corporate, prompt: vibes.corporate },
        { key: 'nature', label: label.nature, prompt: vibes.nature },
        { key: 'vintage', label: label.vintage, prompt: vibes.vintage },
      ],
      usecases: [
        { key: 'landing', label: label.landing, prompt: usecases.landing },
        { key: 'blog', label: label.blog, prompt: usecases.blog },
        { key: 'resume', label: label.resume, prompt: usecases.resume },
        {
          key: 'portfolio',
          label: label.portfolio,
          prompt: usecases.portfolio,
        },
        {
          key: 'documentation',
          label: label.documentation,
          prompt: usecases.documentation,
        },
        {
          key: 'ecommerce',
          label: label.ecommerce,
          prompt: usecases.ecommerce,
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
        error: this.props.locales.error.unavailableAi,
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
        error: this.props.locales.error.unavailableAi,
        isLoading: false,
      })
    }
  }

  convertMistralToSourceColors = (
    palette: MistralColorPalette
  ): Array<SourceColorConfiguration> => {
    const colors: Array<SourceColorConfiguration> = []
    const colorTypeLabels = this.props.locales.source.genAi.colorTypes

    const colorTypes = [
      {
        key: 'primary',
        name: palette.primary.name,
        displayKey: colorTypeLabels.primary,
      },
      {
        key: 'text',
        name: palette.text.name,
        displayKey: colorTypeLabels.text,
      },
      {
        key: 'success',
        name: palette.success.name,
        displayKey: colorTypeLabels.success,
      },
      {
        key: 'warning',
        name: palette.warning.name,
        displayKey: colorTypeLabels.warning,
      },
      {
        key: 'alert',
        name: palette.alert.name,
        displayKey: colorTypeLabels.alert,
      },
    ]

    colorTypes.forEach((colorType) => {
      const color = palette[colorType.key as keyof MistralColorPalette]
      colors.push({
        name: `${colorType.displayKey}${this.props.locales.separator}${color.name}`,
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
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
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
                label={this.props.locales.source.genAi.title}
                helper={this.props.locales.source.genAi.helper.replace(
                  '{fee}',
                  this.props.config.fees.aiColorsGenerate.toString()
                )}
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
                    label: this.props.locales.source.genAi.actions.addColors,
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
            messages={[this.props.locales.source.genAi.emptyMessage]}
          />
        </>
      )

    const colors = [
      {
        ...this.state.generatedPalette.primary,
        type: this.props.locales.source.genAi.colorTypes.primary,
      },
      {
        ...this.state.generatedPalette.text,
        type: this.props.locales.source.genAi.colorTypes.text,
      },
      {
        ...this.state.generatedPalette.success,
        type: this.props.locales.source.genAi.colorTypes.success,
      },
      {
        ...this.state.generatedPalette.warning,
        type: this.props.locales.source.genAi.colorTypes.warning,
      },
      {
        ...this.state.generatedPalette.alert,
        type: this.props.locales.source.genAi.colorTypes.alert,
      },
    ]

    return (
      <>
        <SimpleItem
          leftPartSlot={
            <SectionTitle
              indicator="5"
              label={this.props.locales.source.genAi.title}
              helper={this.props.locales.source.genAi.helper.replace(
                '{fee}',
                this.props.config.fees.aiColorsGenerate.toString()
              )}
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
                  label:
                    this.props.locales.source.genAi.actions.addColors.replace(
                      '{fee}',
                      this.props.config.fees.aiColorsGenerate.toString()
                    ),
                  type: 'MULTI_LINE',
                }}
                isDisabled={false}
                isBlocked={GenAi.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SOURCE_AI_ADD.isReached(this.props.creditsCount * -1 - 1)}
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
                name={`${color.type}${this.props.locales.separator}${color.name}`}
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
                              this.props.locales.source.genAi.form.prompt
                                .placeholder
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
                            label={
                              this.props.locales.source.genAi.actions.generate
                            }
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
                              this.props.creditsCount * -1 - 1
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
