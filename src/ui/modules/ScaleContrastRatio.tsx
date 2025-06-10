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
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  layouts,
  MultipleSlider,
  SectionTitle,
  Select,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { ScaleMessage } from '../../types/messages'
import { BaseProps, PlanStatus } from '../../types/app'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'

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
  private unsubscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static defaultProps: Partial<ScaleProps> = {
    distributionEasing: 'LINEAR',
  }

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    SCALE_CONTRAST_RATIO: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CONTRAST_RATIO',
      planStatus: planStatus,
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
    this.unsubscribePalette = $palette.subscribe((value) => {
      this.scaleMessage.data = value as ExchangeConfiguration
    })
  }

  componentDidUpdate(previousProps: Readonly<ScaleProps>): void {
    if (previousProps.scale !== this.props.scale) this.setContrastMode()
  }

  componentWillUnmount = () => {
    if (this.unsubscribePalette) this.unsubscribePalette()
  }

  // Handlers
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

      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        darkForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

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

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = new Contrast({
          textColor: this.props.textColorsTheme.lightColor,
        }).getLightnessForContrastRatio(value)
        darkForegroundRatio[key] = new Contrast({
          textColor: this.props.textColorsTheme.darkColor,
        }).getContrastRatioForLightness(scale[key])
      })

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

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = new Contrast({
          textColor: this.props.textColorsTheme.lightColor,
        }).getLightnessForContrastRatio(value)
        darkForegroundRatio[key] = new Contrast({
          textColor: this.props.textColorsTheme.darkColor,
        }).getContrastRatioForLightness(scale[key])
      })

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

      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        darkForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

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

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        lightForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

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

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        lightForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

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
                label={this.props.locals.scale.contrast.title}
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
                    this.props.config
                  ).SCALE_CONTRAST_RATIO.isActive()}
                >
                  <Select
                    id="switch-contrast-mode"
                    type="SWITCH_BUTTON"
                    label={this.props.locals.scale.contrast.label}
                    isChecked={true}
                    isBlocked={ScaleContrastRatio.features(
                      this.props.planStatus,
                      this.props.config
                    ).SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={ScaleContrastRatio.features(
                      this.props.planStatus,
                      this.props.config
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
          }}
          colors={{
            min: this.props.textColorsTheme.lightColor,
            max: this.props.textColorsTheme.lightColor,
          }}
          tips={{
            minMax: this.props.locals.scale.tips.distributeAsTooltip,
          }}
          isBlocked={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config
          ).SCALE_CONTRAST_RATIO.isBlocked()}
          isNew={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config
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
          }}
          colors={{
            min: this.props.textColorsTheme.darkColor,
            max: this.props.textColorsTheme.darkColor,
          }}
          tips={{
            minMax: this.props.locals.scale.tips.distributeAsTooltip,
          }}
          isBlocked={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config
          ).SCALE_CONTRAST_RATIO.isBlocked()}
          isNew={ScaleContrastRatio.features(
            this.props.planStatus,
            this.props.config
          ).SCALE_CONTRAST_RATIO.isNew()}
          onChange={this.contrastDarkForegroundHandler}
        />
      </>
    )
  }
}
