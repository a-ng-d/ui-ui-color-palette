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

interface ChromaProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  shift: ShiftConfiguration
  onChangeShift: (feature?: string, state?: string, value?: number) => void
}

export default class Chroma extends PureComponent<ChromaProps> {
  private scaleMessage: ScaleMessage
  private subscribePalette: (() => void) | undefined
  private palette: typeof $palette

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

  constructor(props: ChromaProps) {
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
      this.palette.setKey('shift.chroma', value)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('shift.chroma', value)

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeShift(feature, state, value)

      if (this.props.service === 'EDIT')
        sendPluginMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      this.palette.setKey('shift.chroma', value)
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
        isActive={Chroma.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SCALE_CHROMA.isActive()}
      >
        <SimpleSlider
          id="update-chroma"
          label={this.props.t('scale.shift.chroma.label')}
          value={this.props.shift.chroma}
          min={0}
          max={200}
          colors={{
            min: 'hsl(187, 0%, 75%)',
            max: 'hsl(187, 100%, 75%)',
          }}
          warning={
            this.props.service === 'CREATE' &&
            this.props.shift.chroma !== 100 &&
            Chroma.features(
              this.props.planStatus,
              this.props.config,
              'EDIT',
              this.props.editor
            ).SCALE_CHROMA.isBlocked()
              ? {
                  label: this.props.t('scale.shift.chroma.warning'),
                  type: 'MULTI_LINE',
                }
              : undefined
          }
          feature="SHIFT_CHROMA"
          isBlocked={Chroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CHROMA.isBlocked()}
          isNew={Chroma.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SCALE_CHROMA.isNew()}
          onChange={this.shiftHandler}
        />
      </Feature>
    )
  }
}
