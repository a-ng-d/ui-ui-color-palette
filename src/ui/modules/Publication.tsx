import { Avatar, Chip, Dialog, texts } from '@a_ng_d/figmug-ui'
import { doClassnames } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import detachPalette from '../../external/publication/detachPalette'
import publishPalette from '../../external/publication/publishPalette'
import pullPalette from '../../external/publication/pullPalette'
import pushPalette from '../../external/publication/pushPalette'
import unpublishPalette from '../../external/publication/unpublishPalette'
import { supabase } from '../../index'
import { BaseProps } from '../../types/app'
import { trackPublicationEvent } from '../../utils/eventsTracker'
import getPaletteMeta from '../../utils/setPaletteMeta'
import type { AppStates } from '../App'
import { WithConfigProps } from '../components/WithConfig'

interface PublicationProps extends BaseProps, WithConfigProps {
  rawData: AppStates
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  onLoadPrimaryAction: (e: boolean) => void
  onLoadSecondaryAction: (e: boolean) => void
  onChangePublication: React.Dispatch<Partial<AppStates>>
  onClosePublication: React.MouseEventHandler<HTMLButtonElement>
}

type PublicationStatus =
  | 'UNPUBLISHED'
  | 'CAN_BE_PUSHED'
  | 'MUST_BE_PULLED'
  | 'MAY_BE_PULLED'
  | 'PUBLISHED'
  | 'UP_TO_DATE'
  | 'CAN_BE_REVERTED'
  | 'IS_NOT_FOUND'
  | 'WAITING'

interface PublicationStates {
  isPaletteShared: boolean
  publicationStatus: PublicationStatus
}

interface PublicationAction {
  label: string
  state: 'LOADING' | 'DEFAULT' | 'DISABLED'
  action: () => void
}

interface PublicationOption {
  label: string
  state: boolean
  action: () => void
}

interface PublicationActions {
  primary: PublicationAction | undefined
  secondary: PublicationAction | undefined
}

export default class Publication extends PureComponent<
  PublicationProps,
  PublicationStates
