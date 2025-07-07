import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Card, Dialog } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Plans, PlanStatus, Service } from '../../../types/app'
import uicpo from '../../../content/images/uicp_one.webp'
import uicp from '../../../content/images/uicp_figma.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PricingProps extends BaseProps, WithConfigProps {
  plans: Plans
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PricingState {
  isMobile: boolean
}

export default class Pricing extends PureComponent<PricingProps, PricingState> {
  private theme: string | null
  private mediaQueryList: MediaQueryList | null = null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service
  ) => ({
    PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'PRO_PLAN',
      planStatus: planStatus,
      currentService: service,
    }),
  })

  constructor(props: PricingProps) {
    super(props)
    this.theme = document.documentElement.getAttribute('data-theme')
    this.state = {
      isMobile: false,
    }
  }

  componentDidMount() {
    this.mediaQueryList = window.matchMedia('(max-width: 460px)')
    this.setState({ isMobile: this.mediaQueryList.matches })
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      this.setState({ isMobile: event.matches })
    }
    this.mediaQueryList.addEventListener('change', handleMediaQueryChange)
  }

  componentWillUnmount() {
    if (this.mediaQueryList) {
      const handleMediaQueryChange = (event: MediaQueryListEvent) => {
        this.setState({ isMobile: event.matches })
      }

      this.mediaQueryList.removeEventListener('change', handleMediaQueryChange)
    }
  }

  // Render
  render() {
    let padding
    console.log('Pricing', this.props.plans)

    switch (this.theme) {
      case 'penpot':
        padding = 'var(--size-xxsmall) var(--size-small)'
        break
      case 'figma-ui3':
        padding = 'var(--size-xxsmall)'
        break
      default:
        padding = 'var(--size-xxsmall)'
    }

    return (
      <Feature
        isActive={Pricing.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locales.pricing.title}
          onClose={this.props.onClose}
        >
          <div
            style={{
              padding: padding,
              display: 'flex',
              flexDirection: this.state.isMobile ? 'column' : 'row',
              gap: 'var(--size-xxxsmall)',
            }}
          >
            {this.props.plans.includes('ONE') && (
              <Card
                src={uicpo}
                label={this.props.locales.pricing.one.message}
                shouldFill
                action={() => {
                  window
                    .open(this.props.config.urls.storeUrl, '_blank')
                    ?.focus()
                }}
              >
                <Button
                  type="primary"
                  label={this.props.locales.pricing.one.cta}
                  action={() => {
                    window
                      .open(this.props.config.urls.storeUrl, '_blank')
                      ?.focus()
                  }}
                />
              </Card>
            )}
            {this.props.plans.includes('FIGMA') && (
              <Card
                src={uicp}
                label={this.props.locales.pricing.figma.message}
                shouldFill
                action={() => {
                  parent.postMessage(
                    {
                      type: 'PAY_PRO_PLAN',
                    },
                    '*'
                  )
                }}
              >
                <Button
                  type="primary"
                  label={this.props.locales.pricing.figma.cta}
                  action={() => {
                    parent.postMessage(
                      {
                        type: 'PAY_PRO_PLAN',
                      },
                      '*'
                    )
                  }}
                />
              </Card>
            )}
          </div>
        </Dialog>
      </Feature>
    )
  }
}
