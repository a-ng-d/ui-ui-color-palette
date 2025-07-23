import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Card, Dialog, List, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import isb from '../../../content/images/isb_product_thumbnail.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface StoreProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Store extends PureComponent<StoreProps> {
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    MORE_STORE: new FeatureStatus({
      features: config.features,
      featureName: 'MORE_STORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
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
        isActive={Store.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
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
              title={this.props.locales.store.isb.title}
              subtitle={this.props.locales.store.isb.subtitle}
              richText={
                <span className={texts.type}>
                  {this.props.locales.store.isb.text}
                </span>
              }
              actions={
                <Button
                  type="primary"
                  label={this.props.locales.store.isb.cta}
                  action={() => {
                    window
                      .open(this.props.config.urls.isbUrl, '_blank')
                      ?.focus()
                  }}
                />
              }
              shouldFill
              action={() => {
                window.open(this.props.config.urls.isbUrl, '_blank')?.focus()
              }}
            />
          </List>
        </Dialog>
      </Feature>
    )
  }
}
