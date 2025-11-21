import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Card, Dialog, List, texts } from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import isb from '../../../content/images/isb_product_thumbnail.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface StoreProps extends BaseProps, WithConfigProps, WithTranslationProps {
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
      case 'figma':
        padding = 'var(--size-pos-xxsmall)'
        break
      case 'penpot':
        padding = 'var(--size-pos-xxsmall) var(--size-pos-small)'
        break
      case 'sketch':
        padding = 'var(--size-pos-xxsmall) var(--size-pos-small)'
        break
      case 'framer':
        padding = 'var(--size-pos-xmsmall)'
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
          title={this.props.t('store.title')}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List
            padding={padding}
            isFullWidth
          >
            <Card
              src={isb}
              title={this.props.t('store.isb.title')}
              subtitle={this.props.t('store.isb.subtitle')}
              richText={
                <span className={texts.type}>
                  {this.props.t('store.isb.text')}
                </span>
              }
              actions={
                <Button
                  type="primary"
                  label={this.props.t('store.isb.cta')}
                  action={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    sendPluginMessage(
                      {
                        pluginMessage: {
                          type: 'OPEN_IN_BROWSER',
                          data: {
                            url: this.props.config.urls.isbUrl,
                          },
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
                      type: 'OPEN_IN_BROWSER',
                      data: {
                        url: this.props.config.urls.isbUrl,
                      },
                    },
                  },
                  '*'
                )
              }}
            />
          </List>
        </Dialog>
      </Feature>
    )
  }
}
