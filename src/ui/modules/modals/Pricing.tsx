import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Card, Dialog, layouts, Tabs, texts } from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { AppStates } from '../../App'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  Plans,
  PlanStatus,
  Service,
} from '../../../types/app'
import { trackPricingEvent } from '../../../external/tracking/eventsTracker'
import uicpo from '../../../content/images/uicp_one.webp'
import uicp from '../../../content/images/uicp_figma.webp'
import uicpa from '../../../content/images/uicp_activate.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PricingProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  plans: Plans
  onManageLicense: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PricingState {
  context: 'REGULAR' | 'DISCOUNT'
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
  })

  constructor(props: PricingProps) {
    super(props)
    this.theme = document.documentElement.getAttribute('data-theme')
    this.state = {
      context: 'DISCOUNT',
    }
  }

  // Lifecycle
  componentDidMount() {
    trackPricingEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId === ''
        ? this.props.userIdentity.id === ''
          ? ''
          : this.props.userIdentity.id
        : this.props.userSession.userId,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      { feature: 'VIEW_PRICING' }
    )
  }

  // Handlers
  navHandler = (e: Event) => {
    const newContext = (e.currentTarget as HTMLElement).dataset
      .feature as PricingState['context']

    this.setState({
      context: newContext,
    })
  }

  // Templates
  One = () => {
    return (
      <Card
        src={uicpo}
        title={this.props.t('pricing.one.title')}
        subtitle={
          this.state.context === 'REGULAR'
            ? this.props.t('pricing.one.subtitle.regular')
            : this.props.t('pricing.one.subtitle.discount')
        }
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.one.text'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.one.cta')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_ONE',
                    data: {
                      context: this.state.context,
                    },
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId === ''
                  ? this.props.userIdentity.id === ''
                    ? ''
                    : this.props.userIdentity.id
                  : this.props.userSession.userId,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_ONE' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_ONE',
                data: {
                  context: this.state.context,
                },
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId === ''
              ? this.props.userIdentity.id === ''
                ? ''
                : this.props.userIdentity.id
              : this.props.userSession.userId,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_ONE' }
          )
        }}
      />
    )
  }

  OneFigma = () => {
    return (
      <Card
        src={uicpo}
        title={this.props.t('pricing.oneFigma.title')}
        subtitle={
          this.state.context === 'REGULAR'
            ? this.props.t('pricing.oneFigma.subtitle.regular')
            : this.props.t('pricing.oneFigma.subtitle.discount')
        }
        richText={
          <span
              className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.oneFigma.text'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.oneFigma.cta')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_ONE',
                    data: {
                      context: this.state.context,
                    },
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId === ''
                  ? this.props.userIdentity.id === ''
                    ? ''
                    : this.props.userIdentity.id
                  : this.props.userSession.userId,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_ONE_FIGMA' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_ONE',
                data: {
                  context: this.state.context,
                },
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId === ''
              ? this.props.userIdentity.id === ''
                ? ''
                : this.props.userIdentity.id
              : this.props.userSession.userId,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_ONE_FIGMA' }
          )
        }}
      />
    )
  }

  Figma = () => {
    return (
      <Card
        src={uicp}
        title={this.props.t('pricing.figma.title')}
        subtitle={
          this.state.context === 'REGULAR'
            ? this.props.t('pricing.figma.subtitle.regular')
            : this.props.t('pricing.figma.subtitle.discount')
        }
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.figma.text'),
            }}
          />
        }
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.figma.cta')}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_CHECKOUT',
                  },
                },
                '*'
              )

              trackPricingEvent(
                this.props.config.env.isMixpanelEnabled,
                this.props.userSession.userId === ''
                  ? this.props.userIdentity.id === ''
                    ? ''
                    : this.props.userIdentity.id
                  : this.props.userSession.userId,
                this.props.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                { feature: 'GO_TO_CHECKOUT' }
              )
            }}
          />
        }
        shouldFill
        action={() => {
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'GO_TO_CHECKOUT',
              },
            },
            '*'
          )

          trackPricingEvent(
            this.props.config.env.isMixpanelEnabled,
            this.props.userSession.userId === ''
              ? this.props.userIdentity.id === ''
                ? ''
                : this.props.userIdentity.id
              : this.props.userSession.userId,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            { feature: 'GO_TO_CHECKOUT' }
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
              this.props.onManageLicense({
                modalContext: 'LICENSE',
              })
            }}
          />
        }
        shouldFill
        action={() => {
          this.props.onManageLicense({
            modalContext: 'LICENSE',
          })
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
                    label: this.props.t('pricing.contexts.discount'),
                    id: 'DISCOUNT',
                    isUpdated: true,
                  },
                  {
                    label: this.props.t('pricing.contexts.regular'),
                    id: 'REGULAR',
                    isUpdated: false,
                  },
                ]}
                active={this.state.context}
                isFlex={isFlex}
                action={this.navHandler}
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
              {this.props.plans.map((plan) => {
                switch (plan) {
                  case 'ONE':
                    return <this.One />
                  case 'ONE_FIGMA':
                    return <this.OneFigma />
                  case 'FIGMA':
                    return <this.Figma />
                  case 'ACTIVATE':
                    return <this.Activate />
                  default:
                    return null
                }
              })}
            </div>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
