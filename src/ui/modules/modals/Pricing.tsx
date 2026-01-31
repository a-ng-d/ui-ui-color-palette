import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, doScale, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  Card,
  Dialog,
  layouts,
  SemanticMessage,
  Tabs,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { AppStates } from '../../App'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  LicenseTrigger,
  PlanStatus,
  Service,
} from '../../../types/app'
import { $palette } from '../../../stores/palette'
import { trackPricingEvent } from '../../../external/tracking/eventsTracker'
import uicpu from '../../../content/images/uicp_ultimate.webp'
import uicpp from '../../../content/images/uicp_pro.webp'
import uicpa from '../../../content/images/uicp_activate.webp'
import uicpj from '../../../content/images/uicp_activate.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PricingProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  sourceColors: Array<SourceColorConfiguration>
  preset: PresetConfiguration
  scale: ScaleConfiguration
  licenseTrigger: LicenseTrigger
  onManageLicense: React.Dispatch<Partial<AppStates>>
  onSkipAndResetPalette: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PricingState {
  selectedPlan: 'WEEK' | 'MONTH' | 'YEAR' | 'LIFETIME'
}

export default class Pricing extends PureComponent<PricingProps, PricingState> {
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'PRO_PLAN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE',
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

    PREVIEW_LOCK_SOURCE_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_LOCK_SOURCE_COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_LCH: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_LCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_OKLCH: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_LAB: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_LAB',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_OKLAB: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLAB',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_HSL: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_HSLUV: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSLUV',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_NONE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_NONE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_ALGORITHM_V1: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_ALGORITHM_V1',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_ALGORITHM_V2: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_ALGORITHM_V2',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_ALGORITHM_V3: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_ALGORITHM_V3',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_CHROMA: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CHROMA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: PricingProps) {
    super(props)
    this.theme = document.documentElement.getAttribute('data-theme')
    this.state = {
      selectedPlan: 'WEEK',
    }
  }

  // Lifecycle
  componentDidMount() {
    trackPricingEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      { feature: 'VIEW_PRICING' }
    )
  }

  // Handlers
  planHandler = (e: Event) => {
    const newPlan = (e.currentTarget as HTMLElement).dataset
      .feature as PricingState['selectedPlan']

    this.setState({
      selectedPlan: newPlan,
    })
  }

  canSavePalette = (): boolean => {
    if (
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).SOURCE.isReached(this.refinedNumberOfSourceColors() - 1)
    )
      return false
    if (
      $palette.get().preset.id.includes('CUSTOM') &&
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).PRESETS_CUSTOM_ADD.isReached(Object.keys(this.props.scale).length - 1)
    )
      return false
    if (
      $palette.get().areSourceColorsLocked &&
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      ).PREVIEW_LOCK_SOURCE_COLORS.isBlocked()
    )
      return false
    if (
      $palette.get().shift.chroma !== 100 &&
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      ).SCALE_CHROMA.isBlocked()
    )
      return false
    if (
      $palette.get().visionSimulationMode !== 'NONE' &&
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      )[
        `SETTINGS_VISION_SIMULATION_MODE_${$palette.get().visionSimulationMode}` as keyof ReturnType<
          typeof Pricing.features
        >
      ].isBlocked()
    )
      return false
    if (
      $palette.get().colorSpace !== 'LCH' &&
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      )[
        `SETTINGS_COLOR_SPACE_${$palette.get().colorSpace}` as keyof ReturnType<
          typeof Pricing.features
        >
      ].isBlocked()
    )
      return false
    if (
      $palette.get().algorithmVersion !== 'v3' &&
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      )[
        `SETTINGS_ALGORITHM_${$palette.get().algorithmVersion.toUpperCase()}` as keyof ReturnType<
          typeof Pricing.features
        >
      ]?.isBlocked()
    )
      return false
    return true
  }

  refinedNumberOfSourceColors = (): number => {
    if (this.props.sourceColors.length > 1)
      return this.props.sourceColors.filter(
        (color) => color.source !== 'DEFAULT'
      ).length
    return this.props.sourceColors.length
  }

  // Direct Actions
  onSkipAndResetPalette = () => {
    let updatedPreset = this.props.preset
    let updatedStops = this.props.preset.stops
    let updatedSourceColors = this.props.sourceColors

    if (this.props.preset.id.includes('CUSTOM')) {
      const limit =
        Pricing.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).PRESETS_CUSTOM_ADD.limit ?? 0
      const currentStopsCount = this.props.preset.stops?.length ?? 0

      if (limit > 0 && currentStopsCount > limit) {
        updatedStops = this.props.preset.stops?.slice(0, limit) ?? []
        updatedPreset = {
          ...this.props.preset,
          stops: updatedStops,
        }
        $palette.setKey('preset', updatedPreset)
      }
    }

    const sourceColorLimit =
      Pricing.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).SOURCE.limit ?? 1

    const nonDefaultColors = this.props.sourceColors.filter(
      (color) => color.source !== 'DEFAULT'
    )
    const defaultColors = this.props.sourceColors.filter(
      (color) => color.source === 'DEFAULT'
    )

    if (nonDefaultColors.length > sourceColorLimit) {
      const limitedNonDefaultColors = nonDefaultColors.slice(
        0,
        sourceColorLimit
      )
      updatedSourceColors = [...defaultColors, ...limitedNonDefaultColors]
      $palette.setKey('sourceColors', updatedSourceColors)
    }

    $palette.setKey('areSourceColorsLocked', false)
    $palette.setKey('visionSimulationMode', 'NONE')
    $palette.setKey('colorSpace', 'LCH')
    $palette.setKey('algorithmVersion', 'v3')
    $palette.setKey('shift.chroma', 100)
    $palette.setKey(
      'scale',
      doScale(
        updatedStops,
        this.props.preset.min,
        this.props.preset.max,
        this.props.preset.easing
      )
    )

    this.props.onSkipAndResetPalette({
      sourceColors: updatedSourceColors,
      preset: updatedPreset,
      areSourceColorsLocked: false,
      visionSimulationMode: 'NONE',
      colorSpace: 'LCH',
      algorithmVersion: 'v3',
      shift: {
        chroma: 100,
      },
      scale: doScale(
        updatedStops,
        this.props.preset.min,
        this.props.preset.max,
        this.props.preset.easing
      ),
    })

    this.props.onClose()

    trackPricingEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      { feature: 'RESET_AND_CONTINUE' }
    )
  }

  // Templates
  Week = () => {
    return (
      <Card
        src={uicpp}
        title={this.props.t('pricing.pro.titles.week')}
        subtitle={this.props.t('pricing.pro.subtitles.week')}
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.pro.texts.week'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.pro.ctas.week')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_PRO_WEEK',
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId,
                this.props.userIdentity.id,
                this.props.planStatus,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_PRO_WEEK' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_PRO_WEEK',
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId,
            this.props.userIdentity.id,
            this.props.planStatus,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_PRO_WEEK' }
          )
        }}
      />
    )
  }

  Month = () => {
    return (
      <Card
        src={uicpp}
        title={this.props.t('pricing.pro.titles.month')}
        subtitle={this.props.t('pricing.pro.subtitles.month')}
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.pro.texts.month'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.pro.ctas.month')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_PRO_MONTH',
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId,
                this.props.userIdentity.id,
                this.props.planStatus,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_PRO_MONTH' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_PRO_MONTH',
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId,
            this.props.userIdentity.id,
            this.props.planStatus,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_PRO_MONTH' }
          )
        }}
      />
    )
  }

  Year = () => {
    return (
      <Card
        src={uicpp}
        title={this.props.t('pricing.pro.titles.year')}
        subtitle={this.props.t('pricing.pro.subtitles.year')}
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.pro.texts.year'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.pro.ctas.year')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_PRO_YEAR',
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId,
                this.props.userIdentity.id,
                this.props.planStatus,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_PRO_YEAR' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_PRO_YEAR',
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId,
            this.props.userIdentity.id,
            this.props.planStatus,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_PRO_YEAR' }
          )
        }}
      />
    )
  }

  Lifetime = () => {
    return (
      <Card
        src={uicpp}
        title={this.props.t('pricing.pro.titles.lifetime')}
        subtitle={this.props.t('pricing.pro.subtitles.lifetime')}
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.pro.texts.lifetime'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.pro.ctas.lifetime')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_PRO_LIFETIME',
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId,
                this.props.userIdentity.id,
                this.props.planStatus,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_PRO_LIFETIME' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_PRO_LIFETIME',
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId,
            this.props.userIdentity.id,
            this.props.planStatus,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_PRO_LIFETIME' }
          )
        }}
      />
    )
  }

  Activate = () => {
    return (
      <Card
        src={uicpa}
        title={this.props.t('pricing.activate.title')}
        richText={
          <span className={texts.type}>
            {this.props.t('pricing.activate.text')}
          </span>
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.activate.cta')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GET_LICENSE',
                  },
                },
                '*'
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GET_LICENSE',
              },
            },
            '*'
          )
        }}
      />
    )
  }

  Jump = () => {
    return (
      <Card
        src={uicpj}
        title={this.props.t('pricing.jump.title')}
        richText={
          <span className={texts.type}>
            {this.props.t('pricing.jump.text')}
          </span>
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.jump.cta')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GET_LICENSE',
                  },
                },
                '*'
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GET_LICENSE',
              },
            },
            '*'
          )
        }}
      />
    )
  }

  Ultimate = () => {
    return (
      <Card
        src={uicpu}
        title={this.props.t('pricing.ultimate.title')}
        subtitle={this.props.t('pricing.ultimate.subtitle')}
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.ultimate.text'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.ultimate.cta')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_ULTIMATE_REQUEST',
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId,
                this.props.userIdentity.id,
                this.props.planStatus,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_ULTIMATE_REQUEST' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_ULTIMATE_REQUEST',
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId,
            this.props.userIdentity.id,
            this.props.planStatus,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_ULTIMATE_REQUEST' }
          )
        }}
      />
    )
  }

  // Render
  render() {
    let padding, isFlex

    switch (this.theme) {
      case 'figma':
        padding = 'var(--size-pos-xxsmall)'
        isFlex = false
        break
      case 'penpot':
        padding = 'var(--size-pos-xxsmall) var(--size-pos-small)'
        isFlex = true
        break
      case 'sketch':
        padding = 'var(--size-pos-xxsmall) var(--size-pos-small)'
        isFlex = false
        break
      case 'framer':
        padding = 'var(--size-pos-xmsmall) var(--size-pos-xmsmall)'
        isFlex = true
        break
      default:
        padding = 'var(--size-pos-xxsmall)'
        isFlex = false
    }

    return (
      <Feature
        isActive={Pricing.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.t('pricing.title')}
          onClose={this.props.onClose}
        >
          <div
            className={doClassnames([
              layouts['stackbar'],
              layouts['stackbar--tight'],
            ])}
            style={{
              padding: padding,
              alignItems: 'stretch',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: isFlex ? 'block' : 'flex',
                justifyContent: isFlex ? 'unset' : 'center',
              }}
            >
              <Tabs
                tabs={[
                  {
                    label: this.props.t('pricing.subscriptions.week'),
                    id: 'WEEK',
                    isUpdated: false,
                  },
                  {
                    label: this.props.t('pricing.subscriptions.month'),
                    id: 'MONTH',
                    isUpdated: true,
                  },
                  {
                    label: this.props.t('pricing.subscriptions.year'),
                    id: 'YEAR',
                    isUpdated: false,
                  },
                  {
                    label: this.props.t('pricing.subscriptions.lifetime'),
                    id: 'LIFETIME',
                    isUpdated: false,
                  },
                ]}
                active={this.state.selectedPlan}
                isFlex={false}
                action={this.planHandler}
              />
            </div>
            {!this.canSavePalette() && this.props.service === 'CREATE' && (
              <SemanticMessage
                type="WARNING"
                message={this.props.t('pricing.limit.message')}
                actionsSlot={
                  <Button
                    type="secondary"
                    label={this.props.t('pricing.limit.cta')}
                    action={this.onSkipAndResetPalette}
                  />
                }
              />
            )}
            <div
              style={{
                display: 'flex',
                flexDirection:
                  this.props.documentWidth <= 460 ? 'column' : 'row',
                gap: 'var(--size-pos-xxxsmall)',
                flex: 1,
              }}
            >
              {this.state.selectedPlan === 'WEEK' && <this.Week />}
              {this.state.selectedPlan === 'MONTH' && <this.Month />}
              {this.state.selectedPlan === 'YEAR' && <this.Year />}
              {this.state.selectedPlan === 'LIFETIME' && <this.Lifetime />}
              <this.Ultimate />
              {this.props.licenseTrigger === 'ACTIVATE' ? (
                <this.Activate />
              ) : (
                <this.Jump />
              )}
            </div>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
