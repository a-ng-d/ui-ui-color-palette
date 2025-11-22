import { uid } from 'uid'
import React, { PureComponent } from 'react'
import {
  HexModel,
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { doScale } from '@a_ng_d/figmug-utils'
import {
  Button,
  FormItem,
  Input,
  Layout,
  layouts,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
  SortableList,
} from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { ThemesMessage } from '../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { trackColorThemesManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { AppStates } from '../App'

interface ThemesProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  themes: Array<ThemeConfiguration>
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  onChangeThemes: React.Dispatch<Partial<AppStates>>
}

export default class Themes extends PureComponent<ThemesProps> {
  private themesMessage: ThemesMessage

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
  })

  constructor(props: ThemesProps) {
    super(props)
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      id: this.props.id,
      data: [],
    }
  }

  // Handlers
  themesHandler = (e: Event) => {
    let id: string | null
    const element: HTMLElement | null = (e.target as HTMLElement).closest(
        '.draggable-item'
      ),
      currentElement = e.currentTarget as HTMLInputElement

    element !== null ? (id = element.getAttribute('data-id')) : (id = null)

    const addTheme = () => {
      const hasAlreadyNewUITheme = this.props.themes.filter((color) =>
        color.name.includes(this.props.t('themes.actions.new'))
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

      const enabledTheme = this.themesMessage.data.find(
        (theme) => theme.isEnabled
      )

      this.props.onChangeThemes({
        scale: enabledTheme?.scale ?? {},
        themes: this.themesMessage.data,
        visionSimulationMode: enabledTheme?.visionSimulationMode ?? 'NONE',
        textColorsTheme: enabledTheme?.textColorsTheme ?? {
          lightColor: '#FFFFFF',
          darkColor: '#000000',
        },
        onGoingStep: 'themes changed',
      })

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'ADD_THEME',
        }
      )
    }

    const renameTheme = () => {
      const hasSameName = this.props.themes.filter(
        (color) => color.name === currentElement.value
      )

      this.themesMessage.data = this.props.themes.map((item) => {
        if (item.id === id)
          item.name =
            hasSameName.length > 1
              ? currentElement.value + ' 2'
              : currentElement.value
        return item
      })

      this.props.onChangeThemes({
        scale:
          this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
        themes: this.themesMessage.data,
        onGoingStep: 'themes changed',
      })

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
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

        this.props.onChangeThemes({
          scale:
            this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ??
            {},
          themes: this.themesMessage.data,
          onGoingStep: 'themes changed',
        })
      }

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_BACKGROUND',
        }
      )
    }

    const updateThemeDescription = () => {
      this.themesMessage.data = this.props.themes.map((item) => {
        if (item.id === id) item.description = currentElement.value
        return item
      })

      this.props.onChangeThemes({
        scale:
          this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
        themes: this.themesMessage.data,
        onGoingStep: 'themes changed',
      })

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
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

      const enabledTheme = this.themesMessage.data.find(
        (theme) => theme.isEnabled
      )

      this.props.onChangeThemes({
        scale: enabledTheme?.scale ?? {},
        themes: this.themesMessage.data,
        visionSimulationMode: enabledTheme?.visionSimulationMode ?? 'NONE',
        textColorsTheme: enabledTheme?.textColorsTheme ?? {
          lightColor: '#FFFFFF',
          darkColor: '#000000',
        },
        onGoingStep: 'themes changed',
      })

      sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

      trackColorThemesManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
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
      UPDATE_DESCRIPTION: () => updateThemeDescription(),
      REMOVE_ITEM: () => removeTheme(),
      DEFAULT: () => null,
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onAddTheme = () => {
    const hasAlreadyNewUITheme = this.props.themes.filter((color) =>
      color.name.includes(this.props.t('themes.actions.new'))
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

    const enabledTheme = this.themesMessage.data.find(
      (theme) => theme.isEnabled
    )

    this.props.onChangeThemes({
      scale: enabledTheme?.scale ?? {},
      themes: this.themesMessage.data,
      visionSimulationMode: enabledTheme?.visionSimulationMode ?? 'NONE',
      textColorsTheme: enabledTheme?.textColorsTheme ?? {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      onGoingStep: 'themes changed',
    })

    sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

    trackColorThemesManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
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

    this.props.onChangeThemes({
      scale:
        this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
      themes: this.themesMessage.data,
      onGoingStep: 'themes changed',
    })

    sendPluginMessage({ pluginMessage: this.themesMessage }, '*')

    trackColorThemesManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
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

    return (
      <Layout
        id="colors"
        column={[
          {
            node: (
              <>
                <SimpleItem
                  id="add-theme"
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
                      isBlocked={Themes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).THEMES.isBlocked()}
                      feature="ADD_THEME"
                      action={this.themesHandler}
                    />
                  }
                  alignment="CENTER"
                  isListItem={false}
                />
                {customThemes.length === 0 ? (
                  <div className={layouts.centered}>
                    <SemanticMessage
                      type="NEUTRAL"
                      message={this.props.t('themes.callout.message')}
                      orientation="VERTICAL"
                      actionsSlot={
                        <>
                          {Themes.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).THEMES.isBlocked() &&
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
                                        type: 'GET_PRO_PLAN',
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
                            isBlocked={Themes.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).THEMES.isBlocked()}
                            action={this.themesHandler}
                          />
                        </>
                      }
                    />
                  </div>
                ) : (
                  <>
                    {Themes.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).THEMES.isBlocked() && (
                      <div
                        style={{
                          padding:
                            '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
                        }}
                      >
                        <SemanticMessage
                          type="INFO"
                          message={this.props.t('info.themesOnFree')}
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
                                        type: 'GET_PRO_PLAN',
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
                      primarySlot={customThemes.map((theme, index) => {
                        return (
                          <>
                            <Feature
                              isActive={Themes.features(
                                this.props.planStatus,
                                this.props.config,
                                this.props.service,
                                this.props.editor
                              ).THEMES_NAME.isActive()}
                            >
                              <div className="draggable-item__param--compact">
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
                                  isBlocked={Themes.features(
                                    this.props.planStatus,
                                    this.props.config,
                                    this.props.service,
                                    this.props.editor
                                  ).THEMES_NAME.isBlocked()}
                                  isNew={Themes.features(
                                    this.props.planStatus,
                                    this.props.config,
                                    this.props.service,
                                    this.props.editor
                                  ).THEMES_NAME.isNew()}
                                  onBlur={this.themesHandler}
                                  onValid={this.themesHandler}
                                />
                              </div>
                            </Feature>
                            <Feature
                              isActive={
                                Themes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).THEMES_PARAMS.isActive() &&
                                this.props.documentWidth > 460
                              }
                            >
                              <div className="draggable-item__param">
                                <FormItem
                                  id={`update-palette-background-color-${index}`}
                                  label={this.props.t(
                                    'themes.paletteBackgroundColor.label'
                                  )}
                                  shouldFill={false}
                                  isBlocked={Themes.features(
                                    this.props.planStatus,
                                    this.props.config,
                                    this.props.service,
                                    this.props.editor
                                  ).THEMES_PARAMS.isBlocked()}
                                >
                                  <Input
                                    id={`update-palette-background-color-${index}`}
                                    type="COLOR"
                                    value={theme.paletteBackground}
                                    helper={{
                                      label: this.props.t(
                                        'themes.actions.documentBackground'
                                      ),
                                    }}
                                    feature="UPDATE_PALETTE_BACKGROUND"
                                    isBlocked={Themes.features(
                                      this.props.planStatus,
                                      this.props.config,
                                      this.props.service,
                                      this.props.editor
                                    ).THEMES_PARAMS.isBlocked()}
                                    isNew={Themes.features(
                                      this.props.planStatus,
                                      this.props.config,
                                      this.props.service,
                                      this.props.editor
                                    ).THEMES_PARAMS.isNew()}
                                    onPick={this.themesHandler}
                                    onBlur={this.themesHandler}
                                    onValid={this.themesHandler}
                                  />
                                </FormItem>
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
                            <>
                              {this.props.documentWidth <= 460 && (
                                <Feature
                                  isActive={Themes.features(
                                    this.props.planStatus,
                                    this.props.config,
                                    this.props.service,
                                    this.props.editor
                                  ).THEMES_PARAMS.isActive()}
                                >
                                  <FormItem
                                    id={`update-palette-background-color-secondary-${theme.id}`}
                                    label={this.props.t(
                                      'themes.paletteBackgroundColor.label'
                                    )}
                                    isBlocked={Themes.features(
                                      this.props.planStatus,
                                      this.props.config,
                                      this.props.service,
                                      this.props.editor
                                    ).THEMES_PARAMS.isBlocked()}
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
                                      isBlocked={Themes.features(
                                        this.props.planStatus,
                                        this.props.config,
                                        this.props.service,
                                        this.props.editor
                                      ).THEMES_PARAMS.isBlocked()}
                                      isNew={Themes.features(
                                        this.props.planStatus,
                                        this.props.config,
                                        this.props.service,
                                        this.props.editor
                                      ).THEMES_PARAMS.isNew()}
                                      onPick={this.themesHandler}
                                      onBlur={this.themesHandler}
                                      onValid={this.themesHandler}
                                    />
                                  </FormItem>
                                </Feature>
                              )}
                              <Feature
                                isActive={Themes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).THEMES_DESCRIPTION.isActive()}
                              >
                                <div className="draggable-item__param">
                                  <FormItem
                                    id="update-theme-description"
                                    label={this.props.t(
                                      'global.description.label'
                                    )}
                                    isMultiLine
                                    isBlocked={Themes.features(
                                      this.props.planStatus,
                                      this.props.config,
                                      this.props.service,
                                      this.props.editor
                                    ).THEMES_DESCRIPTION.isBlocked()}
                                  >
                                    <Input
                                      id="update-theme-description"
                                      type="LONG_TEXT"
                                      value={theme.description}
                                      placeholder={this.props.t(
                                        'global.description.placeholder'
                                      )}
                                      feature="UPDATE_DESCRIPTION"
                                      isBlocked={Themes.features(
                                        this.props.planStatus,
                                        this.props.config,
                                        this.props.service,
                                        this.props.editor
                                      ).THEMES_DESCRIPTION.isBlocked()}
                                      isNew={Themes.features(
                                        this.props.planStatus,
                                        this.props.config,
                                        this.props.service,
                                        this.props.editor
                                      ).THEMES_DESCRIPTION.isNew()}
                                      isGrowing
                                      onBlur={this.themesHandler}
                                      onValid={this.themesHandler}
                                    />
                                  </FormItem>
                                </div>
                              </Feature>
                            </>
                          ))(),
                        }
                      })}
                      helpers={{
                        remove: this.props.t('themes.actions.removeColor'),
                        more: this.props.t('themes.actions.moreParameters'),
                      }}
                      isScrollable
                      isTopBorderEnabled
                      onChangeSortableList={this.onChangeOrder}
                      onRemoveItem={this.themesHandler}
                      isBlocked={Themes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).THEMES.isBlocked()}
                    />
                  </>
                )}
              </>
            ),
            typeModifier: 'LIST',
          },
        ]}
        isFullHeight
      />
    )
  }
}
