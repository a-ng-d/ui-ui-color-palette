import React from 'react'
import { Component, createPortal } from 'preact/compat'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  CreatorConfiguration,
  DocumentConfiguration,
  EasingConfiguration,
  ExtractOfBaseConfiguration,
  LockedSourceColorsConfiguration,
  PublicationConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
  DatesConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  ShiftConfiguration,
  BaseConfiguration,
  MetaConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus, doScale } from '@a_ng_d/figmug-utils'
import {
  Button,
  Consent,
  ConsentConfiguration,
  Icon,
  layouts,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import './stylesheets/app.css'
import { userConsent } from '../utils/userConsent'
import { sendPluginMessage } from '../utils/pluginMessage'
import { UserSession } from '../types/user'
import { NotificationMessage, PluginMessageData } from '../types/messages'
import {
  BaseProps,
  Editor,
  AnnouncementsDigest,
  PlanStatus,
  ModalContext,
  TrialStatus,
  Service,
  Plans,
} from '../types/app'
import { defaultPreset, presets } from '../stores/presets'
import {
  $canStylesDeepSync,
  $canVariablesDeepSync,
  $isAPCADisplayed,
  $isVsCodeMessageDisplayed,
  $isWCAGDisplayed,
  $userLanguage,
} from '../stores/preferences'
import { $palette } from '../stores/palette'
import {
  trackEditorEvent,
  trackPurchaseEvent,
  trackTrialEnablementEvent,
  trackUserConsentEvent,
} from '../external/tracking/eventsTracker'
import { setEditor } from '../external/tracking/client'
import validateUserLicenseKey from '../external/license/validateUserLicenseKey '
import checkAnnouncementsVersion from '../external/cms/checkAnnouncementsVersion'
import { getSupabase } from '../external/auth/client'
import checkConnectionStatus from '../external/auth/checkConnectionStatus'
import { ConfigContextType } from '../config/ConfigContext'
import SeePalette from './services/SeePalette'
import EditPalette from './services/EditPalette'
import CreatePalette from './services/CreatePalette'
import BrowsePalettes from './services/BrowsePalettes'
import Shortcuts from './modules/Shortcuts'
import Modal from './contexts/Modal'
import { WithConfig, WithConfigProps } from './components/WithConfig'
import Feature from './components/Feature'

type AppProps = WithConfigProps

export interface AppStates extends BaseProps {
  sourceColors: Array<SourceColorConfiguration>
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
  dates: DatesConfiguration
  palettesList: Array<ExtractOfBaseConfiguration>
  document: DocumentConfiguration
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  editor: Editor
  plans: Plans
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  modalContext: ModalContext
  mustUserConsent: boolean
  announcements: AnnouncementsDigest
  notification: NotificationMessage
  isVsCodeMessageDisplayed: boolean
  isLoaded: boolean
  isNotificationDisplayed: boolean
  onGoingStep: string
}

class App extends Component<AppProps, AppStates> {
  private palette: typeof $palette
  private subscribeLanguage: (() => void) | undefined
  private subsscribeVsCodeMessage: (() => void) | undefined

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    BACKSTAGE_AUTHENTICATION: new FeatureStatus({
      features: config.features,
      featureName: 'BACKSTAGE_AUTHENTICATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    BROWSE: new FeatureStatus({
      features: config.features,
      featureName: 'BROWSE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    CREATE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE',
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
    SEE: new FeatureStatus({
      features: config.features,
      featureName: 'SEE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    USER_CONSENT: new FeatureStatus({
      features: config.features,
      featureName: 'USER_CONSENT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SHORTCUTS: new FeatureStatus({
      features: config.features,
      featureName: 'SHORTCUTS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VSCODE_MESSAGE: new FeatureStatus({
      features: config.features,
      featureName: 'VSCODE_MESSAGE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: AppProps) {
    super(props)
    this.palette = $palette
    this.state = {
      service: 'BROWSE',
      sourceColors: [
        {
          name: props.config.locales.colors.defaultName,
          rgb: { r: 0.533, g: 0.921, b: 0.976 },
          source: 'DEFAULT',
          id: '00000000000',
          isRemovable: false,
        },
      ],
      id: '',
      name: props.config.locales.settings.global.name.default,
      description: '',
      preset:
        presets.find((preset) => preset.id === 'CUSTOM_10_100') ??
        defaultPreset,
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
      algorithmVersion: props.config.versions.algorithmVersion,
      textColorsTheme: {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      palettesList: [],
      document: {},
      dates: {
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        openedAt: '',
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
      userSession: {
        connectionStatus: 'UNCONNECTED',
        userId: '',
        userFullName: '',
        userAvatar: '',
      },
      userConsent: userConsent,
      userIdentity: {
        id: '',
        fullName: '',
        avatar: '',
      },
      planStatus: 'UNPAID',
      trialStatus: 'UNUSED',
      trialRemainingTime: props.config.plan.trialTime,
      editor: props.config.env.editor,
      plans: [],
      modalContext: 'EMPTY',
      locales: props.config.locales,
      lang: $userLanguage.get(),
      mustUserConsent: true,
      announcements: {
        version: '',
        status: 'NO_ANNOUNCEMENTS',
      },
      notification: {
        type: 'INFO',
        message: '',
        timer: 5000,
      },
      isVsCodeMessageDisplayed: true,
      isLoaded: false,
      isNotificationDisplayed: false,
      onGoingStep: 'app started',
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    this.subscribeLanguage = $userLanguage.subscribe(async (value) => {
      this.setState({
        lang: value,
      })

      sendPluginMessage({
        pluginMessage: {
          type: 'UPDATE_LANGUAGE',
          data: {
            lang: value,
          },
        },
      }),
        '*'
    })

    this.subsscribeVsCodeMessage = $isVsCodeMessageDisplayed.subscribe(
      (value) => {
        this.setState({
          isVsCodeMessageDisplayed: value,
        })
      }
    )

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

    // Authentication
    if (
      getSupabase() !== null &&
      App.features(
        this.state.planStatus,
        this.props.config,
        this.state.service,
        this.state.editor
      ).BACKSTAGE_AUTHENTICATION.isActive()
    )
      getSupabase()?.auth.onAuthStateChange((event, session) => {
        const actions: {
          [action: string]: () => void
        } = {
          SIGNED_IN: () => {
            this.setState({
              userSession: {
                connectionStatus: 'CONNECTED',
                userId: session?.user.id || '',
                userFullName:
                  session?.user.user_metadata.full_name ||
                  'Anonymous Palette Wizard',
                userAvatar:
                  session?.user.user_metadata.avatar_url ||
                  `https://www.gravatar.com/avatar/${session?.user.id}?d=identicon`,
              },
            })
          },
          TOKEN_REFRESHED: () => {
            this.setState({
              userSession: {
                connectionStatus: 'CONNECTED',
                userId: session?.user.id || '',
                userFullName:
                  session?.user.user_metadata.full_name ||
                  'Anonymous Palette Wizard',
                userAvatar:
                  session?.user.user_metadata.avatar_url ||
                  `https://www.gravatar.com/avatar/${session?.user.id}?d=identicon`,
              },
            })
            sendPluginMessage({
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
            }),
              this.props.config.urls.platformUrl
          },
        }
        return actions[event]?.()
      })

    // Listener
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  componentWillUnmount = () => {
    if (this.subscribeLanguage) this.subscribeLanguage()
    if (this.subsscribeVsCodeMessage) this.subsscribeVsCodeMessage()
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    try {
      const switchService = () => {
        this.setState({
          service: path.data.service,
          onGoingStep: `service switched to ${path.data.service}`,
        })
      }

      const setTheme = () => {
        document.documentElement.setAttribute('data-mode', path.data.theme)
      }

      const openInBrowser = () => {
        window
          .open(path.data.url, !path.data.isNewTab ? '_self' : '_blank')
          ?.focus()
      }

      const checkUserAuthentication = async () => {
        this.setState({
          userIdentity: {
            id: path.data.id,
            fullName: path.data.fullName,
            avatar: path.data.avatar,
          },
        })
        if (
          App.features(
            this.state.planStatus,
            this.props.config,
            this.state.service,
            this.state.editor
          ).BACKSTAGE_AUTHENTICATION.isActive()
        )
          await checkConnectionStatus(
            path.data.accessToken,
            path.data.refreshToken
          )
      }

      const checkUserConsent = () => {
        this.setState({
          mustUserConsent: path.data.mustUserConsent,
          userConsent: path.data.userConsent,
        })
      }

      const checkUserPreferences = () => {
        setTimeout(() => this.setState({ isLoaded: true }), 2000)
        $isWCAGDisplayed.set(path.data.isWCAGDisplayed)
        $isAPCADisplayed.set(path.data.isAPCADisplayed)
        $canStylesDeepSync.set(path.data.canDeepSyncStyles)
        $canVariablesDeepSync.set(path.data.canDeepSyncVariables)
        $isVsCodeMessageDisplayed.set(path.data.isVsCodeMessageDisplayed)
        $userLanguage.set(path.data.userLanguage)
      }

      const checkUserLicense = () => {
        validateUserLicenseKey({
          storeApiUrl: this.props.config.urls.storeApiUrl,
          licenseKey: path.data.licenseKey,
          instanceId: path.data.instanceId,
        }).then((isValid: boolean) => {
          this.setState({
            planStatus: isValid ? 'PAID' : 'UNPAID',
            trialStatus: isValid ? 'SUSPENDED' : this.state.trialStatus,
          })
        })
      }

      const checkEditor = () => {
        this.setState({ editor: path.data.editor })
        setEditor(path.data.editor)
        setTimeout(
          () =>
            trackEditorEvent(
              this.props.config.env.isMixpanelEnabled,
              this.state.userSession.userId === ''
                ? this.state.userIdentity.id === ''
                  ? ''
                  : this.state.userIdentity.id
                : this.state.userSession.userId,
              this.state.userConsent.find(
                (consent) => consent.id === 'mixpanel'
              )?.isConsented ?? false
            ),
          1000
        )
      }

      const checkPlanStatus = () =>
        this.setState({
          planStatus: path.data.planStatus,
        })

      const checkTrialStatus = () =>
        path.data.planStatus !== undefined
          ? this.setState({
              planStatus: path.data.planStatus,
              trialStatus: path.data.trialStatus,
              trialRemainingTime: path.data.trialRemainingTime,
            })
          : this.setState({
              trialStatus: path.data.trialStatus,
              trialRemainingTime: path.data.trialRemainingTime,
            })

      const checkAnnouncements = () => {
        checkAnnouncementsVersion(
          this.props.config.urls.announcementsWorkerUrl,
          this.props.config.env.announcementsDbId
        ).then((version: string) => {
          this.setState({
            announcements: {
              version: version,
              status: 'NO_ANNOUNCEMENTS',
            },
          })
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'CHECK_ANNOUNCEMENTS_STATUS',
                data: {
                  version: version,
                },
              },
            },
            '*'
          )
        })
      }

      const postMessage = () =>
        this.setState({
          isNotificationDisplayed: true,
          notification: {
            type: path.data.type,
            message: path.data.message,
            timer: path.data.timer === undefined ? 5000 : path.data.timer,
          },
        })

      const handleAnnouncements = () => {
        this.setState({
          modalContext:
            path.data.status !== 'DISPLAY_ANNOUNCEMENTS_DIALOG'
              ? 'EMPTY'
              : 'ANNOUNCEMENTS',
          announcements: {
            version: this.state.announcements.version,
            status: path.data.status,
          },
        })
      }

      const handleOnboarding = () => {
        this.setState({
          modalContext:
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

      const updatePaletteDate = (date: Date) =>
        this.setState({
          dates: {
            createdAt: this.state.dates['createdAt'],
            updatedAt: date,
            publishedAt: this.state.dates['publishedAt'],
            openedAt: this.state.dates['openedAt'],
          },
        })

      const getTrial = () =>
        this.setState({
          modalContext: 'TRY',
        })

      const enableTrial = () => {
        this.setState({
          planStatus: 'PAID',
          trialStatus: 'PENDING',
          modalContext: 'WELCOME_TO_TRIAL',
        })

        trackTrialEnablementEvent(
          this.props.config.env.isMixpanelEnabled,
          this.state.userSession.userId === ''
            ? this.state.userIdentity.id === ''
              ? ''
              : this.state.userIdentity.id
            : this.state.userSession.userId,
          this.state.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            date: path.data.date,
            trialTime: path.data.trialTime,
          }
        )
      }

      const getPricing = () =>
        this.setState({
          modalContext: 'PRICING',
          plans: path.data.plans,
        })

      const enableProPlan = () =>
        this.setState({
          planStatus: 'PAID',
        })

      const leaveProPlan = () =>
        this.setState({
          planStatus: 'UNPAID',
        })

      const welcomeToPro = () => {
        this.setState({
          planStatus: 'PAID',
          modalContext: 'WELCOME_TO_PRO',
          trialStatus:
            this.state.trialStatus !== 'UNUSED'
              ? 'SUSPENDED'
              : this.state.trialStatus,
        })

        trackPurchaseEvent(
          this.props.config.env.isMixpanelEnabled,
          this.state.userSession.userId === ''
            ? this.state.userIdentity.id === ''
              ? ''
              : this.state.userIdentity.id
            : this.state.userSession.userId,
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
        SWITCH_SERVICE: () => switchService(),
        SET_THEME: () => setTheme(),
        OPEN_IN_BROWSER: () => openInBrowser(),
        CHECK_USER_AUTHENTICATION: () => checkUserAuthentication(),
        CHECK_USER_CONSENT: () => checkUserConsent(),
        CHECK_USER_PREFERENCES: () => checkUserPreferences(),
        CHECK_USER_LICENSE: () => checkUserLicense(),
        CHECK_EDITOR: () => checkEditor(),
        CHECK_PLAN_STATUS: () => checkPlanStatus(),
        CHECK_TRIAL_STATUS: () => checkTrialStatus(),
        CHECK_ANNOUNCEMENTS_VERSION: () => checkAnnouncements(),
        POST_MESSAGE: () => postMessage(),
        PUSH_ANNOUNCEMENTS_STATUS: () => handleAnnouncements(),
        PUSH_ONBOARDING_STATUS: () => handleOnboarding(),
        EMPTY_SELECTION: () => updateWhileEmptySelection(),
        COLOR_SELECTED: () => updateWhileColorSelected(),
        DOCUMENT_SELECTED: () => updateWhileDocumentSelected(),
        LOAD_PALETTE: () =>
          this.onLoadPalette(
            path.data,
            !this.state.editor.includes('dev') ? 'EDIT' : 'SEE'
          ),
        RESET_PALETTE: () => this.onResetPalette(),
        UPDATE_PALETTE_DATE: () => updatePaletteDate(path?.data),
        GET_TRIAL: () => getTrial(),
        ENABLE_TRIAL: () => enableTrial(),
        GET_PRICING: () => getPricing(),
        ENABLE_PRO_PLAN: () => enableProPlan(),
        LEAVE_PRO_PLAN: () => leaveProPlan(),
        WELCOME_TO_PRO: () => welcomeToPro(),
        SIGN_OUT: () => signOut(path?.data),
        DEFAULT: () => null,
      }

      return actions[path.type ?? 'DEFAULT']?.()
    } catch (error) {
      console.error(error)
      return
    }
  }

  userConsentHandler = (e: Array<ConsentConfiguration>) => {
    this.setState({
      userConsent: e,
      mustUserConsent: false,
    })
    sendPluginMessage(
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
        pluginId: this.props.config.env.pluginId,
      },
      this.props.config.urls.platformUrl
    )
    sendPluginMessage(
      {
        pluginMessage: {
          type: 'CHECK_USER_CONSENT',
        },
      },
      '*'
    )
    trackUserConsentEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.config.versions.userConsentVersion,
      e
    )
  }

  onResetPalette = () => {
    const preset =
      presets.find((preset) => preset.id === 'CUSTOM_10_100') ?? defaultPreset
    const scale = doScale(preset.stops, preset.min, preset.max, preset.easing)

    this.setState({
      service: 'BROWSE',
      id: '',
      sourceColors: this.state.sourceColors.filter(
        (sourceColor: SourceColorConfiguration) =>
          sourceColor.source === 'CANVAS' || sourceColor.source === 'DEFAULT'
      ),
      name: this.state.locales.settings.global.name.default,
      description: '',
      preset: preset,
      scale: scale,
      shift: {
        chroma: 100,
      },
      areSourceColorsLocked: false,
      colors: [],
      themes: [],
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
        openedAt: '',
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
      onGoingStep: 'palette reset',
    })

    this.palette.setKey('name', this.state.locales.settings.global.name.default)
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

  onLoadPalette = (
    palette: {
      base: BaseConfiguration
      themes: Array<ThemeConfiguration>
      meta: MetaConfiguration
    },
    service: Service
  ) => {
    const theme: ThemeConfiguration | undefined = palette.themes.find(
      (theme: ThemeConfiguration) => theme.isEnabled
    )

    this.palette.setKey('id', palette.meta.id)
    this.palette.setKey('name', palette.base.name)
    this.palette.setKey('description', palette.base.description)
    this.palette.setKey('preset', palette.base.preset)
    this.palette.setKey('scale', theme?.scale ?? {})
    this.palette.setKey('shift', palette.base.shift)
    this.palette.setKey(
      'areSourceColorsLocked',
      palette.base.areSourceColorsLocked
    )
    this.palette.setKey('colors', palette.base.colors)
    this.palette.setKey('colorSpace', palette.base.colorSpace)
    this.palette.setKey(
      'visionSimulationMode',
      theme?.visionSimulationMode ?? 'NONE'
    )
    this.palette.setKey('algorithmVersion', palette.base.algorithmVersion)
    this.palette.setKey(
      'textColorsTheme',
      theme?.textColorsTheme ?? {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      }
    )

    this.setState({
      service: service,
      id: palette.meta.id,
      name: palette.base.name,
      description: palette.base.description,
      preset: palette.base.preset,
      scale: theme?.scale ?? {},
      shift: palette.base.shift,
      areSourceColorsLocked: palette.base.areSourceColorsLocked,
      colors: palette.base.colors,
      colorSpace: palette.base.colorSpace,
      visionSimulationMode: theme?.visionSimulationMode ?? 'NONE',
      themes: palette.themes,
      view: (palette.base.view as ViewConfiguration) ?? 'PALETTE',
      algorithmVersion: palette.base.algorithmVersion,
      textColorsTheme: theme?.textColorsTheme ?? {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      dates: {
        createdAt: palette.meta.dates.createdAt,
        updatedAt: palette.meta.dates.updatedAt,
        publishedAt: palette.meta.dates.publishedAt,
        openedAt: palette.meta.dates.openedAt,
      },
      publicationStatus: {
        isPublished: palette.meta.publicationStatus.isPublished,
        isShared: palette.meta.publicationStatus.isShared,
      },
      creatorIdentity: {
        creatorId: palette.meta.creatorIdentity.creatorId,
        creatorFullName: palette.meta.creatorIdentity.creatorFullName,
        creatorAvatar: palette.meta.creatorIdentity.creatorAvatar,
      },
      onGoingStep: 'palette loaded',
    })
  }

  // Render
  render() {
    if (this.state.isLoaded)
      return (
        <main
          className="ui"
          inert={
            this.state.modalContext !== 'EMPTY' || this.state.mustUserConsent
          }
        >
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config,
                this.state.service,
                this.state.editor
              ).BROWSE.isActive() && this.state.service === 'BROWSE'
            }
          >
            <BrowsePalettes
              {...this.props}
              {...this.state}
              onCreatePalette={(e) => this.setState({ ...e })}
              onSeePalette={(palette) => this.onLoadPalette(palette, 'SEE')}
            />
          </Feature>
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config,
                this.state.service,
                this.state.editor
              ).CREATE.isActive() && this.state.service === 'CREATE'
            }
          >
            <CreatePalette
              {...this.props}
              {...this.state}
              onChangeDefaultColor={(e) => this.setState({ ...e })}
              onChangeColorsFromImport={(e) => this.setState({ ...e })}
              onResetSourceColors={(e) => this.setState({ ...e })}
              onLockSourceColors={(e) => this.setState({ ...e })}
              onChangeScale={(e) => this.setState({ ...e })}
              onChangeShift={(e) => this.setState({ ...e })}
              onChangePreset={(e) => this.setState({ ...e })}
              onCustomPreset={(e) => this.setState({ ...e })}
              onChangeDistributionEasing={(e) => this.setState({ ...e })}
              onChangeSettings={(e) => this.setState({ ...e })}
              onConfigureExternalSourceColors={(e) => this.setState({ ...e })}
              onCancelPalette={this.onResetPalette}
              onSavedPalette={(e) => this.setState({ ...e })}
            />
          </Feature>
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config,
                this.state.service,
                this.state.editor
              ).EDIT.isActive() && this.state.service === 'EDIT'
            }
          >
            <EditPalette
              {...this.props}
              {...this.state}
              onChangeScale={(e) => this.setState({ ...e })}
              onChangePreset={(e) => this.setState({ ...e })}
              onChangeDistributionEasing={(e) => this.setState({ ...e })}
              onChangeColors={(e) => this.setState({ ...e })}
              onChangeThemes={(e) => this.setState({ ...e })}
              onChangeSettings={(e) => this.setState({ ...e })}
              onPublishPalette={() =>
                this.setState({ modalContext: 'PUBLICATION' })
              }
              onLockSourceColors={(e) => this.setState({ ...e })}
              onUnloadPalette={this.onResetPalette}
              onChangeDocument={(e) => this.setState({ ...e })}
              onDeletePalette={this.onResetPalette}
            />
          </Feature>
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config,
                this.state.service,
                this.state.editor
              ).SEE.isActive() && this.state.service === 'SEE'
            }
          >
            <SeePalette
              {...this.props}
              {...this.state}
              onChangeThemes={(e) => this.setState({ ...e })}
              onUnloadPalette={this.onResetPalette}
            />
          </Feature>
          <Feature isActive={this.state.modalContext !== 'EMPTY'}>
            {document.getElementById('modal') &&
              createPortal(
                <Modal
                  {...this.props}
                  {...this.state}
                  rawData={this.state}
                  context={this.state.modalContext}
                  onChangePublication={(e) => this.setState({ ...e })}
                  onClose={() =>
                    this.setState({
                      modalContext: 'EMPTY',
                      announcements: {
                        version: this.state.announcements.version,
                        status: 'NO_ANNOUNCEMENTS',
                      },
                    })
                  }
                />,
                document.getElementById('modal') ??
                  document.createElement('app')
              )}
          </Feature>
          <Feature isActive={this.state.isNotificationDisplayed}>
            {document.getElementById('toast') &&
              createPortal(
                <Modal
                  {...this.props}
                  {...this.state}
                  rawData={this.state}
                  context="NOTIFICATION"
                  onChangePublication={(e) => this.setState({ ...e })}
                  onClose={() =>
                    this.setState({
                      isNotificationDisplayed: false,
                      notification: {
                        type: 'INFO',
                        message: '',
                        timer: 5000,
                      },
                    })
                  }
                />,
                document.getElementById('toast') ??
                  document.createElement('app')
              )}
          </Feature>
          <Feature
            isActive={
              this.state.mustUserConsent &&
              App.features(
                this.state.planStatus,
                this.props.config,
                this.state.service,
                this.state.editor
              ).USER_CONSENT.isActive()
            }
          >
            {document.getElementById('modal') &&
              createPortal(
                <Consent
                  welcomeMessage={this.state.locales.user.cookies.welcome}
                  vendorsMessage={this.state.locales.user.cookies.vendors}
                  privacyPolicy={{
                    label: this.state.locales.user.cookies.privacyPolicy,
                    action: () =>
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type: 'OPEN_IN_BROWSER',
                            data: {
                              url: this.props.config.urls.privacyUrl,
                            },
                          },
                        },
                        '*'
                      ),
                  }}
                  moreDetailsLabel={this.state.locales.user.cookies.customize}
                  lessDetailsLabel={this.state.locales.user.cookies.back}
                  consentActions={{
                    consent: {
                      label: this.state.locales.user.cookies.consent,
                      action: this.userConsentHandler,
                    },
                    deny: {
                      label: this.state.locales.user.cookies.deny,
                      action: this.userConsentHandler,
                    },
                    save: {
                      label: this.state.locales.user.cookies.save,
                      action: this.userConsentHandler,
                    },
                  }}
                  validVendor={{
                    name: this.state.locales.vendors.functional.name,
                    id: 'functional',
                    icon: '',
                    description:
                      this.state.locales.vendors.functional.description,
                    isConsented: true,
                  }}
                  vendorsList={this.state.userConsent}
                  canBeClosed
                  closeLabel={this.state.locales.user.cookies.close}
                  onClose={() => this.setState({ mustUserConsent: false })}
                />,
                document.getElementById('modal') ??
                  document.createElement('app')
              )}
          </Feature>
          <Feature
            isActive={
              App.features(
                this.state.planStatus,
                this.props.config,
                this.state.service,
                this.state.editor
              ).VSCODE_MESSAGE.isActive() && this.state.isVsCodeMessageDisplayed
            }
          >
            <SemanticMessage
              type="INFO"
              message={this.state.locales.dev.vscode.message}
              actionsSlot={
                <>
                  <Button
                    type="secondary"
                    label={this.state.locales.dev.vscode.cta}
                    action={() =>
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type: 'OPEN_IN_BROWSER',
                            data: {
                              url: this.props.config.urls.vsCodeFigmaPluginUrl,
                            },
                          },
                        },
                        '*'
                      )
                    }
                  />
                  <Button
                    type="icon"
                    icon="close"
                    action={() => {
                      $isVsCodeMessageDisplayed.set(false)
                      this.setState({ isVsCodeMessageDisplayed: false })
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type: 'SET_ITEMS',
                            items: [
                              {
                                key: 'is_vscode_message_displayed',
                                value: false,
                              },
                            ],
                          },
                        },
                        '*'
                      )
                    }}
                  />
                </>
              }
              isAnchored
            />
          </Feature>
          <Feature
            isActive={App.features(
              this.state.planStatus,
              this.props.config,
              this.state.service,
              this.state.editor
            ).SHORTCUTS.isActive()}
          >
            <Shortcuts
              {...this.props}
              {...this.state}
              onReOpenAnnouncements={(e) => this.setState({ ...e })}
              onReOpenOnboarding={(e) => this.setState({ ...e })}
              onReOpenReport={(e) => this.setState({ ...e })}
              onReOpenStore={(e) => this.setState({ ...e })}
              onReOpenAbout={(e) => this.setState({ ...e })}
              onReOpenPreferences={(e) => this.setState({ ...e })}
              onReOpenLicense={(e) => this.setState({ ...e })}
              onReOpenChat={(e) => this.setState({ ...e })}
              onReOpenFeedback={(e) => this.setState({ ...e })}
              onUpdateConsent={(e) => this.setState({ ...e })}
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
