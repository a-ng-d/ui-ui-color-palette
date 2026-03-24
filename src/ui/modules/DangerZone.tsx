import React from 'react'
import { createPortal, PureComponent } from 'preact/compat'
import {
  Button,
  Dialog,
  FormItem,
  Section,
  SectionTitle,
  SimpleItem,
  texts,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData } from '../../types/messages'
import { BaseProps } from '../../types/app'

interface DangerZoneProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
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
              title={this.props.t('browse.deletePaletteDialog.title')}
              actions={{
                destructive: {
                  label: this.props.t('browse.deletePaletteDialog.delete'),
                  feature: 'DELETE_PALETTE',
                  state: this.state.isDestructiveActionLoading
                    ? 'LOADING'
                    : 'DEFAULT',
                  action: this.onDeletePalette,
                },
                secondary: {
                  label: this.props.t('browse.deletePaletteDialog.cancel'),
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
                  {this.props.t('browse.deletePaletteDialog.message', {
                    name:
                      this.props.name === ''
                        ? this.props.t('name')
                        : this.props.name,
                  })}
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
      <>
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.t('settings.dangerZone.title')}
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
                    label={this.props.t('settings.dangerZone.deletePalette')}
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
      </>
    )
  }
}
