import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import { Bar, Layout, List, SectionTitle } from '@unoff/ui'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  HexModel,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import GlobalSettings from '../modules/settings/GlobalSettings'
import DangerZone from '../modules/settings/DangerZone'
import ContrastSettings from '../modules/settings/ContrastSettings'
import ColorSettings from '../modules/settings/ColorSettings'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { SettingsMessage } from '../../types/messages'
import {
  BaseProps,
  Context,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { $palette, $themes } from '../../stores/palette'
import { trackSettingsManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface SettingsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  sourceColors?: Array<SourceColorConfiguration>
  name: string
  description: string
  themes?: Array<ThemeConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  algorithmVersion?: AlgorithmVersionConfiguration
  onDeletePalette?: () => void
}

export default class Settings extends PureComponent<SettingsProps> {
  private settingsMessage: SettingsMessage
  private palette: typeof $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SETTINGS_GLOBAL: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_GLOBAL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_MANAGEMENT: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_MANAGEMENT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_CONTRAST_MANAGEMENT: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_CONTRAST_MANAGEMENT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DELETE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DELETE_PALETTE',
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

  private get features() {
    return Settings.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: SettingsProps) {
    super(props)
    this.palette = $palette
    this.settingsMessage = {
      type: 'UPDATE_SETTINGS',
      id: this.props.id,
      data: {
        name: '',
        description: '',
        colorSpace: 'LCH',
        visionSimulationMode: 'NONE',
        algorithmVersion: this.props.config.versions.algorithmVersion,
        textColorsTheme: {
          lightColor: '#FFFFFF',
          darkColor: '#000000',
        },
      },
    }
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  settingsHandler = (e: Event) => {
    const target = e.target as HTMLInputElement,
      feature = target.dataset.feature ?? 'DEFAULT'

    const renamePalette = () => {
      this.settingsMessage.data.name = target.value
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ??
        this.props.config.versions.algorithmVersion

      this.palette.setKey('name', this.settingsMessage.data.name)

      sendPluginMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'RENAME_PALETTE',
        }
      )
    }

    const updateDescription = () => {
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = target.value
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ??
        this.props.config.versions.algorithmVersion

      this.palette.setKey('description', this.settingsMessage.data.description)

      sendPluginMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'DESCRIBE_PALETTE',
        }
      )
    }

    const updateColorSpace = () => {
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = target.dataset
        .value as ColorSpaceConfiguration
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ??
        this.props.config.versions.algorithmVersion

      this.palette.setKey('colorSpace', this.settingsMessage.data.colorSpace)

      sendPluginMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_COLOR_SPACE',
        }
      )
    }

    const updateVisionSimulationMode = () => {
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode = target.dataset
        .value as VisionSimulationModeConfiguration
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ??
        this.props.config.versions.algorithmVersion

      this.palette.setKey(
        'visionSimulationMode',
        this.settingsMessage.data.visionSimulationMode
      )
      $themes.set(
        (this.props.themes ?? []).map((theme) => {
          if (theme.isEnabled)
            theme.visionSimulationMode =
              this.settingsMessage.data.visionSimulationMode
          return theme
        })
      )

      sendPluginMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_VISION_SIMULATION_MODE',
        }
      )
    }

    const updateAlgorithmVersion = () => {
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion = target.dataset
        .value as AlgorithmVersionConfiguration

      this.palette.setKey(
        'algorithmVersion',
        this.settingsMessage.data.algorithmVersion
      )

      sendPluginMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_ALGORITHM',
        }
      )
    }

    const updateTextLightColor = () => {
      const code: HexModel =
        target.value.indexOf('#') === -1 ? '#' + target.value : target.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.settingsMessage.data.name = this.props.name
        this.settingsMessage.data.description = this.props.description
        this.settingsMessage.data.colorSpace = this.props.colorSpace
        this.settingsMessage.data.visionSimulationMode =
          this.props.visionSimulationMode
        this.settingsMessage.data.textColorsTheme.lightColor = code
        this.settingsMessage.data.textColorsTheme.darkColor =
          this.props.textColorsTheme.darkColor
        this.settingsMessage.data.algorithmVersion =
          this.props.algorithmVersion ??
          this.props.config.versions.algorithmVersion
      }

      this.palette.setKey(
        'textColorsTheme',
        this.settingsMessage.data.textColorsTheme
      )
      $themes.set(
        (this.props.themes ?? []).map((theme) => {
          if (theme.isEnabled)
            theme.textColorsTheme = {
              ...theme.textColorsTheme,
              lightColor: code,
            }
          return theme
        })
      )

      sendPluginMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_TEXT_COLORS_THEME',
        }
      )
    }

    const updateTextDarkColor = () => {
      const code: HexModel =
        target.value.indexOf('#') === -1 ? '#' + target.value : target.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.settingsMessage.data.name = this.props.name
        this.settingsMessage.data.description = this.props.description
        this.settingsMessage.data.colorSpace = this.props.colorSpace
        this.settingsMessage.data.visionSimulationMode =
          this.props.visionSimulationMode
        this.settingsMessage.data.textColorsTheme.lightColor =
          this.props.textColorsTheme.lightColor
        this.settingsMessage.data.textColorsTheme.darkColor = code
        this.settingsMessage.data.algorithmVersion =
          this.props.algorithmVersion ??
          this.props.config.versions.algorithmVersion
      }

      this.palette.setKey(
        'textColorsTheme',
        this.settingsMessage.data.textColorsTheme
      )
      $themes.set(
        (this.props.themes ?? []).map((theme) => {
          if (theme.isEnabled)
            theme.textColorsTheme = {
              ...theme.textColorsTheme,
              darkColor: code,
            }
          return theme
        })
      )

      sendPluginMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_TEXT_COLORS_THEME',
        }
      )
    }

    const actions: {
      [action: string]: () => void
    } = {
      RENAME_PALETTE: () => renamePalette(),
      UPDATE_DESCRIPTION: () => updateDescription(),
      UPDATE_COLOR_SPACE: () => updateColorSpace(),
      UPDATE_COLOR_BLIND_MODE: () => updateVisionSimulationMode(),
      UPDATE_ALGORITHM_VERSION: () => updateAlgorithmVersion(),
      UPDATE_TEXT_LIGHT_COLOR: () => updateTextLightColor(),
      UPDATE_TEXT_DARK_COLOR: () => updateTextDarkColor(),
      DEFAULT: () => null,
    }

    return actions[feature ?? 'DEFAULT']?.()
  }

  // Templates
  Palette = () => {
    return (
      <List
        isFullHeight
        isFullWidth
      >
        <Feature isActive={this.features.SETTINGS_GLOBAL.isActive()}>
          <GlobalSettings
            {...this.props}
            onChangeSettings={this.settingsHandler}
          />
        </Feature>
        <Feature isActive={this.features.SETTINGS_COLOR_MANAGEMENT.isActive()}>
          <ColorSettings
            {...this.props}
            onChangeSettings={this.settingsHandler}
          />
        </Feature>
        <Feature
          isActive={this.features.SETTINGS_CONTRAST_MANAGEMENT.isActive()}
        >
          <ContrastSettings
            {...this.props}
            onChangeSettings={this.settingsHandler}
          />
        </Feature>
        <Feature isActive={this.features.DELETE_PALETTE.isActive()}>
          <DangerZone
            {...this.props}
            isLast
            onDeletePalette={this.props.onDeletePalette as () => void}
          />
        </Feature>
      </List>
    )
  }

  // Render
  render() {
    return (
      <>
        <Layout
          id="settings"
          column={[
            {
              node: (
                <>
                  <Bar
                    id="modes-header"
                    leftPartSlot={
                      <SectionTitle label={this.props.t('settings.title')} />
                    }
                    clip={['LEFT']}
                    border={['BOTTOM']}
                  />
                  <this.Palette />
                </>
              ),
              typeModifier: 'BLANK',
            },
          ]}
          isFullHeight
        />
      </>
    )
  }
}
