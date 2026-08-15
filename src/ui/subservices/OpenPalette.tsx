import { PureComponent } from 'preact/compat'
import { createRef } from 'preact'
import { FeatureStatus } from '@unoff/utils'
import {
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  EasingConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  VisionSimulationModeConfiguration,
  ThemeConfiguration,
  DocumentConfiguration,
  ColorConfiguration,
  ViewConfiguration,
  DatesConfiguration,
  PublicationConfiguration,
  CreatorConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { ManagePaletteState } from '../services/ManagePalette'
import InspectPalette from '../modes/InspectPalette'
import ExportPalette from '../modes/ExportPalette'
import EditPalette from '../modes/EditPalette'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import {
  BaseProps,
  Context,
  PlanStatus,
  Service,
  Editor,
  Mode,
} from '../../types/app'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface OpenPaletteProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
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
  onChangeMode: Dispatch<Partial<ManagePaletteState>>
  onChangeDistributionEasing: Dispatch<Partial<ManagePaletteState>>
  onPublishPalette: Dispatch<Partial<ManagePaletteState>>
  onUnloadPalette: () => void
  onChangeDocument: Dispatch<Partial<ManagePaletteState>>
  onDeletePalette: () => void
  onResetPalette: () => void
}

export interface OpenPaletteState {
  mode: Mode
}

export default class OpenPalette extends PureComponent<
  OpenPaletteProps,
  OpenPaletteState
> {
  private palette: typeof $palette
  private modes: Array<Mode>
  private editPaletteRef = createRef<EditPalette>()
  private inspectPaletteRef = createRef<InspectPalette>()

  setMode = (mode: Mode) => this.setState({ mode })

  setEditContext = (context: Context | '') =>
    this.editPaletteRef.current?.setState({ context })

  setInspectContext = (context: Context | '') =>
    this.inspectPaletteRef.current?.setState({ context })

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
    EDIT: new FeatureStatus({
      features: config.features,
      featureName: 'EDIT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    INSPECT: new FeatureStatus({
      features: config.features,
      featureName: 'INSPECT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT',
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
    return OpenPalette.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: OpenPaletteProps) {
    super(props)
    this.palette = $palette
    this.modes = [
      ...(this.features.EDIT.isActive() ? ['EDIT' as Mode] : []),
      ...(this.features.INSPECT.isActive() ? ['INSPECT' as Mode] : []),
      ...(this.features.EXPORT.isActive() ? ['EXPORT' as Mode] : []),
    ]
    this.state = {
      mode: this.modes[0] || 'EDIT',
    }
  }

  // Renders
  render() {
    let fragment

    switch (this.state.mode) {
      case 'EDIT': {
        fragment = (
          <Feature isActive={this.features.EDIT.isActive()}>
            <EditPalette
              ref={this.editPaletteRef}
              {...this.props}
              {...this.state}
              onChangeMode={(e) => this.setState({ ...e })}
            />
          </Feature>
        )
        break
      }
      case 'INSPECT': {
        fragment = (
          <Feature isActive={this.features.INSPECT.isActive()}>
            <InspectPalette
              ref={this.inspectPaletteRef}
              {...this.props}
              {...this.state}
              onChangeMode={(e) => this.setState({ ...e })}
            />
          </Feature>
        )
        break
      }
      case 'EXPORT': {
        fragment = (
          <Feature isActive={this.features.EXPORT.isActive()}>
            <ExportPalette
              {...this.props}
              {...this.state}
              onChangeMode={(e) => this.setState({ ...e })}
            />
          </Feature>
        )
        break
      }
    }

    return fragment
  }
}
