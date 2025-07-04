import type { DropdownOption } from '@a_ng_d/figmug-ui'
import React from 'react'
import { PureComponent } from 'preact/compat'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
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
} from '@a_ng_d/utils-ui-color-palette'
import { Case, doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { doScale } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Dropdown,
  FormItem,
  layouts,
  texts,
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
import {
  trackActionEvent,
  trackSourceColorsManagementEvent,
} from '../../utils/eventsTracker'
import { ColorsMessage, ThemesMessage } from '../../types/messages'
import { SourceColorEvent } from '../../types/events'
import {
  BaseProps,
  Context,
  ContextItem,
  PlanStatus,
  Service,
} from '../../types/app'
import { defaultPreset } from '../../stores/presets'
import { $palette } from '../../stores/palette'
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
  export: ExportConfiguration
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
  selectedElement: {
    id: string
    position: number | null
  }
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
}

export default class EditPalette extends PureComponent<EditPaletteProps, EditPaletteStates> {
  private colorsMessage: ColorsMessage
  private themesMessage: ThemesMessage
  private contexts: Array<ContextItem>
  private themesRef: React.RefObject<Themes>
  private palette: typeof $palette
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service
  ) => ({
    THEMES: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES',
      planStatus: planStatus,
      currentService: service,
    }),
    ACTIONS: new FeatureStatus({
      features: config.features,
      featureName: 'ACTIONS',
      planStatus: planStatus,
      currentService: service,
    }),
    PREVIEW: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
      currentService: service,
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
      selectedElement: {
        id: '',
        position: null,
      },
      isPrimaryLoading: false,
      isSecondaryLoading: false,
    }
    this.themesRef = React.createRef()
    this.theme = document.documentElement.getAttribute('data-theme')
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
    const path = e.data.type === undefined ? e.data.pluginMessage : e.data

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

  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  switchThemeHandler = (e: Event) => {
    this.themesMessage.data = this.props.themes.map((theme) => {
      if ((e.target as HTMLElement).dataset.value === theme.id)
        theme.isEnabled = true
      else theme.isEnabled = false

      return theme
    })

    parent.postMessage({ pluginMessage: this.themesMessage }, '*')

    this.props.onChangeThemes({
      scale:
        this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ??
        doScale(defaultPreset.stops, defaultPreset.min, defaultPreset.max),
      themes: this.themesMessage.data,
      visionSimulationMode:
        this.themesMessage.data.find((theme) => theme.isEnabled)
          ?.visionSimulationMode ?? 'NONE',
      textColorsTheme: this.themesMessage.data.find((theme) => theme.isEnabled)
        ?.textColorsTheme ?? {
        lightColor: '#000000',
        darkColor: '#FFFFFF',
      },
      onGoingStep: 'themes changed',
    })
  }

  slideHandler = () =>
    this.props.onChangeScale({
      scale: this.palette.get().scale,
      preset: this.palette.get().preset,
      themes: this.props.themes.map((theme: ThemeConfiguration) => {
        if (theme.isEnabled) theme.scale = this.palette.get().scale
        return theme
      }),
      onGoingStep: 'scale changed',
    })

  shiftHandler = (feature?: string, state?: string, value?: number) => {
    const onReleaseStop = () => {
      setData()
      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: feature as SourceColorEvent['feature'],
        }
      )
    }

    const onChangeStop = () => {
      setData()
      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
    }

    const onTypeStopValue = () => {
      setData()
      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
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

      parent.postMessage(
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

      parent.postMessage(
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
        this.props.userIdentity.id,
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

      parent.postMessage(
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
        this.props.userIdentity.id,
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

      parent.postMessage(
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
        this.props.userIdentity.id,
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
      selectedElement: {
        id: '',
        position: null,
      },
      isPrimaryLoading: true,
    })

    parent.postMessage(
      { pluginMessage: { type: 'SYNC_LOCAL_STYLES', id: this.props.id } },
      '*'
    )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'SYNC_STYLES',
      }
    )
  }

  onSyncVariables = () => {
    this.setState({
      selectedElement: {
        id: '',
        position: null,
      },
      isPrimaryLoading: true,
    })

    parent.postMessage(
      { pluginMessage: { type: 'SYNC_LOCAL_VARIABLES', id: this.props.id } },
      '*'
    )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userIdentity.id,
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

    parent.postMessage(
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
      this.props.userIdentity.id,
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
    const blob = new Blob([this.props.export.data], {
      type: this.props.export.mimeType,
    })
    if (this.props.export.format === 'CSV') {
      const zip = new JSZip()
      this.props.export.data.forEach(
        (theme: {
          name: string
          type: string
          colors: Array<{ name: string; csv: string }>
        }) => {
          if (theme.type !== 'default theme') {
            const folder = zip.folder(theme.name) ?? zip
            theme.colors.forEach((color) => {
              folder.file(
                `${new Case(color.name).doSnakeCase()}.csv`,
                color.csv
              )
            })
          } else
            theme.colors.forEach((color) => {
              zip.file(`${new Case(color.name).doSnakeCase()}.csv`, color.csv)
            })
        }
      )
      zip
        .generateAsync({ type: 'blob' })
        .then((content: string | Blob) =>
          FileSaver.saveAs(
            content,
            this.props.name === ''
              ? new Case(this.props.locales.name).doSnakeCase()
              : new Case(this.props.name).doSnakeCase()
          )
        )
        .catch(() => this.props.locales.error.generic)
    } else if (this.props.export.format === 'TAILWIND')
      FileSaver.saveAs(blob, 'tailwind.config.js')
    else if (this.props.export.format === 'SWIFT')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.locales.name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.swift`
      )
    else if (this.props.export.format === 'KT')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(this.props.locales.name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.kt`
      )
    else
      FileSaver.saveAs(
        blob,
        this.props.name === ''
          ? new Case(this.props.locales.name).doSnakeCase()
          : new Case(this.props.name).doSnakeCase()
      )
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
          this.props.service
        ).THEMES.isActive(),
        isBlocked: EditPalette.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).THEMES.isBlocked(),
        isNew: EditPalette.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
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

  // Render
  render() {
    let fragment
    let isFlex = true

    switch (this.theme) {
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
            exportPreview={
              this.props.export.format === 'CSV'
                ? this.props.export.data[0].colors[0].csv
                : this.props.export.data
            }
            exportType={this.props.export.label}
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
              {this.props.editor.includes('dev') && (
                <span className={doClassnames([texts.type])}>
                  {this.props.name}
                </span>
              )}
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
              isActive={
                EditPalette.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service
                ).THEMES.isActive() && !this.props.editor.includes('dev')
              }
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
          isActive={
            EditPalette.features(
              this.props.planStatus,
              this.props.config,
              this.props.service
            ).PREVIEW.isActive() &&
            (this.state.context !== 'EXPORT' ||
              this.props.editor.includes('dev'))
          }
        >
          <Preview
            {...this.props}
            service="EDIT"
          />
        </Feature>
        <Feature
          isActive={EditPalette.features(
            this.props.planStatus,
            this.props.config,
            this.props.service
          ).ACTIONS.isActive()}
        >
          <Actions
            {...this.props}
            {...this.state}
            service={this.state.context === 'EXPORT' ? 'TRANSFER' : 'EDIT'}
            exportType={this.props.export.label}
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
