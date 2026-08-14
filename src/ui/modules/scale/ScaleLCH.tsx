import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  PresetConfiguration,
  ScaleConfiguration,
  EasingConfiguration,
  ShiftConfiguration,
  ShiftCurveConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import {
  Button,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  PlanStatus,
  Service,
  Subservice,
} from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'
import StopTools from './StopTools'
import Presets from './Presets'
import Lightness from './Lightness'
import Hue from './Hue'
import Contrast from './Contrast'
import Chroma from './Chroma'

interface ScaleLCHProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  subservice: Subservice
  id: string
  preset: PresetConfiguration
  distributionEasing: EasingConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  textColorsTheme: { lightColor: string; darkColor: string }
  onChangeScale: () => void
  onChangeShift: (
    feature?: string,
    state?: string,
    value?: ShiftCurveConfiguration
  ) => void
  onChangeThemes?: (scale: ScaleConfiguration) => void
  onChangeStops?: (stops: number[]) => void
  distributionEasingSlot?: React.ReactNode
}

export default class ScaleLCH extends PureComponent<ScaleLCHProps> {
  static defaultProps: Partial<ScaleLCHProps> = {
    distributionEasing: 'LINEAR',
  }

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return ScaleLCH.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Templates
  private renderLimitMessage = () => {
    const limit = this.features.PRESETS_CUSTOM_ADD.limit ?? 0

    if (
      !this.features.PRESETS_CUSTOM_ADD.isReached(
        this.props.preset.stops.length
      ) ||
      !this.props.preset.id.includes('CUSTOM')
    )
      return null

    return (
      <SemanticMessage
        type="INFO"
        message={this.props.t('info.maxNumberOfStops', {
          count: limit.toString(),
        })}
        actionsSlot={
          this.props.config.plan.isTrialEnabled &&
          this.props.trialStatus !== 'EXPIRED' ? (
            <Button
              type="secondary"
              label={this.props.t('plan.tryPro')}
              action={() =>
                sendPluginMessage({ pluginMessage: { type: 'GET_TRIAL' } }, '*')
              }
            />
          ) : (
            <Button
              type="secondary"
              label={this.props.t('plan.getPro')}
              action={() =>
                sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
              }
            />
          )
        }
      />
    )
  }

  Edit = () => {
    return (
      <>
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.t('scale.lightness.label')}
                  helper={this.props.t('scale.lightness.helper')}
                />
              }
              rightPartSlot={
                <Presets
                  {...this.props}
                  id={this.props.id}
                  preset={this.props.preset}
                  onChangeThemes={this.props.onChangeThemes}
                />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: this.renderLimitMessage(),
            },
            {
              node: (
                <Lightness
                  {...this.props}
                  id={this.props.id}
                  preset={this.props.preset}
                  scale={this.props.scale}
                  distributionEasing={this.props.distributionEasing}
                  textColorsTheme={this.props.textColorsTheme}
                  documentWidth={this.props.documentWidth}
                  onChangeScale={this.props.onChangeScale}
                  onChangeThemes={this.props.onChangeThemes}
                  onChangeStops={this.props.onChangeStops}
                />
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <SimpleItem
                  id="lightness-tools"
                  leftPartSlot={this.props.distributionEasingSlot}
                  rightPartSlot={
                    <StopTools
                      {...this.props}
                      id={this.props.id}
                      preset={this.props.preset}
                      scale={this.props.scale}
                      distributionEasing={this.props.distributionEasing}
                      onChangeScale={this.props.onChangeScale}
                      onChangeStops={this.props.onChangeStops}
                    />
                  }
                  alignment="CENTER"
                  isListItem={false}
                />
              ),
              spacingModifier: 'NONE',
            },
          ]}
          border={['BOTTOM']}
        />
        <Contrast
          {...this.props}
          id={this.props.id}
          preset={this.props.preset}
          scale={this.props.scale}
          textColorsTheme={this.props.textColorsTheme}
          distributionEasing={this.props.distributionEasing}
          onChangeScale={this.props.onChangeScale}
        />
        <Chroma
          {...this.props}
          id={this.props.id}
          shift={this.props.shift}
          onChangeShift={this.props.onChangeShift}
        />
        <Hue
          {...this.props}
          id={this.props.id}
          shift={this.props.shift}
          onChangeShift={this.props.onChangeShift}
        />
      </>
    )
  }

  // Render
  render() {
    return <this.Edit />
  }
}
