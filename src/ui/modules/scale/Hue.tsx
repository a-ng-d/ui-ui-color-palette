import { PureComponent } from 'preact/compat'
import { listenKeys } from 'nanostores'
import {
  areShiftsEqual,
  Channel,
  ColorConfiguration,
  ExchangeConfiguration,
  PresetConfiguration,
  Preview,
  ShiftConfiguration,
  ShiftCurve,
  ShiftCurveConfiguration,
  ShiftGradientStop,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { Section, SectionTitle, SimpleItem } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import {
  ShiftCurveFields,
  ShiftCurveSelector,
} from '../../components/ShiftCurveControl'
import Feature from '../../components/Feature'
import { sampleColorsEvenly } from '../../../utils/sampleColorsEvenly'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { trackScaleManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

const CURVE_TRACKING_FEATURE: Record<
  ShiftCurve,
  `SET_HUE_CURVE_${ShiftCurve}`
> = {
  LINEAR: 'SET_HUE_CURVE_LINEAR',
  HYPERBOLA: 'SET_HUE_CURVE_HYPERBOLA',
  FREE: 'SET_HUE_CURVE_FREE',
}

const MAX_STACKED_TRACKS = 24

const GRADIENT_WATCHED_KEYS = [
  'colors',
  'colorSpace',
  'algorithmVersion',
  'visionSimulationMode',
  'shift.chroma',
] as const

interface HueProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  preset: PresetConfiguration
  shift: ShiftConfiguration
  onChangeShift: (
    feature?: string,
    state?: string,
    value?: ShiftCurveConfiguration
  ) => void
}

interface HueState {
  gradient: { tracks: ShiftGradientStop[][] }
}

export default class Hue extends PureComponent<HueProps, HueState> {
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
    SCALE_HUE: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_HUE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Hue.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: HueProps) {
    super(props)
    this.palette = $palette
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      id: this.props.id,
      data: this.palette.value as ExchangeConfiguration,
    }
    this.gradientKey = this.makeGradientKey()
    this.state = { gradient: this.computeGradient() }
  }

  // Derived Data
  makeGradientKey = (): string => {
    const palette = this.palette.value as ExchangeConfiguration
    const sourceColors = palette.colors as ColorConfiguration[] | undefined

    return JSON.stringify([
      sampleColorsEvenly(sourceColors ?? [], MAX_STACKED_TRACKS).map(
        (color) => color.rgb
      ),
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

    if (sourceColors === undefined || sourceColors.length === 0)
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
        .sampleShift('HUE', {
          otherShift: palette.shift?.chroma,
          lightnessRange,
        })
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
  shiftHandler = (
    feature: string,
    state: string,
    patch: Partial<ShiftCurveConfiguration>
  ) => {
    const nextShift: ShiftCurveConfiguration = {
      ...this.props.shift.hue,
      ...patch,
    }

    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, nextShift)

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')

      const curve = patch.curve
      if (curve !== undefined)
        trackScaleManagementEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId,
          this.props.userIdentity.id,
          this.props.planStatus,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: CURVE_TRACKING_FEATURE[curve],
          }
        )
    }

    const onChangeStop = () => {
      if (!areShiftsEqual(this.palette.get().shift.hue, nextShift))
        this.palette.setKey('shift.hue', nextShift)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, nextShift)

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      if (!areShiftsEqual(this.palette.get().shift.hue, nextShift))
        this.palette.setKey('shift.hue', nextShift)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeShift(feature, state, nextShift)

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      if (!areShiftsEqual(this.palette.get().shift.hue, nextShift))
        this.palette.setKey('shift.hue', nextShift)
      this.props.onChangeShift(feature, state, nextShift)
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

  curveHandler = (feature: string, curve: ShiftCurve) => {
    this.shiftHandler(feature, 'RELEASED', { curve })
  }

  onBlockHandler = () => {
    const isTrial =
      this.props.config.plan.isTrialEnabled &&
      this.props.trialStatus !== 'EXPIRED'
    sendPluginMessage(
      {
        pluginMessage: isTrial
          ? { type: 'GET_TRIAL' }
          : { type: 'GET_PRO', data: { origin: 'SCALE_HUE' } },
      },
      '*'
    )
  }

  // Render
  render() {
    return (
      <Feature isActive={this.features.SCALE_HUE.isActive()}>
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.t('scale.shift.hue.label')}
                  helper={this.props.t('scale.shift.hue.helper')}
                />
              }
              rightPartSlot={
                <ShiftCurveSelector
                  id="update-hue"
                  curve={this.props.shift.hue.curve}
                  feature="SHIFT_HUE"
                  isBlocked={this.features.SCALE_HUE.isBlocked()}
                  isNew={this.features.SCALE_HUE.isNew()}
                  onBlock={this.onBlockHandler}
                  onChangeCurve={this.curveHandler}
                  t={this.props.t}
                />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <ShiftCurveFields
                  id="update-hue"
                  channel="HUE"
                  shift={this.props.shift.hue}
                  colors={{
                    min: 'hsl(0, 100%, 75%)',
                    max: 'hsl(180, 100%, 75%)',
                  }}
                  gradient={this.state.gradient}
                  feature="SHIFT_HUE"
                  isBlocked={this.features.SCALE_HUE.isBlocked()}
                  isNew={this.features.SCALE_HUE.isNew()}
                  onBlock={this.onBlockHandler}
                  onChangeValue={this.shiftHandler}
                  t={this.props.t}
                />
              ),
              spacingModifier: 'LARGE',
            },
          ]}
        />
      </Feature>
    )
  }
}
