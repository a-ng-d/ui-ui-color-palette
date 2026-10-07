import { PureComponent } from 'preact/compat'
import { createRef, RefObject } from 'preact'
import chroma from 'chroma-js'
import {
  ColorConfiguration,
  CreatorConfiguration,
  DatesConfiguration,
  EasingConfiguration,
  ExchangeConfiguration,
  HexModel,
  makeDefaultShift,
  PresetConfiguration,
  PublicationConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  ShiftCurveConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  ThemeConfiguration,
  ColorSpaceConfiguration,
  AlgorithmVersionConfiguration,
  LockedSourceColorsConfiguration,
  VisionSimulationModeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { Accordion, Bar, Button, layouts, List, SectionTitle } from '@unoff/ui'
import { ManagePaletteState } from '../services/ManagePalette'
import Themes from '../contexts/Themes'
import Settings from '../contexts/Settings'
import Scale from '../contexts/Scale'
import Colors from '../contexts/Colors'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import UndoRedoButtons from '../components/UndoRedoButtons'
import Feature from '../components/Feature'
import { getWorkingThemes } from '../../utils/workingThemes'
import { computeScaleForStops } from '../../utils/scaleStops'
import { resetScale } from '../../utils/resetScale'
import {
  getPublicationIcon,
  getPublicationLabel,
} from '../../utils/publication'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  ColorsMessage,
  PluginMessageData,
  ScaleMessage,
} from '../../types/messages'
import {
  BaseProps,
  Context,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { $palette, $themes } from '../../stores/palette'
import {
  trackScaleManagementEvent,
  trackSourceColorsManagementEvent,
} from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface InspectorProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  dates: DatesConfiguration
  onChangeDistributionEasing: Dispatch<Partial<ManagePaletteState>>
  onPublishPalette: Dispatch<Partial<ManagePaletteState>>
  onDeletePalette: () => void
  onAddColor: () => void
  onAddStop: () => void
  onChangeScale: () => void
  onChangeShift: (
    feature?: string,
    state?: string,
    value?: ShiftCurveConfiguration
  ) => void
}

interface InspectorState {
  expandedSections: Partial<Record<Context, boolean>>
  isImportingCanvasColors: boolean
  isAddingTheme: boolean
}

export default class Inspector extends PureComponent<
  InspectorProps,
  InspectorState
