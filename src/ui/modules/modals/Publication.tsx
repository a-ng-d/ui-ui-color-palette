import React from 'react'
import { PureComponent } from 'preact/compat'
import { Data, PaletteData } from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Avatar, Button, Chip, Dialog, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import getPaletteMeta from '../../../utils/setPaletteMeta'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../index'
import {
  trackPublicationEvent,
  trackSignInEvent,
} from '../../../external/tracking/eventsTracker'
import unpublishPalette from '../../../external/publication/unpublishPalette'
import starPalette from '../../../external/publication/starPalette'
import pushPalette from '../../../external/publication/pushPalette'
import pullPalette from '../../../external/publication/pullPalette'
import publishPalette from '../../../external/publication/publishPalette'
import detachPalette from '../../../external/publication/detachPalette'
import { signIn } from '../../../external/auth/authentication'
import { getSupabase } from '../../../external/auth'
import p from '../../../content/images/publication.webp'
import type { AppStates } from '../../App'

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
  isTertiaryActionLoading: boolean
  isPaletteShared: boolean
  publicationStatus: PublicationStatus
  isStarred: boolean
}

interface PublicationAction {
  label: string
  state: 'LOADING' | 'DEFAULT' | 'DISABLED'
  isAutofocus?: boolean
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

export default class Publication extends PureComponent<PublicationProps, PublicationStates> {
  private enabledThemeIndex: number

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PUBLICATION: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLICATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    STAR_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'STAR_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: PublicationProps) {
    super(props)
    this.enabledThemeIndex = this.props.rawData.themes.findIndex(
      (theme) => theme.isEnabled
    )

    if (this.enabledThemeIndex === -1) this.enabledThemeIndex = 0

    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
      isTertiaryActionLoading: false,
      isPaletteShared: this.props.rawData.publicationStatus.isShared,
      publicationStatus: 'WAITING',
      isStarred: false,
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
    if (prevProps.rawData.themes !== this.props.rawData.themes)
      this.updateEnabledThemeIndex()

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

  updateEnabledThemeIndex = () => {
    const newEnabledIndex = this.props.rawData.themes.findIndex(
      (theme) => theme.isEnabled
    )

    if (
      newEnabledIndex === -1 ||
      newEnabledIndex >= this.props.rawData.themes.length
    )
      this.enabledThemeIndex = 0
    else this.enabledThemeIndex = newEnabledIndex
  }

  // Direct Actions
  buildPaletteData = (): PaletteData => {
    return new Data({
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
  }

  callUICPAgent = async () => {
    const localUserId = this.props.userSession.userId,
      localPublicationDate = new Date(this.props.rawData.dates.publishedAt),
      localUpdatedDate = new Date(this.props.rawData.dates.updatedAt)

    const supabase = getSupabase()

    if (!supabase) {
      this.setState({
        publicationStatus: 'WAITING',
      })
      sendPluginMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: this.props.locales.error.noInternetConnection,
            },
          },
        },
        '*'
      )
      return
    }

    const { data: paletteData, error: paletteError } = await supabase
      .from(this.props.config.dbs.palettesDbViewName)
      .select('*')
      .eq('palette_id', this.props.rawData.id)

