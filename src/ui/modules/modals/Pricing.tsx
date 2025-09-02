import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Card, Dialog, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import {
  BaseProps,
  Editor,
  Plans,
  PlanStatus,
  Service,
} from '../../../types/app'
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
        subtitle={this.props.locales.pricing.one.subtitle}
        richText={this.createTextWithBreaks(
          this.props.locales.pricing.one.text
        )}
        actions={
          <Button
            type="primary"
            label={this.props.locales.pricing.one.cta}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_ONE',
                  },
                },
                '*'
              )
            }}
          />
        }
        shouldFill
        action={() => {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'GO_TO_ONE',
              },
            },
            '*'
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
        subtitle={this.props.locales.pricing.oneFigma.subtitle}
        richText={this.createTextWithBreaks(
          this.props.locales.pricing.oneFigma.text
        )}
        actions={
          <Button
            type="primary"
            label={this.props.locales.pricing.oneFigma.cta}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'GO_TO_ONE_FIGMA',
                  },
                },
                '*'
              )
            }}
          />
        }
        shouldFill
        action={() => {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'GO_TO_ONE_FIGMA',
              },
            },
            '*'
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
        subtitle={this.props.locales.pricing.figma.subtitle}
        richText={this.createTextWithBreaks(
          this.props.locales.pricing.figma.text
        )}
        actions={
          <Button
            type="primary"
            label={this.props.locales.pricing.figma.cta}
            action={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              parent.postMessage(
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
          parent.postMessage(
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

  // Render
  render() {
    let padding

    switch (this.theme) {
      case 'figma-ui3':
        padding = 'var(--size-pos-xxsmall)'
        break
      case 'penpot':
        padding = 'var(--size-pos-xxsmall) var(--size-pos-small)'
        break
      case 'sketch':
        padding = 'var(--size-pos-xxsmall) var(--size-pos-small)'
        break
      default:
        padding = 'var(--size-pos-xxsmall)'
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
            style={{
              padding: padding,
              display: 'flex',
              flexDirection: this.state.isMobile ? 'column' : 'row',
              gap: 'var(--size-pos-xxxsmall)',
              width: '100%',
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
                default:
                  return null
              }
            })}
          </div>
        </Dialog>
      </Feature>
    )
  }
}
