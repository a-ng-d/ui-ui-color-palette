import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import { FeatureStatus } from '@unoff/utils'
import {
  Bar,
  Button,
  FormItem,
  Input,
  InputsBar,
  Layout,
  layouts,
  SectionTitle,
  Select,
  SemanticMessage,
  SortableList,
} from '@unoff/ui'
import {
  ColorConfiguration,
  HexModel,
  ShiftConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { ColorsMessage } from '../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $palette } from '../../stores/palette'
import { trackSourceColorsManagementEvent } from '../../external/tracking/eventsTracker'
import am from '../../content/images/alpha_mode.gif'
import { ConfigContextType } from '../../config/ConfigContext'

interface ColorsProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  colors: Array<ColorConfiguration>
  shift: ShiftConfiguration
}

export default class Colors extends PureComponent<ColorsProps> {
  private colorsMessage: ColorsMessage
  private palette: typeof $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_NAME: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_NAME',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_PARAMS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_PARAMS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_HUE_SHIFTING: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_HUE_SHIFTING',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_CHROMA_SHIFTING: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_CHROMA_SHIFTING',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_DESCRIPTION: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_DESCRIPTION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_ALPHA: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_ALPHA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    COLORS_BACKGROUND_COLOR: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_BACKGROUND_COLOR',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Colors.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ColorsProps) {
    super(props)
    this.palette = $palette
    this.colorsMessage = {
      type: 'UPDATE_COLORS',
      id: this.props.id,
      data: [],
    }
  }

  // Handlers
  colorsHandler = (e: Event) => {
    const element: HTMLElement | null =
        (e.target as HTMLElement).closest('.draggable-item') ??
        (e.target as HTMLElement).closest('[data-color-id]'),
      currentElement = e.currentTarget as HTMLInputElement

    const id: string | null =
      element?.getAttribute('data-id') ||
      (element?.getAttribute('data-color-id') ?? null)

    const addColor = () => {
      const hasAlreadyNewUIColor = this.props.colors.filter((color) =>
        color.name.includes(this.props.t('colors.actions.new'))
      )

      this.colorsMessage.data = this.props.colors
      this.colorsMessage.data.push({
        name: `${this.props.t('colors.actions.new')} ${hasAlreadyNewUIColor.length + 1}`,
        description: '',
        rgb: {
          r: 0.53,
          g: 0.92,
          b: 0.97,
        },
        id: uid(),
        hue: {
          shift: 0,
          isLocked: false,
        },
        chroma: {
          shift: 100,
          isLocked: false,
        },
        alpha: {
          isEnabled: false,
          backgroundColor: '#FFFFFF',
        },
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'ADD_COLOR',
        }
      )
    }

    const renameColor = () => {
      const hasSameName = this.props.colors.filter(
        (color) => color.name === currentElement.value
      )

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id)
          item.name =
            hasSameName.length > 1
              ? currentElement.value + ' 2'
              : currentElement.value
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'RENAME_COLOR',
        }
      )
    }

    const updateHexCode = () => {
      const code: HexModel =
        currentElement.value.indexOf('#') === -1
          ? '#' + currentElement.value
          : currentElement.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.colorsMessage.data = this.props.colors.map((item) => {
          const rgb = chroma(
            currentElement.value.indexOf('#') === -1
              ? '#' + currentElement.value
              : currentElement.value
          ).rgb()
          if (item.id === id)
            item.rgb = {
              r: rgb[0] / 255,
              g: rgb[1] / 255,
              b: rgb[2] / 255,
            }
          return item
        })

        this.palette.setKey('colors', this.colorsMessage.data)
      }

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_HEX',
        }
      )
    }

    const updateLightnessProp = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        const rgb = chroma(item.rgb.r * 255, item.rgb.g * 255, item.rgb.b * 255)
          .set('lch.l', currentElement.value)
          .rgb()
        if (item.id === id)
          item.rgb = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255,
          }
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_LCH',
        }
      )
    }

    const updateChromaProp = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        const rgb = chroma(item.rgb.r * 255, item.rgb.g * 255, item.rgb.b * 255)
          .set('lch.c', currentElement.value)
          .rgb()
        if (item.id === id)
          item.rgb = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255,
          }
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_LCH',
        }
      )
    }

    const updateHueProp = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        const rgb = chroma(item.rgb.r * 255, item.rgb.g * 255, item.rgb.b * 255)
          .set('lch.h', currentElement.value)
          .rgb()
        if (item.id === id)
          item.rgb = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255,
          }
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_LCH',
        }
      )
    }

    const setHueShifting = () => {
      const max = parseFloat(currentElement.max),
        min = parseFloat(currentElement.min)
      let value = parseFloat(currentElement.value)

      if (value >= max) value = max
      if (value <= min) value = min

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.hue.shift = value
          item.hue.isLocked = !(value === this.props.shift.hue)
        }
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SHIFT_HUE',
        }
      )
    }

    const setChromaShifting = () => {
      const max = parseFloat(currentElement.max),
        min = parseFloat(currentElement.min)
      let value = parseFloat(currentElement.value)

      if (value >= max) value = max
      if (value <= min) value = min

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.chroma.shift = value
          item.chroma.isLocked = !(value === this.props.shift.chroma)
        }
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SHIFT_CHROMA',
        }
      )
    }

    const resetHue = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.hue.shift = this.props.shift.hue
          item.hue.isLocked = false
        }
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'RESET_HUE',
        }
      )
    }

    const resetChroma = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.chroma.shift = this.props.shift.chroma
          item.chroma.isLocked = false
        }
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'RESET_CHROMA',
        }
      )
    }

    const updateColorDescription = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.description = currentElement.value
        return item
      })

      console.log(this.colorsMessage.data)

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'DESCRIBE_COLOR',
        }
      )
    }

    const switchAlphaMode = () => {
      let colorId = currentElement.getAttribute('data-color-id')
      if (!colorId) colorId = id

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === colorId) item.alpha.isEnabled = !item.alpha.isEnabled
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ALPHA_MODE',
        }
      )
    }

    const updateBackgroundColor = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.alpha.backgroundColor = currentElement.value
        return item
      })

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_BACKGROUND_COLOR',
        }
      )
    }

    const removeColor = () => {
      this.colorsMessage.data = this.props.colors.filter(
        (item) => item.id !== id
      )

      this.palette.setKey('colors', this.colorsMessage.data)

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'REMOVE_COLOR',
        }
      )
    }

    const actions: {
      [action: string]: () => void
    } = {
      ADD_COLOR: () => addColor(),
      UPDATE_HEX: () => updateHexCode(),
      RENAME_COLOR: () => renameColor(),
      UPDATE_LIGHTNESS: () => updateLightnessProp(),
      UPDATE_CHROMA: () => updateChromaProp(),
      UPDATE_HUE: () => updateHueProp(),
      SHIFT_HUE: () => setHueShifting(),
      SHIFT_CHROMA: () => setChromaShifting(),
      RESET_HUE: () => resetHue(),
      RESET_CHROMA: () => resetChroma(),
      UPDATE_DESCRIPTION: () => updateColorDescription(),
      SWITCH_ALPHA_MODE: () => switchAlphaMode(),
      UPDATE_BACKGROUND_COLOR: () => updateBackgroundColor(),
      REMOVE_ITEM: () => removeColor(),
      DEFAULT: () => null,
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onChangeOrder = (colors: Array<ColorConfiguration>) => {
    this.colorsMessage.data = colors

    this.palette.setKey('colors', this.colorsMessage.data)

    sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

    trackSourceColorsManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'REORDER_COLOR',
      }
    )
  }

  // Render
  render() {
    const limit = this.features.COLORS_ADD.limit ?? 5

    return (
      <Layout
        id="colors"
        column={[
          {
            node: (
              <>
                <Bar
                  id="colors-header"
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.t('colors.title')}
                      indicator={this.props.colors.length.toString()}
                    />
                  }
                  rightPartSlot={
                    <Button
                      type="icon"
                      icon="plus"
                      feature="ADD_COLOR"
                      helper={{
                        label: this.props.t('colors.actions.new'),
                      }}
                      isBlocked={this.features.COLORS_ADD.isReached(
                        this.props.colors.length
                      )}
                      onBlock={() => {
                        sendPluginMessage(
                          {
                            pluginMessage: { type: 'GET_PRO' },
                          },
                          '*'
                        )
                      }}
                      action={(e: Event) => this.colorsHandler(e)}
                    />
                  }
                  clip={['LEFT']}
                  border={['BOTTOM']}
                />
                {this.features.COLORS_ADD.isReached(
                  this.props.colors.length
                ) && (
                  <div
                    style={{
                      padding: 'var(--size-pos-xxsmall)',
                    }}
                  >
                    <SemanticMessage
                      type="INFO"
                      message={this.props.t('info.maxNumberOfSourceColors', {
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
                                { pluginMessage: { type: 'GET_TRIAL' } },
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
                                { pluginMessage: { type: 'GET_PRO' } },
                                '*'
                              )
                            }
                          />
                        )
                      }
                    />
                  </div>
                )}
                {this.props.colors.length === 0 ? (
                  <div className={layouts.centered}>
                    <SemanticMessage
                      type="NEUTRAL"
                      message={this.props.t('colors.callout.message')}
                      orientation="VERTICAL"
                      actionsSlot={
                        <Button
                          type="primary"
                          feature="ADD_COLOR"
                          label={this.props.t('colors.callout.cta')}
                          action={(e: Event) => this.colorsHandler(e)}
                        />
                      }
                    />
                  </div>
                ) : (
                  <SortableList<ColorConfiguration>
                    data={this.props.colors}
                    primarySlot={this.props.colors.map((color) => {
                      const hex = chroma([
                        color.rgb.r * 255,
                        color.rgb.g * 255,
                        color.rgb.b * 255,
                      ]).hex()

                      return (
                        <>
                          <Feature
                            isActive={this.features.COLORS_NAME.isActive()}
                          >
                            <div className="draggable-item__param--compact">
                              <Input
                                type="TEXT"
                                value={color.name}
                                charactersLimit={24}
                                feature="RENAME_COLOR"
                                helper={{
                                  label: this.props.t(
                                    'colors.actions.colorName'
                                  ),
                                }}
                                canBeEmpty={false}
                                isBlocked={this.features.COLORS_NAME.isBlocked()}
                                isNew={this.features.COLORS_NAME.isNew()}
                                onBlur={this.colorsHandler}
                                onValid={this.colorsHandler}
                              />
                            </div>
                          </Feature>
                          <Feature
                            isActive={
                              this.features.COLORS_PARAMS.isActive() &&
                              this.props.documentWidth > 460
                            }
                          >
                            <div className="draggable-item__param">
                              <Input
                                type="COLOR"
                                value={hex}
                                feature="UPDATE_HEX"
                                helper={{
                                  label: this.props.t('colors.actions.hexCode'),
                                }}
                                isBlocked={this.features.COLORS_PARAMS.isBlocked()}
                                isNew={this.features.COLORS_PARAMS.isNew()}
                                onPick={this.colorsHandler}
                                onBlur={this.colorsHandler}
                                onValid={this.colorsHandler}
                              />
                            </div>
                          </Feature>
                        </>
                      )
                    })}
                    secondarySlot={this.props.colors.map((color) => {
                      const lch = chroma([
                        color.rgb.r * 255,
                        color.rgb.g * 255,
                        color.rgb.b * 255,
                      ]).lch()
                      const hex = chroma([
                        color.rgb.r * 255,
                        color.rgb.g * 255,
                        color.rgb.b * 255,
                      ]).hex()

                      return {
                        title: this.props.t('colors.moreParameters', {
                          colorName: color.name,
                        }),
                        node: (() => (
                          <div data-color-id={color.id}>
                            <Feature
                              isActive={
                                this.features.COLORS_PARAMS.isActive() &&
                                this.props.documentWidth <= 460
                              }
                            >
                              <FormItem
                                id={`change-hex-secondary-${color.id}`}
                                label={this.props.t('colors.actions.hexCode')}
                                isBlocked={
                                  this.features.COLORS_ALPHA.isBlocked() &&
                                  !color.alpha.isEnabled
                                }
                              >
                                <Input
                                  id={`change-hex-secondary-${color.id}`}
                                  type="COLOR"
                                  value={hex}
                                  feature="UPDATE_HEX"
                                  isBlocked={this.features.COLORS_PARAMS.isBlocked()}
                                  isNew={this.features.COLORS_PARAMS.isNew()}
                                  onPick={this.colorsHandler}
                                  onBlur={this.colorsHandler}
                                  onValid={this.colorsHandler}
                                />
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={this.features.COLORS_ALPHA.isActive()}
                            >
                              <FormItem
                                id={`switch-alpha-mode-secondary-${color.id}`}
                                label={this.props.t('colors.alpha.label')}
                                isBlocked={
                                  this.features.COLORS_ALPHA.isBlocked() &&
                                  !color.alpha.isEnabled
                                }
                              >
                                <Select
                                  id={`switch-alpha-mode-secondary-${color.id}`}
                                  type="SWITCH_BUTTON"
                                  feature="SWITCH_ALPHA_MODE"
                                  data-color-id={color.id}
                                  preview={{
                                    image: am,
                                    text: this.props.t('colors.alpha.helper'),
                                  }}
                                  isChecked={color.alpha.isEnabled}
                                  isBlocked={
                                    this.features.COLORS_ALPHA.isBlocked() &&
                                    !color.alpha.isEnabled
                                  }
                                  isNew={this.features.COLORS_ALPHA.isNew()}
                                  onBlock={() => {
                                    sendPluginMessage(
                                      {
                                        pluginMessage: {
                                          type: 'GET_PRO',
                                        },
                                      },
                                      '*'
                                    )
                                  }}
                                  action={this.colorsHandler}
                                />
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={
                                this.features.COLORS_BACKGROUND_COLOR.isActive() &&
                                color.alpha.isEnabled
                              }
                            >
                              <FormItem
                                id={`update-color-background-secondary-${color.id}`}
                                label={this.props.t(
                                  'colors.actions.alphaBackground'
                                )}
                                isBlocked={this.features.COLORS_BACKGROUND_COLOR.isBlocked()}
                              >
                                <Input
                                  id={`update-color-background-secondary-${color.id}`}
                                  type="COLOR"
                                  value={color.alpha.backgroundColor}
                                  feature="UPDATE_BACKGROUND_COLOR"
                                  data-color-id={color.id}
                                  isBlocked={this.features.COLORS_BACKGROUND_COLOR.isBlocked()}
                                  isNew={this.features.COLORS_BACKGROUND_COLOR.isNew()}
                                  onPick={this.colorsHandler}
                                  onBlur={this.colorsHandler}
                                  onValid={this.colorsHandler}
                                />
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={this.features.COLORS_CHROMA_SHIFTING.isActive()}
                            >
                              <FormItem
                                id="shift-chroma"
                                label={this.props.t(
                                  'colors.chromaShifting.label'
                                )}
                                isBlocked={this.features.COLORS_CHROMA_SHIFTING.isBlocked()}
                              >
                                <div className={layouts['snackbar--tight']}>
                                  <Input
                                    id="shift-chroma"
                                    type="NUMBER"
                                    icon={{ type: 'LETTER', value: 'C' }}
                                    unit="%"
                                    value={
                                      color.chroma.shift !== undefined
                                        ? color.chroma.shift.toString()
                                        : '100'
                                    }
                                    min="0"
                                    max="200"
                                    feature="SHIFT_CHROMA"
                                    isBlocked={this.features.COLORS_CHROMA_SHIFTING.isBlocked()}
                                    isNew={this.features.COLORS_CHROMA_SHIFTING.isNew()}
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                  {!this.features.COLORS_CHROMA_SHIFTING.isBlocked() && (
                                    <Button
                                      type="icon"
                                      icon="reset"
                                      feature="RESET_CHROMA"
                                      isDisabled={!color.chroma.isLocked}
                                      action={this.colorsHandler}
                                    />
                                  )}
                                </div>
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={this.features.COLORS_HUE_SHIFTING.isActive()}
                            >
                              <FormItem
                                id="shift-hue"
                                label={this.props.t('colors.hueShifting.label')}
                                isBlocked={this.features.COLORS_HUE_SHIFTING.isBlocked()}
                              >
                                <div className={layouts['snackbar--tight']}>
                                  <Input
                                    id="shift-hue"
                                    type="NUMBER"
                                    icon={{ type: 'LETTER', value: 'H' }}
                                    unit="°"
                                    value={
                                      color.hue.shift !== undefined
                                        ? color.hue.shift.toString()
                                        : '0'
                                    }
                                    min="-180"
                                    max="180"
                                    feature="SHIFT_HUE"
                                    isBlocked={this.features.COLORS_HUE_SHIFTING.isBlocked()}
                                    isNew={this.features.COLORS_HUE_SHIFTING.isNew()}
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                  {!this.features.COLORS_HUE_SHIFTING.isBlocked() && (
                                    <Button
                                      type="icon"
                                      icon="reset"
                                      feature="RESET_HUE"
                                      isDisabled={!color.hue.isLocked}
                                      action={this.colorsHandler}
                                    />
                                  )}
                                </div>
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={this.features.COLORS_PARAMS.isActive()}
                            >
                              <FormItem
                                id="shift-lch"
                                label={this.props.t('colors.lch.label')}
                                isBlocked={this.features.COLORS_PARAMS.isBlocked()}
                              >
                                <InputsBar customClassName="draggable-item__param">
                                  <Input
                                    type="NUMBER"
                                    value={lch[0].toFixed(0)}
                                    min="0"
                                    max="100"
                                    isBlocked={this.features.COLORS_PARAMS.isBlocked()}
                                    feature="UPDATE_LIGHTNESS"
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                  <Input
                                    type="NUMBER"
                                    value={lch[1].toFixed(0)}
                                    min="0"
                                    max="100"
                                    isBlocked={this.features.COLORS_PARAMS.isBlocked()}
                                    feature="UPDATE_CHROMA"
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                  <Input
                                    type="NUMBER"
                                    value={
                                      lch[2].toFixed(0) === 'NaN'
                                        ? '0'
                                        : lch[2].toFixed(0)
                                    }
                                    min="0"
                                    max="360"
                                    isBlocked={this.features.COLORS_PARAMS.isBlocked()}
                                    feature="UPDATE_HUE"
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                </InputsBar>
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={this.features.COLORS_DESCRIPTION.isActive()}
                            >
                              <FormItem
                                id="update-color-description"
                                label={this.props.t('global.description.label')}
                                isMultiLine
                                isBlocked={this.features.COLORS_DESCRIPTION.isBlocked()}
                              >
                                <Input
                                  id="update-color-description"
                                  type="LONG_TEXT"
                                  value={color.description}
                                  placeholder={this.props.t(
                                    'global.description.placeholder'
                                  )}
                                  feature="UPDATE_DESCRIPTION"
                                  isBlocked={this.features.COLORS_DESCRIPTION.isBlocked()}
                                  isNew={this.features.COLORS_DESCRIPTION.isNew()}
                                  isGrowing
                                  onBlur={this.colorsHandler}
                                  onValid={this.colorsHandler}
                                />
                              </FormItem>
                            </Feature>
                          </div>
                        ))(),
                      }
                    })}
                    helpers={{
                      remove: this.props.t('colors.actions.removeColor'),
                      more: this.props.t('colors.actions.moreParameters'),
                    }}
                    canBeEmpty={false}
                    isScrollable
                    onChangeSortableList={this.onChangeOrder}
                    onRemoveItem={this.colorsHandler}
                  />
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
