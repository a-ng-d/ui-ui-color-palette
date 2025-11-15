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
import Themes from '../contexts/Themes'
import Settings from '../contexts/Settings'
import Scale from '../contexts/Scale'
import Export from '../contexts/Export'
import Colors from '../contexts/Colors'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { setContexts } from '../../utils/setContexts'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  ColorsMessage,
  PluginMessageData,
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
} from '../../types/app'
import { defaultPreset } from '../../stores/presets'
import { $palette } from '../../stores/palette'
import {
  trackActionEvent,
  trackSourceColorsManagementEvent,
} from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { AppStates } from '../App'

interface EditPaletteProps extends BaseProps, WithConfigProps {
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
  onChangeScale: React.Dispatch<Partial<AppStates>>
  onChangePreset: React.Dispatch<Partial<AppStates>>
  onChangeDistributionEasing: React.Dispatch<Partial<AppStates>>
  onChangeColors: React.Dispatch<Partial<AppStates>>
  onChangeThemes: React.Dispatch<Partial<AppStates>>
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onPublishPalette: React.Dispatch<Partial<AppStates>>
  onLockSourceColors: React.Dispatch<Partial<AppStates>>
  onUnloadPalette: () => void
  onChangeDocument: React.Dispatch<Partial<AppStates>>
  onDeletePalette: () => void
}

interface EditPaletteStates {
  context: Context | ''
  export: ExportConfiguration
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
}

export default class EditPalette extends PureComponent<EditPaletteProps, EditPaletteStates> {
  private colorsMessage: ColorsMessage
  private themesMessage: ThemesMessage
  private contexts: Array<ContextItem>
  private themesRef: React.RefObject<Themes>
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
    this.contexts = setContexts(
      ['SCALE', 'COLORS', 'THEMES', 'EXPORT', 'SETTINGS'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service
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
    const newScale =
      activeTheme?.scale ??
      doScale(defaultPreset.stops, defaultPreset.min, defaultPreset.max)
    const newTextColorsTheme = activeTheme?.textColorsTheme ?? {
      lightColor: '#000000',
      darkColor: '#FFFFFF',
    }
    const newVisionSimulationMode = activeTheme?.visionSimulationMode ?? 'NONE'

    this.palette.setKey('scale', newScale)

    sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

    this.props.onChangeThemes({
      scale: newScale,
      themes: this.themesMessage.data,
      visionSimulationMode: newVisionSimulationMode,
      textColorsTheme: newTextColorsTheme,
      onGoingStep: 'themes changed',
    })
  }

  slideHandler = () => {
    this.props.onChangeScale({
      scale: this.palette.get().scale,
      preset: this.palette.get().preset,
      themes: this.props.themes.map((theme: ThemeConfiguration) => {
        if (theme.isEnabled) theme.scale = this.palette.get().scale
        return theme
      }),
      onGoingStep: 'scale changed',
    })
  }

  shiftHandler = (feature?: string, state?: string, value?: number) => {
    const onReleaseStop = () => {
      setData()
      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
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
      }

      this.palette.setKey('shift', shift)
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (feature === 'SHIFT_CHROMA' && !item.chroma.isLocked)
          item.chroma.shift = value ?? this.props.shift.chroma
        return item
      })

      this.props.onChangeColors({
        shift: shift,
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })
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
    }

    const generateSheet = () => {
      this.props.onChangeDocument({
        document: {
          ...this.props.document,
          view: 'SHEET',
        },
      })

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
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'GENERATE_SHEET',
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
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
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
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
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

  // Direct Actions
  onSyncStyles = () => {
    this.setState({
      isPrimaryLoading: true,
    })

    sendPluginMessage(
      { pluginMessage: { type: 'SYNC_LOCAL_STYLES', id: this.props.id } },
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
        feature: 'SYNC_VARIABLES',
      }
    )
  }

  onPublishPalette = () => {
    this.props.onPublishPalette({ modalContext: 'PUBLICATION' })
  }

  onChangeView = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
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
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
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
            ? new Case(this.props.locales.name).doSnakeCase()
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
            ? new Case(this.props.locales.name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.swift`
      )
    else if (this.state.export.mimeType === 'text/x-kotlin')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.locales.name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.kt`
      )
    else if (this.state.export.mimeType === 'text/x-scss')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.locales.name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.scss`
      )
    else if (this.state.export.mimeType === 'text/x-less')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.locales.name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.less`
      )
    else
      FileSaver.saveAs(
        blob,
        this.props.name === ''
          ? new Case(this.props.locales.name).doSnakeCase()
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
              message: this.props.locales.info.copiedCode,
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
              message: this.props.locales.warning.uncopiedCode,
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
    const actions: Array<DropdownOption> = [
      {
        type: 'SEPARATOR',
      },
      {
        label: this.props.locales.themes.callout.cta,
        feature: 'ADD_THEME',
        type: 'OPTION',
        isActive: EditPalette.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).THEMES.isActive(),
        isBlocked: EditPalette.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).THEMES.isBlocked(),
        isNew: EditPalette.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).THEMES.isNew(),
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
      case 'SCALE': {
        fragment = (
          <Scale
            {...this.props}
            service="EDIT"
            onChangeScale={this.slideHandler}
            onChangeShift={this.shiftHandler}
          />
        )
        break
      }
      case 'COLORS': {
        fragment = <Colors {...this.props} />
        break
      }
      case 'THEMES': {
        fragment = (
          <Themes
            {...this.props}
            ref={this.themesRef}
          />
        )
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
      case 'SETTINGS': {
        fragment = (
          <Settings
            {...this.props}
            service="EDIT"
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
                  label: this.props.locales.contexts.back,
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
              isActive={EditPalette.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).THEMES.isActive()}
            >
              <FormItem
                id="switch-theme"
                label={this.props.locales.themes.switchTheme.label}
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
          isActive={EditPalette.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).PREVIEW.isActive()}
        >
          <Preview
            {...this.props}
            service="EDIT"
            onInteractWithSourceColor={() => this.onJumpToSourceColor()}
            ref={this.previewRef}
          />
        </Feature>
        <Feature
          isActive={EditPalette.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).ACTIONS.isActive()}
        >
          <Actions
            {...this.props}
            {...this.state}
            service={this.state.context === 'EXPORT' ? 'SEE' : 'EDIT'}
            format={this.state.export.format}
            onSyncLocalStyles={this.onSyncStyles}
            onSyncLocalVariables={this.onSyncVariables}
            onPublishPalette={this.onPublishPalette}
            onGenerateDocument={this.documentHandler}
            onChangeView={this.onChangeView}
            onExportPalette={this.onExport}
          />
        </Feature>
      </>
    )
  }
}
