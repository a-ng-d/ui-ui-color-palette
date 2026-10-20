import { PureComponent } from 'preact/compat'
import { listenKeys } from 'nanostores'
import {
  Channel,
  ColorConfiguration,
  Contrast,
  EasingConfiguration,
  ExchangeConfiguration,
  PresetConfiguration,
  Preview,
  ScaleConfiguration,
  ShiftGradientStop,
  TextColorsThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { MultipleSlider } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sampleColorsEvenly } from '../../../utils/sampleColorsEvenly'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { ConfigContextType } from '../../../config/ConfigContext'

interface LightnessProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  distributionEasing: EasingConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  documentWidth: number
  onChangeScale: () => void
  onChangeThemes?: (scale: ScaleConfiguration) => void
  onChangeStops?: (stops: number[]) => void
}

interface LightnessState {
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
  gradient: { tracks: ShiftGradientStop[][] }
}

const MAX_STACKED_TRACKS = 24

const GRADIENT_WATCHED_KEYS = [
  'colors',
  'shift.hue',
  'shift.chroma',
  'colorSpace',
  'algorithmVersion',
  'visionSimulationMode',
] as const

export default class Lightness extends PureComponent<
  LightnessProps,
  LightnessState
> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette
  private gradientKey: string

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

  private get features() {
    return Lightness.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: LightnessProps) {
    super(props)
    this.palette = $palette
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      id: this.props.id,
      data: this.palette.value as ExchangeConfiguration,
    }
    this.gradientKey = this.makeGradientKey()
    this.state = {
      ratioLightForeground: {},
      ratioDarkForeground: {},
      gradient: this.computeGradient(),
    }
  }

  // Derived Data
  makeGradientKey = (): string => {
    const palette = this.palette.value as ExchangeConfiguration
    const sourceColors = palette.colors as ColorConfiguration[] | undefined

    return JSON.stringify([
      sampleColorsEvenly(sourceColors ?? [], MAX_STACKED_TRACKS).map(
        (color) => color.rgb
      ),
      palette.shift?.hue,
      palette.shift?.chroma,
      palette.colorSpace,
      palette.algorithmVersion,
      palette.visionSimulationMode,
      this.props.preset.min,
      this.props.preset.max,
    ])
  }

  computeGradient = (): { tracks: ShiftGradientStop[][] } => {
    const palette = this.palette.value as ExchangeConfiguration
    const sourceColors = palette.colors as ColorConfiguration[] | undefined
    const shift = palette.shift

    if (
      sourceColors === undefined ||
      sourceColors.length === 0 ||
      shift === undefined
    )
      return { tracks: [] }

    const lightnessRange = {
      min: this.props.preset.min,
      max: this.props.preset.max,
    }

    const perColorTracks = sampleColorsEvenly(
      sourceColors,
      MAX_STACKED_TRACKS
    ).map((sourceColor) =>
      new Preview({
        sourceColor: [
          sourceColor.rgb.r * 255,
          sourceColor.rgb.g * 255,
          sourceColor.rgb.b * 255,
        ] as Channel,
        colorSpace: palette.colorSpace,
        algorithmVersion: palette.algorithmVersion,
        visionSimulationMode: palette.visionSimulationMode,
      })
        .sampleLightness(
          { hue: shift.hue, chroma: shift.chroma },
          lightnessRange
        )
        .map((stop) => ({ ...stop, outOfGamut: false }))
    )

    return {
      tracks: perColorTracks,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribePalette = listenKeys(
      $palette,
      GRADIENT_WATCHED_KEYS,
      (value) => {
        this.scaleMessage.data = value as ExchangeConfiguration

        const nextGradientKey = this.makeGradientKey()
        if (nextGradientKey !== this.gradientKey) {
          this.gradientKey = nextGradientKey
          this.setState({ gradient: this.computeGradient() })
        }
      }
    )
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

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      this.palette.setKey('scale', { ...results.scale })
      if (feature === 'ADD_STOP' || feature === 'DELETE_STOP') {
        this.palette.setKey('preset.stops', results.stops ?? [])
        this.props.onChangeStops?.(results.stops ?? [])
      }

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

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('scale', { ...results.scale })

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

      this.palette.setKey('scale', { ...results.scale })

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
    return (
      <Feature isActive={this.features.SCALE_CONFIGURATION.isActive()}>
        {this.props.preset.id.includes('CUSTOM') ? (
          <MultipleSlider
            {...this.props}
            type="FULLY_EDIT"
            distributionEasing={this.props.distributionEasing}
            stops={{
              list: this.props.preset.stops,
              min: 2,
              max: this.features.PRESETS_CUSTOM_ADD.isReached(
                this.props.preset.stops.length
              )
                ? this.features.PRESETS_CUSTOM_ADD.limit
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
            gradient={this.state.gradient}
            tips={{
              minMax: this.props.t('scale.tips.distributeAsTooltip'),
            }}
            hasPadding={false}
            isBlocked={this.features.SCALE_CONFIGURATION.isBlocked()}
            isNew={this.features.SCALE_CONFIGURATION.isNew()}
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
                        data: { origin: 'SCALE_CONFIGURATION' },
                      },
                },
                '*'
              )
            }}
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
              step: 0.1,
            }}
            colors={{
              min: 'black',
              max: 'white',
            }}
            gradient={this.state.gradient}
            tips={{
              minMax: this.props.t('scale.tips.distributeAsTooltip'),
            }}
            hasPadding={false}
            isBlocked={this.features.SCALE_CONFIGURATION.isBlocked()}
            isNew={this.features.SCALE_CONFIGURATION.isNew()}
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
                        data: { origin: 'SCALE_CONFIGURATION' },
                      },
                },
                '*'
              )
            }}
            onChange={this.lightnessHandler}
          />
        )}
      </Feature>
    )
  }
}
