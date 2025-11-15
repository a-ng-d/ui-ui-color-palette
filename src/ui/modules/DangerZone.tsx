import React from 'react'
import { createPortal, PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  Dialog,
  FormItem,
  Section,
  SectionTitle,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData } from '../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
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
    service: Service,
    editor: Editor
  ) => ({
    DELETE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DELETE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
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
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  componentWillUnmount = () => {
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

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

    sendPluginMessage(
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
                  isAutofocus: true,
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
                    '{name}',
                    this.props.name === ''
                      ? this.props.locales.name
                      : this.props.name
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
          this.props.service,
          this.props.editor
        ).DELETE_PALETTE.isActive()}
      >
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.locales.settings.dangerZone.title}
                />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <FormItem>
                  <Button
                    type="destructive"
                    label={this.props.locales.settings.dangerZone.deletePalette}
                    action={() => this.setState({ isDeleteDialogOpen: true })}
                  />
                </FormItem>
              ),
              spacingModifier: 'TIGHT',
            },
          ]}
          border={!this.props.isLast ? ['BOTTOM'] : undefined}
        />
        <this.Modals />
      </Feature>
    )
  }
}
