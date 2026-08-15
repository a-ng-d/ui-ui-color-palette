import { PureComponent } from 'preact/compat'
import {
  Channel,
  ColorConfiguration,
  ExchangeConfiguration,
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
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { trackScaleManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

const CURVE_TRACKING_FEATURE: Record<
  ShiftCurve,
  `SET_CHROMA_CURVE_${ShiftCurve}`
> = {
  LINEAR: 'SET_CHROMA_CURVE_LINEAR',
  HYPERBOLA: 'SET_CHROMA_CURVE_HYPERBOLA',
  FREE: 'SET_CHROMA_CURVE_FREE',
}

const MAX_STACKED_TRACKS = 6

interface ChromaProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  shift: ShiftConfiguration
  onChangeShift: (
    feature?: string,
    state?: string,
    value?: ShiftCurveConfiguration
  ) => void
}

interface ChromaState {
  gradient: { tracks: ShiftGradientStop[][] }
}

export default class Chroma extends PureComponent<ChromaProps, ChromaState> {
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
    SCALE_CHROMA: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CHROMA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Chroma.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ChromaProps) {
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
      sourceColors?.map((color) => color.rgb),
      palette.colorSpace,
      palette.algorithmVersion,
      palette.visionSimulationMode,
    ])
  }

  computeGradient = (): { tracks: ShiftGradientStop[][] } => {
    const palette = this.palette.value as ExchangeConfiguration
    const sourceColors = palette.colors as ColorConfiguration[] | undefined

    if (sourceColors === undefined || sourceColors.length === 0)
      return { tracks: [] }

    const perColorTracks = sourceColors.map((sourceColor) =>
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
        .sampleShift('CHROMA')
        .map((stop) => ({ ...stop, outOfGamut: false }))
    )

    return {
      tracks:
        perColorTracks.length > MAX_STACKED_TRACKS
          ? [Preview.blend(perColorTracks)]
          : perColorTracks,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribePalette = $palette.subscribe((value) => {
      this.scaleMessage.data = value as ExchangeConfiguration

      const nextGradientKey = this.makeGradientKey()
      if (nextGradientKey !== this.gradientKey) {
        this.gradientKey = nextGradientKey
        this.setState({ gradient: this.computeGradient() })
      }
    })
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
      ...this.props.shift.chroma,
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
      this.palette.setKey('shift.chroma', nextShift)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, nextShift)

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('shift.chroma', nextShift)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeShift(feature, state, nextShift)

      sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      this.palette.setKey('shift.chroma', nextShift)
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
  }

  // Render
  render() {
    return (
      <Feature isActive={this.features.SCALE_CHROMA.isActive()}>
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.t('scale.shift.chroma.label')}
                  helper={this.props.t('scale.shift.chroma.helper')}
                />
              }
              rightPartSlot={
                <ShiftCurveSelector
                  id="update-chroma"
                  curve={this.props.shift.chroma.curve}
                  feature="SHIFT_CHROMA"
                  isBlocked={this.features.SCALE_CHROMA.isBlocked()}
                  isNew={this.features.SCALE_CHROMA.isNew()}
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
                  id="update-chroma"
                  channel="CHROMA"
                  label={this.props.t('scale.shift.chroma.label')}
                  shift={this.props.shift.chroma}
                  colors={{
                    min: 'hsl(187, 0%, 75%)',
                    max: 'hsl(187, 100%, 75%)',
                  }}
                  gradient={this.state.gradient}
                  feature="SHIFT_CHROMA"
                  isBlocked={this.features.SCALE_CHROMA.isBlocked()}
                  isNew={this.features.SCALE_CHROMA.isNew()}
                  onBlock={this.onBlockHandler}
                  onChangeValue={this.shiftHandler}
                  t={this.props.t}
                />
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
