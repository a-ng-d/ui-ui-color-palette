import type { DropdownOption } from '@unoff/ui'
import React from 'react'
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
  HexModel,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
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
import ContrastReport from '../modules/preview/ContrastReport'
import Preview from '../modules/Preview'
import Actions from '../modules/Actions'
import Themes from '../contexts/Themes'
import Properties from '../contexts/Properties'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { setContexts } from '../../utils/setContexts'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData, ThemesMessage } from '../../types/messages'
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
import { ConfigContextType } from '../../config/ConfigContext'

interface EditPaletteProps
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
  onChangeMode: React.Dispatch<Partial<OpenPaletteState>>
  onChangeDistributionEasing: React.Dispatch<Partial<ManagePaletteState>>
  onPublishPalette: React.Dispatch<Partial<ManagePaletteState>>
  onUnloadPalette: () => void
  onChangeDocument: React.Dispatch<Partial<ManagePaletteState>>
  onDeletePalette: () => void
}

interface EditPaletteState {
  context: Context | ''
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
  shadeReport: {
    sourceColor: SourceColorConfiguration | ColorConfiguration
    scaleName: string
    actualBackground: HexModel
    lightForeground: HexModel
    darkForeground: HexModel
    colorIndex: number
    shadeIndex: number
  } | null
}

export default class EditPalette extends PureComponent<
  EditPaletteProps,
  EditPaletteState
> {
  private themesMessage: ThemesMessage
  private contexts: Array<ContextItem>
  private themesRef: React.RefObject<Themes>
  private previewRef: React.RefObject<Preview>
  private theme: string | null
  private palette: typeof $palette

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
    REPORT: new FeatureStatus({
      features: config.features,
      featureName: 'REPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PROPERTIES: new FeatureStatus({
      features: config.features,
      featureName: 'PROPERTIES',
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
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      id: this.props.id,
      data: [],
    }
    this.contexts = setContexts(
      ['PROPERTIES', 'REPORT'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service,
      props.t
    )
    this.palette = $palette
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      isPrimaryLoading: false,
      isSecondaryLoading: false,
      shadeReport: null,
    }
    this.themesRef = React.createRef()
    this.previewRef = React.createRef()
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )

    if (this.state.context === 'REPORT')
      this.previewRef.current?.openShadeAt(0, 0)
  }

  componentDidUpdate(previousProps: Readonly<EditPaletteProps>): void {
    if (previousProps.t !== this.props.t) {
      this.contexts = setContexts(
        ['PROPERTIES', 'REPORT'],
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

    return themes
  }

  workingThemes = () => {
    if (this.props.themes.length > 1)
      return this.props.themes.filter((theme) => theme.type === 'custom theme')
    else
      return this.props.themes.filter((theme) => theme.type === 'default theme')
  }

  onShadeReportOpen = (data: {
    sourceColor: SourceColorConfiguration | ColorConfiguration
    scaleName: string
    actualBackground: HexModel
    lightForeground: HexModel
    darkForeground: HexModel
    colorIndex: number
    shadeIndex: number
  }) => {
    this.setState({
      context: 'REPORT',
      shadeReport: data,
    })
  }

  onNavigatePrevious = () => {
    if (!this.state.shadeReport) return
    this.previewRef.current?.navigateShadeReport(
      'previous',
      this.state.shadeReport.colorIndex,
      this.state.shadeReport.shadeIndex
    )
  }

  onNavigateNext = () => {
    if (!this.state.shadeReport) return
    this.previewRef.current?.navigateShadeReport(
      'next',
      this.state.shadeReport.colorIndex,
      this.state.shadeReport.shadeIndex
    )
  }

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'PROPERTIES': {
        fragment = (
          <Feature isActive={this.features.PROPERTIES.isActive()}>
            <Properties {...this.props} />
          </Feature>
        )
        break
      }
      case 'REPORT': {
        fragment = (
          <Feature isActive={this.features.REPORT.isActive()}>
            {this.state.shadeReport && (
              <ContrastReport
                {...this.props}
                sourceColor={this.state.shadeReport.sourceColor}
                scaleName={this.state.shadeReport.scaleName}
                actualBackground={this.state.shadeReport.actualBackground}
                lightForeground={this.state.shadeReport.lightForeground}
                darkForeground={this.state.shadeReport.darkForeground}
                onPrevious={this.onNavigatePrevious}
                onNext={this.onNavigateNext}
              />
            )}
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
            mode="INSPECT"
          />
        </Feature>
        <Layout
          id="inspect-palette"
          column={[
            {
              node: (
                <Feature isActive={this.features.PREVIEW.isActive()}>
                  <Preview
                    {...this.props}
                    selectedShade={
                      this.state.context === 'REPORT'
                        ? this.state.shadeReport
                        : null
                    }
                    themeOptions={this.setThemes()}
                    onShadeReportOpen={this.onShadeReportOpen}
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
                      <Feature isActive={this.features.PROPERTIES.isActive()}>
                        <Button
                          type="icon"
                          icon="list-detailed"
                          state={
                            this.state.context === 'PROPERTIES'
                              ? 'selected'
                              : undefined
                          }
                          helper={{
                            label: this.props.t('contexts.properties'),
                          }}
                          action={() =>
                            this.setState({
                              context:
                                this.state.context === 'PROPERTIES'
                                  ? ''
                                  : 'PROPERTIES',
                            })
                          }
                        />
                      </Feature>
                      <Feature isActive={this.features.REPORT.isActive()}>
                        <Button
                          id="tour-report"
                          type="icon"
                          icon="contrast"
                          state={
                            this.state.context === 'REPORT'
                              ? 'selected'
                              : undefined
                          }
                          helper={{
                            label: this.props.t('contexts.report'),
                          }}
                          action={() => {
                            this.setState({
                              context:
                                this.state.context === 'REPORT' ? '' : 'REPORT',
                            })
                            if (!this.state.shadeReport)
                              this.previewRef.current?.openShadeAt(0, 0)
                          }}
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
