import { uid } from 'uid'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import { SourceColorConfiguration } from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
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
} from '@unoff/ui'
import { SemanticMessage } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import PalettePreview from '../components/PalettePreview'
import Feature from '../components/Feature'
import { AppState } from '../App'
import setPreviewPalette from '../../utils/setPreviewPalette'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $palette } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import {
  trackActionEvent,
  trackImportEvent,
} from '../../external/tracking/eventsTracker'
import { getMistral, MistralColorPalette } from '../../external/mistral'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface GenAiProps extends BaseProps, WithConfigProps, WithTranslationProps {
  creditsCount: number
  localPalettesCount: number
  onChangeService: Dispatch<Partial<AppState>>
}

interface GenAiState {
  prompt: string
  isRequestProcessing: boolean
  isActionLoading?: boolean
  error: string | null
  generatedPalette: MistralColorPalette | null
  previewPrompt: string | null
}

export default class GenAi extends PureComponent<GenAiProps, GenAiState> {
  private palette = $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    GEN_REQUEST: new FeatureStatus({
      features: config.features,
      featureName: 'GEN_REQUEST',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return GenAi.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: GenAiProps) {
    super(props)
    this.palette = $palette
    this.state = {
      prompt: '',
      isRequestProcessing: false,
      isActionLoading: false,
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
          label: this.props.t('genAi.form.presets.labels.cyberpunk'),
          prompt: this.props.t('genAi.form.presets.vibes.cyberpunk'),
        },
        {
          key: 'minimalist',
          label: this.props.t('genAi.form.presets.labels.minimalist'),
          prompt: this.props.t('genAi.form.presets.vibes.minimalist'),
        },
        {
          key: 'pastel',
          label: this.props.t('genAi.form.presets.labels.pastel'),
          prompt: this.props.t('genAi.form.presets.vibes.pastel'),
        },
        {
          key: 'corporate',
          label: this.props.t('genAi.form.presets.labels.corporate'),
          prompt: this.props.t('genAi.form.presets.vibes.corporate'),
        },
        {
          key: 'nature',
          label: this.props.t('genAi.form.presets.labels.nature'),
          prompt: this.props.t('genAi.form.presets.vibes.nature'),
        },
        {
          key: 'vintage',
          label: this.props.t('genAi.form.presets.labels.vintage'),
          prompt: this.props.t('genAi.form.presets.vibes.vintage'),
        },
      ],
      usecases: [
        {
          key: 'landing',
          label: this.props.t('genAi.form.presets.labels.landing'),
          prompt: this.props.t('genAi.form.presets.usecases.landing'),
        },
        {
          key: 'blog',
          label: this.props.t('genAi.form.presets.labels.blog'),
          prompt: this.props.t('genAi.form.presets.usecases.blog'),
        },
        {
          key: 'resume',
          label: this.props.t('genAi.form.presets.labels.resume'),
          prompt: this.props.t('genAi.form.presets.usecases.resume'),
        },
        {
          key: 'portfolio',
          label: this.props.t('genAi.form.presets.labels.portfolio'),
          prompt: this.props.t('genAi.form.presets.usecases.portfolio'),
        },
        {
          key: 'documentation',
          label: this.props.t('genAi.form.presets.labels.documentation'),
          prompt: this.props.t('genAi.form.presets.usecases.documentation'),
        },
        {
          key: 'ecommerce',
          label: this.props.t('genAi.form.presets.labels.ecommerce'),
          prompt: this.props.t('genAi.form.presets.usecases.ecommerce'),
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

    this.setState({ isRequestProcessing: true, error: null })

    try {
      const palette = await mistralClient.generateColorPalette(
        this.state.prompt
      )

      this.setState({ generatedPalette: palette, isRequestProcessing: false })

      if (
        this.props.config.plan.isProEnabled &&
        this.props.config.plan.isCreditsEnabled
      )
        $creditsCount.set(
          $creditsCount.get() - this.props.config.fees.aiColorsGenerate
        )
    } catch (error) {
      console.error(error)
      this.setState({
        error: this.props.t('error.unavailableAi'),
        isRequestProcessing: false,
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
        displayKey: this.props.t('genAi.colorTypes.primary'),
      },
      {
        key: 'text',
        name: palette.text.name,
        displayKey: this.props.t('genAi.colorTypes.text'),
      },
      {
        key: 'success',
        name: palette.success.name,
        displayKey: this.props.t('genAi.colorTypes.success'),
      },
      {
        key: 'warning',
        name: palette.warning.name,
        displayKey: this.props.t('genAi.colorTypes.warning'),
      },
      {
        key: 'alert',
        name: palette.alert.name,
        displayKey: this.props.t('genAi.colorTypes.alert'),
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

  // Direct Actions
  onCreatePalette = (sourceColors: Array<SourceColorConfiguration>) => {
    this.setState({
      isActionLoading: true,
    })

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE',
          data: {
            sourceColors: sourceColors,
            exchange: {
              ...this.palette.value,
            },
          },
        },
      },
      '*'
    )

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.paletteCreate
      )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'CREATE_PALETTE',
        colors: sourceColors.length,
        stops: this.palette.value?.preset.stops.length,
      }
    )
  }

