import { PureComponent, MouseEvent, ChangeEventHandler } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import { Button, Card, Dialog, List, texts } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import isb from '../../../content/images/isb_product_thumbnail.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface StoreProps extends BaseProps, WithConfigProps, WithTranslationProps {
  onClose: ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Store extends PureComponent<StoreProps> {
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

  private get features() {
    return Store.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Render
  render() {
    return (
      <Feature isActive={this.features.MORE_STORE.isActive()}>
        <Dialog
          title={this.props.t('store.title')}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <div className="dialog__text">
            <List
              isFullWidth
              isFullHeight
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
                    action={(e: MouseEvent<HTMLButtonElement>) => {
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
          </div>
        </Dialog>
      </Feature>
    )
  }
}
