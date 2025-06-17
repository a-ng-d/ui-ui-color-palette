import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Card, Dialog, List } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus } from '../../../types/app'
import isb from '../../../content/images/isb_product_thumbnail.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface StoreProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Store extends PureComponent<StoreProps> {
  private theme: string | null

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    MORE_STORE: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_STORE',
      planStatus: planStatus,
    }),
  })

  constructor(props: StoreProps) {
    super(props)
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Render
  render() {
    let padding

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
        isActive={Store.features(
          this.props.planStatus,
          this.props.config
        ).MORE_STORE.isActive()}
      >
        <Dialog
          title={this.props.locales.store.title}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List
            padding={padding}
            isFullWidth
          >
            <Card
              src={isb}
              label={this.props.locales.store.isb.label}
              shouldFill
              action={() => {
                window.open(this.props.config.urls.isbUrl, '_blank')?.focus()
              }}
            >
              <Button
                type="primary"
                label={this.props.locales.store.isb.cta}
                action={() => {
                  window.open(this.props.config.urls.isbUrl, '_blank')?.focus()
                }}
              />
            </Card>
          </List>
        </Dialog>
      </Feature>
    )
  }
}