> {
  constructor(props: PublicationProps) {
    super(props)
    this.state = {
      isPaletteShared: this.props.rawData.publicationStatus.isShared,
      publicationStatus: 'WAITING',
    }
  }

  // Lifecycle
  componentDidMount = () => {
    if (this.props.rawData.publicationStatus.isPublished) this.callUICPAgent()
    else
      this.setState({
        publicationStatus: 'UNPUBLISHED',
      })
  }

  componentDidUpdate = (prevProps: Readonly<PublicationProps>) => {
    if (
      this.props.rawData.publicationStatus.isPublished &&
      prevProps.rawData.id !== this.props.rawData.id
    )
      this.callUICPAgent()
    else if (
      !this.props.rawData.publicationStatus.isPublished &&
      prevProps.rawData.id !== this.props.rawData.id
    )
      this.setState({
        publicationStatus: 'UNPUBLISHED',
      })
  }

  // Direct Actions
  callUICPAgent = async () => {
    const localUserId = this.props.userSession.userId,
      localPublicationDate = new Date(this.props.rawData.dates.publishedAt),
      localUpdatedDate = new Date(this.props.rawData.dates.updatedAt)

    const { data, error } = await supabase
      .from(this.props.config.dbs.palettesDbTableName)
      .select('*')
      .eq('palette_id', this.props.rawData.id)

    if (!error && data.length !== 0) {
      const isMyPalette = data?.[0].creator_id === localUserId

      if (new Date(data[0].published_at) > localPublicationDate)
        this.setState({
          publicationStatus: isMyPalette ? 'MUST_BE_PULLED' : 'MAY_BE_PULLED',
        })
      else if (new Date(data[0].published_at) < localUpdatedDate)
        this.setState({
          publicationStatus: isMyPalette ? 'CAN_BE_PUSHED' : 'CAN_BE_REVERTED',
        })
      else
        this.setState({
          publicationStatus: isMyPalette ? 'PUBLISHED' : 'UP_TO_DATE',
        })
    } else if (data?.length === 0)
      this.setState({
        publicationStatus: 'IS_NOT_FOUND',
      })
    else if (error) {
      this.setState({
        publicationStatus: 'WAITING',
      })
      parent.postMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',

              message: this.props.locals.error.noInternetConnection,
            },
          },
        },
        '*'
      )
    }
  }

  getPaletteStatus = () => {
    if (this.state.publicationStatus === 'UNPUBLISHED')
      return (
        <Chip state="INACTIVE">
          {this.props.locals.publication.statusUnpublished}
        </Chip>
      )
    else if (
      this.state.publicationStatus === 'CAN_BE_PUSHED' ||
      this.state.publicationStatus === 'CAN_BE_REVERTED'
    )
      return <Chip>{this.props.locals.publication.statusLocalChanges}</Chip>
    else if (
      this.state.publicationStatus === 'PUBLISHED' ||
      this.state.publicationStatus === 'UP_TO_DATE'
    )
      return (
        <Chip state="INACTIVE">
          {this.props.locals.publication.statusUptoDate}
        </Chip>
      )
    else if (
      this.state.publicationStatus === 'MUST_BE_PULLED' ||
      this.state.publicationStatus === 'MAY_BE_PULLED'
    )
      return <Chip>{this.props.locals.publication.statusRemoteChanges}</Chip>
    else if (this.state.publicationStatus === 'IS_NOT_FOUND')
      return (
        <Chip state="INACTIVE">
          {this.props.locals.publication.statusNotFound}
        </Chip>
      )
    else if (this.state.publicationStatus === 'WAITING')
      return (
        <Chip state="INACTIVE">
          {this.props.locals.publication.statusWaiting}
        </Chip>
      )
  }

  publicationActions = (
    publicationStatus: PublicationStatus
  ): PublicationActions => {
    const actions: Record<string, PublicationActions> = {
      UNPUBLISHED: {
        primary: {
          label: this.props.locals.publication.publish,
          state: this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            publishPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
              isShared: this.state.isPaletteShared,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                })

                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.publication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'PUBLISH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.publication,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: undefined,
      },
      CAN_BE_PUSHED: {
        primary: {
          label: this.props.locals.publication.publish,
          state: this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            pushPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
              isShared: this.state.isPaletteShared,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.publication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'PUSH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.publication,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locals.publication.revert,
          state: this.props.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadSecondaryAction(true)
            pullPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.synchronization,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'REVERT_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadSecondaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
      },
      MUST_BE_PULLED: {
        primary: {
          label: this.props.locals.publication.synchronize,
          state: this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            pullPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.synchronization,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'PULL_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locals.publication.detach,
          state: this.props.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadSecondaryAction(true)
            detachPalette({
              rawData: this.props.rawData,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)

                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'DETACH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadSecondaryAction(false)
              })
          },
        },
      },
      MAY_BE_PULLED: {
        primary: {
          label: this.props.locals.publication.synchronize,
          state: this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            pullPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'UP_TO_DATE',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.synchronization,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'PULL_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locals.publication.detach,
          state: this.props.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadSecondaryAction(true)
            detachPalette({
              rawData: this.props.rawData,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)

                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'DETACH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadSecondaryAction(false)
              })
          },
        },
      },
      PUBLISHED: {
        primary: {
          label: this.props.locals.publication.publish,
          state: (() => {
            if (
              this.props.rawData.publicationStatus.isShared !==
              this.state.isPaletteShared
            )
              return this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT'

            return 'DISABLED'
          })(),
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            pushPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
              isShared: this.state.isPaletteShared,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.publication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'PUSH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.publication,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locals.publication.unpublish,
          state: this.props.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadSecondaryAction(true)
            unpublishPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.nonPublication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'UNPUBLISH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadSecondaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.nonPublication,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
      },
      UP_TO_DATE: {
        primary: {
          label: this.props.locals.publication.detach,
          state: this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            detachPalette({
              rawData: this.props.rawData,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)

                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'DETACH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
          },
        },
        secondary: undefined,
      },
      CAN_BE_REVERTED: {
        primary: {
          label: this.props.locals.publication.revert,
          state: this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            pullPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
            })
              .then((data) => {
                this.props.onChangePublication(data)

                this.setState({
                  publicationStatus: 'UP_TO_DATE',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'REVERT_PALETTE',
                  }
                )
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locals.success.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
              .catch(() => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locals.error.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locals.publication.detach,
          state: this.props.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadSecondaryAction(true)
            detachPalette({
              rawData: this.props.rawData,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })
                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'DETACH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadSecondaryAction(false)
              })
          },
        },
      },
      IS_NOT_FOUND: {
        primary: {
          label: this.props.locals.publication.detach,
          state: this.props.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.props.onLoadPrimaryAction(true)
            detachPalette({
              rawData: this.props.rawData,
              locals: this.props.locals,
            })
              .then((data) => {
                this.props.onChangePublication(data)

                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.userIdentity.id,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'DETACH_PALETTE',
                  }
                )
              })
              .finally(() => {
                this.props.onLoadPrimaryAction(false)
              })
          },
        },
        secondary: undefined,
      },
      WAITING: {
        primary: {
          label: this.props.locals.pending.primaryAction,
          state: 'DISABLED',
          action: () => null,
        },
        secondary: {
          label: this.props.locals.pending.secondaryAction,
          state: 'DISABLED',
          action: () => null,
        },
      },
    }

    return actions[publicationStatus]
  }

  publicationOption = (
    publicationStatus: PublicationStatus
  ): PublicationOption | undefined => {
    const actions: Record<string, PublicationOption | undefined> = {
      UNPUBLISHED: {
        label: this.props.locals.publication.share,
        state: this.state.isPaletteShared,
        action: () =>
          this.setState({ isPaletteShared: !this.state.isPaletteShared }),
      },
      CAN_BE_PUSHED: {
        label: this.props.locals.publication.share,
        state: this.state.isPaletteShared,
        action: () =>
          this.setState({ isPaletteShared: !this.state.isPaletteShared }),
      },
      MUST_BE_PULLED: undefined,
      MAY_BE_PULLED: undefined,
      PUBLISHED: {
        label: this.props.locals.publication.share,
        state: this.state.isPaletteShared,
        action: () =>
          this.setState({ isPaletteShared: !this.state.isPaletteShared }),
      },
      UP_TO_DATE: undefined,
      CAN_BE_REVERTED: undefined,
      IS_NOT_FOUND: undefined,
      WAITING: undefined,
    }

    return actions[publicationStatus]
  }

  // Render
  render() {
    return (
      <Dialog
        title={
          this.props.rawData.creatorIdentity.creatorId ===
            this.props.rawData.userSession.userId ||
          this.props.rawData.creatorIdentity.creatorId === ''
            ? this.props.locals.publication.titlePublish
            : this.props.locals.publication.titleSynchronize
        }
        actions={this.publicationActions(this.state.publicationStatus)}
        select={this.publicationOption(this.state.publicationStatus)}
        onClose={this.props.onClosePublication}
      >
        <div className="dialog__cover dialog__cover--padding"></div>
        <div className="dialog__text">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--size-xxsmall)',
            }}
          >
            <div>
              <div className={texts.type}>
                {this.props.rawData.name === ''
                  ? this.props.locals.name
                  : this.props.rawData.name}
                {this.getPaletteStatus()}
              </div>
              <div className={texts.type}>{this.props.rawData.preset.name}</div>
              <div
                className={doClassnames([texts.type, texts['type--secondary']])}
                style={{
                  marginTop: '2px',
                }}
              >
                {getPaletteMeta(
                  this.props.rawData.colors,
                  this.props.rawData.themes
                )}
              </div>
            </div>
            {(this.state.publicationStatus === 'UP_TO_DATE' ||
              this.state.publicationStatus === 'MAY_BE_PULLED' ||
              this.state.publicationStatus === 'CAN_BE_REVERTED') && (
              <Avatar
                avatar={this.props.rawData.creatorIdentity.creatorAvatar}
                fullName={this.props.rawData.creatorIdentity.creatorFullName}
              />
            )}
          </div>
          <div
            className={doClassnames([texts.type, texts['type--secondary']])}
          ></div>
        </div>
      </Dialog>
    )
  }
}
