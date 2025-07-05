import React from 'react'
import { createPortal, PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  Dialog,
  Section,
  SectionTitle,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { BaseProps, PlanStatus, Service } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface DangerZoneProps extends BaseProps, WithConfigProps {
  id: string
  name: string
  isLast?: boolean
  onDeletePalette: () => void
}

interface DangerZoneState {
  isDeleteDialogOpen: boolean
}

export default class DangerZone extends PureComponent<
  DangerZoneProps,
  DangerZoneState
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service
  ) => ({
    DELETE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DELETE_PALETTE',
      planStatus: planStatus,
      currentService: service,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  constructor(props: DangerZoneProps) {
    super(props)
    this.state = {
      isDeleteDialogOpen: false,
    }
  }

  // Direct Actions
  onDeletePalette = () => {
    this.setState({
      isDeleteDialogOpen: false,
    })

    this.props.onDeletePalette()

    parent.postMessage(
      {
        pluginMessage: {
          type: 'DELETE_PALETTE',
          id: this.props.id,
        },
      },
      '*'
    )
  }

  // Templates
  Modals = () => {
    return (
      <Feature isActive={this.state.isDeleteDialogOpen}>
        {document.getElementById('modal') &&
          createPortal(
            <Dialog
              title={this.props.locales.browse.deletePaletteDialog.title}
              actions={{
                destructive: {
                  label: this.props.locales.browse.deletePaletteDialog.delete,
                  feature: 'DELETE_PALETTE',
                  action: this.onDeletePalette,
                },
                secondary: {
                  label: this.props.locales.browse.deletePaletteDialog.cancel,
                  action: () =>
                    this.setState({
                      isDeleteDialogOpen: false,
                    }),
                },
              }}
              onClose={() =>
                this.setState({
                  isDeleteDialogOpen: false,
                })
              }
            >
              <div className="dialog__text">
                <p className={texts.type}>
                  {this.props.locales.browse.deletePaletteDialog.message.replace(
                    '{$1}',
                    this.props.name
                  )}
                </p>
              </div>
            </Dialog>,
            document.getElementById('modal') ?? document.createElement('app')
          )}
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <Feature
        isActive={DangerZone.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).DELETE_PALETTE.isActive()}
      >
        <Section
          title={
            <SimpleItem
              leftPartSlot={<SectionTitle label={'Danger zone'} />}
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <Button
                  type="destructive"
                  label="Delete palette"
                  action={() => this.setState({ isDeleteDialogOpen: true })}
                />
              ),
            },
          ]}
          border={!this.props.isLast ? ['BOTTOM'] : undefined}
        />
        <this.Modals />
      </Feature>
    )
  }
}