  onUsePalette = () => {
    if (!this.state.generatedPalette) return

    const sourceColors = this.convertMistralToSourceColors(
      this.state.generatedPalette
    )

    this.props.onChangeService({
      service: 'MANAGE',
    })
    this.onCreatePalette(sourceColors)

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
          gap: 'var(--size-pos-xxsmall)',
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
                label={this.props.t('genAi.title')}
              />
            }
            rightPartSlot={
              <Feature isActive={this.features.CREATE_PALETTE.isActive()}>
                <Button
                  type="secondary"
                  label={this.props.t('genAi.actions.newPalette')}
                  helper={{
                    label: this.features.LOCAL_PALETTES.isReached(
                      this.props.localPalettesCount
                    )
                      ? this.props.t('info.maxNumberOfLocalPalettes', {
                          count: (
                            this.features.LOCAL_PALETTES.limit ?? 3
                          ).toString(),
                        })
                      : this.props.t('genAi.actions.addColors'),
                    type: 'MULTI_LINE',
                  }}
                  isLoading={this.state.isActionLoading}
                  isDisabled={true}
                  isBlocked={this.features.LOCAL_PALETTES.isReached(
                    this.props.localPalettesCount
                  )}
                  onBlock={() => {
                    sendPluginMessage(
                      {
                        pluginMessage: {
                          type:
                            this.props.config.plan.isTrialEnabled &&
                            this.props.trialStatus !== 'EXPIRED'
                              ? 'GET_TRIAL'
                              : 'GET_PRO',
                        },
                      },
                      '*'
                    )
                  }}
                  isNew={this.features.CREATE_PALETTE.isNew()}
                  action={this.onUsePalette}
                />
              </Feature>
            }
            isListItem={false}
            alignment="CENTER"
          />
          <Message
            icon="info"
            messages={[this.props.t('genAi.emptyMessage')]}
          />
        </>
      )

    const colors = [
      {
        ...this.state.generatedPalette.primary,
        type: this.props.t('genAi.colorTypes.primary'),
      },
      {
        ...this.state.generatedPalette.text,
        type: this.props.t('genAi.colorTypes.text'),
      },
      {
        ...this.state.generatedPalette.success,
        type: this.props.t('genAi.colorTypes.success'),
      },
      {
        ...this.state.generatedPalette.warning,
        type: this.props.t('genAi.colorTypes.warning'),
      },
      {
        ...this.state.generatedPalette.alert,
        type: this.props.t('genAi.colorTypes.alert'),
      },
    ]

    return (
      <>
        <SimpleItem
          leftPartSlot={
            <SectionTitle
              indicator="5"
              label={this.props.t('genAi.title')}
            />
          }
          rightPartSlot={
            <Feature isActive={this.features.CREATE_PALETTE.isActive()}>
              <Button
                type="secondary"
                label={this.props.t('genAi.actions.newPalette')}
                helper={{
                  label: this.features.LOCAL_PALETTES.isReached(
                    this.props.localPalettesCount
                  )
                    ? this.props.t('info.maxNumberOfLocalPalettes', {
                        count: (
                          this.features.LOCAL_PALETTES.limit ?? 3
                        ).toString(),
                      })
                    : this.props.t('genAi.actions.addColors'),
                  type: 'MULTI_LINE',
                }}
                isDisabled={false}
                isBlocked={this.features.LOCAL_PALETTES.isReached(
                  this.props.localPalettesCount
                )}
                isNew={this.features.CREATE_PALETTE.isNew()}
                onBlock={() => {
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type:
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                            ? 'GET_TRIAL'
                            : 'GET_PRO',
                      },
                    },
                    '*'
                  )
                }}
                action={this.onUsePalette}
              />
            </Feature>
          }
          isListItem={false}
          alignment="CENTER"
        />
        <div
          style={{
            padding: 'var(--size-pos-xsmall)',
          }}
        >
          <PalettePreview
            colors={setPreviewPalette(
              this.convertMistralToSourceColors(this.state.generatedPalette),
              this.palette.get()
            )}
          />
        </div>
        <List
          isTopBorderEnabled
          isFullHeight
          isFullWidth
        >
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
              <Feature isActive={this.features.GEN_REQUEST.isActive()}>
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
                              this.props.t('genAi.form.prompt.placeholder')
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
                            label={this.props.t('genAi.actions.generate')}
                            isLoading={this.state.isRequestProcessing}
                            isDisabled={
                              !this.state.prompt.trim() || !mistralClient
                            }
                            isBlocked={this.features.GEN_REQUEST.isReached(
                              (this.props.creditsCount -
                                this.props.config.fees.aiColorsGenerate) *
                                -1 -
                                1
                            )}
                            onBlock={() => {
                              sendPluginMessage(
                                {
                                  pluginMessage: {
                                    type:
                                      this.props.config.plan.isTrialEnabled &&
                                      this.props.trialStatus !== 'EXPIRED'
                                        ? 'GET_TRIAL'
                                        : 'GET_PRO',
                                  },
                                },
                                '*'
                              )
                            }}
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
            typeModifier: this.props.documentWidth > 460 ? 'DRAWER' : 'FIXED',
            drawerOptions: {
              minSize: {
                value: 196,
                unit: 'PIXEL' as const,
              },
              defaultSize: {
                value: 272,
                unit: 'PIXEL' as const,
              },
              maxSize: {
                value: 496,
                unit: 'PIXEL' as const,
              },
              pin: 'RIGHT' as const,
              direction: 'HORIZONTAL' as const,
            },
          },
        ]}
        isFullHeight
        isFullWidth
        shouldReflow
      />
    )
  }
}
