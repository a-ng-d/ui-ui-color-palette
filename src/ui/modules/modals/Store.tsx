import { Button, Card, Dialog, List, texts } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../../config/ConfigContext'
import isb from '../../../content/images/isb_product_thumbnail.webp'
import { BaseProps, PlanStatus } from '../../../types/app'
import Feature from '../../components/Feature'
import { WithConfigProps } from '../../components/WithConfig'

interface StoreProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Store extends PureComponent<StoreProps> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    MORE_STORE: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_STORE',
      planStatus: planStatus,
    }),
  })

  // Render
  render() {
    const theme = document.documentElement.getAttribute('data-theme')
    let padding

    switch (theme) {
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
          title={this.props.locals.store.title}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List
            padding={padding}
            isFullWidth
          >
            <Card
              src={isb}
              label={this.props.locals.store.isb.label}
              shouldFill
              action={() => {
                window.open(this.props.config.urls.isbUrl, '_blank')?.focus()
              }}
            >
              <Button
                type="primary"
                label={this.props.locals.store.isb.cta}
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
