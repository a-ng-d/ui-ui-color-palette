import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  Contrast,
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  TextColorsThemeConfiguration,
  EasingConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { MultipleSlider } from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { ConfigContextType } from '../../../config/ConfigContext'

interface LightnessProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  id: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  distributionEasing: EasingConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  documentWidth: number
  onChangeScale: () => void
  onChangeThemes?: (scale: ScaleConfiguration) => void
}

interface LightnessState {
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
}

export default class Lightness extends PureComponent<
  LightnessProps,
  LightnessState
> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SCALE_CONFIGURATION: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CONFIGURATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: LightnessProps) {
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
    this.subscribePalette = $palette.subscribe((value) => {
      this.scaleMessage.data = value as ExchangeConfiguration
    })
  }

  componentWillUnmount = () => {
    if (this.subscribePalette) this.subscribePalette()
  }

  // Handlers
  lightnessHandler = (
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
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      this.palette.setKey('scale', results.scale)
      if (feature === 'ADD_STOP' || feature === 'DELETE_STOP')
        this.palette.setKey('preset.stops', results.stops ?? [])

      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
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

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('scale', results.scale)

      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
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

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
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

      this.palette.setKey('scale', results.scale)

      this.setState({
        ratioLightForeground: lightForegroundRatio,
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

  // Render
  render() {
    if (this.props.service === 'CREATE')
      return (
        <Feature
          isActive={Lightness.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CONFIGURATION.isActive()}
        >
          <MultipleSlider
            {...this.props}
            type="EDIT"
            distributionEasing={this.props.distributionEasing}
            stops={{
              list: this.props.preset.stops,
              min: Infinity,
              max: Infinity,
            }}
            range={{
              min: 0,
              max: 100,
            }}
            colors={{
              min: 'black',
              max: 'white',
            }}
            tips={{
              minMax: this.props.t('scale.tips.distributeAsTooltip'),
            }}
            isBlocked={Lightness.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isBlocked()}
            isNew={Lightness.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isNew()}
            onChange={this.lightnessHandler}
          />
        </Feature>
      )

    // EDIT mode
    return (
      <Feature
        isActive={Lightness.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SCALE_CONFIGURATION.isActive()}
      >
        {this.props.preset.id.includes('CUSTOM') ? (
          <MultipleSlider
            {...this.props}
            type="FULLY_EDIT"
            distributionEasing={this.props.distributionEasing}
            stops={{
              list: this.props.preset.stops,
              min: 2,
              max: Lightness.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).PRESETS_CUSTOM_ADD.isReached(this.props.preset.stops.length)
                ? Lightness.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).PRESETS_CUSTOM_ADD.limit
                : 24,
            }}
            range={{
              min: 0,
              max: 100,
              step: 0.1,
            }}
            colors={{
              min: 'black',
              max: 'white',
            }}
            tips={{
              minMax: this.props.t('scale.tips.distributeAsTooltip'),
            }}
            isBlocked={Lightness.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isBlocked()}
            isNew={Lightness.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isNew()}
            onChange={this.lightnessHandler}
          />
        ) : (
          <MultipleSlider
            {...this.props}
            type="EDIT"
            distributionEasing={this.props.distributionEasing}
            stops={{
              list: this.props.preset.stops,
              min: Infinity,
              max: Infinity,
            }}
            range={{
              min: 0,
              max: 100,
            }}
            colors={{
              min: 'black',
              max: 'white',
            }}
            tips={{
              minMax: this.props.t('scale.tips.distributeAsTooltip'),
            }}
            isBlocked={Lightness.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isBlocked()}
            isNew={Lightness.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SCALE_CONFIGURATION.isNew()}
            onChange={this.lightnessHandler}
          />
        )}
      </Feature>
    )
  }
}
