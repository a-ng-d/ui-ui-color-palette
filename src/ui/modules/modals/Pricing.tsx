import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Card, Dialog, layouts, Tabs, texts } from '@a_ng_d/figmug-ui'
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

interface PricingProps extends BaseProps, WithConfigProps {
  plans: Plans
  onManageLicense: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PricingState {
  isMobile: boolean
  context: 'REGULAR' | 'DISCOUNT'
}

export default class Pricing extends PureComponent<PricingProps, PricingState> {
  private theme: string | null
  private mediaQueryList: MediaQueryList | null = null

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
      isMobile: false,
      context: 'REGULAR',
    }
  }

  // Lifecycle
  componentDidMount() {
    this.mediaQueryList = window.matchMedia('(max-width: 460px)')
    this.setState({ isMobile: this.mediaQueryList.matches })
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      this.setState({ isMobile: event.matches })
    }
    this.mediaQueryList.addEventListener('change', handleMediaQueryChange)

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

  componentWillUnmount() {
    if (this.mediaQueryList) {
      const handleMediaQueryChange = (event: MediaQueryListEvent) => {
        this.setState({ isMobile: event.matches })
      }

      this.mediaQueryList.removeEventListener('change', handleMediaQueryChange)
    }
  }

  // Handlers
  navHandler = (e: Event) => {
    const newContext = (e.currentTarget as HTMLElement).dataset
      .feature as PricingState['context']

    this.setState({
      context: newContext,
    })
  }

  // Direct Actions
  createTextWithBreaks = (text: string) => {
    return text.split(/{br}/g).map((segment, index, array) =>
      index < array.length - 1 ? (
        <span
          className={texts.type}
          key={index}
        >
          {segment}
          <br />
        </span>
      ) : (
        <span
          className={texts.type}
          key={index}
        >
          {segment}
        </span>
      )
    )
  }

  // Templates
  One = () => {
    return (
      <Card
        src={uicpo}
        title={this.props.locales.pricing.one.title}
        subtitle={
          this.state.context === 'REGULAR'
            ? this.props.locales.pricing.one.subtitle.regular
            : this.props.locales.pricing.one.subtitle.discount
        }
        richText={this.createTextWithBreaks(
          this.props.locales.pricing.one.text
        )}
        actions={
          <Button
            type="primary"
            label={this.props.locales.pricing.one.cta}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_ONE',
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
        title={this.props.locales.pricing.oneFigma.title}
        subtitle={
          this.state.context === 'REGULAR'
            ? this.props.locales.pricing.oneFigma.subtitle.regular
            : this.props.locales.pricing.oneFigma.subtitle.discount
        }
        richText={this.createTextWithBreaks(
          this.props.locales.pricing.oneFigma.text
        )}
        actions={
          <Button
            type="primary"
            label={this.props.locales.pricing.oneFigma.cta}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              sendPluginMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_ONE_FIGMA',
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
                type: 'GO_TO_ONE_FIGMA',
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
        title={this.props.locales.pricing.figma.title}
        subtitle={
          this.state.context === 'REGULAR'
            ? this.props.locales.pricing.figma.subtitle.regular
            : this.props.locales.pricing.figma.subtitle.discount
        }
        richText={this.createTextWithBreaks(
          this.props.locales.pricing.figma.text
        )}
        actions={
          <Button
            type="primary"
            label={this.props.locales.pricing.figma.cta}
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
        title={this.props.locales.pricing.activate.title}
        richText={
          <span className={texts.type}>
            {this.props.locales.pricing.activate.text}
          </span>
        }
        actions={
          <Button
            type="primary"
            label={this.props.locales.pricing.activate.cta}
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
          title={this.props.locales.pricing.title}
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
                    label: this.props.locales.pricing.contexts.regular,
                    id: 'REGULAR',
                    isUpdated: false,
                  },
                  {
                    label: this.props.locales.pricing.contexts.discount,
                    id: 'DISCOUNT',
                    isUpdated: true,
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
                flexDirection: this.state.isMobile ? 'column' : 'row',
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
