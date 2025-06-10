import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import { ShiftConfiguration } from '@a_ng_d/utils-ui-color-palette/dist/types/configuration.types'
import { ColorConfiguration, HexModel } from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  FormItem,
  Input,
  InputsBar,
  Layout,
  layouts,
  SectionTitle,
  Select,
  SemanticMessage,
  SimpleItem,
  SortableList,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { trackSourceColorsManagementEvent } from '../../utils/eventsTracker'
import { ColorsMessage } from '../../types/messages'
import { BaseProps, PlanStatus, ModalContext } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import type { AppStates } from '../App'

interface ColorsProps extends BaseProps, WithConfigProps {
  id: string
  colors: Array<ColorConfiguration>
  shift: ShiftConfiguration
  onChangeColors: React.Dispatch<Partial<AppStates>>
  onGetProPlan: (context: { modalContext: ModalContext }) => void
}

export default class Colors extends PureComponent<ColorsProps> {
  private colorsMessage: ColorsMessage

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS',
      planStatus: planStatus,
    }),
    COLORS_NAME: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_NAME',
      planStatus: planStatus,
    }),
    COLORS_PARAMS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_PARAMS',
      planStatus: planStatus,
    }),
    COLORS_HUE_SHIFTING: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_HUE_SHIFTING',
      planStatus: planStatus,
    }),
    COLORS_CHROMA_SHIFTING: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_CHROMA_SHIFTING',
      planStatus: planStatus,
    }),
    COLORS_DESCRIPTION: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_DESCRIPTION',
      planStatus: planStatus,
    }),
    COLORS_ALPHA: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_ALPHA',
      planStatus: planStatus,
    }),
    COLORS_BACKGROUND_COLOR: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS_BACKGROUND_COLOR',
      planStatus: planStatus,
    }),
  })

  constructor(props: ColorsProps) {
    super(props)
    this.colorsMessage = {
      type: 'UPDATE_COLORS',
      id: this.props.id,
      data: [],
    }
  }

  // Handlers
  colorsHandler = (e: Event) => {
    let id: string | null
    const element: HTMLElement | null = (e.target as HTMLElement).closest(
        '.draggable-item'
      ),
      currentElement = e.currentTarget as HTMLInputElement

    element !== null ? (id = element.getAttribute('data-id')) : (id = null)

    const addColor = () => {
      const hasAlreadyNewUIColor = this.props.colors.filter((color) =>
        color.name.includes(this.props.locals.colors.actions.new)
      )

      this.colorsMessage.data = this.props.colors
      this.colorsMessage.data.push({
        name: `${this.props.locals.colors.actions.new} ${hasAlreadyNewUIColor.length + 1}`,
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      if (e.type === 'focusout' || (e as KeyboardEvent).key === 'Enter') {
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

        trackSourceColorsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'RENAME_COLOR',
          }
        )
      }
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

        this.props.onChangeColors({
          colors: this.colorsMessage.data,
          onGoingStep: 'colors changed',
        })
      }

      if (e.type === 'focusout') {
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

        trackSourceColorsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_HEX',
          }
        )
      }
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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
          item.hue.isLocked = !(value === 0)
        }
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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
          item.hue.shift = 0
          item.hue.isLocked = false
        }
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      if (e.type === 'focusout') {
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

        trackSourceColorsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'DESCRIBE_COLOR',
          }
        )
      }
    }

    const switchAlphaMode = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.alpha.isEnabled = !item.alpha.isEnabled
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
    }

    const updateBackgroundColor = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.alpha.backgroundColor = currentElement.value
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      if (e.type === 'focusout')
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
    }

    const removeColor = () => {
      this.colorsMessage.data = this.props.colors.filter(
        (item) => item.id !== id
      )

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
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

    this.props.onChangeColors({
      colors: this.colorsMessage.data,
      onGoingStep: 'colors changed',
    })

    parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

    trackSourceColorsManagementEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'REORDER_COLOR',
      }
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="colors"
        column={[
          {
            node: (
              <>
                <SimpleItem
                  id="add-color"
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.locals.colors.title}
                      indicator={this.props.colors.length.toString()}
                    />
                  }
                  rightPartSlot={
                    <Button
                      type="icon"
                      icon="plus"
                      feature="ADD_COLOR"
                      helper={{
                        label: this.props.locals.colors.actions.new,
                      }}
                      isBlocked={Colors.features(
                        this.props.planStatus,
                        this.props.config
                      ).COLORS.isReached(this.props.colors.length)}
                      action={(e: Event) => this.colorsHandler(e)}
                    />
                  }
                  alignment="CENTER"
                />
                {Colors.features(
                  this.props.planStatus,
                  this.props.config
                ).COLORS.isReached(this.props.colors.length) && (
                  <div
                    style={{
                      padding: 'var(--size-xxxsmall) var(--size-xsmall)',
                    }}
                  >
                    <SemanticMessage
                      type="INFO"
                      message={this.props.locals.info.maxNumberOfSourceColors.replace(
                        '{$1}',
                        (
                          Colors.features(
                            this.props.planStatus,
                            this.props.config
                          ).COLORS.limit ?? 0
                        ).toString()
                      )}
                      actionsSlot={
                        <Button
                          type="secondary"
                          label={this.props.locals.plan.getPro}
                          action={() =>
                            parent.postMessage(
                              { pluginMessage: { type: 'GET_PRO_PLAN' } },
                              '*'
                            )
                          }
                        />
                      }
                    />
                  </div>
                )}
                {this.props.colors.length === 0 ? (
                  <div className={layouts.centered}>
                    <SemanticMessage
                      type="NEUTRAL"
                      message={this.props.locals.colors.callout.message}
                      orientation="VERTICAL"
                      actionsSlot={
                        <Button
                          type="primary"
                          feature="ADD_COLOR"
                          label={this.props.locals.colors.callout.cta}
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
                            isActive={Colors.features(
                              this.props.planStatus,
                              this.props.config
                            ).COLORS_NAME.isActive()}
                          >
                            <div className="draggable-item__param--compact">
                              <Input
                                type="TEXT"
                                value={color.name}
                                charactersLimit={24}
                                feature="RENAME_COLOR"
                                helper={{
                                  label:
                                    this.props.locals.colors.actions.colorName,
                                  type: 'SINGLE_LINE',
                                }}
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_NAME.isBlocked()}
                                isNew={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_NAME.isNew()}
                                onBlur={this.colorsHandler}
                              />
                            </div>
                          </Feature>
                          <Feature
                            isActive={Colors.features(
                              this.props.planStatus,
                              this.props.config
                            ).COLORS_PARAMS.isActive()}
                          >
                            <div className="draggable-item__param">
                              <Input
                                type="COLOR"
                                value={hex}
                                feature="UPDATE_HEX"
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_PARAMS.isBlocked()}
                                isNew={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_PARAMS.isNew()}
                                onChange={this.colorsHandler}
                                onBlur={this.colorsHandler}
                              />
                            </div>
                          </Feature>
                          <Feature
                            isActive={Colors.features(
                              this.props.planStatus,
                              this.props.config
                            ).COLORS_HUE_SHIFTING.isActive()}
                          >
                            <div
                              className={doClassnames([
                                'draggable-item__param',
                                layouts['snackbar--tight'],
                              ])}
                            >
                              <Input
                                id="shift-hue"
                                type="NUMBER"
                                icon={{ type: 'LETTER', value: 'H' }}
                                unit="°"
                                value={
                                  color.hue.shift !== undefined
                                    ? color.hue.shift.toString()
                                    : '100'
                                }
                                min="-180"
                                max="180"
                                feature="SHIFT_HUE"
                                helper={{
                                  label:
                                    this.props.locals.colors.actions.shiftHue,
                                  type: 'SINGLE_LINE',
                                }}
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_HUE_SHIFTING.isBlocked()}
                                isNew={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_HUE_SHIFTING.isNew()}
                                onBlur={this.colorsHandler}
                                onShift={this.colorsHandler}
                              />
                              {!Colors.features(
                                this.props.planStatus,
                                this.props.config
                              ).COLORS_HUE_SHIFTING.isBlocked() && (
                                <Button
                                  type="icon"
                                  icon="reset"
                                  feature="RESET_HUE"
                                  isDisabled={!color.hue.isLocked}
                                  action={this.colorsHandler}
                                />
                              )}
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

                      return {
                        title: this.props.locals.colors.moreParameters.replace(
                          '{$1}',
                          color.name
                        ),
                        node: (() => (
                          <>
                            <Feature
                              isActive={Colors.features(
                                this.props.planStatus,
                                this.props.config
                              ).COLORS_PARAMS.isActive()}
                            >
                              <FormItem
                                id="shift-lch"
                                label={this.props.locals.colors.lch.label}
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_PARAMS.isBlocked()}
                              >
                                <InputsBar customClassName="draggable-item__param">
                                  <Input
                                    type="NUMBER"
                                    value={lch[0].toFixed(0)}
                                    min="0"
                                    max="100"
                                    isBlocked={Colors.features(
                                      this.props.planStatus,
                                      this.props.config
                                    ).COLORS_PARAMS.isBlocked()}
                                    feature="UPDATE_LIGHTNESS"
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                  <Input
                                    type="NUMBER"
                                    value={lch[1].toFixed(0)}
                                    min="0"
                                    max="100"
                                    isBlocked={Colors.features(
                                      this.props.planStatus,
                                      this.props.config
                                    ).COLORS_PARAMS.isBlocked()}
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
                                    isBlocked={Colors.features(
                                      this.props.planStatus,
                                      this.props.config
                                    ).COLORS_PARAMS.isBlocked()}
                                    feature="UPDATE_HUE"
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                </InputsBar>
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={Colors.features(
                                this.props.planStatus,
                                this.props.config
                              ).COLORS_CHROMA_SHIFTING.isActive()}
                            >
                              <FormItem
                                id="shift-chroma"
                                label={
                                  this.props.locals.colors.chromaShifting.label
                                }
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_CHROMA_SHIFTING.isBlocked()}
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
                                    isBlocked={Colors.features(
                                      this.props.planStatus,
                                      this.props.config
                                    ).COLORS_CHROMA_SHIFTING.isBlocked()}
                                    isNew={Colors.features(
                                      this.props.planStatus,
                                      this.props.config
                                    ).COLORS_CHROMA_SHIFTING.isNew()}
                                    onBlur={this.colorsHandler}
                                    onShift={this.colorsHandler}
                                  />
                                  {!Colors.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).COLORS_CHROMA_SHIFTING.isBlocked() && (
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
                              isActive={Colors.features(
                                this.props.planStatus,
                                this.props.config
                              ).COLORS_DESCRIPTION.isActive()}
                            >
                              <FormItem
                                id="update-color-description"
                                label={
                                  this.props.locals.global.description.label
                                }
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_DESCRIPTION.isBlocked()}
                              >
                                <Input
                                  id="update-color-description"
                                  type="LONG_TEXT"
                                  value={color.description}
                                  placeholder={
                                    this.props.locals.global.description
                                      .placeholder
                                  }
                                  feature="UPDATE_DESCRIPTION"
                                  isBlocked={Colors.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).COLORS_DESCRIPTION.isBlocked()}
                                  isNew={Colors.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).COLORS_DESCRIPTION.isNew()}
                                  isGrowing
                                  onBlur={this.colorsHandler}
                                />
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={Colors.features(
                                this.props.planStatus,
                                this.props.config
                              ).COLORS_ALPHA.isActive()}
                            >
                              <FormItem
                                id="switch-alpha-mode"
                                label={this.props.locals.colors.alpha.label}
                                helper={{
                                  type: 'INFO',
                                  message:
                                    this.props.locals.colors.alpha.message,
                                }}
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_ALPHA.isBlocked()}
                              >
                                <Select
                                  id="switch-alpha-mode"
                                  type="SWITCH_BUTTON"
                                  feature="SWITCH_ALPHA_MODE"
                                  isChecked={color.alpha.isEnabled}
                                  isBlocked={Colors.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).COLORS_ALPHA.isBlocked()}
                                  isNew={Colors.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).COLORS_ALPHA.isNew()}
                                  action={this.colorsHandler}
                                />
                              </FormItem>
                            </Feature>
                            <Feature
                              isActive={
                                Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_BACKGROUND_COLOR.isActive() &&
                                color.alpha.isEnabled
                              }
                            >
                              <FormItem
                                id="update-color-background"
                                label={
                                  this.props.locals.colors.backgroundColor.label
                                }
                                isBlocked={Colors.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).COLORS_BACKGROUND_COLOR.isBlocked()}
                              >
                                <Input
                                  id="update-color-background"
                                  type="COLOR"
                                  value={color.alpha.backgroundColor}
                                  feature="UPDATE_BACKGROUND_COLOR"
                                  isBlocked={Colors.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).COLORS_BACKGROUND_COLOR.isBlocked()}
                                  isNew={Colors.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).COLORS_BACKGROUND_COLOR.isNew()}
                                  onChange={this.colorsHandler}
                                  onBlur={this.colorsHandler}
                                />
                              </FormItem>
                            </Feature>
                          </>
                        ))(),
                      }
                    })}
                    helpers={{
                      remove: this.props.locals.colors.actions.removeColor,
                      more: this.props.locals.colors.actions.moreParameters,
                    }}
                    isScrollable
                    isTopBorderEnabled
                    onChangeSortableList={this.onChangeOrder}
                    onRemoveItem={this.colorsHandler}
                  />
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
