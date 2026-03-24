import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { Button, Card, Dialog, layouts, Tabs, texts } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { AppState } from '../../App'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  LicenseTrigger,
  PlanStatus,
  Service,
} from '../../../types/app'
import { trackPricingEvent } from '../../../external/tracking/eventsTracker'
import uicpu from '../../../content/images/uicp_ultimate.webp'
import uicpp from '../../../content/images/uicp_pro.webp'
import uicpa from '../../../content/images/uicp_activate.webp'
import uicpj from '../../../content/images/uicp_activate.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PricingProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  licenseTrigger: LicenseTrigger
  onManageLicense: React.Dispatch<Partial<AppState>>
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
  })

  private get features() {
    return Pricing.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

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
        tag={this.props.t('pricing.checkout.lemonsqueezy')}
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
        tag={
          this.props.licenseTrigger === 'ACTIVATE'
            ? this.props.t('pricing.checkout.lemonsqueezy')
            : this.props.t('pricing.checkout.figma')
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
        tag={
          this.props.licenseTrigger === 'ACTIVATE'
            ? this.props.t('pricing.checkout.lemonsqueezy')
            : this.props.t('pricing.checkout.figma')
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
        tag={this.props.t('pricing.checkout.lemonsqueezy')}
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
      <Feature isActive={this.features.PRO_PLAN.isActive()}>
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
                    isNew: true,
                  },
                  {
                    label: this.props.t('pricing.subscriptions.month'),
                    id: 'MONTH',
                    isUpdated: false,
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
                isFlex={isFlex}
                action={this.planHandler}
              />
            </div>
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
