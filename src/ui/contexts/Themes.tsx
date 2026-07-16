import { uid } from 'uid'
import React, { PureComponent } from 'react'
import {
  HexModel,
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { doScale } from '@unoff/utils'
import {
  Bar,
  Button,
  Dropdown,
  FormItem,
  Input,
  Layout,
  layouts,
  SectionTitle,
  SemanticMessage,
  SortableList,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { ThemesMessage } from '../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $palette, $themes } from '../../stores/palette'
import { trackColorThemesManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface ThemesProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  themes: Array<ThemeConfiguration>
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
}

export default class Themes extends PureComponent<ThemesProps> {
  private themesMessage: ThemesMessage
  private palette: typeof $palette

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
    THEMES_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    THEMES_NAME: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES_NAME',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    THEMES_PARAMS: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES_PARAMS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    THEMES_DESCRIPTION: new FeatureStatus({
      features: config.features,
      featureName: 'THEMES_DESCRIPTION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_NONE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_NONE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_TEXT_COLORS_THEME: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_TEXT_COLORS_THEME',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Themes.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ThemesProps) {
    super(props)
    this.palette = $palette
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      id: this.props.id,
      data: [],
    }
  }

  // Helpers
  private applyThemeChanges = (themes: Array<ThemeConfiguration>) => {
    const enabled = themes.find((t) => t.isEnabled)
    $themes.set(themes)
    this.palette.setKey('scale', enabled?.scale ?? {})
    this.palette.setKey(
      'visionSimulationMode',
      enabled?.visionSimulationMode ?? 'NONE'
    )
    this.palette.setKey(
      'textColorsTheme',
      enabled?.textColorsTheme ?? {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      }
    )
  }

  // Handlers
  themesHandler = (e: Event, themeId?: string) => {
    const element: HTMLElement | null =
        (e.target as HTMLElement).closest('.draggable-item') ??
        (e.target as HTMLElement).closest('[data-theme-id]'),
      currentElement = e.currentTarget as HTMLInputElement

    const id: string | null =
      themeId ??
      element?.getAttribute('data-id') ??
      element?.getAttribute('data-theme-id') ??
      null

    const addTheme = () => {
      const hasAlreadyNewUITheme = this.props.themes.filter((theme) =>
        theme.name.includes(this.props.t('themes.actions.new'))
      )

      this.themesMessage.data = this.props.themes.map((theme) => {
        theme.isEnabled = false
        return theme
      })
      this.themesMessage.data.push({
        name: `${this.props.t('themes.actions.new')} ${hasAlreadyNewUITheme.length + 1}`,
        description: '',
        scale: doScale(
          this.props.preset.stops,
          this.props.preset.min === undefined ? 10 : this.props.preset.min,
          this.props.preset.max === undefined ? 90 : this.props.preset.max
        ),
        paletteBackground: '#FFFFFF',
        visionSimulationMode: 'NONE',
        textColorsTheme: {
          lightColor: '#FFFFFF',
          darkColor: '#000000',
        },
        isEnabled: true,
        id: uid(),
        type: 'custom theme',
      })

      this.applyThemeChanges(this.themesMessage.data)

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'ADD_THEME',
        }
      )
    }

    const renameTheme = () => {
      const hasSameName = this.props.themes.filter(
        (theme) => theme.name === currentElement.value
      )

      this.themesMessage.data = this.props.themes.map((item) => {
        if (item.id === id)
          item.name =
            hasSameName.length > 1
              ? currentElement.value + ' 2'
              : currentElement.value
        return item
      })

      this.applyThemeChanges(this.themesMessage.data)

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'RENAME_THEME',
        }
      )
    }

    const updatePaletteBackgroundColor = () => {
      const code: HexModel =
        currentElement.value.indexOf('#') === -1
          ? '#' + currentElement.value
          : currentElement.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.themesMessage.data = this.props.themes.map((item) => {
          if (item.id === id) item.paletteBackground = code
          return item
        })

        this.applyThemeChanges(this.themesMessage.data)
      }

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_BACKGROUND',
        }
      )
    }

    const updateVisionSimulationMode = () => {
      this.themesMessage.data = this.props.themes.map((item) => {
        if (item.id === id)
          item.visionSimulationMode = currentElement.dataset
            .value as VisionSimulationModeConfiguration
        return item
      })

      this.applyThemeChanges(this.themesMessage.data)

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
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

    const updateTextLightColor = () => {
      const code: HexModel =
        currentElement.value.indexOf('#') === -1
          ? '#' + currentElement.value
          : currentElement.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.themesMessage.data = this.props.themes.map((item) => {
          if (item.id === id)
            item.textColorsTheme = {
              ...item.textColorsTheme,
              lightColor: code,
            }
          return item
        })

        this.applyThemeChanges(this.themesMessage.data)
      }

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
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
        currentElement.value.indexOf('#') === -1
          ? '#' + currentElement.value
          : currentElement.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.themesMessage.data = this.props.themes.map((item) => {
          if (item.id === id)
            item.textColorsTheme = {
              ...item.textColorsTheme,
              darkColor: code,
            }
          return item
        })

        this.applyThemeChanges(this.themesMessage.data)
      }

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
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

    const updateThemeDescription = () => {
      this.themesMessage.data = this.props.themes.map((item) => {
        if (item.id === id) item.description = currentElement.value
        return item
      })

      this.applyThemeChanges(this.themesMessage.data)

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'DESCRIBE_THEME',
        }
      )
    }

    const removeTheme = () => {
      this.themesMessage.data = this.props.themes.filter(
        (item) => item.id !== id
      )
      if (this.themesMessage.data.length > 1)
        this.themesMessage.data.filter(
          (item) => item.type === 'custom theme'
        )[0].isEnabled = true
      else {
        const result = this.themesMessage.data.find(
          (item) => item.type === 'default theme'
        )
        if (result !== undefined) result.isEnabled = true
      }

      this.applyThemeChanges(this.themesMessage.data)

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'REMOVE_THEME',
        }
      )
    }

    const actions: {
      [action: string]: () => void
    } = {
      ADD_THEME: () => addTheme(),
      RENAME_THEME: () => renameTheme(),
      UPDATE_PALETTE_BACKGROUND: () => updatePaletteBackgroundColor(),
      UPDATE_VISION_SIMULATION_MODE: () => updateVisionSimulationMode(),
      UPDATE_TEXT_LIGHT_COLOR: () => updateTextLightColor(),
      UPDATE_TEXT_DARK_COLOR: () => updateTextDarkColor(),
      UPDATE_DESCRIPTION: () => updateThemeDescription(),
      REMOVE_ITEM: () => removeTheme(),
      DEFAULT: () => null,
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onAddTheme = () => {
    const hasAlreadyNewUITheme = this.props.themes.filter((theme) =>
      theme.name.includes(this.props.t('themes.actions.new'))
    )

    this.themesMessage.data = this.props.themes.map((theme) => {
      theme.isEnabled = false
      return theme
    })
    this.themesMessage.data.push({
      name: `${this.props.t('themes.actions.new')} ${hasAlreadyNewUITheme.length + 1}`,
      description: '',
      scale: doScale(
        this.props.preset.stops,
        this.props.preset.min === undefined ? 10 : this.props.preset.min,
        this.props.preset.max === undefined ? 90 : this.props.preset.max
      ),
      paletteBackground: '#FFFFFF',
      visionSimulationMode: 'NONE',
      textColorsTheme: {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      isEnabled: true,
      id: uid(),
      type: 'custom theme',
    })

    this.applyThemeChanges(this.themesMessage.data)

    sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

    trackColorThemesManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'ADD_THEME_FROM_DROPDOWN',
      }
    )
  }

  onChangeOrder = (themes: Array<ThemeConfiguration>) => {
    const defaultTheme = this.props.themes.filter(
      (item) => item.type === 'default theme'
    )

    this.themesMessage.data = defaultTheme.concat(themes)

    this.applyThemeChanges(this.themesMessage.data)

    sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

    trackColorThemesManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'REORDER_THEME',
      }
    )
  }

  // Render
  render() {
    const customThemes = this.props.themes.filter(
      (item) => item.type === 'custom theme'
    )
    const limit = this.features.THEMES_ADD.limit ?? 2

    return (
      <Layout
        id="themes"
        column={[
          {
            node: (
              <>
                <Bar
                  id="modes-header"
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.t('themes.title')}
                      indicator={customThemes.length.toString()}
                    />
                  }
                  rightPartSlot={
                    <Button
                      type="icon"
                      icon="plus"
                      helper={{
                        label: this.props.t('themes.actions.new'),
                      }}
                      isBlocked={this.features.THEMES_ADD.isReached(
                        this.props.themes.length - 1
                      )}
                      feature="ADD_THEME"
                      onBlock={() => {
                        sendPluginMessage(
                          {
                            pluginMessage: { type: 'GET_PRO' },
                          },
                          '*'
                        )
                      }}
                      action={this.themesHandler}
                    />
                  }
                  clip={['LEFT']}
                  border={['BOTTOM']}
                />
                {customThemes.length === 0 ? (
                  <div className={layouts.centered}>
                    <SemanticMessage
                      type="NEUTRAL"
                      message={this.props.t('themes.callout.message')}
                      orientation="VERTICAL"
                      actionsSlot={
                        <>
                          {this.features.THEMES_ADD.isReached(
                            this.props.themes.length - 1
                          ) &&
                            (this.props.config.plan.isTrialEnabled &&
                            this.props.trialStatus !== 'EXPIRED' ? (
                              <Button
                                type="secondary"
                                label={this.props.t('plan.tryPro')}
                                action={() =>
                                  sendPluginMessage(
                                    {
                                      pluginMessage: { type: 'GET_TRIAL' },
                                    },
                                    '*'
                                  )
                                }
                              />
                            ) : (
                              <Button
                                type="secondary"
                                label={this.props.t('plan.getPro')}
                                action={() =>
                                  sendPluginMessage(
                                    {
                                      pluginMessage: {
                                        type: 'GET_PRO',
                                      },
                                    },
                                    '*'
                                  )
                                }
                              />
                            ))}
                          <Button
                            type="primary"
                            feature="ADD_THEME"
                            label={this.props.t('themes.callout.cta')}
                            isBlocked={this.features.THEMES_ADD.isReached(
                              this.props.themes.length - 1
                            )}
                            onBlock={() => {
                              sendPluginMessage(
                                {
                                  pluginMessage: { type: 'GET_PRO' },
                                },
                                '*'
                              )
                            }}
                            action={this.themesHandler}
                          />
                        </>
                      }
                    />
                  </div>
                ) : (
                  <>
                    {this.features.THEMES_ADD.isReached(
                      this.props.themes.length - 1
                    ) && (
                      <div
                        style={{
                          padding: 'var(--size-pos-xxsmall)',
                        }}
                      >
                        <SemanticMessage
                          type="INFO"
                          message={this.props.t('info.maxNumberOfThemes', {
                            count: limit.toString(),
                          })}
                          actionsSlot={
                            this.props.config.plan.isTrialEnabled &&
                            this.props.trialStatus !== 'EXPIRED' ? (
                              <Button
                                type="secondary"
                                label={this.props.t('plan.tryPro')}
                                action={() =>
                                  sendPluginMessage(
                                    {
                                      pluginMessage: { type: 'GET_TRIAL' },
                                    },
                                    '*'
                                  )
                                }
                              />
                            ) : (
                              <Button
                                type="secondary"
                                label={this.props.t('plan.getPro')}
                                action={() =>
                                  sendPluginMessage(
                                    {
                                      pluginMessage: {
                                        type: 'GET_PRO',
                                      },
                                    },
                                    '*'
                                  )
                                }
                              />
                            )
                          }
                        />
                      </div>
                    )}
                    <SortableList<ThemeConfiguration>
                      data={customThemes}
                      primarySlot={customThemes.map((theme) => {
                        return (
                          <>
                            <Feature
                              isActive={this.features.THEMES_NAME.isActive()}
                            >
                              <div className="draggable-item__param">
                                <Input
                                  type="TEXT"
                                  value={theme.name}
                                  feature="RENAME_THEME"
                                  charactersLimit={24}
                                  helper={{
                                    label: this.props.t(
                                      'themes.actions.themeName'
                                    ),
                                  }}
                                  canBeEmpty={false}
                                  isBlocked={this.features.THEMES_NAME.isBlocked()}
                                  isNew={this.features.THEMES_NAME.isNew()}
                                  onBlur={this.themesHandler}
                                  onValid={this.themesHandler}
                                />
                              </div>
                            </Feature>
                          </>
                        )
                      })}
                      secondarySlot={customThemes.map((theme) => {
                        return {
                          title: this.props.t('themes.moreParameters', {
                            themeName: theme.name,
                          }),
                          node: (() => (
                            <div data-theme-id={theme.id}>
                              <Feature
                                isActive={this.features.SETTINGS_VISION_SIMULATION_MODE.isActive()}
                              >
                                <FormItem
                                  id={`update-vision-simulation-mode-${theme.id}`}
                                  label={this.props.t(
                                    'settings.color.visionSimulationMode.label'
                                  )}
                                  isBlocked={this.features.SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
                                >
                                  <Dropdown
                                    id={`update-vision-simulation-mode-${theme.id}`}
                                    options={[
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.none'
                                        ),
                                        value: 'NONE',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        type: 'SEPARATOR',
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.colorBlind'
                                        ),
                                        type: 'TITLE',
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.protanomaly'
                                        ),
                                        value: 'PROTANOMALY',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.protanopia'
                                        ),
                                        value: 'PROTANOPIA',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.deuteranomaly'
                                        ),
                                        value: 'DEUTERANOMALY',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.deuteranopia'
                                        ),
                                        value: 'DEUTERANOPIA',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.tritanomaly'
                                        ),
                                        value: 'TRITANOMALY',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.tritanopia'
                                        ),
                                        value: 'TRITANOPIA',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.achromatomaly'
                                        ),
                                        value: 'ACHROMATOMALY',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                      {
                                        label: this.props.t(
                                          'settings.color.visionSimulationMode.achromatopsia'
                                        ),
                                        value: 'ACHROMATOPSIA',
                                        feature:
                                          'UPDATE_VISION_SIMULATION_MODE',
                                        type: 'OPTION',
                                        isActive:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                                        isBlocked:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                                        isNew:
                                          this.features.SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                                        onBlock: () => {
                                          sendPluginMessage(
                                            {
                                              pluginMessage: {
                                                type: 'GET_PRO',
                                              },
                                            },
                                            '*'
                                          )
                                        },
                                        action: (e: Event) =>
                                          this.themesHandler(e, theme.id),
                                      },
                                    ]}
                                    selected={theme.visionSimulationMode}
                                    alignment="RIGHT"
                                    isFill
                                    isBlocked={this.features.SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
                                    isNew={this.features.SETTINGS_VISION_SIMULATION_MODE.isNew()}
                                    onBlock={() => {
                                      sendPluginMessage(
                                        {
                                          pluginMessage: { type: 'GET_PRO' },
                                        },
                                        '*'
                                      )
                                    }}
                                  />
                                </FormItem>
                              </Feature>
                              <Feature
                                isActive={this.features.SETTINGS_TEXT_COLORS_THEME.isActive()}
                              >
                                <FormItem
                                  id={`update-text-light-color-${theme.id}`}
                                  label={this.props.t(
                                    'settings.contrast.textColors.textLightColor'
                                  )}
                                  isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
                                >
                                  <Input
                                    id={`update-text-light-color-${theme.id}`}
                                    type="COLOR"
                                    value={
                                      theme.textColorsTheme?.lightColor ??
                                      '#FFFFFF'
                                    }
                                    isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
                                    isNew={this.features.SETTINGS_TEXT_COLORS_THEME.isNew()}
                                    feature="UPDATE_TEXT_LIGHT_COLOR"
                                    onPick={this.themesHandler}
                                    onBlur={this.themesHandler}
                                    onValid={this.themesHandler}
                                  />
                                </FormItem>
                                <FormItem
                                  id={`update-text-dark-color-${theme.id}`}
                                  label={this.props.t(
                                    'settings.contrast.textColors.textDarkColor'
                                  )}
                                  isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
                                >
                                  <Input
                                    id={`update-text-dark-color-${theme.id}`}
                                    type="COLOR"
                                    value={
                                      theme.textColorsTheme?.darkColor ??
                                      '#000000'
                                    }
                                    isBlocked={this.features.SETTINGS_TEXT_COLORS_THEME.isBlocked()}
                                    isNew={this.features.SETTINGS_TEXT_COLORS_THEME.isNew()}
                                    feature="UPDATE_TEXT_DARK_COLOR"
                                    onPick={this.themesHandler}
                                    onBlur={this.themesHandler}
                                    onValid={this.themesHandler}
                                  />
                                </FormItem>
                              </Feature>
                              <Feature
                                isActive={this.features.THEMES_PARAMS.isActive()}
                              >
                                <FormItem
                                  id={`update-palette-background-color-secondary-${theme.id}`}
                                  label={this.props.t(
                                    'themes.paletteBackgroundColor.label'
                                  )}
                                  isBlocked={this.features.THEMES_PARAMS.isBlocked()}
                                >
                                  <Input
                                    id={`update-palette-background-color-secondary-${theme.id}`}
                                    type="COLOR"
                                    value={theme.paletteBackground}
                                    helper={{
                                      label: this.props.t(
                                        'themes.actions.documentBackground'
                                      ),
                                    }}
                                    feature="UPDATE_PALETTE_BACKGROUND"
                                    isBlocked={this.features.THEMES_PARAMS.isBlocked()}
                                    isNew={this.features.THEMES_PARAMS.isNew()}
                                    onPick={this.themesHandler}
                                    onBlur={this.themesHandler}
                                    onValid={this.themesHandler}
                                  />
                                </FormItem>
                              </Feature>
                              <Feature
                                isActive={this.features.THEMES_DESCRIPTION.isActive()}
                              >
                                <div className="draggable-item__param">
                                  <FormItem
                                    id="update-theme-description"
                                    label={this.props.t(
                                      'global.description.label'
                                    )}
                                    isMultiLine
                                    isBlocked={this.features.THEMES_DESCRIPTION.isBlocked()}
                                  >
                                    <Input
                                      id="update-theme-description"
                                      type="LONG_TEXT"
                                      value={theme.description}
                                      placeholder={this.props.t(
                                        'global.description.placeholder'
                                      )}
                                      feature="UPDATE_DESCRIPTION"
                                      isBlocked={this.features.THEMES_DESCRIPTION.isBlocked()}
                                      isNew={this.features.THEMES_DESCRIPTION.isNew()}
                                      isGrowing
                                      onBlur={this.themesHandler}
                                      onValid={this.themesHandler}
                                    />
                                  </FormItem>
                                </div>
                              </Feature>
                            </div>
                          ))(),
                        }
                      })}
                      helpers={{
                        remove: this.props.t('themes.actions.removeColor'),
                        more: this.props.t('themes.actions.moreParameters'),
                      }}
                      isScrollable
                      onChangeSortableList={this.onChangeOrder}
                      onRemoveItem={this.themesHandler}
                      isBlocked={this.features.THEMES.isBlocked()}
                    />
                  </>
                )}
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }
}
