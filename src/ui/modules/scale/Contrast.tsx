import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  Contrast as ContrastEngine,
  EasingConfiguration,
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import {
  Button,
  MultipleSlider,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ContrastProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  distributionEasing: EasingConfiguration
  onChangeScale: () => void
}

interface ContrastState {
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
}

export default class Contrast extends PureComponent<
  ContrastProps,
  ContrastState
> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static defaultProps: Partial<ContrastProps> = {
    distributionEasing: 'LINEAR',
  }

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SCALE_CONTRAST_RATIO: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CONTRAST_RATIO',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ContrastProps) {
    super(props)
    this.palette = $palette
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      id: this.props.id,
      data: this.palette.value as ExchangeConfiguration,
    }
    this.state = {
      ratioLightForeground: {},
      ratioDarkForeground: {},
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.setContrastMode()
    this.subscribePalette = $palette.subscribe((value) => {
      this.scaleMessage.data = value as ExchangeConfiguration
    })
  }

  componentDidUpdate(previousProps: Readonly<ContrastProps>): void {
    if (previousProps.scale !== this.props.scale) this.setContrastMode()
  }

  componentWillUnmount = () => {
    if (this.subscribePalette) this.subscribePalette()
  }

  // Handlers
  calculateLightnessForContrast = (
    textColor: string,
    contrastRatio: number,
    previousLightness?: number
  ): number => {
    const contrast = new ContrastEngine({ textColor })
    const newLightness = contrast.getLightnessForContrastRatio(contrastRatio)

    if (previousLightness !== undefined) {
      const maxChange = Math.max(5, previousLightness * 0.1)
      if (Math.abs(newLightness - previousLightness) > maxChange)
        return (
          previousLightness +
          (newLightness > previousLightness ? maxChange : -maxChange)
        )
    }

    return newLightness
  }

  contrastLightForegroundHandler = (
    state: string,
    results: {
      scale: Record<string, number>
      stops?: Array<number>
      min?: number
      max?: number
    },
    feature?: string
  ) => {
    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration
      const currentScale = this.palette.get().scale || {}

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = this.calculateLightnessForContrast(
          this.props.textColorsTheme.lightColor,
          value,
          currentScale[key]
        )
        darkForegroundRatio[key] = parseFloat(
          new ContrastEngine({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.sortScaleIfNeeded(scale)

      this.palette.setKey('scale', scale)

      this.setState({
        ratioLightForeground: results.scale,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeScale()

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration
      const currentScale = this.palette.get().scale || {}

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = this.calculateLightnessForContrast(
          this.props.textColorsTheme.lightColor,
          value,
          currentScale[key]
        )
        darkForegroundRatio[key] = new ContrastEngine({
          textColor: this.props.textColorsTheme.darkColor,
        }).getContrastRatioForLightness(scale[key])
      })

      this.sortScaleIfNeeded(scale)

      this.palette.setKey('scale', scale)

      this.setState({
        ratioLightForeground: results.scale,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeScale()

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration
      const currentScale = this.palette.get().scale || {}

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = this.calculateLightnessForContrast(
          this.props.textColorsTheme.lightColor,
          value,
          currentScale[key]
        )
        darkForegroundRatio[key] = new ContrastEngine({
          textColor: this.props.textColorsTheme.darkColor,
        }).getContrastRatioForLightness(scale[key])
      })

      this.sortScaleIfNeeded(scale)

      this.palette.setKey('scale', scale)

      this.setState({
        ratioLightForeground: results.scale,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.props.onChangeScale()
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

  contrastDarkForegroundHandler = (
    state: string,
    results: {
      scale: Record<string, number>
      stops?: Array<number>
      min?: number
      max?: number
    },
    feature?: string
  ) => {
    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration
      const currentScale = this.palette.get().scale || {}

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = this.calculateLightnessForContrast(
          this.props.textColorsTheme.darkColor,
          value,
          currentScale[key]
        )
        darkForegroundRatio[key] = parseFloat(
          new ContrastEngine({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.sortScaleIfNeeded(scale)

      this.palette.setKey('scale', scale)

      this.setState({
        ratioDarkForeground: results.scale,
        ratioLightForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeScale()

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      const scale = {} as ScaleConfiguration
      const lightForegroundRatio = {} as ScaleConfiguration
      const currentScale = this.palette.get().scale || {}

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = this.calculateLightnessForContrast(
          this.props.textColorsTheme.darkColor,
          value,
          currentScale[key]
        )
        lightForegroundRatio[key] = parseFloat(
          new ContrastEngine({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.sortScaleIfNeeded(scale)

      this.palette.setKey('scale', scale)

      this.setState({
        ratioDarkForeground: results.scale,
        ratioLightForeground: lightForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeScale()

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      const scale = {} as ScaleConfiguration
      const lightForegroundRatio = {} as ScaleConfiguration
      const currentScale = this.palette.get().scale || {}

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = this.calculateLightnessForContrast(
          this.props.textColorsTheme.darkColor,
          value,
          currentScale[key]
        )
        lightForegroundRatio[key] = parseFloat(
          new ContrastEngine({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.sortScaleIfNeeded(scale)

      this.palette.setKey('scale', scale)

      this.setState({
        ratioDarkForeground: results.scale,
        ratioLightForeground: lightForegroundRatio,
      })

      this.props.onChangeScale()
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

  // Direct Actions
  sortScaleIfNeeded = (scale: ScaleConfiguration) => {
    const stops = this.props.preset.stops
    if (!stops || stops.length < 2) return

    const scaleValues = stops.map((stop) => ({ stop, value: scale[stop] || 0 }))

    const firstValue = scaleValues[0].value
    const lastValue = scaleValues[scaleValues.length - 1].value
    const shouldBeIncreasing = lastValue > firstValue

    let needsSorting = false
    for (let i = 1; i < scaleValues.length; i++) {
      const prevValue = scaleValues[i - 1].value
      const currValue = scaleValues[i].value

      if (
        (shouldBeIncreasing && prevValue > currValue) ||
        (!shouldBeIncreasing && prevValue < currValue)
      ) {
        needsSorting = true
        break
      }
    }

    if (needsSorting) {
      const min = Math.min(...scaleValues.map((item) => item.value))
      const max = Math.max(...scaleValues.map((item) => item.value))
      const range = max - min

      scaleValues.forEach((item, index) => {
        const position = index / (scaleValues.length - 1)
        const newValue = shouldBeIncreasing
          ? min + range * position
          : max - range * position

        const currentValue = item.value
        const weight = 0.7
        scale[item.stop] = currentValue * (1 - weight) + newValue * weight
      })
    }
  }

  setContrastMode = () => {
    const lightForegroundRatio = {} as ScaleConfiguration
    const darkForegroundRatio = {} as ScaleConfiguration

    Object.entries(this.props.scale ?? {}).forEach(([key, value]) => {
      lightForegroundRatio[key] = parseFloat(
        new ContrastEngine({
          textColor: this.props.textColorsTheme.lightColor,
        })
          .getContrastRatioForLightness(value)
          .toFixed(1)
      )
      darkForegroundRatio[key] = parseFloat(
        new ContrastEngine({
          textColor: this.props.textColorsTheme.darkColor,
        })
          .getContrastRatioForLightness(value)
          .toFixed(1)
      )
    })

    this.setState({
      ratioLightForeground: lightForegroundRatio,
      ratioDarkForeground: darkForegroundRatio,
    })
  }

  // Render
  render() {
    const features = Contrast.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )

    return (
      <Feature isActive={features.SCALE_CONTRAST_RATIO.isActive()}>
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.t('scale.contrast.title')}
                  helper={this.props.t('scale.contrast.helper')}
                />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            ...(features.SCALE_CONTRAST_RATIO.isBlocked()
              ? [
                  {
                    node: (
                      <SemanticMessage
                        type="INFO"
                        message={this.props.t('info.contrastRatioOnFree')}
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
                    ),
                  },
                ]
              : []),
            {
              node: (
                <>
                  <MultipleSlider
                    {...this.props}
                    type="EDIT"
                    scale={this.state.ratioLightForeground}
                    stops={{
                      list: this.props.preset.stops,
                      min: Infinity,
                      max: Infinity,
                    }}
                    range={{
                      min: 0,
                      max: 21,
                      step: 0.1,
                    }}
                    colors={{
                      min: this.props.textColorsTheme.lightColor,
                      max: this.props.textColorsTheme.lightColor,
                    }}
                    tips={{
                      minMax: this.props.t('scale.tips.distributeAsTooltip'),
                    }}
                    hasPadding={false}
                    isBlocked={features.SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={features.SCALE_CONTRAST_RATIO.isNew()}
                    onBlock={() => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    }}
                    onChange={this.contrastLightForegroundHandler}
                  />
                  <MultipleSlider
                    {...this.props}
                    type="EDIT"
                    scale={this.state.ratioDarkForeground}
                    stops={{
                      list: this.props.preset.stops,
                      min: Infinity,
                      max: Infinity,
                    }}
                    range={{
                      min: 0,
                      max: 21,
                      step: 0.1,
                    }}
                    colors={{
                      min: this.props.textColorsTheme.darkColor,
                      max: this.props.textColorsTheme.darkColor,
                    }}
                    tips={{
                      minMax: this.props.t('scale.tips.distributeAsTooltip'),
                    }}
                    hasPadding={false}
                    isBlocked={features.SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={features.SCALE_CONTRAST_RATIO.isNew()}
                    onBlock={() => {
                      sendPluginMessage(
                        {
                          pluginMessage: {
                            type:
                              this.props.config.plan.isTrialEnabled &&
                              this.props.trialStatus !== 'EXPIRED'
                                ? 'GET_TRIAL'
                                : 'GET_PRO',
                          },
                        },
                        '*'
                      )
                    }}
                    onChange={this.contrastDarkForegroundHandler}
                  />
                </>
              ),
              spacingModifier: 'LARGE',
            },
          ]}
          border={['BOTTOM']}
        />
      </Feature>
    )
  }
}
