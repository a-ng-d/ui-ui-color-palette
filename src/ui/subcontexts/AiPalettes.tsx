import React from 'react'
import { PureComponent } from 'preact/compat'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Input,
  List,
  SemanticMessage,
  ActionsItem,
} from '@a_ng_d/figmug-ui'
import Glance from '../modules/Glance'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  BaseProps,
  Context,
  Editor,
  FetchStatus,
  PlanStatus,
  Service,
} from '../../types/app'
import { MistralColorPalette } from '../../external/mistral/types'
import { getMistral } from '../../external/mistral'
import { ConfigContextType } from '../../config/ConfigContext'

interface AiPalettesProps extends BaseProps, WithConfigProps {
  context: Context
  localPalettesList: Array<FullConfiguration>
  onSelectPalette: (id: string) => Promise<void>
}

interface AiPalettesStates {
  status: FetchStatus
  userPrompt: string
  aiResponse: string
  generatedPalette: MistralColorPalette | null
  isGenerating: boolean
  isPaletteGlancing: boolean
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  previewPrompt: string | null
  error: string | null
}

export default class AiPalettes extends PureComponent<
  AiPalettesProps,
  AiPalettesStates
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    AI_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'AI_PALETTES',
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
    SOURCE_AI_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_AI_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    GLANCE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'GLANCE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: AiPalettesProps) {
    super(props)
    this.state = {
      status: 'UNLOADED',
      userPrompt: '',
      aiResponse: '',
      generatedPalette: null,
      isGenerating: false,
      isPaletteGlancing: false,
      conversationHistory: [],
      previewPrompt: null,
      error: null,
    }
  }

  // Get predefined prompts
  getPrompts = () => {
    const label = this.props.locales.source?.genAi?.form?.presets?.labels || {}
    const vibes = this.props.locales.source?.genAi?.form?.presets?.vibes || {}
    const usecases =
      this.props.locales.source?.genAi?.form?.presets?.usecases || {}

    return {
      vibes: [
        {
          key: 'cyberpunk',
          label: label.cyberpunk || 'Cyberpunk',
          prompt:
            vibes.cyberpunk ||
            'Create a cyberpunk color palette with neon colors',
        },
        {
          key: 'minimalist',
          label: label.minimalist || 'Minimalist',
          prompt:
            vibes.minimalist ||
            'Create a minimalist color palette with clean neutral colors',
        },
        {
          key: 'pastel',
          label: label.pastel || 'Pastel',
          prompt: vibes.pastel || 'Create a soft pastel color palette',
        },
        {
          key: 'corporate',
          label: label.corporate || 'Corporate',
          prompt:
            vibes.corporate || 'Create a professional corporate color palette',
        },
        {
          key: 'nature',
          label: label.nature || 'Nature',
          prompt: vibes.nature || 'Create a nature-inspired color palette',
        },
        {
          key: 'vintage',
          label: label.vintage || 'Vintage',
          prompt:
            vibes.vintage || 'Create a vintage color palette with retro colors',
        },
      ],
      usecases: [
        {
          key: 'landing',
          label: label.landing || 'Landing Page',
          prompt:
            usecases.landing ||
            'Create a color palette for a modern landing page',
        },
        {
          key: 'blog',
          label: label.blog || 'Blog',
          prompt: usecases.blog || 'Create a color palette for a blog website',
        },
        {
          key: 'portfolio',
          label: label.portfolio || 'Portfolio',
          prompt:
            usecases.portfolio ||
            'Create a color palette for a creative portfolio',
        },
        {
          key: 'ecommerce',
          label: label.ecommerce || 'E-commerce',
          prompt:
            usecases.ecommerce ||
            'Create a color palette for an e-commerce website',
        },
      ],
    }
  }

  // Handlers
  handlePromptChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    this.setState({ userPrompt: target.value, previewPrompt: null })
  }

  handlePromptSelect = (prompt: string) => {
    this.setState({ userPrompt: prompt, previewPrompt: null })
  }

  // Direct Actions
  onSendMessage = async () => {
    if (!this.state.userPrompt.trim()) return

    this.setState({ isGenerating: true, status: 'LOADING', error: null })

    const mistralClient = getMistral()
    if (!mistralClient) {
      this.setState({
        status: 'ERROR',
        isGenerating: false,
        error:
          this.props.locales.error?.unavailableAi ||
          'Mistral client not initialized',
      })
      return
    }

    try {
      // Add user message to conversation
      const updatedHistory = [
        ...this.state.conversationHistory,
        { role: 'user' as const, content: this.state.userPrompt },
      ]

      // Get response from conversation agent
      const response = await mistralClient.chatWithAI(this.state.userPrompt)

      // Add AI response to conversation
      const finalHistory = [
        ...updatedHistory,
        { role: 'assistant' as const, content: response },
      ]

      // Try to extract palette if present in response
      let palette: MistralColorPalette | null = null
      try {
        // Look for JSON palette in the response
        const jsonMatch = response.match(
          /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/
        )
        if (jsonMatch && jsonMatch[1]) palette = JSON.parse(jsonMatch[1].trim())
      } catch (error) {
        // No palette in response, that's ok for conversation
      }
      this.setState({
        conversationHistory: finalHistory,
        aiResponse: response,
        generatedPalette: palette,
        userPrompt: '',
        status: palette ? 'LOADED' : 'COMPLETE',
        isGenerating: false,
      })
    } catch (error) {
      console.error('Error communicating with AI:', error)
      this.setState({
        status: 'ERROR',
        isGenerating: false,
        error:
          this.props.locales.error?.unavailableAi ||
          (error instanceof Error ? error.message : 'Unknown error occurred'),
      })
    }
  }

  onGlancePalette = () => {
    this.setState({ isPaletteGlancing: true })
  }

  onAddPalette = async () => {
    if (!this.state.generatedPalette) return

    // Convert MistralColorPalette to the format expected by the plugin
    const paletteData = {
      name: `AI Generated Palette - ${new Date().toLocaleDateString()}`,
      colors: [
        this.state.generatedPalette.primary,
        this.state.generatedPalette.text,
        this.state.generatedPalette.success,
        this.state.generatedPalette.warning,
        this.state.generatedPalette.alert,
      ],
    }

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE_FROM_AI',
          data: paletteData,
        },
      },
      '*'
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
          gap: 'var(--size-pos-xxsmall)',
          padding: 'var(--size-pos-xxxsmall) var(--size-pos-xsmall)',
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

  // Render
  render() {
    const mistralClient = getMistral()

    return (
      <Feature
        isActive={AiPalettes.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).AI_PALETTES.isActive()}
      >
        <>
          <Bar
            soloPartSlot={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--size-pos-xsmall)',
                  width: '100%',
                }}
              >
                {this.state.error && (
                  <SemanticMessage
                    type="WARNING"
                    message={this.state.error}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--size-pos-xsmall)',
                    width: '100%',
                  }}
                >
                  <Input
                    type="LONG_TEXT"
                    placeholder={
                      this.state.previewPrompt ||
                      this.props.locales.create?.ai?.prompt ||
                      'Ask AI to create a color palette...'
                    }
                    value={this.state.userPrompt}
                    onChange={this.handlePromptChange}
                    isGrowing
                    isFramed={false}
                  />
                  <Button
                    type="primary"
                    icon="play"
                    label={this.props.locales.actions?.send || 'Send'}
                    isLoading={this.state.isGenerating}
                    action={this.onSendMessage}
                  />
                </div>
                <this.PromptButtons />
              </div>
            }
            border={['BOTTOM']}
          />

          <List
            isLoading={this.state.status === 'LOADING'}
            isMessage={this.state.status === 'ERROR'}
            isFullHeight
          >
            {this.state.status === 'ERROR' && (
              <SemanticMessage
                type="WARNING"
                message={
                  this.state.error ||
                  this.props.locales.error?.unavailableAi ||
                  'AI service unavailable'
                }
              />
            )}

            {this.state.conversationHistory.length === 0 &&
              this.state.status === 'UNLOADED' && (
                <SemanticMessage
                  type="NEUTRAL"
                  message={
                    this.props.locales.create?.ai?.welcome ||
                    'Ask AI to create a custom color palette for your project'
                  }
                />
              )}

            {/* Conversation History */}
            {this.state.conversationHistory.map((message, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--size-pos-small)',
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--color-bg-secondary)'
                      : 'transparent',
                }}
              >
                <strong>{message.role === 'user' ? 'You:' : 'AI:'}</strong>
                <div style={{ marginTop: 'var(--size-pos-xsmall)' }}>
                  {message.content}
                </div>
              </div>
            ))}

            {/* Generated Palette Display */}
            {this.state.generatedPalette && (
              <ActionsItem
                id="ai-generated-palette"
                name={`AI Generated Palette`}
                description="Created by AI conversation"
                actionsSlot={
                  <>
                    <Feature
                      isActive={AiPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).GLANCE_PALETTE.isActive()}
                    >
                      <Button
                        type="icon"
                        icon="visible"
                        helper={{
                          label:
                            this.props.locales.browse?.actions?.glancePalette ||
                            'Preview palette',
                        }}
                        action={this.onGlancePalette}
                      />
                    </Feature>
                    <Feature
                      isActive={AiPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SOURCE_AI_ADD.isActive()}
                    >
                      <Button
                        type="secondary"
                        label={
                          this.props.locales.actions?.addToLocal ||
                          'Add to Local'
                        }
                        action={this.onAddPalette}
                      />
                    </Feature>
                  </>
                }
                complementSlot={
                  <div
                    style={{
                      display: 'flex',
                      gap: '2px',
                      borderRadius: 'var(--border-radius-medium)',
                      overflow: 'hidden',
                    }}
                  >
                    {Object.values(this.state.generatedPalette).map(
                      (color, index) => (
                        <div
                          key={index}
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: color.hex,
                          }}
                        />
                      )
                    )}
                  </div>
                }
              />
            )}
          </List>

          <Feature
            isActive={
              AiPalettes.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).GLANCE_PALETTE.isActive() &&
              this.state.isPaletteGlancing &&
              !!this.state.generatedPalette
            }
          >
            {this.state.generatedPalette && (
              <Glance
                {...this.props}
                id="ai-generated-palette"
                onSelectPalette={(id: string) => this.props.onSelectPalette(id)}
                onClosePalette={() => {
                  this.setState({ isPaletteGlancing: false })
                }}
              />
            )}
          </Feature>
        </>
      </Feature>
    )
  }
}
