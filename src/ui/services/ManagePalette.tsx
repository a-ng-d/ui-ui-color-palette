import React from 'react'
import { PureComponent } from 'preact/compat'
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
import Publication from '../modules/modals/Publication'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppState } from '../App'
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
import { $palette, initializePaletteStore } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'
import OpenPalette from './OpenPalette'
import BrowsePalettes from './BrowsePalettes'

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
      sourceColors: [
        {
          name: props.t('colors.defaultName'),
          rgb: { r: 0.533, g: 0.921, b: 0.976 },
          source: 'DEFAULT',
          id: '00000000000',
          isRemovable: false,
        },
      ],
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

    this.setState({
      scale: doScale(
        this.state.preset.stops,
        this.state.preset.min,
        this.state.preset.max,
        this.state.preset.easing
      ),
    })
    this.palette.setKey(
      'scale',
      doScale(
        this.state.preset.stops,
        this.state.preset.min,
        this.state.preset.max,
        this.state.preset.easing
      )
    )

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

    try {
      const updateWhileEmptySelection = () => {
        this.setState({
          sourceColors: this.state.sourceColors.filter(
            (sourceColor: SourceColorConfiguration) =>
              sourceColor.source !== 'CANVAS'
          ),
          document: {},
        })
      }

      const updateWhileColorSelected = () => {
        this.setState({
          sourceColors: this.state.sourceColors
            .filter(
              (sourceColor: SourceColorConfiguration) =>
                sourceColor.source !== 'CANVAS'
            )
            .concat(path.data.selection),
          document: {},
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

    this.setState({
      subservice: 'BROWSE',
      id: '',
      sourceColors: this.state.sourceColors.filter(
        (sourceColor: SourceColorConfiguration) =>
          sourceColor.source === 'CANVAS' || sourceColor.source === 'DEFAULT'
      ),
      name: this.props.t('settings.global.name.default'),
      description: '',
      preset: preset,
      scale: scale,
      shift: {
        chroma: 100,
        hue: 0,
      },
      areSourceColorsLocked: false,
      colors: [],
      themes: [],
      colorSpace: 'LCH',
      visionSimulationMode: 'NONE',
      view: 'PALETTE_WITH_PROPERTIES',
      algorithmVersion: this.props.config.versions.algorithmVersion,
      textColorsTheme: {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
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
    })

    this.palette.setKey('name', this.props.t('settings.global.name.default'))
    this.palette.setKey('description', '')
    this.palette.setKey('preset', preset)
    this.palette.setKey('scale', scale)
    this.palette.setKey('shift', {
      chroma: 100,
      hue: 0,
    })
    this.palette.setKey('areSourceColorsLocked', false)
    this.palette.setKey('colorSpace', 'LCH')
    this.palette.setKey('visionSimulationMode', 'NONE')
    this.palette.setKey('view', 'PALETTE_WITH_PROPERTIES')
    this.palette.setKey('textColorsTheme', {
      lightColor: '#FFFFFF',
      darkColor: '#000000',
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

    this.palette.setKey('id', palette.meta.id)
    this.palette.setKey('name', palette.base.name)
    this.palette.setKey('description', palette.base.description)
    this.palette.setKey('preset', palette.base.preset)
    this.palette.setKey('scale', theme?.scale ?? {})
    this.palette.setKey('shift', palette.base.shift)
    this.palette.setKey(
      'areSourceColorsLocked',
      palette.base.areSourceColorsLocked
    )
    this.palette.setKey('colors', palette.base.colors)
    this.palette.setKey('colorSpace', palette.base.colorSpace)
    this.palette.setKey(
      'visionSimulationMode',
      theme?.visionSimulationMode ?? 'NONE'
    )
    this.palette.setKey('algorithmVersion', palette.base.algorithmVersion)
    this.palette.setKey(
      'textColorsTheme',
      theme?.textColorsTheme ?? {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      }
    )

    this.setState({
      subservice: 'OPEN',
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
      themes: palette.themes,
      view: (palette.base.view as ViewConfiguration) ?? 'PALETTE',
      algorithmVersion: palette.base.algorithmVersion,
      textColorsTheme: theme?.textColorsTheme ?? {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      dates: {
        createdAt: palette.meta.dates.createdAt,
        updatedAt: palette.meta.dates.updatedAt,
        publishedAt: palette.meta.dates.publishedAt,
        openedAt: palette.meta.dates.openedAt,
      },
      publicationStatus: {
        isPublished: palette.meta.publicationStatus.isPublished,
        isShared: palette.meta.publicationStatus.isShared,
      },
      creatorIdentity: {
        creatorId: palette.meta.creatorIdentity.creatorId,
        creatorFullName: palette.meta.creatorIdentity.creatorFullName,
        creatorAvatar: palette.meta.creatorIdentity.creatorAvatar,
      },
    })
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
              {...this.props}
              {...this.state}
              onChangeMode={(e) => this.setState({ ...e })}
              onChangeScale={(e) => this.setState({ ...e })}
              onChangePreset={(e) => this.setState({ ...e })}
              onChangeDistributionEasing={(e) => this.setState({ ...e })}
              onChangeColors={(e) => this.setState({ ...e })}
              onChangeThemes={(e) => this.setState({ ...e })}
              onChangeSettings={(e) => this.setState({ ...e })}
              onLockSourceColors={(e) => this.setState({ ...e })}
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
