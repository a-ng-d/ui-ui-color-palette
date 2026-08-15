import { PureComponent } from 'preact/compat'
import FileSaver from 'file-saver'
import * as fflate from 'fflate'
import {
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  ExportConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
  BaseConfiguration,
  Data,
  Code,
  PublicationConfiguration,
  CreatorConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { Case, FeatureStatus } from '@unoff/utils'
import { Layout } from '@unoff/ui'
import { OpenPaletteState } from '../subservices/OpenPalette'
import { ManagePaletteState } from '../services/ManagePalette'
import Actions from '../modules/Actions'
import Export from '../contexts/Export'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData } from '../../types/messages'
import { BaseProps, PlanStatus, Service, Editor, Mode } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface ExportPaletteProps
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
  onChangeMode: Dispatch<Partial<OpenPaletteState>>
  onChangeDistributionEasing: Dispatch<Partial<ManagePaletteState>>
  onPublishPalette: Dispatch<Partial<ManagePaletteState>>
  onUnloadPalette: () => void
  onChangeDocument: Dispatch<Partial<ManagePaletteState>>
  onDeletePalette: () => void
}

interface ExportPaletteState {
  export: ExportConfiguration
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
  isCodeCopied: boolean
}

export default class ExportPalette extends PureComponent<
  ExportPaletteProps,
  ExportPaletteState
> {
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
    EXPORT: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return ExportPalette.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ExportPaletteProps) {
    super(props)
    this.state = {
      export: {
        format: 'CSS',
        context: 'STYLESHEET_CSS',
        mimeType: 'text/css',
        data: new Code({
          paletteData: new Data({
            base: {
              name: this.props.name,
              description: this.props.description,
              preset: this.props.preset,
              shift: this.props.shift,
              areSourceColorsLocked: this.props.areSourceColorsLocked,
              colors: this.props.colors,
              colorSpace: this.props.colorSpace,
              algorithmVersion: this.props.algorithmVersion,
            } as BaseConfiguration,
            themes: this.props.themes,
          }).makePaletteData(),
        }).makeCssCustomProps('RGB')[0].content,
      },
      isPrimaryLoading: false,
      isSecondaryLoading: false,
      isCodeCopied: false,
    }
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
      STOP_LOADER: () =>
        this.setState({
          isPrimaryLoading: false,
          isSecondaryLoading: false,
        }),
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onExport = () => {
    const blob = new Blob([this.state.export.data], {
      type: this.state.export.mimeType,
    })
    if (this.state.export.mimeType === 'text/csv') {
      const zipEntries: Record<string, Uint8Array> = {}
      const encoder = new TextEncoder()

      JSON.parse(this.state.export.data).forEach(
        (theme: {
          name: string
          type: string
          colors: Array<{ name: string; csv: string }>
        }) => {
          if (theme.type !== 'default theme')
            theme.colors.forEach((color) => {
              const fileName = `${theme.name}/${new Case(color.name).doSnakeCase()}.csv`
              zipEntries[fileName] = encoder.encode(color.csv)
            })
          else
            theme.colors.forEach((color) => {
              const fileName = `${new Case(color.name).doSnakeCase()}.csv`
              zipEntries[fileName] = encoder.encode(color.csv)
            })
        }
      )

      const zipData = fflate.zipSync(zipEntries)
      const zipBlob = new Blob([new Uint8Array(zipData)], {
        type: 'application/zip',
      })

      FileSaver.saveAs(
        zipBlob,
        `${
          this.props.name === ''
            ? new Case(this.props.t('name')).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.zip`
      )
    } else if (this.state.export.context === 'TAILWIND_V3')
      FileSaver.saveAs(blob, 'tailwind.config.js')
    else if (this.state.export.context === 'TAILWIND_V4')
      FileSaver.saveAs(blob, 'tailwind.theme.css')
    else if (this.state.export.format === 'SWIFT')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.t('name')).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.swift`
      )
    else if (this.state.export.mimeType === 'text/x-kotlin')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.t('name')).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.kt`
      )
    else if (this.state.export.mimeType === 'text/x-scss')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.t('name')).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.scss`
      )
    else if (this.state.export.mimeType === 'text/x-less')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.t('name')).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.less`
      )
    else
      FileSaver.saveAs(
        blob,
        this.props.name === ''
          ? new Case(this.props.t('name')).doSnakeCase()
          : new Case(this.props.name).doSnakeCase()
      )
  }

  onCopyCode = () => {
    if (!this.state.export.data) return

    try {
      const textarea = document.createElement('textarea')
      textarea.value = this.state.export.data

      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      textarea.style.top = '0'
      textarea.setAttribute('readonly', '')

      document.body.appendChild(textarea)

      textarea.select()

      document.execCommand('copy')
      document.body.removeChild(textarea)

      this.setState({ isCodeCopied: true })
      setTimeout(() => {
        this.setState({ isCodeCopied: false })
      }, 2000)
    } catch (error) {
      console.error(error)
      sendPluginMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              style: 'WARNING',
              message: this.props.t('warning.uncopiedCode'),
            },
          },
        },
        '*'
      )
    }
  }

  // Render
  render() {
    return (
      <>
        <Feature isActive={this.features.ACTIONS.isActive()}>
          <Actions
            {...this.props}
            {...this.state}
            mode="EXPORT"
            format={this.state.export.format}
            onExportPalette={this.onExport}
          />
        </Feature>
        <Layout
          id="export-palette"
          column={[
            {
              node: (
                <Feature isActive={this.features.EXPORT.isActive()}>
                  <Export
                    {...this.props}
                    context={this.state.export.context}
                    code={this.state.export.data}
                    isCodeCopied={this.state.isCodeCopied}
                    onChangeExport={(exp) => {
                      this.setState({
                        export: exp.export,
                      })
                    }}
                    onCopyCode={this.onCopyCode}
                  />
                </Feature>
              ),
              typeModifier: 'BLANK',
            },
          ]}
          isFullHeight
          isFullWidth
        />
      </>
    )
  }
}