    if (!paletteError && paletteData.length !== 0) {
      const isMyPalette = paletteData[0].creator_id === localUserId

      if (new Date(paletteData[0].published_at) > localPublicationDate)
        this.setState({
          publicationStatus: isMyPalette ? 'MUST_BE_PULLED' : 'MAY_BE_PULLED',
        })
      else if (new Date(paletteData[0].published_at) < localUpdatedDate)
        this.setState({
          publicationStatus: isMyPalette ? 'CAN_BE_PUSHED' : 'CAN_BE_REVERTED',
        })
      else
        this.setState({
          publicationStatus: isMyPalette ? 'PUBLISHED' : 'UP_TO_DATE',
        })

      const { data: starredData, error: starredError } = await supabase
        .from(this.props.config.dbs.starredPalettesDbTableName)
        .select('*')
        .eq('palette_id', this.props.rawData.id)
        .eq('user_id', this.props.userSession.userId)

      if (!starredError && starredData.length > 0)
        this.setState({ isStarred: true })
      else this.setState({ isStarred: false })
    } else if (paletteData?.length === 0)
      this.setState({
        publicationStatus: 'IS_NOT_FOUND',
      })
    else if (paletteError) {
      this.setState({
        publicationStatus: 'WAITING',
      })
      sendPluginMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',

              message: this.props.locales.error.noInternetConnection,
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
          {this.props.locales.publication.statusUnpublished}
        </Chip>
      )
    else if (
      this.state.publicationStatus === 'CAN_BE_PUSHED' ||
      this.state.publicationStatus === 'CAN_BE_REVERTED'
    )
      return <Chip>{this.props.locales.publication.statusLocalChanges}</Chip>
    else if (
      this.state.publicationStatus === 'PUBLISHED' ||
      this.state.publicationStatus === 'UP_TO_DATE'
    )
      return (
        <Chip state="INACTIVE">
          {this.props.locales.publication.statusUptoDate}
        </Chip>
      )
    else if (
      this.state.publicationStatus === 'MUST_BE_PULLED' ||
      this.state.publicationStatus === 'MAY_BE_PULLED'
    )
      return <Chip>{this.props.locales.publication.statusRemoteChanges}</Chip>
    else if (this.state.publicationStatus === 'IS_NOT_FOUND')
      return (
        <Chip state="INACTIVE">
          {this.props.locales.publication.statusNotFound}
        </Chip>
      )
    else if (this.state.publicationStatus === 'WAITING')
      return (
        <Chip state="INACTIVE">
          {this.props.locales.publication.statusWaiting}
        </Chip>
      )
  }

  publicationActions = (
    publicationStatus: PublicationStatus
  ): PublicationActions => {
    const actions: Record<string, PublicationActions> = {
      UNPUBLISHED: {
        primary: {
          label: this.props.locales.publication.publish,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          isAutofocus: true,
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
            publishPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
              isShared: this.state.isPaletteShared,
              locales: this.props.locales,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                })

                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.publication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.publication,
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
          label: this.props.locales.publication.publish,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          isAutofocus: true,
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
            pushPalette({
              rawData: this.props.rawData,
              palettesDbTableName: this.props.config.dbs.palettesDbTableName,
              isShared: this.state.isPaletteShared,
              locales: this.props.locales,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.publication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.publication,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locales.publication.revert,
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
            pullPalette({
              rawData: this.props.rawData,
              palettesDbViewName: this.props.config.dbs.palettesDbViewName,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.synchronization,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.synchronization,
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
          label: this.props.locales.publication.synchronize,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          isAutofocus: true,
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
            pullPalette({
              rawData: this.props.rawData,
              palettesDbViewName: this.props.config.dbs.palettesDbViewName,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.synchronization,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locales.publication.detach,
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
            detachPalette({
              rawData: this.props.rawData,
              locales: this.props.locales,
            })
              .then(() => {
                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
          label: this.props.locales.publication.synchronize,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          isAutofocus: true,
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
            pullPalette({
              rawData: this.props.rawData,
              palettesDbViewName: this.props.config.dbs.palettesDbViewName,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'UP_TO_DATE',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.synchronization,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locales.publication.detach,
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
            detachPalette({
              rawData: this.props.rawData,
              locales: this.props.locales,
            })
              .then(() => {
                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
          label: this.props.locales.publication.publish,
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
              locales: this.props.locales,
            })
              .then((data) => {
                this.props.onChangePublication(data)
                this.setState({
                  publicationStatus: 'PUBLISHED',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.publication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.publication,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locales.publication.unpublish,
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

                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.nonPublication,
                      },
                    },
                  },
                  '*'
                )

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.nonPublication,
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
          label: this.props.locales.publication.detach,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
            detachPalette({
              rawData: this.props.rawData,
              locales: this.props.locales,
            })
              .then(() => {
                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
          label: this.props.locales.publication.revert,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
            pullPalette({
              rawData: this.props.rawData,
              palettesDbViewName: this.props.config.dbs.palettesDbViewName,
            })
              .then((data) => {
                this.props.onChangePublication(data)

                this.setState({
                  publicationStatus: 'UP_TO_DATE',
                  isPaletteShared: data.publicationStatus?.isShared ?? false,
                })

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
                  this.props.userConsent.find(
                    (consent) => consent.id === 'mixpanel'
                  )?.isConsented ?? false,
                  {
                    feature: 'REVERT_PALETTE',
                  }
                )
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'SUCCESS',
                        message: this.props.locales.success.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
              .finally(() => {
                this.setState({ isPrimaryActionLoading: false })
              })
              .catch((error) => {
                console.error(error)
                sendPluginMessage(
                  {
                    pluginMessage: {
                      type: 'POST_MESSAGE',
                      data: {
                        type: 'ERROR',
                        message: this.props.locales.error.synchronization,
                      },
                    },
                  },
                  '*'
                )
              })
          },
        },
        secondary: {
          label: this.props.locales.publication.detach,
          state: this.state.isSecondaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isSecondaryActionLoading: true })
            detachPalette({
              rawData: this.props.rawData,
              locales: this.props.locales,
            })
              .then(() => {
                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })
                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
          label: this.props.locales.publication.detach,
          state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
          action: async () => {
            this.setState({ isPrimaryActionLoading: true })
            detachPalette({
              rawData: this.props.rawData,
              locales: this.props.locales,
            })
              .then(() => {
                this.setState({
                  publicationStatus: 'UNPUBLISHED',
                  isPaletteShared: false,
                })

                trackPublicationEvent(
                  this.props.config.env.isMixpanelEnabled,
                  this.props.userSession.userId === ''
                    ? this.props.userIdentity.id === ''
                      ? ''
                      : this.props.userIdentity.id
                    : this.props.userSession.userId,
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
          label: this.props.locales.pending.primaryAction,
          state: 'LOADING',
          action: () => null,
        },
        secondary: {
          label: this.props.locales.pending.secondaryAction,
          state: 'LOADING',
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
        label: this.props.locales.publication.share,
        state: this.state.isPaletteShared,
        action: () =>
          this.setState({ isPaletteShared: !this.state.isPaletteShared }),
      },
      CAN_BE_PUSHED: {
        label: this.props.locales.publication.share,
        state: this.state.isPaletteShared,
        action: () =>
          this.setState({ isPaletteShared: !this.state.isPaletteShared }),
      },
      MUST_BE_PULLED: undefined,
      MAY_BE_PULLED: undefined,
      PUBLISHED: {
        label: this.props.locales.publication.share,
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

  onStarPalette = async () => {
    this.setState({ isTertiaryActionLoading: true })

    starPalette({
      id: this.props.rawData.id,
      starredPalettesDbTableName:
        this.props.config.dbs.starredPalettesDbTableName,
      userId: this.props.userSession.userId,
      mustBeStarred: !this.state.isStarred,
    })
      .then(() => {
        this.setState({ isStarred: !this.state.isStarred })

        trackPublicationEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId === ''
            ? this.props.userIdentity.id === ''
              ? ''
              : this.props.userIdentity.id
            : this.props.userSession.userId,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'STAR_PALETTE',
          }
        )
      })
      .finally(() => {
        this.setState({ isTertiaryActionLoading: false })
      })
      .catch((error) => {
        console.error('Error starring/un-starring palette:', error)
        sendPluginMessage(
          {
            pluginMessage: {
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: this.props.locales.error.starPalette,
              },
            },
          },
          '*'
        )
      })
  }

  // Templates
  StarButton = () => {
    if (this.state.isStarred)
      return (
        <Feature
          isActive={Publication.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).STAR_PALETTE.isActive()}
        >
          <Button
            type="tertiary"
            icon="star-on"
            label={this.props.locales.publication.unstar}
            isLoading={this.state.isTertiaryActionLoading}
            isBlocked={Publication.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).STAR_PALETTE.isBlocked()}
            action={this.onStarPalette}
          />
        </Feature>
      )

    return (
      <Feature
        isActive={Publication.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).STAR_PALETTE.isActive()}
      >
        <Button
          type="tertiary"
          icon="star-off"
          label={this.props.locales.publication.star}
          isLoading={this.state.isTertiaryActionLoading}
          isBlocked={Publication.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).STAR_PALETTE.isBlocked()}
          action={this.onStarPalette}
        />
      </Feature>
    )
  }

  // Render
  render() {
    if (this.props.userSession.connectionStatus === 'CONNECTED')
      return (
        <Feature
          isActive={Publication.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).PUBLICATION.isActive()}
        >
          <Dialog
            title={
              this.props.rawData.creatorIdentity.creatorId ===
                this.props.rawData.userSession.userId ||
              this.props.rawData.creatorIdentity.creatorId === ''
                ? this.props.locales.publication.titlePublish
                : this.props.locales.publication.titleSynchronize
            }
            actions={this.publicationActions(this.state.publicationStatus)}
            select={this.publicationOption(this.state.publicationStatus)}
            onClose={this.props.onClosePublication}
          >
            <div className="dialog__cover dialog__cover--padding">
              <div
                style={{
                  borderRadius: 'var(--border-radius-medium)',
                  overflow: 'hidden',
                  height: '100%',
                }}
                className="preview__rows"
              >
                {this.buildPaletteData().themes[
                  this.enabledThemeIndex
                ].colors.map((color, index) => (
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
                ))}
              </div>
            </div>
            <div className="dialog__text">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--size-pos-xxsmall)',
                }}
              >
                <div>
                  <div
                    className={doClassnames([texts.type, texts['type--large']])}
                  >
                    {this.props.rawData.name === ''
                      ? this.props.locales.name
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
              {this.state.publicationStatus !== 'UNPUBLISHED' &&
                this.state.publicationStatus !== 'IS_NOT_FOUND' && (
                  <this.StarButton />
                )}
            </div>
          </Dialog>
        </Feature>
      )
    return (
      <Feature
        isActive={Publication.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).PUBLICATION.isActive()}
      >
        <Dialog
          title={this.props.locales.publication.titleSignIn}
          actions={{
            primary: {
              label: this.props.locales.publication.signIn,
              state: this.state.isPrimaryActionLoading ? 'LOADING' : 'DEFAULT',
              isAutofocus: true,
              action: async () => {
                this.setState({ isPrimaryActionLoading: true })
                signIn({
                  disinctId: this.props.userIdentity.id,
                  authWorkerUrl: this.props.config.urls.authWorkerUrl,
                  authUrl: this.props.config.urls.authUrl,
                  platformUrl: this.props.config.urls.platformUrl,
                  pluginId: this.props.config.env.pluginId,
                })
                  .then(() => {
                    trackSignInEvent(
                      this.props.config.env.isMixpanelEnabled,
                      this.props.userSession.userId === ''
                        ? this.props.userIdentity.id === ''
                          ? ''
                          : this.props.userIdentity.id
                        : this.props.userSession.userId,
                      this.props.userConsent.find(
                        (consent) => consent.id === 'mixpanel'
                      )?.isConsented ?? false
                    )
                  })
                  .finally(() => {
                    this.setState({ isPrimaryActionLoading: false })
                  })
                  .catch((error) => {
                    sendPluginMessage(
                      {
                        pluginMessage: {
                          type: 'POST_MESSAGE',
                          data: {
                            type: 'ERROR',
                            message:
                              error.message === 'Authentication timeout'
                                ? this.props.locales.error.timeout
                                : this.props.locales.error.authentication,
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
              {this.props.locales.publication.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
