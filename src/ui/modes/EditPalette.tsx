import type { DropdownOption, IconList } from '@unoff/ui'
import { uid } from 'uid'
import { PureComponent, ChangeEvent, KeyboardEvent } from 'preact/compat'
import { createRef, RefObject } from 'preact'
import { FeatureStatus } from '@unoff/utils'
import { doScale } from '@unoff/utils'
import { Bar, Button, Layout, layouts } from '@unoff/ui'
import {
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  EasingConfiguration,
  ExchangeConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
  PublicationConfiguration,
  CreatorConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { doScale } from '@unoff/utils'
import { Bar, Button, Layout, layouts } from '@unoff/ui'
import { OpenPaletteState } from '../subservices/OpenPalette'
import { ManagePaletteState } from '../services/ManagePalette'
import Preview from '../modules/Preview'
import Actions from '../modules/Actions'
import Themes from '../contexts/Themes'
import Settings from '../contexts/Settings'
import Scale from '../contexts/Scale'
import Imports from '../contexts/Imports'
import Colors from '../contexts/Colors'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import UndoRedoButtons from '../components/UndoRedoButtons'
import Feature from '../components/Feature'
import { setContexts } from '../../utils/setContexts'
import { computeScaleForStops } from '../../utils/scaleStops'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  ColorsMessage,
  PluginMessageData,
  ScaleMessage,
  ThemesMessage,
} from '../../types/messages'
import { SourceColorEvent } from '../../types/events'
import {
  BaseProps,
  Context,
  ContextItem,
  PlanStatus,
  Service,
  Editor,
  Mode,
} from '../../types/app'
import { getDefaultPreset } from '../../stores/presets'
import { $palette, $themes } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import {
  trackActionEvent,
  trackPreviewManagementEvent,
  trackSourceColorsManagementEvent,
} from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface EditPaletteProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  mode: Mode
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  view: ViewConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  document: DocumentConfiguration
  dates: DatesConfiguration
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  onChangeMode: Dispatch<Partial<OpenPaletteState>>
  onChangeDistributionEasing: Dispatch<Partial<ManagePaletteState>>
  onPublishPalette: Dispatch<Partial<ManagePaletteState>>
  onUnloadPalette: () => void
  onChangeDocument: Dispatch<Partial<ManagePaletteState>>
  onDeletePalette: () => void
}

interface EditPaletteState {
  context: Context | ''
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
}

export default class EditPalette extends PureComponent<
  EditPaletteProps,
  EditPaletteState
