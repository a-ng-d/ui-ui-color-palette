import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import {
  Button,
  Card,
  Dialog,
  Icon,
  layouts,
  SemanticMessage,
  Tabs,
  texts,
} from '@unoff/ui'
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
import buildCheckoutUrl from '../../../external/transactional/openCheckout'
import getPrices, {
  ProductPrice,
} from '../../../external/transactional/getPrices'
import checkSubscription from '../../../external/transactional/checkSubscription'
import { trackPricingEvent } from '../../../external/tracking/eventsTracker'
import { signIn } from '../../../external/auth/authentication'
import uicpu from '../../../content/images/uicp_ultimate.webp'
import uicpp from '../../../content/images/uicp_pro.webp'
import uicpa from '../../../content/images/uicp_activate.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PricingProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  licenseTrigger: LicenseTrigger
  onSubscribe: React.Dispatch<Partial<AppState>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PricingState {
  selectedPlan: 'WEEK' | 'MONTH' | 'YEAR' | 'LIFETIME'
  isSigningIn: boolean
  checkoutUrl: string | null
  checkoutOpenedInBrowser: string | null
  isCheckoutLoading: boolean
  isCheckingSubscription: boolean
  subscriptionCheckFailed: boolean
  productPrices: Record<string, ProductPrice>
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
      isSigningIn: false,
      checkoutUrl: null,
      checkoutOpenedInBrowser: null,
      isCheckoutLoading: false,
      isCheckingSubscription: false,
      subscriptionCheckFailed: false,
      productPrices: {},
    }
  }

  // Lifecycle
  componentDidMount() {
    window.addEventListener('message', this.polarMessageHandler)
    this.loadProductPrices()
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

  componentWillUnmount() {
    window.removeEventListener('message', this.polarMessageHandler)
  }

  // Handlers
  getPricingLocale = () =>
    navigator.languages?.[0] ?? navigator.language ?? this.props.config.lang

  loadProductPrices = async () => {
    this.setState({
      productPrices: await getPrices(
        [
          this.props.config.plan.storeProWeekId,
          this.props.config.plan.storeProMonthId,
          this.props.config.plan.storeProYearId,
          this.props.config.plan.storeProLifetimeId,
        ],
        this.getPricingLocale()
      ),
    })
  }

  getLocalizedPrice = (productId: string, fallback: string) =>
    this.state.productPrices[productId]?.formatted ?? fallback

  polarMessageHandler = (event: MessageEvent) => {
    const POLAR_ORIGINS = ['https://polar.sh', 'https://sandbox.polar.sh']
    if (!POLAR_ORIGINS.includes(event.origin)) return
    if (event.data?.type !== 'POLAR_CHECKOUT') return

    if (event.data.event === 'success') {
      this.setState({ checkoutUrl: null })
      this.props.onSubscribe({ isAccountSubscribed: true })
      sendPluginMessage({ pluginMessage: { type: 'WELCOME_TO_PRO' } }, '*')
    }
    if (event.data.event === 'close') this.setState({ checkoutUrl: null })
  }

  openCheckout = async (productId: string) => {
    if (this.state.checkoutUrl) return

    if (this.props.userSession.connectionStatus === 'UNCONNECTED') {
      this.setState({ isSigningIn: true })
      try {
        await signIn({
          authWorkerUrl: this.props.config.urls.authWorkerUrl,
          authUrl: this.props.config.urls.authUrl,
          platformUrl: this.props.config.urls.platformUrl,
          pluginId: this.props.config.env.pluginId,
        })
      } catch {
        this.setState({ isSigningIn: false })
        return
      }
      this.setState({ isSigningIn: false })
    }

    this.setState({ isCheckoutLoading: true })
    const url = await buildCheckoutUrl(
      productId,
      this.getPricingLocale(),
      this.props.config.env.isDev
    )

    const shouldOpenInBrowser = [
      'figma',
      'figjam',
      'dev',
      'dev_vscode',
      'buzz',
      'sketch',
    ].includes(this.props.editor)

    if (shouldOpenInBrowser && url) {
      this.setState({ isCheckoutLoading: false, checkoutOpenedInBrowser: url })
      sendPluginMessage(
        { pluginMessage: { type: 'OPEN_IN_BROWSER', data: { url } } },
        '*'
      )
      return
    }
    this.setState({ checkoutUrl: url ?? null })
  }

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
        subtitle={this.props.t('pricing.pro.subtitles.week', {
          price: this.getLocalizedPrice(
            this.props.config.plan.storeProWeekId,
            '$3.99'
          ),
        })}
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
            isLoading={this.state.isSigningIn}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              if (!this.props.config.env.isPolarEnabled) return
              this.openCheckout(this.props.config.plan.storeProWeekId)
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
          if (!this.props.config.env.isPolarEnabled) return
          this.openCheckout(this.props.config.plan.storeProWeekId)
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
        subtitle={this.props.t('pricing.pro.subtitles.month', {
          price: this.getLocalizedPrice(
            this.props.config.plan.storeProMonthId,
            '$7.99'
          ),
        })}
        richText={
          <span
            className={texts.type}
            dangerouslySetInnerHTML={{
              __html: this.props.t('pricing.pro.texts.month'),
            }}
          />
        }
        tag={this.props.t('pricing.bestDeal')}
        actions={
          <Button
            type="primary"
            label={this.props.t('pricing.pro.ctas.month')}
            isLoading={this.state.isSigningIn}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              if (!this.props.config.env.isPolarEnabled) return
              this.openCheckout(this.props.config.plan.storeProMonthId)
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
          if (!this.props.config.env.isPolarEnabled) return
          this.openCheckout(this.props.config.plan.storeProMonthId)
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
        subtitle={this.props.t('pricing.pro.subtitles.year', {
          price: this.getLocalizedPrice(
            this.props.config.plan.storeProYearId,
            '$75.99'
          ),
        })}
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
            isLoading={this.state.isSigningIn}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              if (!this.props.config.env.isPolarEnabled) return
              this.openCheckout(this.props.config.plan.storeProYearId)
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
          if (!this.props.config.env.isPolarEnabled) return
          this.openCheckout(this.props.config.plan.storeProYearId)
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
        subtitle={this.props.t('pricing.pro.subtitles.lifetime', {
          price: this.getLocalizedPrice(
            this.props.config.plan.storeProLifetimeId,
            '$149.99'
          ),
        })}
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
            isLoading={this.state.isSigningIn}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              if (!this.props.config.env.isPolarEnabled) return
              this.openCheckout(this.props.config.plan.storeProLifetimeId)
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
          if (!this.props.config.env.isPolarEnabled) return
          this.openCheckout(this.props.config.plan.storeProLifetimeId)
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

  CustomCheckout = () => {
    return (
      <Card
        src={this.props.licenseTrigger.imageSrc}
        title={this.props.licenseTrigger.title}
        richText={
          <span className={texts.type}>{this.props.licenseTrigger.text}</span>
        }
        actions={
          <Button
            type="primary"
            label={this.props.licenseTrigger.cta}
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
          onClose={() => {
            if (this.state.checkoutUrl) this.setState({ checkoutUrl: null })
            else if (this.state.checkoutOpenedInBrowser)
              this.setState({ checkoutOpenedInBrowser: null })
            else this.props.onClose()
          }}
        >
          {this.state.checkoutUrl && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <iframe
                src={`${this.state.checkoutUrl}&embed=true&embed_origin=${encodeURIComponent(window.location.origin)}`}
                style={{
                  width: '100%',
                  minHeight: '496px',
                  border: 'none',
                  display: 'block',
                  opacity: this.state.isCheckoutLoading ? 0 : 1,
                }}
                loading="lazy"
                onLoad={() => {
                  this.setState({ isCheckoutLoading: false })
                }}
                allow="payment 'self' https://sandbox.polar.sh https://polar.sh"
              />
              <div
                style={{
                  position: 'absolute',
                  display: this.state.isCheckoutLoading ? 'flex' : 'none',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  type="PICTO"
                  iconName="spinner"
                />
              </div>
            </div>
          )}
          {!this.state.checkoutUrl && (
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
              {this.state.checkoutOpenedInBrowser && (
                <SemanticMessage
                  type="INFO"
                  message={this.props.t('pricing.checkout.browser.title')}
                  actionsSlot={
                    <>
                      <Button
                        type="secondary"
                        label={this.props.t('pricing.checkout.browser.abort')}
                        action={() => {
                          this.setState({ checkoutOpenedInBrowser: null })
                        }}
                      />
                      <Button
                        type="primary"
                        label={
                          this.state.subscriptionCheckFailed
                            ? this.props.t('pricing.checkout.browser.failed')
                            : this.props.t('pricing.checkout.browser.done')
                        }
                        icon={
                          this.state.subscriptionCheckFailed
                            ? 'close'
                            : undefined
                        }
                        isLoading={this.state.isCheckingSubscription}
                        action={() => {
                          this.setState({ isCheckingSubscription: true })
                          checkSubscription()
                            .then((isSubscribed) => {
                              if (isSubscribed) {
                                this.setState({ checkoutOpenedInBrowser: null })
                                this.props.onSubscribe({
                                  isAccountSubscribed: true,
                                })
                                sendPluginMessage(
                                  { pluginMessage: { type: 'WELCOME_TO_PRO' } },
                                  '*'
                                )
                              }
                            })
                            .finally(() => {
                              this.setState({
                                isCheckingSubscription: false,
                              })
                            })
                            .catch((error) => {
                              console.error(error)
                              this.setState({ subscriptionCheckFailed: true })
                              setTimeout(() => {
                                this.setState({
                                  subscriptionCheckFailed: false,
                                })
                              }, 5000)
                            })
                        }}
                      />
                    </>
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
                {this.props.licenseTrigger.type === 'ACTIVATE' && (
                  <this.Activate />
                )}
                {this.props.licenseTrigger.type === 'CUSTOM_CHECKOUT' && (
                  <this.CustomCheckout />
                )}
              </div>
            </div>
          )}
        </Dialog>
      </Feature>
    )
  }
}
