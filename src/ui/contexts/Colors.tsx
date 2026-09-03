import { uid } from 'uid'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  ColorConfiguration,
  HexModel,
  ShiftConfiguration,
  ShiftCurve,
  ShiftCurveConfiguration,
  areShiftsEqual,
} from '@yelbolt/engine-ui-color-palette'
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
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import ShiftCurveControl from '../components/ShiftCurveControl'
import Feature from '../components/Feature'
import { rafThrottle } from '../../utils/rafThrottle'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { debounce } from '../../utils/debounce'
import { ColorsMessage } from '../../types/messages'
import { SourceColorEvent } from '../../types/events'
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

const CURVE_TRACKING_FEATURE: Record<
  'hue' | 'chroma',
  Record<
    ShiftCurve,
    `SET_HUE_CURVE_${ShiftCurve}` | `SET_CHROMA_CURVE_${ShiftCurve}`
  >
> = {
  hue: {
    LINEAR: 'SET_HUE_CURVE_LINEAR',
    HYPERBOLA: 'SET_HUE_CURVE_HYPERBOLA',
    FREE: 'SET_HUE_CURVE_FREE',
  },
  chroma: {
    LINEAR: 'SET_CHROMA_CURVE_LINEAR',
    HYPERBOLA: 'SET_CHROMA_CURVE_HYPERBOLA',
    FREE: 'SET_CHROMA_CURVE_FREE',
  },
}

