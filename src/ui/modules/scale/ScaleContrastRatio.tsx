import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  Contrast,
  EasingConfiguration,
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, doScale, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  layouts,
  MultipleSlider,
  SectionTitle,
  Select,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { ConfigContextType } from '../../../config/ConfigContext'
import { defaultPreset } from '../../..//stores/presets'

interface ScaleProps extends BaseProps, WithConfigProps {
  id: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  distributionEasing: EasingConfiguration
  onChangeScale: () => void
  onSwitchMode: () => void
}

interface ScaleStates {
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
}

export default class ScaleContrastRatio extends PureComponent<
  ScaleProps,
  ScaleStates
> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static defaultProps: Partial<ScaleProps> = {
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
    SCALE_RESET: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_RESET',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ScaleProps) {
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

  componentDidUpdate(previousProps: Readonly<ScaleProps>): void {
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
    const contrast = new Contrast({ textColor })
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

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
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
          new Contrast({
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

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
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
        darkForegroundRatio[key] = new Contrast({
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

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
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
        darkForegroundRatio[key] = new Contrast({
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

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
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
          new Contrast({
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

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
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
          new Contrast({
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

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
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
          new Contrast({
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
        new Contrast({
          textColor: this.props.textColorsTheme.lightColor,
        })
          .getContrastRatioForLightness(value)
          .toFixed(1)
      )
      darkForegroundRatio[key] = parseFloat(
        new Contrast({
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

  // Direct Actions
  onResetScale = () => {
    const preset = this.props.preset ?? defaultPreset

    this.scaleMessage.data.scale = doScale(preset.stops, preset.min, preset.max)

    this.palette.setKey('scale', this.scaleMessage.data.scale)
    this.palette.setKey('shift.chroma', 100)

    this.props.onChangeScale()

    if (this.props.service === 'EDIT')
      parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
  }

  // Render
  render() {
    return (
      <>
        <div
          className={doClassnames([
            layouts['stackbar'],
            layouts['stackbar--fill'],
          ])}
        >
          <SimpleItem
            id="update-preset"
            leftPartSlot={
              <SectionTitle
                label={this.props.locales.scale.contrast.title}
                indicator={Object.entries(
                  this.props.scale ?? {}
                ).length.toString()}
              />
            }
            rightPartSlot={
              <div className={layouts['snackbar--medium']}>
                <Feature
                  isActive={ScaleContrastRatio.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_RESET.isActive()}
                >
                  <Button
                    type="icon"
                    icon="reset"
                    helper={{
                      label: this.props.locales.scale.actions.resetLightness,
                    }}
                    feature="RESET_SCALE"
                    isBlocked={ScaleContrastRatio.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_RESET.isBlocked()}
                    isNew={ScaleContrastRatio.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_RESET.isNew()}
                    action={this.onResetScale}
                  />
                </Feature>
                <span className={texts.type}>
                  {this.props.locales.separator}
                </span>
                <Feature
                  isActive={ScaleContrastRatio.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SCALE_CONTRAST_RATIO.isActive()}
                >
                  <Select
                    id="switch-contrast-mode"
                    type="SWITCH_BUTTON"
                    label={this.props.locales.scale.contrast.label}
                    isChecked={true}
                    isBlocked={ScaleContrastRatio.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={ScaleContrastRatio.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SCALE_CONTRAST_RATIO.isNew()}
                    action={this.props.onSwitchMode}
                  />
                </Feature>
              </div>
            }
            alignment="CENTER"
            isListItem={false}
          />
        </div>
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
            minMax: this.props.locales.scale.tips.distributeAsTooltip,
          }}
          isBlocked={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CONTRAST_RATIO.isBlocked()}
          isNew={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CONTRAST_RATIO.isNew()}
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
            minMax: this.props.locales.scale.tips.distributeAsTooltip,
          }}
          isBlocked={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CONTRAST_RATIO.isBlocked()}
          isNew={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CONTRAST_RATIO.isNew()}
          onChange={this.contrastDarkForegroundHandler}
        />
      </>
    )
  }
}
