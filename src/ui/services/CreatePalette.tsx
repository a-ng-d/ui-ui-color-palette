import { uid } from 'uid'
import React from 'react'
import { PureComponent, createPortal } from 'preact/compat'
import chroma from 'chroma-js'
import {
  HexModel,
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  EasingConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  VisionSimulationModeConfiguration,
  RgbModel,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Bar, Button, Dialog, Tabs, texts } from '@a_ng_d/figmug-ui'
import Preview from '../modules/Preview'
import Actions from '../modules/Actions'
import Source from '../contexts/Source'
import Settings from '../contexts/Settings'
import Scale from '../contexts/Scale'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { setContexts } from '../../utils/setContexts'
import { PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  Context,
  ContextItem,
  PlanStatus,
  Service,
  ThirdParty,
  Editor,
} from '../../types/app'
import { $palette } from '../../stores/palette'
import { trackActionEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { AppStates } from '../App'

interface CreatePaletteProps extends BaseProps, WithConfigProps {
  sourceColors: Array<SourceColorConfiguration> | []
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  onGoingStep: string
  onChangeDefaultColor: React.Dispatch<Partial<AppStates>>
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
  isLeaveDialogOpen: boolean
}

export default class CreatePalette extends PureComponent<
  CreatePaletteProps,
  CreatePaletteStates
> {
  private contexts: Array<ContextItem>
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
  })

  constructor(props: CreatePaletteProps) {
    super(props)
    this.palette = $palette
    this.contexts = setContexts(
      ['SCALE', 'SOURCE', 'SETTINGS'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      isPrimaryLoading: false,
      isSecondaryLoading: false,
      isLeaveDialogOpen: false,
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener(
      'pluginMessage',
      this.handleMessage as EventListener
    )
  }

  componentWillUnmount = () => {
    window.removeEventListener(
      'pluginMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

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

    return actions[path.type ?? 'DEFAULT']?.()
  }

  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  defaultColorHandler = (name: string, rgb: RgbModel) => {
    this.props.onChangeDefaultColor({
      sourceColors: this.props.sourceColors.map(
        (sourceColors: SourceColorConfiguration) => {
          if (sourceColors.source !== 'DEFAULT') return sourceColors
          return {
            ...sourceColors,
            name: name,
            rgb: rgb,
          }
        }
      ),
      onGoingStep: 'default color updated',
    })
  }

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
      onGoingStep: 'source colors imported',
    })
  }

  resetSourceColorsHandler = () => {
    this.props.onResetSourceColors({
      sourceColors: this.props.sourceColors.filter(
        (sourceColors: SourceColorConfiguration) =>
          sourceColors.source === 'CANVAS' || sourceColors.source === 'DEFAULT'
      ),
      onGoingStep: 'source colors reset',
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
            sourceColors: this.props.sourceColors.filter((sourceColor) => {
              if (this.props.sourceColors.length > 1)
                return sourceColor.source !== 'DEFAULT'
              return true
            }),
            exchange: {
              ...this.palette.value,
            },
          },
        },
      },
      '*'
    )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
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

  // Templates
  Modals = () => {
    return (
      <Feature isActive={this.state.isLeaveDialogOpen}>
        {document.getElementById('modal') &&
          createPortal(
            <Dialog
              title={this.props.locales.create.leavePaletteDialog.title}
              actions={{
                destructive: {
                  label: this.props.locales.create.leavePaletteDialog.leave,
                  feature: 'DELETE_PALETTE',
                  action: this.onCancelPalette,
                },
                secondary: {
                  label: this.props.locales.create.leavePaletteDialog.cancel,
                  action: () =>
                    this.setState({
                      isLeaveDialogOpen: false,
                    }),
                },
              }}
              onClose={() =>
                this.setState({
                  isLeaveDialogOpen: false,
                })
              }
            >
              <div className="dialog__text">
                <p className={texts.type}>
                  {this.props.locales.create.leavePaletteDialog.message.replace(
                    '{name}',
                    this.props.name
                  )}
                </p>
              </div>
            </Dialog>,
            document.getElementById('modal') ?? document.createElement('app')
          )}
      </Feature>
    )
  }

  // Renders
  render() {
    let fragment
    let isFlex = true

    switch (this.theme) {
      case 'figma-ui3':
        isFlex = false
        break
      case 'penpot':
        isFlex = true
        break
      case 'sketch':
        isFlex = false
        break
      default:
        isFlex = true
    }

    switch (this.state.context) {
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
      case 'SOURCE': {
        fragment = (
          <Source
            {...this.props}
            onChangeDefaultColor={this.defaultColorHandler}
            onChangeColorsFromImport={this.colorsFromImportHandler}
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
              helper={{
                label: this.props.locales.contexts.back,
              }}
              action={() =>
                this.props.onGoingStep === 'palette creation opened'
                  ? this.onCancelPalette()
                  : this.setState({
                      isLeaveDialogOpen: true,
                    })
              }
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
          border={['BOTTOM']}
          isInverted
        />
        <section className="context">{fragment}</section>
        <Feature
          isActive={
            CreatePalette.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
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
            this.props.config,
            this.props.service,
            this.props.editor
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
        <this.Modals />
      </>
    )
  }
}
