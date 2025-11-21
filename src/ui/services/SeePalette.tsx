import type { DropdownOption } from '@a_ng_d/figmug-ui'
import React from 'react'
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
  ExportConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
  BaseConfiguration,
  Data,
  Code,
  PublicationConfiguration,
  CreatorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { Case, doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { doScale } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Dropdown,
  FormItem,
  layouts,
  Tabs,
} from '@a_ng_d/figmug-ui'
import Preview from '../modules/Preview'
import Actions from '../modules/Actions'
import Properties from '../contexts/Properties'
import Export from '../contexts/Export'
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
} from '../../types/app'
import { getDefaultPreset } from '../../stores/presets'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'
import type { AppStates } from '../App'

interface SeePaletteProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
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
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  dates: DatesConfiguration
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  onChangeThemes: React.Dispatch<Partial<AppStates>>
  onUnloadPalette: () => void
}

interface SeePaletteStates {
  context: Context | ''
  export: ExportConfiguration
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
}

export default class SeePalette extends PureComponent<
  SeePaletteProps,
  SeePaletteStates
> {
  private themesMessage: ThemesMessage
  private contexts: Array<ContextItem>
  private previewRef: React.RefObject<Preview>
  private palette: typeof $palette
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    THEMES: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
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

  constructor(props: SeePaletteProps) {
    super(props)
    this.palette = $palette
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      id: this.props.id,
      data: [],
    }
    this.contexts = setContexts(
      ['PROPERTIES', 'EXPORT'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service,
      props.t
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      export: {
        format: 'JSON',
        context: 'TOKENS_NATIVE',
        mimeType: 'application/json',
        data: new Code(
          new Data({
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
          }).makePaletteData()
        ).makeNativeTokens(),
      },
      isPrimaryLoading: false,
      isSecondaryLoading: false,
    }
    this.previewRef = React.createRef()
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  componentDidUpdate(previousProps: Readonly<SeePaletteProps>): void {
    if (previousProps.t !== this.props.t) {
      this.contexts = setContexts(
        ['PROPERTIES', 'EXPORT'],
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

  navHandler = (e: Event) => {
    const newContext = (e.currentTarget as HTMLElement).dataset
      .feature as Context

    this.setState({
      context: newContext,
    })

    if (newContext === 'EXPORT') this.forceCollapsePreview()
  }

  forceCollapsePreview = () => {
    if (this.previewRef.current) this.previewRef.current.forceCollapseDrawer()
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

    this.props.onChangeThemes({
      scale: newScale,
      themes: this.themesMessage.data,
      visionSimulationMode: newVisionSimulationMode,
      textColorsTheme: newTextColorsTheme,
      onGoingStep: 'themes changed',
    })
  }

  // Direct Actions
  onExport = () => {
    const blob = new Blob([this.state.export.data], {
      type: this.state.export.mimeType,
    })
    if (this.state.export.mimeType === 'text/csv') {
      const zipEntries: Record<string, Uint8Array> = {}
      const encoder = new TextEncoder()

      this.state.export.data.forEach(
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

      sendPluginMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              type: 'INFO',
              message: this.props.t('info.copiedCode'),
            },
          },
        },
        '*'
      )
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

  setThemes = (): Array<DropdownOption> => {
    const themes = this.workingThemes().map((theme) => {
      return {
        label: theme.name,
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

  onJumpToSourceColor = () => {
    this.setState({
      context: 'COLORS',
    })
  }

  // Render
  render() {
    let fragment
    let isFlex = true

    switch (this.theme) {
      case 'figma':
        isFlex = false
        break
      case 'penpot':
        isFlex = true
        break
      case 'sketch':
        isFlex = false
        break
      case 'framer':
        isFlex = true
        break
      default:
        isFlex = true
    }

    switch (this.state.context) {
      case 'PROPERTIES': {
        fragment = <Properties {...this.props} />
        break
      }
      case 'EXPORT': {
        fragment = (
          <Export
            {...this.props}
            context={this.state.export.context}
            code={this.state.export.data}
            onChangeExport={(exp) => {
              this.setState({
                export: exp.export,
              })
            }}
            onCopyCode={this.onCopyCode}
          />
        )
        break
      }
    }
    return (
      <>
        <Bar
          leftPartSlot={
            <div
              className={doClassnames([
                layouts['snackbar--tight'],
                isFlex && 'patch-2',
              ])}
            >
              <Button
                type="icon"
                icon="back"
                helper={{
                  label: this.props.t('contexts.back'),
                }}
                action={this.props.onUnloadPalette}
              />
              <Tabs
                tabs={this.contexts}
                active={this.state.context ?? ''}
                isFlex={isFlex}
                action={this.navHandler}
              />
            </div>
          }
          rightPartSlot={
            <Feature
              isActive={SeePalette.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).THEMES.isActive()}
            >
              <FormItem
                id="switch-theme"
                label={this.props.t('themes.switchTheme.label')}
                shouldFill={false}
              >
                <Dropdown
                  id="switch-theme"
                  options={this.setThemes()}
                  selected={
                    this.props.themes.find((theme) => theme.isEnabled)?.id
                  }
                  alignment="RIGHT"
                  pin="TOP"
                />
              </FormItem>
            </Feature>
          }
          border={['BOTTOM']}
        />
        <section className="context">{fragment}</section>
        <Feature
          isActive={SeePalette.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).PREVIEW.isActive()}
        >
          <Preview
            {...this.props}
            ref={this.previewRef}
          />
        </Feature>
        <Feature
          isActive={
            SeePalette.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).ACTIONS.isActive() && this.state.context === 'EXPORT'
          }
        >
          <Actions
            {...this.props}
            {...this.state}
            service="SEE"
            format={this.state.export.format}
            onExportPalette={this.onExport}
          />
        </Feature>
      </>
    )
  }
}
