import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  EasingConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  VisionSimulationModeConfiguration,
} from '@a_ng_d/utils-ui-color-palette/dist/types/configuration.types'
import {
  HexModel,
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Bar, Button, Tabs } from '@a_ng_d/figmug-ui'
import Preview from '../modules/Preview'
import Actions from '../modules/Actions'
import Source from '../contexts/Source'
import Settings from '../contexts/Settings'
import Scale from '../contexts/Scale'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { setContexts } from '../../utils/setContexts'
import { trackActionEvent } from '../../utils/eventsTracker'
import {
  BaseProps,
  Context,
  ContextItem,
  NamingConvention,
  PlanStatus,
  ThirdParty,
} from '../../types/app'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'
import type { AppStates } from '../App'

interface CreatePaletteProps extends BaseProps, WithConfigProps {
  sourceColors: Array<SourceColorConfiguration> | []
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  onChangeColorsFromImport: React.Dispatch<Partial<AppStates>>
  onChangeScale: React.Dispatch<Partial<AppStates>>
  onChangePreset: React.Dispatch<Partial<AppStates>>
  onChangeShift: React.Dispatch<Partial<AppStates>>
  onCustomPreset: React.Dispatch<Partial<AppStates>>
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onConfigureExternalSourceColors: React.Dispatch<Partial<AppStates>>
  onResetSourceColors: React.Dispatch<Partial<AppStates>>
  onLockSourceColors: React.Dispatch<Partial<AppStates>>
  onChangeDistributionEasing: React.Dispatch<Partial<AppStates>>
  onCancelPalette: () => void
  onSavedPalette: React.Dispatch<Partial<AppStates>>
}

interface CreatePaletteStates {
  context: Context | ''
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
}

export default class CreatePalette extends PureComponent<
  CreatePaletteProps,
  CreatePaletteStates
> {
  private contexts: Array<ContextItem>
  private palette: typeof $palette

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    ACTIONS: new FeatureStatus({
      features: config.features,
      featureName: 'ACTIONS',
      planStatus: planStatus,
    }),
    PREVIEW: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
    }),
  })

  constructor(props: CreatePaletteProps) {
    super(props)
    this.palette = $palette
    this.contexts = setContexts(
      ['SOURCE', 'SCALE', 'SETTINGS'],
      props.planStatus,
      props.config.features,
      props.editor
    )
    this.state = {
      context:
        this.contexts[0] !== undefined
          ? this.contexts[this.props.sourceColors.length === 0 ? 0 : 1].id
          : '',
      isPrimaryLoading: false,
      isSecondaryLoading: false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const actions: {
      [action: string]: () => void
    } = {
      STOP_LOADER: () => {
        this.setState({
          isPrimaryLoading: false,
          isSecondaryLoading: false,
        })
      },
      DEFAULT: () => null,
    }

    return actions[e.data.type ?? 'DEFAULT']?.()
  }

  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  colorsFromImportHandler = (
    sourceColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => {
    this.props.onChangeColorsFromImport({
      sourceColors: this.props.sourceColors
        .filter(
          (sourceColors: SourceColorConfiguration) =>
            sourceColors.source !== source
        )
        .concat(sourceColorsFromImport),
    })
  }

  resetSourceColorsHandler = () => {
    this.props.onResetSourceColors({
      sourceColors: this.props.sourceColors.filter(
        (sourceColors: SourceColorConfiguration) =>
          sourceColors.source === 'CANVAS'
      ),
    })
  }

  slideHandler = () =>
    this.props.onChangeScale({
      scale: this.palette.get().scale,
      onGoingStep: 'scale changed',
    })

  shiftHandler = () =>
    this.props.onChangeShift({
      shift: this.palette.get().shift,
      onGoingStep: 'shift changed',
    })

  // Direct Actions
  onCreatePalette = () => {
    this.setState({
      isPrimaryLoading: true,
    })

    parent.postMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE',
          data: {
            sourceColors: this.props.sourceColors,
            exchange: {
              ...this.palette.value,
            },
          },
        },
      },
      '*'
    )

    trackActionEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'CREATE_PALETTE',
        colors: this.props.sourceColors.length,
        stops: this.props.preset.stops.length,
      }
    )
  }

  onConfigureExternalSourceColors = (name: string, colors: Array<HexModel>) => {
    this.palette.setKey('name', name)
    this.setState({
      context: 'SOURCE',
    })
    this.props.onConfigureExternalSourceColors({
      name: name,
      sourceColors: colors.map((color, index) => {
        const gl = chroma(color).gl()
        return {
          name: `Color ${index + 1}`,
          description: '',
          rgb: {
            r: gl[0],
            g: gl[1],
            b: gl[2],
          },
          source: 'REMOTE',
          hue: {
            shift: 0,
            isLocked: false,
          },
          chroma: {
            shift: 100,
            isLocked: false,
          },
          id: uid(),
          isRemovable: false,
        }
      }),
    })
  }

  onCancelPalette = () => {
    this.props.onCancelPalette()
  }

  // Renders
  render() {
    let fragment
    const theme = document.documentElement.getAttribute('data-theme')
    let isFlex = true

    switch (theme) {
      case 'penpot':
        isFlex = true
        break
      case 'figma-ui3':
        isFlex = false
        break
      default:
        isFlex = true
    }

    switch (this.state.context) {
      case 'SOURCE': {
        fragment = (
          <Source
            {...this.props}
            onChangeColorsFromImport={this.colorsFromImportHandler}
          />
        )
        break
      }
      case 'SCALE': {
        fragment = (
          <Scale
            {...this.props}
            service="CREATE"
            onAddStop={this.props.onCustomPreset}
            onRemoveStop={this.props.onCustomPreset}
            onChangeScale={this.slideHandler}
            onChangeShift={this.shiftHandler}
          />
        )
        break
      }
      case 'SETTINGS': {
        fragment = (
          <Settings
            {...this.props}
            service="CREATE"
          />
        )
        break
      }
    }

    return (
      <>
        <Bar
          leftPartSlot={
            <Button
              type="icon"
              icon="back"
              action={this.onCancelPalette}
            />
          }
          rightPartSlot={
            <Tabs
              tabs={this.contexts}
              active={this.state.context ?? ''}
              isFlex={isFlex}
              action={this.navHandler}
            />
          }
          isInverted
        />
        <section className="context">{fragment}</section>
        <Feature
          isActive={
            CreatePalette.features(
              this.props.planStatus,
              this.props.config
            ).PREVIEW.isActive() && this.props.sourceColors.length > 0
          }
        >
          <Preview
            {...this.props}
            service="CREATE"
            colors={this.props.sourceColors}
            onResetSourceColors={this.resetSourceColorsHandler}
          />
        </Feature>
        <Feature
          isActive={CreatePalette.features(
            this.props.planStatus,
            this.props.config
          ).ACTIONS.isActive()}
        >
          <Actions
            {...this.props}
            {...this.state}
            service="CREATE"
            scale={this.props.scale}
            onCreatePalette={this.onCreatePalette}
          />
        </Feature>
      </>
    )
  }
}
