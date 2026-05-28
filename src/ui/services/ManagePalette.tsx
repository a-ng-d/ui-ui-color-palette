import { uid } from 'uid'
import 'driver.js/dist/driver.css'
import '../stylesheets/tour.css'
import { PureComponent } from 'preact/compat'
import { createRef } from 'preact'
import chroma from 'chroma-js'
import { doScale, FeatureStatus } from '@unoff/utils'
import {
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  VisionSimulationModeConfiguration,
  BaseConfiguration,
  ThemeConfiguration,
  MetaConfiguration,
  DocumentConfiguration,
  ColorConfiguration,
  ViewConfiguration,
  DatesConfiguration,
  PublicationConfiguration,
  CreatorConfiguration,
  ExtractOfBaseConfiguration,
  EasingConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import OpenPalette from '../subservices/OpenPalette'
import BrowsePalettes from '../subservices/BrowsePalettes'
import Publication from '../modules/modals/Publication'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppState } from '../App'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { getClosestColorName } from '../../utils/colorNameHelper'
import { PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  PlanStatus,
  Service,
  Editor,
  Subservice,
} from '../../types/app'
import {
  getDefaultPreset,
  getPresets,
  updatePresets,
} from '../../stores/presets'
import {
  $creatorIdentity,
  $dates,
  $palette,
  $publicationStatus,
  $themes,
  initializePaletteStore,
} from '../../stores/palette'
import { clearHistory, flush, suppressHistory } from '../../stores/history'
import startTour, {
  showNoPaletteNotice,
} from '../../external/onboarding/startTour'
import { ConfigContextType } from '../../config/ConfigContext'

interface ManagePaletteProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  appData: AppState
}

export interface ManagePaletteState {
  subservice: Subservice
  sourceColors: Array<SourceColorConfiguration>
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
  dates: DatesConfiguration
  palettesList: Array<ExtractOfBaseConfiguration>
  document: DocumentConfiguration
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  canBePublished: boolean
}

export default class ManagePalette extends PureComponent<
  ManagePaletteProps,
  ManagePaletteState
