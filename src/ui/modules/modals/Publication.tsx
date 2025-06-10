import { Avatar, Chip, Dialog, texts } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import detachPalette from '../../../external/publication/detachPalette'
import publishPalette from '../../../external/publication/publishPalette'
import pullPalette from '../../../external/publication/pullPalette'
import pushPalette from '../../../external/publication/pushPalette'
import unpublishPalette from '../../../external/publication/unpublishPalette'
import { ConfigContextType, supabase } from '../../../index'
import { BaseProps, PlanStatus } from '../../../types/app'
import {
  trackPublicationEvent,
  trackSignInEvent,
} from '../../../utils/eventsTracker'
import p from '../../../content/images/publication.webp'
import getPaletteMeta from '../../../utils/setPaletteMeta'
import type { AppStates } from '../../App'
import { WithConfigProps } from '../../components/WithConfig'
import { Data, PaletteData } from '@a_ng_d/utils-ui-color-palette'
import Feature from '../../components/Feature'
import { signIn } from '../../../external/auth/authentication'

interface PublicationProps extends BaseProps, WithConfigProps {
  rawData: AppStates
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
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
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
  private data: PaletteData
  private enabledThemeIndex: number

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    PUBLICATION: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLICATION',
      planStatus: planStatus,
    }),
  })

  constructor(props: PublicationProps) {
    super(props)
    this.data = new Data({
      base: {
        name: this.props.rawData.name,
        description: this.props.rawData.description,
        preset: this.props.rawData.preset,
        shift: this.props.rawData.shift,
        areSourceColorsLocked: this.props.rawData.areSourceColorsLocked,
        colors: this.props.rawData.colors,
        colorSpace: this.props.rawData.colorSpace,
        algorithmVersion: this.props.rawData.algorithmVersion,
      },
      themes: this.props.rawData.themes,
      meta: {
        id: this.props.rawData.id,
        dates: {
          createdAt: this.props.rawData.dates.createdAt,
          updatedAt: this.props.rawData.dates.updatedAt,
          publishedAt: this.props.rawData.dates.publishedAt,
          openedAt: this.props.rawData.dates.openedAt,
        },
        creatorIdentity: {
          creatorId: this.props.rawData.creatorIdentity.creatorId,
          creatorFullName: this.props.rawData.creatorIdentity.creatorFullName,
          creatorAvatar: this.props.rawData.creatorIdentity.creatorAvatar,
        },
        publicationStatus: {
          isShared: this.props.rawData.publicationStatus.isShared,
          isPublished: this.props.rawData.publicationStatus.isPublished,
        },
      },
    }).makePaletteData()
    this.enabledThemeIndex = this.props.rawData.themes.findIndex(
      (theme) => theme.isEnabled
    )
    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
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
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
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
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
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
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
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
                this.setState({ isSecondaryActionLoading: false })
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
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
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
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
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
                this.setState({ isSecondaryActionLoading: false })
              })
          },
        },
      },
      MAY_BE_PULLED: {
        primary: {
          label: this.props.locals.publication.synchronize,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
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
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
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
                this.setState({ isSecondaryActionLoading: false })
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
              return this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT'

            return 'DISABLED'
          })(),
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
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
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
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
                this.setState({ isSecondaryActionLoading: false })
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
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
              })
          },
        },
        secondary: undefined,
      },
      CAN_BE_REVERTED: {
        primary: {
          label: this.props.locals.publication.revert,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
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
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
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
                this.setState({ isSecondaryActionLoading: false })
              })
          },
        },
      },
      IS_NOT_FOUND: {
        primary: {
          label: this.props.locals.publication.detach,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
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
                this.setState({ isPrimaryActionLoading: false })
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
    if (this.props.userSession.connectionStatus === 'CONNECTED')
      return (
        <Feature
          isActive={Publication.features(
            this.props.planStatus,
            this.props.config
          ).PUBLICATION.isActive()}
        >
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
            <div className="dialog__cover dialog__cover--padding">
              <div
                style={{
                  borderRadius: 'var(--border-radius-med)',
                  overflow: 'hidden',
                  height: '100%',
                }}
                className="preview__rows"
              >
                {this.data.themes[this.enabledThemeIndex].colors.map(
                  (color, index) => (
                    <div
                      key={`color-${index}`}
                      className="preview__row"
                    >
                      {color.shades.map((shade, shadeIndex) => (
                        <div
                          key={`color-${index}-${shadeIndex}`}
                          className="preview__cell"
                          style={{
                            minHeight: 'unset',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              position: 'absolute',
                              zIndex: '1',
                              top: 0,
                              left: 0,
                              backgroundColor: shade.hex,
                            }}
                          />
                          {shade.backgroundColor !== undefined && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                zIndex: '0',
                                top: 0,
                                left: 0,
                                backgroundColor: Array.isArray(
                                  shade.backgroundColor
                                )
                                  ? `rgba(${shade.backgroundColor[0]}, ${shade.backgroundColor[1]}, ${shade.backgroundColor[2]}, 1)`
                                  : undefined,
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
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
                  <div className={texts.type}>
                    {this.props.rawData.preset.name}
                  </div>
                  <div
                    className={doClassnames([
                      texts.type,
                      texts['type--secondary'],
                    ])}
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
                    fullName={
                      this.props.rawData.creatorIdentity.creatorFullName
                    }
                  />
                )}
              </div>
              <div
                className={doClassnames([texts.type, texts['type--secondary']])}
              ></div>
            </div>
          </Dialog>
        </Feature>
      )
    return (
      <Feature
        isActive={Publication.features(
          this.props.planStatus,
          this.props.config
        ).PUBLICATION.isActive()}
      >
        <Dialog
          title={this.props.locals.publication.titleSignIn}
          actions={{
            primary: {
              label: this.props.locals.publication.signIn,
              state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
              action: async () => {
                this.setState({ isPrimaryActionLoading: true })
                signIn(
                  this.props.userIdentity.id,
                  this.props.config.urls.authWorkerUrl,
                  this.props.config.urls.authUrl
                )
                  .then(() => {
                    trackSignInEvent(
                      this.props.userIdentity.id,
                      this.props.userConsent.find(
                        (consent) => consent.id === 'mixpanel'
                      )?.isConsented ?? false
                    )
                  })
                  .finally(() => {
                    this.setState({ isPrimaryActionLoading: false })
                  })
                  .catch((error) => {
                    parent.postMessage(
                      {
                        pluginMessage: {
                          type: 'POST_MESSAGE',
                          data: {
                            type: 'ERROR',
                            message:
                              error.message === 'Authentication timeout'
                                ? this.props.locals.error.timeout
                                : this.props.locals.error.authentication,
                          },
                        },
                      },
                      '*'
                    )
                  })
              },
            },
          }}
          onClose={this.props.onClosePublication}
        >
          <div className="dialog__cover">
            <img
              src={p}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locals.publication.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
