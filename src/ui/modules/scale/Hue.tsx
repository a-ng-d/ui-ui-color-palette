import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  ExchangeConfiguration,
  ShiftConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { SimpleSlider } from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { ScaleMessage } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { ConfigContextType } from '../../../config/ConfigContext'

interface HueProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  shift: ShiftConfiguration
  onChangeShift: (feature?: string, state?: string, value?: number) => void
}

export default class Hue extends PureComponent<HueProps> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette

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

  constructor(props: HueProps) {
    super(props)
    this.palette = $palette
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      id: this.props.id,
      data: this.palette.value as ExchangeConfiguration,
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
  shiftHandler = (feature: string, state: string, value: number) => {
    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      this.palette.setKey('shift.hue', value)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('shift.hue', value)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      this.palette.setKey('shift.hue', value)
      this.props.onChangeShift(feature, state, value)
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
      <Feature
        isActive={Hue.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SCALE_HUE.isActive()}
      >
        <SimpleSlider
          id="update-hue"
          label={this.props.t('scale.shift.hue.label')}
          value={this.props.shift.hue ?? 0}
          min={-180}
          max={180}
          colors={{
            min: 'hsl(0, 100%, 75%)',
            max: 'hsl(180, 100%, 75%)',
          }}
          feature="SHIFT_HUE"
          isBlocked={Hue.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_HUE.isBlocked()}
          isNew={Hue.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_HUE.isNew()}
          onChange={this.shiftHandler}
        />
      </Feature>
    )
  }
}
