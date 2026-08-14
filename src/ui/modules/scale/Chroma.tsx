import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  ExchangeConfiguration,
  ShiftConfiguration,
  ShiftCurve,
  ShiftCurveConfiguration,
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
import { ConfigContextType } from '../../../config/ConfigContext'

interface ChromaProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  shift: ShiftConfiguration
  onChangeShift: (
    feature?: string,
    state?: string,
    value?: ShiftCurveConfiguration
  ) => void
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
