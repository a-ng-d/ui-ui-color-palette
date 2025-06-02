import { Consent, ConsentConfiguration, Icon, layouts } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Component, createPortal } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../config/ConfigContext'
import { locals } from '../content/locals'
import { $palette } from '../stores/palette'
import {
  $canStylesDeepSync,
  $isAPCADisplayed,
  $isVsCodeMessageDisplayed,
  $isWCAGDisplayed,
  $userLanguage,
} from '../stores/preferences'
import { defaultPreset, presets } from '../stores/presets'
import {
  BaseProps,
  Easing,
  Editor,
  HighlightDigest,
  NamingConvention,
  PlanStatus,
  PriorityContext,
  Service,
  TrialStatus,
} from '../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  CreatorConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  ExportConfiguration,
  ExtractOfBaseConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  PublicationConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { UserSession } from '../types/user'
import { doScale } from '@a_ng_d/figmug-utils'
import {
  trackEditorEvent,
  trackExportEvent,
  trackPurchaseEvent,
  trackUserConsentEvent,
} from '../utils/eventsTracker'
import { userConsent } from '../utils/userConsent'
import Feature from './components/Feature'
import { WithConfig, WithConfigProps } from './components/WithConfig'
import PriorityContainer from './modules/PriorityContainer'
import Shortcuts from './modules/Shortcuts'
import BrowsePalettes from './services/BrowsePalettes'
import CreatePalette from './services/CreatePalette'
import EditPalette from './services/EditPalette'
import './stylesheets/app.css'
import { TextColorsThemeConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { NotificationMessage } from '../types/messages'
import { supabase } from '../index'

type AppProps = WithConfigProps

export interface AppStates extends BaseProps {
  service: Service
  sourceColors: Array<SourceColorConfiguration>
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
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
  export: ExportConfiguration
  palettesList: Array<ExtractOfBaseConfiguration>
  document: DocumentConfiguration
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  editor: Editor
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  priorityContainerContext: PriorityContext
  mustUserConsent: boolean
  highlight: HighlightDigest
  notification: NotificationMessage
  isLoaded: boolean
  onGoingStep: string
}

class App extends Component<AppProps, AppStates> {
  private palette: typeof $palette
  private subscribeLanguage: (() => void) | undefined

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    BROWSE: new FeatureStatus({
      features: config.features,
      featureName: 'BROWSE',
      planStatus: planStatus,
    }),
    CREATE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE',
      planStatus: planStatus,
    }),
    EDIT: new FeatureStatus({
      features: config.features,
      featureName: 'EDIT',
      planStatus: planStatus,
    }),
    CONSENT: new FeatureStatus({
      features: config.features,
      featureName: 'CONSENT',
      planStatus: planStatus,
    }),
    SHORTCUTS: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS',
      planStatus: planStatus,
    }),
  })

  constructor(props: AppProps) {
    super(props)
    this.palette = $palette
    this.state = {
      service: 'BROWSE',
      sourceColors: [],
      id: '',
      name: '',
      description: '',
      preset:
        presets.find((preset) => preset.id === 'MATERIAL') ?? defaultPreset,
      namingConvention: 'ONES',
      distributionEasing: 'LINEAR',
      scale: {},
      shift: {
        chroma: 100,
      },
      areSourceColorsLocked: false,
      colors: [],
      colorSpace: 'LCH',
      visionSimulationMode: 'NONE',
      themes: [],
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
      },
      export: {
        format: 'JSON',
        context: 'TOKENS_TOKENS_STUDIO',
        label: '',
        colorSpace: 'HEX',
        mimeType: 'application/json',
        data: '',
      },
      palettesList: [],
      document: {},
      planStatus: 'UNPAID',
      trialStatus: 'UNUSED',
      editor: props.config.env.editor,
      trialRemainingTime: this.props.config.plan.trialTime,
      publicationStatus: {
        isPublished: false,
        isShared: false,
      },
      creatorIdentity: {
        creatorId: '',
        creatorFullName: '',
        creatorAvatar: '',
      },
      priorityContainerContext: 'EMPTY',
      locals: {},
      lang: $userLanguage.get(),
      userSession: {
        connectionStatus: 'UNCONNECTED',
        userId: '',
        userFullName: '',
        userAvatar: '',
        accessToken: undefined,
        refreshToken: undefined,
      },
      userConsent: userConsent,
      userIdentity: {
        id: '',
        fullName: '',
        avatar: '',
      },
      mustUserConsent: true,
      highlight: {
        version: '',
        status: 'NO_HIGHLIGHT',
      },
      notification: {
        type: undefined,
        message: '',
      },
      isLoaded: false,
      onGoingStep: '',
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    this.subscribeLanguage = $userLanguage.subscribe(async (value) => {
      this.setState({
        lang: value,
        locals: locals.set(value),
      })

      parent.postMessage({
        pluginMessage: {
          type: 'UPDATE_LANGUAGE',
          data: {
            lang: value,
          },
        },
      })
    })

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

    // Locals
    this.setState({
      locals: locals.get(),
      name: locals.get().settings.global.name.default,
    })

    // Announcements
    fetch(
      `${this.props.config.urls.announcementsWorkerUrl}/?action=get_version&database_id=${this.props.config.env.announcementsDbId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'The database is not found') {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'CHECK_HIGHLIGHT_STATUS',
                data: {
                  version: data.version,
                },
              },
            },
            '*'
          )
          this.setState({
            highlight: {
              version: data.version,
              status: 'NO_HIGHLIGHT',
            },
          })
        }
      })
      .catch((error) => console.error(error))

    // Authentication
    if (supabase !== undefined)
      supabase.auth.onAuthStateChange((event, session) => {
        const actions: {
          [action: string]: () => void
        } = {
          SIGNED_IN: () => {
            this.setState({
              userSession: {
                connectionStatus: 'CONNECTED',
                userId: session?.user.id || '',
                userFullName: session?.user.user_metadata.full_name,
                userAvatar: session?.user.user_metadata.avatar_url,
                accessToken: session?.access_token,
                refreshToken: session?.refresh_token,
              },
            })
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'POST_MESSAGE',
                  data: {
                    type: 'SUCCESS',
                    message: this.state.locals.user.welcomeMessage.replace(
                      '{$1}',
                      session?.user.user_metadata.full_name
                    ),
                  },
                },
              },
              '*'
            )
          },
          TOKEN_REFRESHED: () => {
            this.setState({
              userSession: {
                connectionStatus: 'CONNECTED',
                userId: session?.user.id || '',
                userFullName: session?.user.user_metadata.full_name,
                userAvatar: session?.user.user_metadata.avatar_url,
                accessToken: session?.access_token,
                refreshToken: session?.refresh_token,
              },
            })
            parent.postMessage({
              pluginMessage: {
                type: 'SET_ITEMS',
                items: [
                  {
                    key: 'supabase_access_token',
                    value: session?.access_token,
                  },
                  {
                    key: 'supabase_refresh_token',
                    value: session?.refresh_token,
                  },
                ],
              },
            })
          },
        }
        // console.log(event, session)
        return actions[event]?.()
      })

    // Listener
    window.addEventListener('message', (e: MessageEvent) => {
      const path = e.data

      try {
        const setTheme = () => {
          document.documentElement.setAttribute(
            'data-mode',
            path.data.theme === 'light' ? 'penpot-light' : 'penpot-dark'
          )
        }

        const checkUserAuthentication = async () => {
          this.setState({
            userIdentity: {
              id: path.data.id,
              fullName: path.data.fullName,
              avatar: path.data.avatar,
            },
          })
        }

        const checkUserConsent = () => {
          this.setState({
            mustUserConsent: path.data.mustUserConsent,
            userConsent: path.data.userConsent,
          })
        }

        const checkUserPreferences = () => {
          setTimeout(() => this.setState({ isLoaded: true }), 1000)
          $isWCAGDisplayed.set(path.data.isWCAGDisplayed)
          $isAPCADisplayed.set(path.data.isAPCADisplayed)
          $canStylesDeepSync.set(path.data.canDeepSyncStyles)
          $isVsCodeMessageDisplayed.set(path.data.isVsCodeMessageDisplayed)
          $userLanguage.set(path.data.userLanguage)
        }

        const checkEditor = () => {
          this.setState({ editor: path.data.editor })
          setTimeout(
            () =>
              trackEditorEvent(
                path.data.id,
                this.state.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                {
                  editor: path.data.editor,
                }
              ),
            1000
          )
        }

        const checkPlanStatus = () =>
          this.setState({
            planStatus: path.data.planStatus,
            trialStatus: path.data.trialStatus,
            trialRemainingTime: path.data.trialRemainingTime,
          })

        const postMessage = () =>
          this.setState({
            priorityContainerContext: 'NOTIFICATION',
            notification: {
              type: path.data.type,
              message: path.data.message,
            },
          })

        const handleHighlight = () => {
          this.setState({
            priorityContainerContext:
              path.data.status !== 'DISPLAY_HIGHLIGHT_DIALOG'
                ? 'EMPTY'
                : 'HIGHLIGHT',
            highlight: {
              version: this.state.highlight.version,
              status: path.data.status,
            },
          })
        }

        const handleOnboarding = () => {
          this.setState({
            priorityContainerContext:
              path.data.status !== 'DISPLAY_ONBOARDING_DIALOG'
                ? 'EMPTY'
                : 'ONBOARDING',
          })
        }

        const updateWhileEmptySelection = () => {
          this.setState({
            sourceColors: this.state.sourceColors.filter(
              (sourceColor: SourceColorConfiguration) =>
                sourceColor.source !== 'CANVAS'
            ),
            document: {},
            onGoingStep: 'selection empty',
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
            onGoingStep: 'colors selected',
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

        const loadPalette = () => {
          const theme: ThemeConfiguration = path.data.themes.find(
            (theme: ThemeConfiguration) => theme.isEnabled
          )

          this.palette.setKey('id', path.data.meta.id)
          this.palette.setKey('name', path.data.base.name)
          this.palette.setKey('description', path.data.base.description)
          this.palette.setKey('preset', path.data.base.preset)
          this.palette.setKey('scale', theme?.scale)
          this.palette.setKey('shift', path.data.base.shift)
          this.palette.setKey(
            'areSourceColorsLocked',
            path.data.base.areSourceColorsLocked
          )
          this.palette.setKey('colors', path.data.base.colors)
          this.palette.setKey('colorSpace', path.data.base.colorSpace)
          this.palette.setKey(
            'visionSimulationMode',
            theme?.visionSimulationMode ?? 'NONE'
          )
          this.palette.setKey(
            'algorithmVersion',
            path.data.base.algorithmVersion
          )
          this.palette.setKey(
            'textColorsTheme',
            theme?.textColorsTheme ?? {
              lightColor: '#FFFFFF',
              darkColor: '#000000',
            }
          )

          parent.postMessage(
            {
              pluginMessage: {
                type: 'EXPORT_PALETTE',
                id: path.data.meta.id,
                export: this.state.export.context,
                colorSpace: this.state.export.colorSpace,
              },
            },
            '*'
          )

          this.setState({
            service: 'EDIT',
            id: path.data.meta.id,
            name: path.data.base.name,
            description: path.data.base.description,
            preset: path.data.base.preset,
            scale: theme?.scale,
            shift: path.data.base.shift,
            areSourceColorsLocked: path.data.base.areSourceColorsLocked,
            colors: path.data.base.colors,
            colorSpace: path.data.base.colorSpace,
            visionSimulationMode: theme?.visionSimulationMode ?? 'NONE',
            themes: path.data.themes,
            view: path.data.base.view,
            algorithmVersion: path.data.base.algorithmVersion,
            textColorsTheme: theme?.textColorsTheme ?? {
              lightColor: '#FFFFFF',
              darkColor: '#000000',
            },
            dates: {
              createdAt: path.data.meta.dates.createdAt,
              updatedAt: path.data.meta.dates.updatedAt,
              publishedAt: path.data.meta.dates.publishedAt,
            },
            publicationStatus: {
              isPublished: path.data.meta.publicationStatus.isPublished,
              isShared: path.data.meta.publicationStatus.isShared,
            },
            creatorIdentity: {
              creatorId: path.data.meta.creatorIdentity.creatorId,
              creatorFullName: path.data.meta.creatorIdentity.creatorFullName,
              creatorAvatar: path.data.meta.creatorIdentity.creatorAvatar,
            },
            onGoingStep: 'palette loaded',
          })
        }

        const exportPaletteToJson = () => {
          this.setState({
            export: {
              format: 'JSON',
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.tokens.label
              }`,
              colorSpace: path.data.colorSpace,
              mimeType: 'application/json',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          if (path.data.context !== 'TOKENS_GLOBAL')
            trackExportEvent(
              path.data.id,
              this.state.userConsent.find(
                (consent) => consent.id === 'mixpanel'
              )?.isConsented ?? false,
              {
                feature: path.data.context,
              }
            )
        }

        const exportPaletteToCss = () => {
          this.setState({
            export: {
              format: 'CSS',
              colorSpace: path.data.colorSpace,
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.css.customProperties
              }`,
              mimeType: 'text/css',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
              colorSpace: path.data.colorSpace,
            }
          )
        }

        const exportPaletteToTaiwind = () => {
          this.setState({
            export: {
              format: 'TAILWIND',
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.tailwind.config
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/javascript',
              data: `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(
                path.data.code,
                null,
                '  '
              )}`,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToSwiftUI = () => {
          this.setState({
            export: {
              format: 'SWIFT',
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.apple.swiftui
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/swift',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToUIKit = () => {
          this.setState({
            export: {
              format: 'SWIFT',
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.apple.uikit
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/swift',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToKt = () => {
          this.setState({
            export: {
              format: 'KT',
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.android.compose
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/x-kotlin',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToXml = () => {
          this.setState({
            export: {
              format: 'XML',
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.android.resources
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/xml',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToCsv = () => {
          this.setState({
            export: {
              format: 'CSV',
              context: path.data.context,
              label: `${this.state.locals.actions.export} ${
                this.state.locals.export.csv.spreadsheet
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/csv',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const updatePaletteDate = (date: Date) =>
          this.setState({
            dates: {
              createdAt: this.state.dates['createdAt'],
              updatedAt: date,
              publishedAt: this.state.dates['publishedAt'],
            },
          })

        const getProPlan = () => {
          this.setState({
            planStatus: path.data.status,
            priorityContainerContext: 'WELCOME_TO_PRO',
          })
          trackPurchaseEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false
          )
        }

        const signOut = (data: UserSession) =>
          this.setState({
            userSession: data,
          })

        const actions: {
          [action: string]: () => void
        } = {
          SET_THEME: () => setTheme(),
          CHECK_USER_AUTHENTICATION: () => checkUserAuthentication(),
          CHECK_USER_CONSENT: () => checkUserConsent(),
          CHECK_USER_PREFERENCES: () => checkUserPreferences(),
          CHECK_EDITOR: () => checkEditor(),
          CHECK_PLAN_STATUS: () => checkPlanStatus(),
          POST_MESSAGE: () => postMessage(),
          PUSH_HIGHLIGHT_STATUS: () => handleHighlight(),
          PUSH_ONBOARDING_STATUS: () => handleOnboarding(),
          EMPTY_SELECTION: () => updateWhileEmptySelection(),
          COLOR_SELECTED: () => updateWhileColorSelected(),
          DOCUMENT_SELECTED: () => updateWhileDocumentSelected(),
          LOAD_PALETTE: () => loadPalette(),
          EXPORT_PALETTE_JSON: () => exportPaletteToJson(),
          EXPORT_PALETTE_CSS: () => exportPaletteToCss(),
          EXPORT_PALETTE_TAILWIND: () => exportPaletteToTaiwind(),
          EXPORT_PALETTE_SWIFTUI: () => exportPaletteToSwiftUI(),
          EXPORT_PALETTE_UIKIT: () => exportPaletteToUIKit(),
          EXPORT_PALETTE_KT: () => exportPaletteToKt(),
          EXPORT_PALETTE_XML: () => exportPaletteToXml(),
          EXPORT_PALETTE_CSV: () => exportPaletteToCsv(),
          UPDATE_PALETTE_DATE: () => updatePaletteDate(path?.data),
          GET_PRO_PLAN: () => getProPlan(),
          SIGN_OUT: () => signOut(path?.data),
          DEFAULT: () => null,
        }

        return actions[path.type ?? 'DEFAULT']?.()
      } catch (error) {
        console.error(error)
      }
    })
  }

  componentWillUnmount = () => {
    if (this.subscribeLanguage) this.subscribeLanguage()
  }

  // Handlers
  userConsentHandler = (e: Array<ConsentConfiguration>) => {
    this.setState({
      userConsent: e,
      mustUserConsent: false,
    })
    parent.postMessage(
      {
        pluginMessage: {
          type: 'SET_ITEMS',
          items: [
            {
              key: 'mixpanel_user_consent',
              value: e.find((consent) => consent.id === 'mixpanel')
                ?.isConsented,
            },
            {
              key: 'user_consent_version',
              value: this.props.config.versions.userConsentVersion,
            },
          ],
        },
      },
      '*'
    )
    parent.postMessage(
      {
        pluginMessage: {
          type: 'CHECK_USER_CONSENT',
        },
      },
      '*'
    )
    trackUserConsentEvent(e)
  }

  onReset = () => {
    const preset =
      presets.find((preset) => preset.id === 'MATERIAL') ?? defaultPreset
    const scale = doScale(preset.stops, preset.min, preset.max, preset.easing)

    this.setState({
      service: 'BROWSE',
      id: '',
      name: this.state.locals.settings.global.name.default,
      description: '',
      preset: preset,
      scale: scale,
      shift: {
        chroma: 100,
      },
      areSourceColorsLocked: false,
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

    this.palette.setKey('name', this.state.locals.settings.global.name.default)
    this.palette.setKey('description', '')
    this.palette.setKey('preset', preset)
    this.palette.setKey('scale', scale)
    this.palette.setKey('shift', {
      chroma: 100,
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

  // Render
  render() {
    if (this.state.isLoaded)
      return (
        <main className="ui">
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config
              ).BROWSE.isActive() && this.state.service === 'BROWSE'
            }
          >
            <BrowsePalettes
              {...this.props}
              {...this.state}
              onCreatePalette={(e) => this.setState({ ...e })}
            />
          </Feature>
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config
              ).CREATE.isActive() && this.state.service === 'CREATE'
            }
          >
            <CreatePalette
              {...this.props}
              {...this.state}
              onChangeColorsFromImport={(e) => this.setState({ ...e })}
              onResetSourceColors={(e) => this.setState({ ...e })}
              onLockSourceColors={(e) => this.setState({ ...e })}
              onChangeScale={(e) => this.setState({ ...e })}
              onChangeShift={(e) => this.setState({ ...e })}
              onChangePreset={(e) => this.setState({ ...e })}
              onCustomPreset={(e) => this.setState({ ...e })}
              onChangeSettings={(e) => this.setState({ ...e })}
              onConfigureExternalSourceColors={(e) => this.setState({ ...e })}
              onGetProPlan={(e) => this.setState({ ...e })}
              onCancelPalette={this.onReset}
              onSavedPalette={(e) => this.setState({ ...e })}
            />
          </Feature>
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config
              ).EDIT.isActive() && this.state.service === 'EDIT'
            }
          >
            <EditPalette
              {...this.props}
              {...this.state}
              onChangeScale={(e) => this.setState({ ...e })}
              onChangeStop={(e) => this.setState({ ...e })}
              onChangeDistributionEasing={(e) => this.setState({ ...e })}
              onChangeColors={(e) => this.setState({ ...e })}
              onChangeThemes={(e) => this.setState({ ...e })}
              onChangeSettings={(e) => this.setState({ ...e })}
              onPublishPalette={() =>
                this.setState({ priorityContainerContext: 'PUBLICATION' })
              }
              onLockSourceColors={(e) => this.setState({ ...e })}
              onGetProPlan={(e) => this.setState({ ...e })}
              onUnloadPalette={this.onReset}
              onChangeDocument={(e) => this.setState({ ...e })}
              onDeletePalette={this.onReset}
            />
          </Feature>
          <Feature isActive={this.state.priorityContainerContext !== 'EMPTY'}>
            {document.getElementById('modal') &&
              createPortal(
                <PriorityContainer
                  {...this.props}
                  {...this.state}
                  rawData={this.state}
                  context={this.state.priorityContainerContext}
                  onChangePublication={(e) => this.setState({ ...e })}
                  onClose={() =>
                    this.setState({
                      priorityContainerContext: 'EMPTY',
                      highlight: {
                        version: this.state.highlight.version,
                        status: 'NO_HIGHLIGHT',
                      },
                      notification: {
                        type: undefined,
                        message: '',
                      },
                    })
                  }
                />,
                document.getElementById('modal') ??
                  document.createElement('app')
              )}
          </Feature>
          <Feature
            isActive={
              this.state.mustUserConsent &&
              App.features(
                this.state.planStatus,
                this.props.config
              ).CONSENT.isActive()
            }
          >
            <Consent
              welcomeMessage={this.state.locals.user.cookies.welcome}
              vendorsMessage={this.state.locals.user.cookies.vendors}
              privacyPolicy={{
                label: this.state.locals.user.cookies.privacyPolicy,
                action: () =>
                  window.open(this.props.config.urls.privacyUrl, '_blank'),
              }}
              moreDetailsLabel={this.state.locals.user.cookies.customize}
              lessDetailsLabel={this.state.locals.user.cookies.back}
              consentActions={{
                consent: {
                  label: this.state.locals.user.cookies.consent,
                  action: this.userConsentHandler,
                },
                deny: {
                  label: this.state.locals.user.cookies.deny,
                  action: this.userConsentHandler,
                },
                save: {
                  label: this.state.locals.user.cookies.save,
                  action: this.userConsentHandler,
                },
              }}
              validVendor={{
                name: this.state.locals.vendors.functional.name,
                id: 'functional',
                icon: '',
                description: this.state.locals.vendors.functional.description,
                isConsented: true,
              }}
              vendorsList={this.state.userConsent}
            />
          </Feature>
          <Feature
            isActive={App.features(
              this.state.planStatus,
              this.props.config
            ).SHORTCUTS.isActive()}
          >
            <Shortcuts
              {...this.props}
              {...this.state}
              onReOpenHighlight={() =>
                this.setState({ priorityContainerContext: 'HIGHLIGHT' })
              }
              onReOpenOnboarding={() =>
                this.setState({ priorityContainerContext: 'ONBOARDING' })
              }
              onReOpenReport={() =>
                this.setState({ priorityContainerContext: 'REPORT' })
              }
              onReOpenStore={() =>
                this.setState({ priorityContainerContext: 'STORE' })
              }
              onReOpenAbout={() =>
                this.setState({ priorityContainerContext: 'ABOUT' })
              }
              onGetProPlan={() => {
                if (this.state.trialStatus === 'EXPIRED')
                  parent.postMessage(
                    { pluginMessage: { type: 'GET_PRO_PLAN' } },
                    '*'
                  )
                else this.setState({ priorityContainerContext: 'TRY' })
              }}
              onUpdateConsent={() => this.setState({ mustUserConsent: true })}
              onOpenPreferences={() =>
                this.setState({ priorityContainerContext: 'PREFERENCES' })
              }
            />
          </Feature>
        </main>
      )
    else
      return (
        <main className="ui">
          <div className={layouts.centered}>
            <Icon
              type="PICTO"
              iconName="spinner"
            />
          </div>
        </main>
      )
  }
}

export default WithConfig(App)