> {
  private colorsMessage: ColorsMessage
  private themesMessage: ThemesMessage
  private scaleMessage: ScaleMessage
  private contexts: Array<ContextItem>
  private themesRef: RefObject<Themes>
  private previewRef: RefObject<Preview>
  private palette: typeof $palette
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    ACTIONS: new FeatureStatus({
      features: config.features,
      featureName: 'ACTIONS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE',
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
    THEMES: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS',
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
    return EditPalette.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: EditPaletteProps) {
    super(props)
    this.palette = $palette
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      id: this.props.id,
      data: [],
    }
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
    this.contexts = setContexts(
      ['SCALE', 'COLORS', 'THEMES', 'IMPORTS', 'SETTINGS'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service,
      props.t
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      isPrimaryLoading: false,
      isSecondaryLoading: false,
    }
    this.themesRef = createRef()
    this.previewRef = createRef()
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  componentDidUpdate(previousProps: Readonly<EditPaletteProps>): void {
    if (previousProps.t !== this.props.t) {
      this.contexts = setContexts(
        ['SCALE', 'COLORS', 'THEMES', 'SETTINGS'],
        this.props.planStatus,
        this.props.config.features,
        this.props.editor,
        this.props.service,
        this.props.t
      )

      this.forceUpdate()
    }
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
      STOP_LOADER: () =>
        this.setState({
          isPrimaryLoading: false,
          isSecondaryLoading: false,
        }),
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  switchThemeHandler = (e: Event) => {
    this.themesMessage.data = this.props.themes.map((theme) => {
      if ((e.target as HTMLElement).dataset.value === theme.id)
        theme.isEnabled = true
      else theme.isEnabled = false

      return theme
    })

    const activeTheme = this.themesMessage.data.find((theme) => theme.isEnabled)
    const defaultPreset = getDefaultPreset(this.props.t)
    const newScale =
      activeTheme?.scale ??
      doScale(defaultPreset.stops, defaultPreset.min, defaultPreset.max)
    const newTextColorsTheme = activeTheme?.textColorsTheme ?? {
      lightColor: '#000000',
      darkColor: '#FFFFFF',
    }
    const newVisionSimulationMode = activeTheme?.visionSimulationMode ?? 'NONE'

    this.palette.setKey('scale', newScale)
    this.palette.setKey('visionSimulationMode', newVisionSimulationMode)
    this.palette.setKey('textColorsTheme', newTextColorsTheme)
    $themes.set(this.themesMessage.data)

    sendPluginMessage({ pluginMessage: this.themesMessage }, '*')
  }

  slideHandler = () => {
    $themes.set(
      $themes.get().map((theme: ThemeConfiguration) => {
        if (theme.isEnabled) theme.scale = this.palette.get().scale
        return theme
      })
    )
  }

  shiftHandler = (feature?: string, state?: string, value?: number) => {
    const onReleaseStop = () => {
      setData()
      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: feature as SourceColorEvent['feature'],
        }
      )
    }

    const onChangeStop = () => {
      setData()
      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')
    }

    const onTypeStopValue = () => {
      setData()
      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')
    }

    const onUpdatingStop = () => {
      setData()
    }

    const setData = () => {
      const shift: ShiftConfiguration = {
        chroma:
          feature === 'SHIFT_CHROMA' ? (value ?? 100) : this.props.shift.chroma,
        hue: feature === 'SHIFT_HUE' ? (value ?? 0) : this.props.shift.hue,
      }

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (feature === 'SHIFT_CHROMA' && !item.chroma.isLocked)
          item.chroma.shift = value ?? this.props.shift.chroma
        if (feature === 'SHIFT_HUE' && !item.hue.isLocked)
          item.hue.shift = value ?? this.props.shift.hue
        return item
      })

      this.palette.setKey('shift', shift)
      this.palette.setKey('colors', this.colorsMessage.data)
    }

    const actions: {
      [action: string]: () => void
    } = {
      RELEASED: () => onReleaseStop(),
      SHIFTED: () => onChangeStop(),
      TYPED: () => onTypeStopValue(),
      UPDATING: () => onUpdatingStop(),
      DEFAULT: () => null,
    }

    return actions[state ?? 'DEFAULT']?.()
  }

  documentHandler = (e: Event) => {
    this.setState({
      isSecondaryLoading: true,
    })
    const currentElement = e.currentTarget as HTMLInputElement

    const generatePalette = () => {
      this.props.onChangeDocument({
        document: {
          ...this.props.document,
          view: 'PALETTE',
        },
      })

      if (
        this.props.config.plan.isProEnabled &&
        this.props.config.plan.isCreditsEnabled
      )
        $creditsCount.set(
          $creditsCount.get() - this.props.config.fees.paletteGenerate
        )

      sendPluginMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'PALETTE',
          },
        },
        '*'
      )

      trackActionEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'GENERATE_PALETTE',
        }
      )
    }

    const generatePaletteWithProperties = () => {
      this.props.onChangeDocument({
        document: {
          ...this.props.document,
          view: 'PALETTE_WITH_PROPERTIES',
        },
      })

      if (
        this.props.config.plan.isProEnabled &&
        this.props.config.plan.isCreditsEnabled
      )
        $creditsCount.set(
          $creditsCount.get() - this.props.config.fees.paletteWithPropsGenerate
        )

      sendPluginMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'PALETTE_WITH_PROPERTIES',
          },
        },
        '*'
      )

      trackActionEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
        }
      )
    }

    const generateSheet = () => {
      this.props.onChangeDocument({
        document: {
          ...this.props.document,
          view: 'SHEET',
        },
      })

      if (
        this.props.config.plan.isProEnabled &&
        this.props.config.plan.isCreditsEnabled
      )
        $creditsCount.set(
          $creditsCount.get() - this.props.config.fees.sheetGenerate
        )

      sendPluginMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'SHEET',
          },
        },
        '*'
      )

      trackActionEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'GENERATE_SHEET',
        }
      )
    }

    const pushUpdates = () => {
      this.props.onChangeDocument({
        document: {
          ...this.props.document,
          view: this.props.document?.view ?? 'PALETTE',
        },
      })

      sendPluginMessage(
        {
          pluginMessage: {
            type: 'UPDATE_DOCUMENT',
            view: this.props.document?.view ?? 'PALETTE',
          },
        },
        '*'
      )

      trackActionEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_DOCUMENT',
        }
      )
    }

    const actions: { [action: string]: () => void } = {
      GENERATE_SHEET: () => generateSheet(),
      GENERATE_PALETTE_WITH_PROPERTIES: () => generatePaletteWithProperties(),
      GENERATE_PALETTE: () => generatePalette(),
      PUSH_UPDATES: () => pushUpdates(),
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  publicationAction = (): Partial<DropdownOption> => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return {
        label: this.props.t('actions.publishOrSyncPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_SYNC_PALETTE',
      }
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return {
        label: this.props.t('actions.publishPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return {
        label: this.props.t('actions.syncPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'SYNC_PALETTE',
      }
    else
      return {
        label: this.props.t('actions.publishPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
  }

  publicationLabel = (): string => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return this.props.t('actions.publishOrSyncPalette')
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return this.props.t('actions.publishPalette')
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return this.props.t('actions.syncPalette')
    else return this.props.t('actions.publishPalette')
  }

  publicationIcon = (): IconList => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return 'library'
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return 'library'
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return 'swap'
    else return 'library'
  }

  // Direct Actions
  onSyncStyles = () => {
    this.setState({
      isPrimaryLoading: true,
    })

    sendPluginMessage(
      { pluginMessage: { type: 'SYNC_LOCAL_STYLES', id: this.props.id } },
      '*'
    )

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.localStylesSync
      )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'SYNC_STYLES',
      }
    )
  }

  onSyncVariables = () => {
    this.setState({
      isPrimaryLoading: true,
    })

    sendPluginMessage(
      { pluginMessage: { type: 'SYNC_LOCAL_VARIABLES', id: this.props.id } },
      '*'
    )

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.localVariablesSync
      )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'SYNC_VARIABLES',
      }
    )
  }

  onSyncTokens = () => {
    this.setState({
      isPrimaryLoading: true,
    })

    sendPluginMessage(
      { pluginMessage: { type: 'SYNC_LOCAL_TOKENS', id: this.props.id } },
      '*'
    )

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.localTokensSync
      )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'SYNC_TOKENS',
      }
    )
  }

  onChangeView = (
    e:
      | ChangeEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.setState({
      isSecondaryLoading: true,
    })
    const currentElement = e.currentTarget as HTMLInputElement

    this.props.onChangeDocument({
      document: {
        ...this.props.document,
        view: currentElement.dataset.value as ViewConfiguration,
      },
    })

    if (
      this.props.config.plan.isProEnabled &&
      currentElement.dataset.value === 'PALETTE'
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.paletteGenerate
      )
    else if (
      this.props.config.plan.isProEnabled &&
      currentElement.dataset.value === 'PALETTE_WITH_PROPERTIES'
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.paletteWithPropsGenerate
      )
    else if (
      this.props.config.plan.isProEnabled &&
      currentElement.dataset.value === 'SHEET'
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.sheetGenerate
      )

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'UPDATE_DOCUMENT',
          view: currentElement.dataset.value,
        },
      },
      '*'
    )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: `SWITCH_${currentElement.dataset.value as ViewConfiguration}`,
      }
    )
  }

  onChangeDocument = (view?: ViewConfiguration) => {
    this.setState({
      isSecondaryLoading: true,
    })
    if (view !== undefined)
      this.props.onChangeDocument({
        document: {
          ...this.props.document,
          view: view,
        },
      })
  }

  setThemes = (): Array<DropdownOption> => {
    const themes = this.workingThemes().map((theme) => {
      return {
        label:
          theme.type === 'default theme'
            ? this.props.t('themes.switchTheme.defaultTheme')
            : theme.name,
        value: theme.id,
        feature: 'SWITCH_THEME',
        type: 'OPTION',
        action: (e: Event) => this.switchThemeHandler(e),
      } as DropdownOption
    })
    const actions: Array<DropdownOption> = [
      ...(this.features.THEMES.isActive()
        ? [
            {
              type: 'SEPARATOR' as const,
            },
          ]
        : []),
      {
        label: this.props.t('themes.callout.cta'),
        feature: 'ADD_THEME',
        type: 'OPTION',
        isActive: this.features.THEMES.isActive(),
        isBlocked: this.features.THEMES.isBlocked(),
        isNew: this.features.THEMES.isNew(),
        onBlock: () => {
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
        },
        action: () => {
          this.setState({ context: 'THEMES' })
          setTimeout(() => this.themesRef.current?.onAddTheme(), 1)
        },
      },
    ]

    return themes.concat(actions)
  }

  workingThemes = () => {
    if (this.props.themes.length > 1)
      return this.props.themes.filter((theme) => theme.type === 'custom theme')
    else
      return this.props.themes.filter((theme) => theme.type === 'default theme')
  }

  onJumpToSourceColor = () => {
    this.setState({
      context: 'COLORS',
    })

    trackPreviewManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'JUMP_TO_COLOR',
      }
    )
  }

  onAddColor = () => {
    const hasAlreadyNewUIColor = this.props.colors.filter((color) =>
      color.name.includes(this.props.t('colors.actions.new'))
    )

    this.colorsMessage.data = [...this.props.colors]
    this.colorsMessage.data.push({
      name: `${this.props.t('colors.actions.new')} ${hasAlreadyNewUIColor.length + 1}`,
      description: '',
      rgb: {
        r: 0.53,
        g: 0.92,
        b: 0.97,
      },
      id: uid(),
      hue: {
        shift: 0,
        isLocked: false,
      },
      chroma: {
        shift: 100,
        isLocked: false,
      },
      alpha: {
        isEnabled: false,
        backgroundColor: '#FFFFFF',
      },
    })

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

  onAddStop = () => {
    const preset = { ...$palette.get().preset }
    const stops = [...(preset.stops ?? [])]

    if (stops.length < 24) {
      stops.push(stops.slice(-1)[0] + stops[0])
      preset.stops = stops

      const scale = computeScaleForStops(
        stops,
        $palette.get().scale ?? {},
        this.props.distributionEasing
      )

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = 'ADD_STOP'

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

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'SCALE': {
        fragment = (
          <Feature isActive={this.features.SCALE.isActive()}>
            <Scale
              {...this.props}
              onChangeScale={this.slideHandler}
              onChangeShift={this.shiftHandler}
            />
          </Feature>
        )
        break
      }
      case 'COLORS': {
        fragment = (
          <Feature isActive={this.features.COLORS.isActive()}>
            <Colors {...this.props} />
          </Feature>
        )
        break
      }
      case 'THEMES': {
        fragment = (
          <Feature isActive={this.features.THEMES.isActive()}>
            <Themes
              {...this.props}
              ref={this.themesRef}
            />
          </Feature>
        )
        break
      }
      case 'IMPORTS': {
        fragment = (
          <Feature isActive={this.features.IMPORTS.isActive()}>
            <Imports {...this.props} />
          </Feature>
        )
        break
      }
      case 'SETTINGS': {
        fragment = (
          <Feature isActive={this.features.SETTINGS.isActive()}>
            <Settings {...this.props} />
          </Feature>
        )
        break
      }
    }

    return (
      <>
        <Feature isActive={this.features.ACTIONS.isActive()}>
          <Actions
            {...this.props}
            {...this.state}
            mode="EDIT"
            onSyncLocalStyles={this.onSyncStyles}
            onSyncLocalVariables={this.onSyncVariables}
            onSyncLocalTokens={this.onSyncTokens}
            onGenerateDocument={this.documentHandler}
            onChangeView={this.onChangeView}
          />
        </Feature>
        <Layout
          id="edit-palette"
          column={[
            {
              node: (
                <Feature isActive={this.features.PREVIEW.isActive()}>
                  <Preview
                    {...this.props}
                    themeOptions={this.setThemes()}
                    onAddColor={this.onAddColor}
                    onAddStop={this.onAddStop}
                    onInteractWithSourceColor={() => this.onJumpToSourceColor()}
                    ref={this.previewRef}
                  />
                </Feature>
              ),
              typeModifier: 'BLANK',
            },
            ...(this.state.context !== ''
              ? [
                  {
                    node: (
                      <section className="context">
                        <div
                          style={{
                            minWidth: '200px',
                            overflow: 'hidden',
                            position: 'relative',
                            height: '100%',
                          }}
                        >
                          {fragment}
                        </div>
                      </section>
                    ),
                    typeModifier: 'DRAWER' as const,
                    drawerOptions: {
                      minSize: {
                        value: 48,
                        unit: 'PIXEL' as const,
                      },
                      defaultSize: {
                        value: 360,
                        unit: 'PIXEL' as const,
                      },
                      maxSize: {
                        value: 496,
                        unit: 'PIXEL' as const,
                      },
                      pin: 'RIGHT' as const,
                      direction: 'HORIZONTAL' as const,
                      onCollapse: () => this.setState({ context: '' }),
                    },
                  },
                ]
              : []),
            {
              node: (
                <Bar
                  id="contexts-nav"
                  leftPartSlot={
                    <div className={layouts['stackbar--medium']}>
                      <Feature isActive={this.features.SCALE.isActive()}>
                        <Button
                          type="icon"
                          icon="adjust"
                          state={
                            this.state.context === 'SCALE'
                              ? 'selected'
                              : undefined
                          }
                          helper={{
                            label: this.props.t('contexts.scale'),
                          }}
                          action={() =>
                            this.setState({
                              context:
                                this.state.context === 'SCALE' ? '' : 'SCALE',
                            })
                          }
                        />
                      </Feature>
                      <Feature isActive={this.features.COLORS.isActive()}>
                        <Button
                          type="icon"
                          icon="colors"
                          state={
                            this.state.context === 'COLORS'
                              ? 'selected'
                              : undefined
                          }
                          helper={{
                            label: this.props.t('contexts.colors'),
                          }}
                          action={() =>
                            this.setState({
                              context:
                                this.state.context === 'COLORS' ? '' : 'COLORS',
                            })
                          }
                        />
                      </Feature>
                      <Feature isActive={this.features.THEMES.isActive()}>
                        <Button
                          id="tour-themes"
                          type="icon"
                          icon="theme"
                          state={
                            this.state.context === 'THEMES'
                              ? 'selected'
                              : undefined
                          }
                          helper={{
                            label: this.props.t('contexts.themes'),
                          }}
                          action={() =>
                            this.setState({
                              context:
                                this.state.context === 'THEMES' ? '' : 'THEMES',
                            })
                          }
                        />
                      </Feature>
                      <Feature isActive={this.features.IMPORTS.isActive()}>
                        <Button
                          type="icon"
                          icon="import"
                          state={
                            this.state.context === 'IMPORTS'
                              ? 'selected'
                              : undefined
                          }
                          helper={{
                            label: this.props.t('contexts.imports'),
                          }}
                          action={() =>
                            this.setState({
                              context:
                                this.state.context === 'IMPORTS'
                                  ? ''
                                  : 'IMPORTS',
                            })
                          }
                        />
                      </Feature>
                      <Feature isActive={this.features.SETTINGS.isActive()}>
                        <Button
                          type="icon"
                          icon="settings"
                          state={
                            this.state.context === 'SETTINGS'
                              ? 'selected'
                              : undefined
                          }
                          helper={{
                            label: this.props.t('contexts.settings'),
                          }}
                          action={() =>
                            this.setState({
                              context:
                                this.state.context === 'SETTINGS'
                                  ? ''
                                  : 'SETTINGS',
                            })
                          }
                        />
                      </Feature>
                      <Feature isActive={this.features.PUBLICATION.isActive()}>
                        <Button
                          id="tour-publication"
                          type="icon"
                          icon={this.publicationIcon()}
                          helper={{
                            label: this.publicationLabel(),
                          }}
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
                      </Feature>
                      <Button
                        type="icon"
                        icon="visible"
                        state={
                          this.state.context === '' ? 'selected' : undefined
                        }
                        helper={{
                          label: this.props.t('contexts.hide'),
                        }}
                        action={() =>
                          this.setState({
                            context: '',
                          })
                        }
                      />
                    </div>
                  }
                  rightPartSlot={<UndoRedoButtons />}
                  isVertical
                />
              ),
              typeModifier: ['FIXED', 'BLANK'],
              fixedWidth: 'var(--bar-min-height)',
            },
          ]}
          isFullHeight
          isFullWidth
        />
      </>
    )
  }
}
