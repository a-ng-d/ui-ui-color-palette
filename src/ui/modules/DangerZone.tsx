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
  isDestructiveActionLoading: boolean
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
      isDestructiveActionLoading: false,
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const path = e.data.type === undefined ? e.data.pluginMessage : e.data

    const actions: {
      [key: string]: () => void
    } = {
      STOP_LOADER: () => {
        this.setState({
          isDestructiveActionLoading: false,
          isDeleteDialogOpen: false,
        })
        this.props.onDeletePalette()
      },
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onDeletePalette = () => {
    this.setState({
      isDestructiveActionLoading: true,
    })

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
                  state: this.state.isDestructiveActionLoading
                    ? 'LOADING'
                    : 'DEFAULT',
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