export default class Colors extends PureComponent<ColorsProps> {
  private colorsMessage: ColorsMessage
  private palette: typeof $palette
  private commitColorsChange: ((
    feature: SourceColorEvent['feature']
  ) => void) & {
    cancel: () => void
  }
  private applyColorsChange: ((data: ColorConfiguration[]) => void) & {
    cancel: () => void
  }

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
    this.commitColorsChange = debounce(
      (feature: SourceColorEvent['feature']) => {
        sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

        trackSourceColorsManagementEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId,
          this.props.userIdentity.id,
          this.props.planStatus,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature,
          }
        )
      },
      250
    )
    this.applyColorsChange = rafThrottle((data: ColorConfiguration[]) => {
      this.palette.setKey('colors', data)
    })
  }

  componentWillUnmount = () => {
    this.commitColorsChange.cancel()
    this.applyColorsChange.cancel()
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
          shift: { ...this.props.shift.hue },
          isLocked: false,
        },
        chroma: {
          shift: { ...this.props.shift.chroma },
          isLocked: false,
        },
        alpha: {
          isEnabled: false,
          backgroundColor: '#FFFFFF',
        },
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('ADD_COLOR')
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

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('RENAME_COLOR')
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

        this.applyColorsChange(this.colorsMessage.data)
      }

      this.commitColorsChange('UPDATE_HEX')
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

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('UPDATE_LCH')
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

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('UPDATE_LCH')
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

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('UPDATE_LCH')
    }

    const setHueShifting = () => {
      const max = parseFloat(currentElement.max),
        min = parseFloat(currentElement.min)
      let value = parseFloat(currentElement.value)

      if (value >= max) value = max
      if (value <= min) value = min

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.hue.shift = { ...item.hue.shift, value }
          item.hue.isLocked = !areShiftsEqual(
            item.hue.shift,
            this.props.shift.hue
          )
        }
        return item
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('SHIFT_HUE')
    }

    const setChromaShifting = () => {
      const max = parseFloat(currentElement.max),
        min = parseFloat(currentElement.min)
      let value = parseFloat(currentElement.value)

      if (value >= max) value = max
      if (value <= min) value = min

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.chroma.shift = { ...item.chroma.shift, value }
          item.chroma.isLocked = !areShiftsEqual(
            item.chroma.shift,
            this.props.shift.chroma
          )
        }
        return item
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('SHIFT_CHROMA')
    }

    const resetHue = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.hue.shift = { ...this.props.shift.hue }
          item.hue.isLocked = false
        }
        return item
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('RESET_HUE')
    }

    const resetChroma = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) {
          item.chroma.shift = { ...this.props.shift.chroma }
          item.chroma.isLocked = false
        }
        return item
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('RESET_CHROMA')
    }

    const updateColorDescription = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.description = currentElement.value
        return item
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('DESCRIBE_COLOR')
    }

    const switchAlphaMode = () => {
      let colorId = currentElement.getAttribute('data-color-id')
      if (!colorId) colorId = id

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === colorId) item.alpha.isEnabled = !item.alpha.isEnabled
        return item
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('SWITCH_ALPHA_MODE')
    }

    const updateBackgroundColor = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.alpha.backgroundColor = currentElement.value
        return item
      })

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('UPDATE_BACKGROUND_COLOR')
    }

    const removeColor = () => {
      this.colorsMessage.data = this.props.colors.filter(
        (item) => item.id !== id
      )

      this.applyColorsChange(this.colorsMessage.data)

      this.commitColorsChange('REMOVE_COLOR')
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

  shiftCurveHandler = (
    colorId: string,
    channel: 'hue' | 'chroma',
    feature: string,
    state: string,
    patch: Partial<ShiftCurveConfiguration>
  ) => {
    const color = this.props.colors.find((item) => item.id === colorId)
    if (color === undefined) return

    const nextShift: ShiftCurveConfiguration = {
      ...color[channel].shift,
      ...patch,
    }
    const nextIsLocked = !areShiftsEqual(nextShift, this.props.shift[channel])

    this.colorsMessage.data = this.props.colors.map((item) => {
      if (item.id === colorId)
        item[channel] = { shift: nextShift, isLocked: nextIsLocked }
      return item
    })

    this.applyColorsChange(this.colorsMessage.data)

    if (state === 'UPDATING') return

    sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

    const curve = patch.curve

    trackSourceColorsManagementEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature:
          curve !== undefined
            ? CURVE_TRACKING_FEATURE[channel][curve]
            : feature === 'SHIFT_HUE'
              ? 'SHIFT_HUE'
              : 'SHIFT_CHROMA',
      }
    )
  }

  curveShiftHandler = (
    colorId: string,
    channel: 'hue' | 'chroma',
    feature: string,
    curve: ShiftCurve
  ) => {
    this.shiftCurveHandler(colorId, channel, feature, 'RELEASED', { curve })
  }

  onShiftBlockHandler = () => {
    const isTrial =
      this.props.config.plan.isTrialEnabled &&
      this.props.trialStatus !== 'EXPIRED'
    sendPluginMessage(
      {
        pluginMessage: isTrial
          ? { type: 'GET_TRIAL' }
          : { type: 'GET_PRO', data: { origin: 'COLOR_SHIFTING' } },
      },
      '*'
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
                        const isTrial =
                          this.props.config.plan.isTrialEnabled &&
                          this.props.trialStatus !== 'EXPIRED'
                        sendPluginMessage(
                          {
                            pluginMessage: isTrial
                              ? { type: 'GET_TRIAL' }
                              : {
                                  type: 'GET_PRO',
                                  data: { origin: 'ADD_COLOR' },
                                },
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
                                {
                                  pluginMessage:
                                    this.props.config.plan.isTrialEnabled &&
                                    this.props.trialStatus !== 'EXPIRED'
                                      ? { type: 'GET_TRIAL' }
                                      : {
                                          type: 'GET_PRO',
                                          data: { origin: 'COLORS_ADD' },
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
                                charactersLimit={32}
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
                                    const isTrial =
                                      this.props.config.plan.isTrialEnabled &&
                                      this.props.trialStatus !== 'EXPIRED'
                                    sendPluginMessage(
                                      {
                                        pluginMessage: isTrial
                                          ? { type: 'GET_TRIAL' }
                                          : {
                                              type: 'GET_PRO',
                                              data: {
                                                origin: 'SWITCH_ALPHA_MODE',
                                              },
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
                                <ShiftCurveControl
                                  id={`shift-chroma-${color.id}`}
                                  channel="CHROMA"
                                  shift={color.chroma.shift}
                                  colors={{
                                    min: 'hsl(187, 0%, 75%)',
                                    max: 'hsl(187, 100%, 75%)',
                                  }}
                                  feature="SHIFT_CHROMA"
                                  isBlocked={this.features.COLORS_CHROMA_SHIFTING.isBlocked()}
                                  isNew={this.features.COLORS_CHROMA_SHIFTING.isNew()}
                                  onBlock={this.onShiftBlockHandler}
                                  variant="INPUT"
                                  resetSlot={
                                    !this.features.COLORS_CHROMA_SHIFTING.isBlocked() && (
                                      <Button
                                        type="icon"
                                        icon="reset"
                                        feature="RESET_CHROMA"
                                        isDisabled={!color.chroma.isLocked}
                                        action={this.colorsHandler}
                                      />
                                    )
                                  }
                                  onChangeCurve={(feature, curve) =>
                                    this.curveShiftHandler(
                                      color.id,
                                      'chroma',
                                      feature,
                                      curve
                                    )
                                  }
                                  onChangeValue={(feature, state, patch) =>
                                    this.shiftCurveHandler(
                                      color.id,
                                      'chroma',
                                      feature,
                                      state,
                                      patch
                                    )
                                  }
                                  t={this.props.t}
                                />
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
                                <ShiftCurveControl
                                  id={`shift-hue-${color.id}`}
                                  channel="HUE"
                                  shift={color.hue.shift}
                                  colors={{
                                    min: 'hsl(0, 100%, 75%)',
                                    max: 'hsl(180, 100%, 75%)',
                                  }}
                                  feature="SHIFT_HUE"
                                  isBlocked={this.features.COLORS_HUE_SHIFTING.isBlocked()}
                                  isNew={this.features.COLORS_HUE_SHIFTING.isNew()}
                                  onBlock={this.onShiftBlockHandler}
                                  variant="INPUT"
                                  resetSlot={
                                    !this.features.COLORS_HUE_SHIFTING.isBlocked() && (
                                      <Button
                                        type="icon"
                                        icon="reset"
                                        feature="RESET_HUE"
                                        isDisabled={!color.hue.isLocked}
                                        action={this.colorsHandler}
                                      />
                                    )
                                  }
                                  onChangeCurve={(feature, curve) =>
                                    this.curveShiftHandler(
                                      color.id,
                                      'hue',
                                      feature,
                                      curve
                                    )
                                  }
                                  onChangeValue={(feature, state, patch) =>
                                    this.shiftCurveHandler(
                                      color.id,
                                      'hue',
                                      feature,
                                      state,
                                      patch
                                    )
                                  }
                                  t={this.props.t}
                                />
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
