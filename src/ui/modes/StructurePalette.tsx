import { PureComponent } from 'preact/compat'
import {
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  SystemConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
  PublicationConfiguration,
  CreatorConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { Bar, Layout, Tabs } from '@unoff/ui'
import { OpenPaletteState } from '../subservices/OpenPalette'
import { ManagePaletteState } from '../services/ManagePalette'
import Actions from '../modules/Actions'
import Visualize from '../contexts/Visualize'
import Taxonomy from '../contexts/Taxonomy'
import Binding from '../contexts/Binding'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { setContexts } from '../../utils/setContexts'
import {
  BaseProps,
  Context,
  ContextItem,
  PlanStatus,
  Service,
  Editor,
  Mode,
} from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface StructurePaletteProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  mode: Mode
  id: string
  name: string
  description: string
  preset: PresetConfiguration
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
  system: SystemConfiguration
  onChangeMode: Dispatch<Partial<OpenPaletteState>>
  onChangeDistributionEasing: Dispatch<Partial<ManagePaletteState>>
  onPublishPalette: Dispatch<Partial<ManagePaletteState>>
  onUnloadPalette: () => void
  onChangeDocument: Dispatch<Partial<ManagePaletteState>>
  onDeletePalette: () => void
}

interface StructurePaletteState {
  context: Context
}

export default class StructurePalette extends PureComponent<
  StructurePaletteProps,
  StructurePaletteState
> {
  private contexts: Array<ContextItem>
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
    TAXONOMY: new FeatureStatus({
      features: config.features,
      featureName: 'TAXONOMY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    BINDING: new FeatureStatus({
      features: config.features,
      featureName: 'BINDING',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VISUALIZE: new FeatureStatus({
      features: config.features,
      featureName: 'VISUALIZE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return StructurePalette.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: StructurePaletteProps) {
    super(props)
    this.contexts = setContexts(
      ['TAXONOMY', 'BINDING', 'VISUALIZE'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service,
      props.t
    )
    this.state = {
      context:
        this.contexts[0] !== undefined ? this.contexts[0].id : 'TAXONOMY',
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidUpdate(previousProps: Readonly<StructurePaletteProps>): void {
    if (previousProps.t !== this.props.t) {
      this.contexts = setContexts(
        ['TAXONOMY', 'BINDING', 'VISUALIZE'],
        this.props.planStatus,
        this.props.config.features,
        this.props.editor,
        this.props.service,
        this.props.t
      )

      this.forceUpdate()
    }
  }

  // Handlers
  onSyncLocalSemantics = () => undefined

  navHandler = (e: Event) =>
    this.setState({
      context: (e.currentTarget as HTMLElement).dataset.feature as Context,
    })

  // Render
  render() {
    let fragment
    let isFlex = true
    let padding

    switch (this.theme) {
      case 'figma':
        isFlex = false
        padding = 'var(--size-null) var(--size-pos-xsmall)'
        break
      case 'penpot':
        isFlex = true
        padding = 'var(--size-null) var(--size-pos-xsmall)'
        break
      case 'sketch':
        isFlex = false
        padding = 'var(--size-null) var(--size-pos-xsmall)'
        break
      case 'framer':
        isFlex = true
        padding = 'var(--size-null) var(--size-pos-xsmall)'
        break
      default:
        isFlex = false
        padding = 'var(--size-null) var(--size-pos-xsmall)'
    }

    if (this.props.documentWidth > 460) padding = 'var(--size-null)'

    switch (this.state.context) {
      case 'TAXONOMY': {
        fragment = (
          <Feature isActive={this.features.TAXONOMY.isActive()}>
            <Taxonomy
              {...this.props}
              system={this.props.system}
            />
          </Feature>
        )
        break
      }
      case 'BINDING': {
        fragment = (
          <Feature isActive={this.features.BINDING.isActive()}>
            <Binding
              {...this.props}
              system={this.props.system}
            />
          </Feature>
        )
        break
      }
      case 'VISUALIZE': {
        fragment = (
          <Feature isActive={this.features.VISUALIZE.isActive()}>
            <Visualize
              {...this.props}
              system={this.props.system}
            />
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
            mode="STRUCTURE"
            onSyncLocalSemantics={this.onSyncLocalSemantics}
          />
        </Feature>
        <Layout
          id="structure-palette"
          column={[
            {
              node: (
                <div
                  style={{
                    padding: padding,
                  }}
                >
                  <Tabs
                    tabs={this.contexts}
                    active={this.state.context ?? ''}
                    direction="VERTICAL"
                    isFlex={isFlex}
                    maxVisibleTabs={3}
                    action={this.navHandler}
                  />
                </div>
              ),
              typeModifier: 'FIXED',
              fixedWidth: '148px',
            },
            {
              node: (
                <section
                  className="context"
                  style={{
                    overflow: 'hidden',
                    position: 'relative',
                    height: '100%',
                  }}
                >
                  {fragment}
                </section>
              ),
              typeModifier: 'BLANK',
            },
          ]}
          isFullHeight
          isFullWidth
          shouldReflow
        />
      </>
    )
  }
}