> {
  private colorsMessage: ColorsMessage
  private scaleMessage: ScaleMessage
  private themesRef: RefObject<Themes>
  private palette: typeof $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SCALE: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_PRESETS: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_PRESETS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_RESET: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_RESET',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    THEMES: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    THEMES_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_CANVAS: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_CANVAS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PUBLICATION: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLICATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Inspector.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: InspectorProps) {
    super(props)
    this.palette = $palette
    this.colorsMessage = {
      type: 'UPDATE_COLORS',
      id: this.props.id,
      data: [],
    }
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      id: this.props.id,
      data: this.palette.value as ExchangeConfiguration,
    }
    this.state = {
      expandedSections: {},
      isImportingCanvasColors: false,
      isAddingTheme: false,
    }
    this.themesRef = createRef()
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
      COLOR_SELECTED: () => this.onCanvasColorsSelected(path.data.selection),
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  addTheme = () => {
    this.setState({ isAddingTheme: true })
    setTimeout(() => this.themesRef.current?.onAddTheme(), 1)
  }

  onRemoveStop = () => {
    const preset = { ...$palette.get().preset }
    const stops = [...(preset.stops ?? [])]

    if (stops.length > 2) {
      stops.pop()
      preset.stops = stops

      const scale = computeScaleForStops(
        stops,
        $palette.get().scale ?? {},
        this.props.distributionEasing
      )

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = 'DELETE_STOP'

      $themes.set(
        $themes.get().map((theme) => ({
          ...theme,
          scale: computeScaleForStops(
            stops,
            theme.isEnabled ? $palette.get().scale : theme.scale,
            this.props.distributionEasing
          ),
        }))
      )

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }
  }

  onToggleSection = (section: Context) =>
    this.setState({
      expandedSections: {
        ...this.state.expandedSections,
        [section]: !this.state.expandedSections[section],
      },
    })

  onBlockedFeature = (origin: string) => {
    const isTrial =
      this.props.config.plan.isTrialEnabled &&
      this.props.trialStatus !== 'EXPIRED'
    sendPluginMessage(
      {
        pluginMessage: isTrial
          ? { type: 'GET_TRIAL' }
          : { type: 'GET_PRO', data: { origin } },
      },
      '*'
    )
  }

  onResetScale = () => {
    resetScale({
      id: this.props.id,
      preset: this.props.preset,
      onChangeScale: this.props.onChangeScale,
      onChangeShift: this.props.onChangeShift,
    })

    trackScaleManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'RESET_SCALE',
      }
    )
  }

  onAddColorGuarded = () => {
    if (this.features.COLORS_ADD.isReached(this.props.colors.length))
      this.onBlockedFeature('ADD_COLOR')
    else this.props.onAddColor()
  }

  onAddThemeGuarded = () => {
    if (this.features.THEMES_ADD.isReached(this.props.themes.length - 1))
      this.onBlockedFeature('ADD_THEME')
    else {
      this.setState({ isAddingTheme: true })
      setTimeout(() => {
        this.themesRef.current?.onAddTheme()
        this.setState({ isAddingTheme: false })
      }, 1)
    }
  }

  onToggleCanvasColorsImport = () => {
    if (
      this.features.IMPORTS_CANVAS.isBlocked() &&
      !this.state.isImportingCanvasColors
    )
      this.onBlockedFeature('IMPORTS_CANVAS')
    else
      this.setState({
        isImportingCanvasColors: !this.state.isImportingCanvasColors,
      })
  }

  onCanvasColorsSelected = (selection: Array<SourceColorConfiguration>) => {
    if (
      !this.props.isCompact ||
      !this.state.isImportingCanvasColors ||
      !Array.isArray(selection)
    )
      return

    const hexOf = (rgb: SourceColorConfiguration['rgb']) =>
      chroma([rgb.r * 255, rgb.g * 255, rgb.b * 255])
        .hex()
        .toUpperCase()
    const knownIds = new Set(this.props.colors.map((color) => color.id))
    const knownHexes = new Set(this.props.colors.map((c) => hexOf(c.rgb)))

    let newColors = selection.filter((sourceColor) => {
      const hex = hexOf(sourceColor.rgb)
      if (knownIds.has(sourceColor.id) || knownHexes.has(hex)) return false
      knownIds.add(sourceColor.id)
      knownHexes.add(hex)
      return true
    })
    if (newColors.length === 0) return

    const limit = this.features.COLORS_ADD.limit
    if (limit !== undefined) {
      const remaining = Math.max(limit - this.props.colors.length, 0)
      if (newColors.length > remaining) {
        newColors = newColors.slice(0, remaining)
        this.onBlockedFeature('COLORS_ADD')
      }
    }
    if (newColors.length === 0) return

    this.colorsMessage.data = [
      ...this.props.colors,
      ...newColors.map((sourceColor) => ({
        name: sourceColor.name,
        description: '',
        rgb: sourceColor.rgb,
        id: sourceColor.id,
        hue: sourceColor.hue ?? {
          shift: makeDefaultShift('HUE'),
          isLocked: false,
        },
        chroma: sourceColor.chroma ?? {
          shift: makeDefaultShift('CHROMA'),
          isLocked: false,
        },
        alpha: {
          isEnabled: false,
          backgroundColor: '#FFFFFF' as HexModel,
        },
      })),
    ]

    this.palette.setKey('colors', this.colorsMessage.data)

    sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

    trackSourceColorsManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'ADD_COLOR',
      }
    )
  }

  private get activeThemeName(): string | undefined {
    const activeTheme = this.props.themes.find((theme) => theme.isEnabled)
    if (activeTheme === undefined || activeTheme.type === 'default theme')
      return undefined
    return activeTheme.name
  }

  render() {
    const isExpanded = (section: Context) =>
      this.state.expandedSections[section] === true
    const isCustomPreset = this.props.preset.id.includes('CUSTOM')
    const stopsCount = this.props.preset.stops.length
    const customThemes = getWorkingThemes(this.props.themes)
    const hasCustomThemes = this.props.themes.length > 1
    const binding = this.activeThemeName

    return (
      <section
        className="compact-inspector"
        id="compact-inspector"
      >
        <Bar
          id="compact-inspector-header"
          leftPartSlot={
            <SectionTitle
              label={this.props.name}
              helper={
                this.props.description?.trim()
                  ? this.props.description
                  : undefined
              }
            />
          }
          rightPartSlot={
            <div className={layouts['snackbar--medium']}>
              <Feature isActive={this.features.PUBLICATION.isActive()}>
                <div data-id="tour-publication">
                  <Button
                    type="icon"
                    icon={getPublicationIcon(this.props)}
                    helper={{ label: getPublicationLabel(this.props) }}
                    isNew={
                      this.props.publicationStatus.isPublished &&
                      this.props.dates.publishedAt !==
                        this.props.dates.updatedAt
                    }
                    action={() =>
                      this.props.onPublishPalette?.({
                        canBePublished: true,
                      })
                    }
                  />
                </div>
              </Feature>
              <UndoRedoButtons isHorizontal />
            </div>
          }
          clip={['LEFT']}
          border={['BOTTOM']}
        />
        <List
          isFullWidth
          isFullHeight
        >
          <Feature isActive={this.features.SCALE.isActive()}>
            <Accordion
              label={this.props.t('scale.title')}
              indicator={stopsCount}
              icon="chevron-down"
              collapseIcon="chevron-up"
              helper={
                binding !== undefined
                  ? this.props.t('settings.themeBinding.message', {
                      themeName: binding,
                    })
                  : undefined
              }
              isExpanded={isExpanded('SCALE')}
              onAdd={() => this.onToggleSection('SCALE')}
              onEmpty={() => this.onToggleSection('SCALE')}
              actions={
                <>
                  <Feature isActive={this.features.SCALE_RESET.isActive()}>
                    <Button
                      type="icon"
                      icon="reset"
                      helper={{
                        label: this.props.t('scale.actions.resetScale'),
                      }}
                      isBlocked={this.features.SCALE_RESET.isBlocked()}
                      isNew={this.features.SCALE_RESET.isNew()}
                      onBlock={() => this.onBlockedFeature('RESET_SCALE')}
                      action={this.onResetScale}
                    />
                  </Feature>
                  <Feature isActive={this.features.SCALE_PRESETS.isActive()}>
                    <Button
                      type="icon"
                      icon="minus"
                      isDisabled={!isCustomPreset || stopsCount <= 2}
                      helper={{
                        label: this.props.t('scale.actions.removeStop'),
                      }}
                      action={this.onRemoveStop}
                    />
                    <Feature
                      isActive={this.features.PRESETS_CUSTOM_ADD.isActive()}
                    >
                      <Button
                        type="icon"
                        icon="plus"
                        isDisabled={!isCustomPreset || stopsCount >= 24}
                        helper={{
                          label: this.props.t('scale.actions.addStop'),
                        }}
                        isBlocked={
                          isCustomPreset &&
                          this.features.PRESETS_CUSTOM_ADD.isReached(stopsCount)
                        }
                        onBlock={() => this.onBlockedFeature('ADD_STOP')}
                        action={this.props.onAddStop}
                      />
                    </Feature>
                  </Feature>
                </>
              }
            >
              <Scale
                {...this.props}
                isEmbedded
                onChangeScale={this.props.onChangeScale}
                onChangeShift={this.props.onChangeShift}
              />
            </Accordion>
          </Feature>
          <Feature isActive={this.features.COLORS.isActive()}>
            <Accordion
              label={this.props.t('colors.title')}
              indicator={this.props.colors.length}
              helper={this.props.t('colors.callout.message')}
              icon="plus"
              collapseIcon="plus"
              helpers={{
                add: this.props.t('colors.actions.new'),
                empty: this.props.t('colors.actions.new'),
              }}
              isExpanded={this.props.colors.length > 0}
              onAdd={this.onAddColorGuarded}
              onEmpty={this.onAddColorGuarded}
              actions={
                <Feature isActive={this.features.IMPORTS_CANVAS.isActive()}>
                  <Button
                    type="icon"
                    icon="import"
                    state={
                      this.state.isImportingCanvasColors
                        ? 'selected'
                        : undefined
                    }
                    helper={{
                      label: this.state.isImportingCanvasColors
                        ? this.props.t('imports.canvas.tip', {
                            element: this.props.t(
                              `imports.nodes.${this.props.config.env.platform}`
                            ),
                            canvas: this.props.t(
                              `platform.${this.props.config.env.platform}`
                            ),
                          })
                        : this.props.t('imports.canvas.add'),
                      type: this.state.isImportingCanvasColors
                        ? 'MULTI_LINE'
                        : 'SINGLE_LINE',
                    }}
                    isBlocked={
                      this.features.IMPORTS_CANVAS.isBlocked() &&
                      !this.state.isImportingCanvasColors
                    }
                    isNew={this.features.IMPORTS_CANVAS.isNew()}
                    onBlock={() => this.onBlockedFeature('IMPORTS_CANVAS')}
                    action={this.onToggleCanvasColorsImport}
                  />
                </Feature>
              }
            >
              <Colors
                {...this.props}
                isEmbedded
              />
            </Accordion>
          </Feature>
          <Feature isActive={this.features.THEMES.isActive()}>
            <div data-id="tour-themes">
              <Accordion
                label={this.props.t('themes.title')}
                indicator={hasCustomThemes ? customThemes.length : 0}
                helper={this.props.t('themes.callout.message')}
                icon="plus"
                collapseIcon="plus"
                helpers={{
                  add: this.props.t('themes.actions.new'),
                  empty: this.props.t('themes.actions.new'),
                }}
                isExpanded={hasCustomThemes || this.state.isAddingTheme}
                isNew={this.features.THEMES.isNew()}
                onAdd={this.onAddThemeGuarded}
                onEmpty={this.onAddThemeGuarded}
              >
                <Themes
                  {...this.props}
                  isEmbedded
                  ref={this.themesRef}
                />
              </Accordion>
            </div>
          </Feature>
          <Feature isActive={this.features.SETTINGS.isActive()}>
            <Accordion
              label={this.props.t('contexts.settings')}
              icon="chevron-down"
              collapseIcon="chevron-up"
              isExpanded={isExpanded('SETTINGS')}
              onAdd={() => this.onToggleSection('SETTINGS')}
              onEmpty={() => this.onToggleSection('SETTINGS')}
            >
              <Settings
                {...this.props}
                isEmbedded
              />
            </Accordion>
          </Feature>
        </List>
      </section>
    )
  }
}