> {
  private palette: typeof $palette
  private theme: string | null
  private subscribePalette: Array<() => void> = []
  private openPaletteRef = createRef<OpenPalette>()

  private generateDefaultSourceColors = (): Array<SourceColorConfiguration> =>
    Array.from({ length: 5 }, () => {
      const hex = chroma.random().hex()
      const gl = chroma(hex).gl()
      return {
        name: getClosestColorName(hex),
        rgb: { r: gl[0], g: gl[1], b: gl[2] },
        source: 'DEFAULT' as const,
        id: uid(),
        isRemovable: false,
      }
    })

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    BROWSE: new FeatureStatus({
      features: config.features,
      featureName: 'BROWSE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    OPEN: new FeatureStatus({
      features: config.features,
      featureName: 'OPEN',
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
    COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return ManagePalette.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ManagePaletteProps) {
    super(props)
    this.palette = $palette
    this.state = {
      subservice: 'BROWSE',
      sourceColors: this.generateDefaultSourceColors(),
      id: '',
      name: props.t('settings.global.name.default'),
      description: '',
      preset: getDefaultPreset(props.t),
      distributionEasing: 'LINEAR',
      scale: {},
      shift: {
        chroma: 100,
        hue: 0,
      },
      areSourceColorsLocked: false,
      colors: [],
      colorSpace: 'LCH',
      visionSimulationMode: 'NONE',
      themes: [],
      view: 'PALETTE_WITH_PROPERTIES',
      algorithmVersion: props.config.versions.algorithmVersion,
      textColorsTheme: {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      palettesList: [],
      document: {},
      dates: {
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        openedAt: '',
      },
      publicationStatus: {
        isPublished: false,
        isShared: false,
      },
      creatorIdentity: {
        creatorId: '',
        creatorFullName: '',
        creatorAvatar: '',
      },
      canBePublished: false,
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = async () => {
    // Load
    initializePaletteStore()
    updatePresets(this.props.t)

    this.palette.setKey(
      'scale',
      doScale(
        this.state.preset.stops,
        this.state.preset.min,
        this.state.preset.max,
        this.state.preset.easing
      )
    )

    this.subscribePalette = [
      $palette.subscribe(() => {
        const p = $palette.get()
        this.setState({
          id: p.id as string,
          name: p.name,
          description: p.description,
          preset: p.preset,
          scale: p.scale,
          shift: p.shift,
          areSourceColorsLocked: p.areSourceColorsLocked,
          colors: [...(p.colors as ColorConfiguration[])],
          colorSpace: p.colorSpace,
          visionSimulationMode: p.visionSimulationMode,
          algorithmVersion: p.algorithmVersion,
          textColorsTheme: p.textColorsTheme,
          view: p.view as ViewConfiguration,
        })
      }),
      $themes.subscribe((themes) => this.setState({ themes: [...themes] })),
      $dates.subscribe((dates) => this.setState({ dates })),
      $publicationStatus.subscribe((publicationStatus) =>
        this.setState({ publicationStatus })
      ),
      $creatorIdentity.subscribe((creatorIdentity) =>
        this.setState({ creatorIdentity })
      ),
    ]

    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
    window.addEventListener('keydown', this.handleKeydown)
    sendPluginMessage(
      {
        pluginMessage: { type: 'OPEN_DOCUMENT' },
      },
      '*'
    )
  }

  componentWillUnmount = () => {
    if (this.subscribePalette)
      this.subscribePalette.forEach((unsubscribe) => unsubscribe())

    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
    window.removeEventListener('keydown', this.handleKeydown)
  }

  // Handlers
  handleKeydown = (e: KeyboardEvent) => {
    if (
      e.code !== 'Space' ||
      this.state.subservice !== 'BROWSE' ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return

    e.preventDefault()
    if (
      this.state.sourceColors.filter(
        (sourceColor: SourceColorConfiguration) =>
          sourceColor.source === 'CANVAS'
      ).length === 0
    )
      this.setState({
        sourceColors: [
          ...this.state.sourceColors.filter(
            (sourceColor: SourceColorConfiguration) =>
              sourceColor.source !== 'CANVAS' &&
              sourceColor.source !== 'DEFAULT'
          ),
          ...this.generateDefaultSourceColors(),
        ],
      })
  }

  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    try {
      const updateWhileEmptySelection = () => {
        this.setState({
          sourceColors: [
            ...this.state.sourceColors.filter(
              (sourceColor: SourceColorConfiguration) =>
                sourceColor.source !== 'CANVAS' &&
                sourceColor.source !== 'DEFAULT'
            ),
            ...this.generateDefaultSourceColors(),
          ],
          document: {},
        })
      }

      const updateWhileColorSelected = () => {
        const existingColors = this.state.sourceColors.filter(
          (sourceColor: SourceColorConfiguration) =>
            sourceColor.source !== 'CANVAS' && sourceColor.source !== 'DEFAULT'
        )
        const remaining =
          (this.features.COLORS.limit ?? path.data.selection.length) -
          existingColors.length

        this.setState({
          sourceColors: existingColors.concat(
            this.features.COLORS.isReached(existingColors.length)
              ? []
              : path.data.selection.slice(0, remaining)
          ),
        })
      }

      const updateWhileDocumentSelected = () => {
        this.setState({
          document: {
            view: path.data.view,
            id: path.data.id,
            isLinkedToPalette: path.data.isLinkedToPalette,
            updatedAt: path.data.updatedAt,
          },
        })
      }

      const updatePaletteDate = (date: Date) =>
        this.setState({
          dates: {
            createdAt: this.state.dates['createdAt'],
            updatedAt: date,
            publishedAt: this.state.dates['publishedAt'],
            openedAt: this.state.dates['openedAt'],
          },
        })

      const actions: {
        [action: string]: () => void
      } = {
        EMPTY_SELECTION: () => updateWhileEmptySelection(),
        COLOR_SELECTED: () => updateWhileColorSelected(),
        DOCUMENT_SELECTED: () => updateWhileDocumentSelected(),
        LOAD_PALETTE: () => this.onLoadPalette(path.data),
        RESET_PALETTE: () => this.onResetPalette(),
        UPDATE_PALETTE_DATE: () => updatePaletteDate(path?.data),
        DEFAULT: () => null,
      }

      return actions[path.type ?? 'DEFAULT']?.()
    } catch (error) {
      console.error(error)
      return
    }
  }

  onResetPalette = () => {
    const preset =
      getPresets(this.props.t).find(
        (preset) => preset.id === 'CUSTOM_10_100'
      ) ?? getDefaultPreset(this.props.t)
    const scale = doScale(preset.stops, preset.min, preset.max, preset.easing)

    suppressHistory(() => {
      this.palette.set({
        ...this.palette.get(),
        id: '',
        name: this.props.t('settings.global.name.default'),
        description: '',
        preset,
        scale,
        shift: { chroma: 100, hue: 0 },
        areSourceColorsLocked: false,
        colors: [],
        colorSpace: 'LCH',
        visionSimulationMode: 'NONE',
        view: 'PALETTE_WITH_PROPERTIES',
        algorithmVersion: this.props.config.versions.algorithmVersion,
        textColorsTheme: { lightColor: '#FFFFFF', darkColor: '#000000' },
      })
      $themes.set([])
      $dates.set({
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        openedAt: '',
      })
      $publicationStatus.set({ isPublished: false, isShared: false })
      $creatorIdentity.set({
        creatorId: '',
        creatorFullName: '',
        creatorAvatar: '',
      })
    })

    clearHistory()
    this.setState({ subservice: 'BROWSE' })
  }

  onStartTour = () => {
    if (this.state.subservice !== 'OPEN') {
      showNoPaletteNotice(this.props.t)
      return
    }

    const ref = this.openPaletteRef.current
    if (!ref) return

    startTour(this.props.t, this.props.editor, {
      setMode: (mode) => ref.setMode(mode),
      setEditContext: (context) => ref.setEditContext(context),
      setInspectContext: (context) => ref.setInspectContext(context),
    })
  }

  onLoadPalette = (palette: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }) => {
    const theme: ThemeConfiguration | undefined = palette.themes.find(
      (theme: ThemeConfiguration) => theme.isEnabled
    )
    const isNewPalette = palette.meta.id !== (this.palette.get().id as string)

    flush()

    suppressHistory(() => {
      this.palette.set({
        ...this.palette.get(),
        id: palette.meta.id,
        name: palette.base.name,
        description: palette.base.description,
        preset: palette.base.preset,
        scale: theme?.scale ?? {},
        shift: palette.base.shift,
        areSourceColorsLocked: palette.base.areSourceColorsLocked,
        colors: palette.base.colors,
        colorSpace: palette.base.colorSpace,
        visionSimulationMode: theme?.visionSimulationMode ?? 'NONE',
        algorithmVersion: palette.base.algorithmVersion,
        textColorsTheme: theme?.textColorsTheme ?? {
          lightColor: '#FFFFFF',
          darkColor: '#000000',
        },
        view: (palette.base.view as ViewConfiguration) ?? 'PALETTE',
      })
      if (isNewPalette) $themes.set(palette.themes)
      else {
        const current = $themes.get()
        $themes.set(
          palette.themes.map((t) => {
            if (t.isEnabled) return t
            return current.find((c) => c.id === t.id) ?? t
          })
        )
      }
      $dates.set({
        createdAt: palette.meta.dates.createdAt,
        updatedAt: palette.meta.dates.updatedAt,
        publishedAt: palette.meta.dates.publishedAt,
        openedAt: palette.meta.dates.openedAt,
      })
      $publicationStatus.set({
        isPublished: palette.meta.publicationStatus.isPublished,
        isShared: palette.meta.publicationStatus.isShared,
      })
      $creatorIdentity.set({
        creatorId: palette.meta.creatorIdentity.creatorId,
        creatorFullName: palette.meta.creatorIdentity.creatorFullName,
        creatorAvatar: palette.meta.creatorIdentity.creatorAvatar,
      })
    })

    if (isNewPalette) clearHistory()
    this.setState({ subservice: 'OPEN' })
  }

  // Renders
  render() {
    let fragment

    switch (this.state.subservice) {
      case 'BROWSE': {
        fragment = (
          <Feature isActive={this.features.BROWSE.isActive()}>
            <BrowsePalettes
              {...this.props}
              {...this.state}
              sourceColors={this.state.sourceColors}
              onCreatePalette={(e) => this.setState({ ...e })}
              onSeePalette={(palette) => this.onLoadPalette(palette)}
            />
          </Feature>
        )
        break
      }
      case 'OPEN': {
        fragment = (
          <Feature isActive={this.features.OPEN.isActive()}>
            <OpenPalette
              ref={this.openPaletteRef}
              {...this.props}
              {...this.state}
              onChangeMode={(e) => this.setState({ ...e })}
              onChangeDistributionEasing={(e) => this.setState({ ...e })}
              onUnloadPalette={this.onResetPalette}
              onChangeDocument={(e) => this.setState({ ...e })}
              onDeletePalette={this.onResetPalette}
              onPublishPalette={(e) => this.setState({ ...e })}
              onResetPalette={this.onResetPalette}
            />
          </Feature>
        )
        break
      }
    }

    return (
      <>
        {fragment}
        <Feature
          isActive={
            this.features.PUBLICATION.isActive() && this.state.canBePublished
          }
        >
          <Publication
            {...this.props}
            paletteData={this.state as ManagePaletteState}
            appData={this.props.appData}
            onChangePublication={(e) => this.setState({ ...e })}
            onClosePublication={() => this.setState({ canBePublished: false })}
          />
        </Feature>
      </>
    )
  }
}
