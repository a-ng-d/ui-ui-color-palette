import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  Data,
  FullConfiguration,
  ExternalPalettes,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  ActionsItem,
  Bar,
  Button,
  Input,
  List,
  Message,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import setPaletteMeta from '../../utils/setPaletteMeta'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  Context,
  Editor,
  FetchStatus,
  PlanStatus,
  Service,
} from '../../types/app'
import { trackPublicationEvent } from '../../external/tracking/eventsTracker'
import starPalette from '../../external/publication/starPalette'
import { signIn } from '../../external/auth/authentication'
import { getSupabase } from '../../external/auth'
import { ConfigContextType } from '../../config/ConfigContext'

interface StarredPalettesProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  context: Context
  localPalettesList: Array<FullConfiguration>
  currentPage: number
  searchQuery: string
  status: FetchStatus
  palettesList: Array<ExternalPalettes>
  onChangeStatus: (status: FetchStatus) => void
  onChangeCurrentPage: (page: number) => void
  onChangeSearchQuery: (query: string) => void
  onLoadPalettesList: (palettes: Array<ExternalPalettes>) => void
  onSelectPalette: (id: string) => Promise<void>
  onSeePalette: (id: string) => Promise<void>
}

interface StarredPalettesStates {
  isLoadMoreActionLoading: boolean
  isSignInActionLoading: boolean
  isAddToLocalActionLoading: Array<boolean>
  isRemoveFromStarredLoading: Array<boolean>
}

export default class StarredPalettes extends PureComponent<
  StarredPalettesProps,
  StarredPalettesStates
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SEE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'SEE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    ADD_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'ADD_PALETTE',
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

  constructor(props: StarredPalettesProps) {
    super(props)
    this.state = {
      isLoadMoreActionLoading: false,
      isSignInActionLoading: false,
      isAddToLocalActionLoading: [],
      isRemoveFromStarredLoading: [],
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )

    const actions: {
      [key: string]: () => void
    } = {
      UNLOADED: () => {
        this.callUICPAgent(1, '')
        this.props.onChangeStatus('LOADING')
      },
      LOADING: () => null,
      COMPLETE: () => null,
      LOADED: () => null,
    }

    return actions[this.props.status]?.()
  }

  componentDidUpdate = (prevProps: Readonly<StarredPalettesProps>): void => {
    if (
      prevProps.userSession.connectionStatus !==
        this.props.userSession.connectionStatus &&
      this.props.palettesList.length === 0
    ) {
      this.props.onChangeStatus('LOADING')
      this.callUICPAgent(1, '')
    }

    if (prevProps.palettesList.length !== this.props.palettesList.length)
      this.setState({
        isAddToLocalActionLoading: Array(this.props.palettesList.length).fill(
          false
        ),
        isRemoveFromStarredLoading: Array(this.props.palettesList.length).fill(
          false
        ),
      })
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
      STOP_LOADER: () =>
        this.setState({
          isAddToLocalActionLoading: Array(this.props.palettesList.length).fill(
            false
          ),
          isRemoveFromStarredLoading: Array(
            this.props.palettesList.length
          ).fill(false),
        }),
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  updateStatus = (
    batch: Array<ExternalPalettes>,
    currentPage: number,
    searchQuery: string
  ) => {
    if (batch.length === 0 && currentPage === 1 && searchQuery === '')
      return 'EMPTY'
    if (batch.length === 0 && currentPage === 1 && searchQuery !== '')
      return 'NO_RESULT'
    else if (batch.length < this.props.config.limits.pageSize) return 'COMPLETE'
    return 'LOADED'
  }

  callUICPAgent = async (currentPage: number, searchQuery: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error: any = null

    const supabase = getSupabase()

    if (!supabase) {
      this.props.onChangeStatus('ERROR')
      return
    }

    if (searchQuery === '') {
      const { data: starredData, error: starredError } = await supabase
        .from(this.props.config.dbs.starredPalettesDbTableName)
        .select(
          `
          palette_id,
          ${this.props.config.dbs.palettesDbViewName}!inner(
            palette_id,
            name,
            description,
            preset,
            shift,
            are_source_colors_locked,
            colors,
            themes,
            color_space,
            algorithm_version,
            creator_avatar_url,
            creator_full_name,
            is_shared
          )
        `
        )
        .eq('user_id', this.props.userSession.userId)
        .order('created_at', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        )

      if (!starredError && starredData) {
        data = starredData
          .map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => item[this.props.config.dbs.palettesDbViewName]
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((item: any) => item.is_shared)
        error = null
      } else {
        data = []
        error = starredError
      }
    } else {
      const { data: starredData, error: starredError } = await supabase
        .from(this.props.config.dbs.starredPalettesDbTableName)
        .select(
          `
          palette_id,
          ${this.props.config.dbs.palettesDbViewName}!inner(
            palette_id,
            name,
            description,
            preset,
            shift,
            are_source_colors_locked,
            colors,
            themes,
            color_space,
            algorithm_version,
            creator_avatar_url,
            creator_full_name,
            is_shared
          )
        `
        )
        .eq('user_id', this.props.userSession.userId)
        .order('created_at', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        )

      if (!starredError && starredData) {
        data = starredData
          .map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => item[this.props.config.dbs.palettesDbViewName]
          )
          .filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => item.is_shared && item.name.includes(searchQuery)
          )
        error = null
      } else {
        data = []
        error = starredError
      }
    }

    if (!error) {
      const batch = this.props.palettesList.concat(
        data as Array<ExternalPalettes>
      )
      this.props.onLoadPalettesList(batch)
      this.props.onChangeStatus(
        this.updateStatus(
          data as Array<ExternalPalettes>,
          currentPage,
          searchQuery
        )
      )
      this.setState({
        isLoadMoreActionLoading: false,
      })
    } else this.props.onChangeStatus('ERROR')
  }

  onSelectPalette = async (id: string) => {
    await this.props.onSelectPalette(id)
  }

  onSeePalette = async (id: string) => {
    await this.props.onSeePalette(id)
  }

  onStarPalette = async (id: string) => {
    starPalette({
      id: id,
      starredPalettesDbTableName:
        this.props.config.dbs.starredPalettesDbTableName,
      userId: this.props.userSession.userId,
      mustBeStarred: false,
    })
      .then(() => {
        const currentPalettesList = this.props.palettesList.filter(
          (pal) => pal.palette_id !== id
        )
        this.props.onLoadPalettesList(currentPalettesList)

        if (currentPalettesList.length === 0) this.props.onChangeStatus('EMPTY')
        if (currentPalettesList.length < this.props.config.limits.pageSize)
          this.props.onChangeCurrentPage(1)

        trackPublicationEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId,
          this.props.userIdentity.id,
          this.props.planStatus,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'STAR_PALETTE',
          }
        )
      })
      .finally(() => {
        this.setState({
          isRemoveFromStarredLoading: Array(
            this.props.palettesList.length
          ).fill(false),
        })
      })
      .catch((error) => {
        console.error('Error starring/un-starring palette:', error)
        sendPluginMessage(
          {
            pluginMessage: {
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: this.props.t('error.starPalette'),
              },
            },
          },
          '*'
        )
      })
  }

  // Templates
  StarredPalettesList = () => {
    let fragment

    if (this.props.status === 'LOADED')
      fragment = (
        <Bar
          soloPartSlot={
            <Button
              type="secondary"
              label={this.props.t('browse.lazyLoad.loadMore')}
              isLoading={this.state.isLoadMoreActionLoading}
              action={() => {
                this.props.onChangeCurrentPage(this.props.currentPage + 1)
                this.callUICPAgent(
                  this.props.currentPage + 1,
                  this.props.searchQuery
                )
                this.setState({
                  isLoadMoreActionLoading: true,
                })
              }}
            />
          }
          isCentered
          padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
        />
      )
    else if (this.props.status === 'COMPLETE')
      fragment = (
        <Bar
          soloPartSlot={
            <Message
              icon="check"
              messages={[this.props.t('browse.lazyLoad.completeList')]}
            />
          }
          isCentered
          padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
        />
      )

    return (
      <List
        isLoading={this.props.status === 'LOADING'}
        isMessage={
          this.props.status === 'ERROR' ||
          this.props.status === 'EMPTY' ||
          this.props.status === 'NO_RESULT'
        }
        isFullHeight
      >
        {this.props.status === 'ERROR' && (
          <SemanticMessage
            type="WARNING"
            message={this.props.t('error.fetchPalette')}
          />
        )}
        {this.props.status === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.t('warning.noStarredPalettes')}
          />
        )}
        {this.props.status === 'NO_RESULT' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.t('info.noResult')}
          />
        )}
        {(this.props.status === 'LOADED' || this.props.status === 'COMPLETE') &&
          this.props.palettesList.map((palette, index: number) => {
            const enabledThemeIndex = palette.themes.findIndex(
              (theme) => theme.isEnabled
            )

            const data = new Data({
              base: {
                name: palette.name,
                description: palette.description,
                preset: palette.preset,
                shift: palette.shift,
                areSourceColorsLocked: palette.are_source_colors_locked,
                colors: palette.colors,
                colorSpace: palette.color_space,
                algorithmVersion: palette.algorithm_version,
              },
              themes: palette.themes,
            }).makePaletteData()

            return (
              <ActionsItem
                id={palette.palette_id}
                key={`palette-${index}`}
                name={palette.name}
                description={palette.preset?.name}
                subdescription={setPaletteMeta({
                  colors: palette.colors ?? [],
                  themes: palette.themes ?? [],
                  stars: palette.star_count ?? 0,
                  locales: this.props.t,
                })}
                user={{
                  avatar: palette.creator_avatar_url ?? '',
                  name: palette.creator_full_name ?? '',
                }}
                actionsSlot={
                  <>
                    <Feature
                      isActive={StarredPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).STAR_PALETTE.isActive()}
                    >
                      <Button
                        type="icon"
                        icon="star-on"
                        helper={{
                          label: this.props.t('browse.actions.unstarPalette'),
                        }}
                        isLoading={this.state.isRemoveFromStarredLoading[index]}
                        isBlocked={StarredPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).STAR_PALETTE.isBlocked()}
                        isNew={StarredPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).STAR_PALETTE.isNew()}
                        action={() => {
                          this.setState({
                            isRemoveFromStarredLoading:
                              this.state.isRemoveFromStarredLoading.map(
                                (loading, i) => (i === index ? true : loading)
                              ),
                          })
                          this.onStarPalette(palette.palette_id)
                        }}
                      />
                    </Feature>
                    <Feature
                      isActive={StarredPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SEE_PALETTE.isActive()}
                    >
                      <Button
                        type="secondary"
                        label={this.props.t('browse.actions.openPalette')}
                        isLoading={this.state.isAddToLocalActionLoading[index]}
                        shouldReflow={{
                          isEnabled: true,
                          icon: 'forward',
                        }}
                        isBlocked={StarredPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SEE_PALETTE.isBlocked()}
                        isNew={StarredPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SEE_PALETTE.isNew()}
                        action={() => {
                          this.setState({
                            isAddToLocalActionLoading: this.state[
                              'isAddToLocalActionLoading'
                            ].map((loading, i) =>
                              i === index ? true : loading
                            ),
                          })

                          this.onSeePalette(palette.palette_id)
                            .finally(() =>
                              this.setState({
                                isAddToLocalActionLoading: Array(
                                  this.props.palettesList.length
                                ).fill(false),
                              })
                            )
                            .catch((error) => {
                              console.error(error)
                              sendPluginMessage(
                                {
                                  pluginMessage: {
                                    type: 'POST_MESSAGE',
                                    data: {
                                      type: 'ERROR',
                                      message:
                                        this.props.t('error.openPalette'),
                                    },
                                  },
                                },
                                '*'
                              )
                            })
                        }}
                      />
                    </Feature>
                    <Feature
                      isActive={StarredPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).ADD_PALETTE.isActive()}
                    >
                      <Button
                        type="secondary"
                        label={this.props.t('actions.addToLocal')}
                        isLoading={this.state.isAddToLocalActionLoading[index]}
                        shouldReflow={{
                          isEnabled: true,
                          icon: 'plus',
                        }}
                        isBlocked={StarredPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).LOCAL_PALETTES.isReached(
                          this.props.localPalettesList.length
                        )}
                        action={() => {
                          this.setState({
                            isAddToLocalActionLoading: this.state[
                              'isAddToLocalActionLoading'
                            ].map((loading, i) =>
                              i === index ? true : loading
                            ),
                          })

                          this.onSelectPalette(palette.palette_id)
                            .finally(() =>
                              this.setState({
                                isAddToLocalActionLoading: Array(
                                  this.props.palettesList.length
                                ).fill(false),
                              })
                            )
                            .catch((error) => {
                              console.error(error)
                              sendPluginMessage(
                                {
                                  pluginMessage: {
                                    type: 'POST_MESSAGE',
                                    data: {
                                      type: 'ERROR',
                                      message: this.props.t('error.addToLocal'),
                                    },
                                  },
                                },
                                '*'
                              )
                            })
                        }}
                      />
                    </Feature>
                  </>
                }
                complementSlot={
                  <div
                    style={{
                      borderRadius: 'var(--border-radius-medium)',
                      overflow: 'hidden',
                    }}
                    className="preview__rows"
                  >
                    {data.themes[enabledThemeIndex].colors.map(
                      (color, index) => (
                        <div
                          key={`color-${index}`}
                          className="preview__row"
                        >
                          {color.shades.map((shade, shadeIndex) => (
                            <div
                              key={`color-${index}-${shadeIndex}`}
                              className="preview__cell preview__cell--compact"
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
                }
              />
            )
          })}
        {fragment}
      </List>
    )
  }

  // Render
  render() {
    let fragment

    if (this.props.status !== 'SIGN_IN_FIRST')
      fragment = <this.StarredPalettesList />
    else
      fragment = (
        <List isMessage>
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.t('browse.signInFirst.message')}
            orientation="VERTICAL"
            actionsSlot={
              <Button
                type="primary"
                label={this.props.t('browse.signInFirst.signIn')}
                isLoading={this.state.isSignInActionLoading}
                action={async () => {
                  this.setState({ isSignInActionLoading: true })
                  signIn({
                    authWorkerUrl: this.props.config.urls.authWorkerUrl,
                    authUrl: this.props.config.urls.authUrl,
                    platformUrl: this.props.config.urls.platformUrl,
                    pluginId: this.props.config.env.pluginId,
                  })
                    .finally(() => {
                      this.setState({ isSignInActionLoading: false })
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
                                  ? this.props.t('error.timeout')
                                  : this.props.t('error.authentication'),
                            },
                          },
                        },
                        '*'
                      )
                    })
                }}
              />
            }
          />
        </List>
      )

    return (
      <>
        {this.props.status !== 'SIGN_IN_FIRST' &&
          this.props.status !== 'EMPTY' && (
            <Bar
              soloPartSlot={
                <Input
                  type="TEXT"
                  icon={{
                    type: 'PICTO',
                    value: 'search',
                  }}
                  placeholder={this.props.t('browse.lazyLoad.search')}
                  value={this.props.searchQuery}
                  isClearable
                  isFramed={false}
                  onChange={(e) => {
                    this.props.onChangeSearchQuery(
                      (e.target as HTMLInputElement).value
                    )
                    this.props.onChangeStatus('LOADING')
                    this.props.onChangeCurrentPage(1)
                    this.props.onLoadPalettesList([])
                    this.callUICPAgent(1, (e.target as HTMLInputElement).value)
                  }}
                  onClear={(e) => {
                    this.props.onChangeSearchQuery(e)
                    this.props.onChangeStatus('LOADING')
                    this.props.onChangeCurrentPage(1)
                    this.props.onLoadPalettesList([])
                    this.callUICPAgent(1, e)
                  }}
                />
              }
              border={['BOTTOM']}
            />
          )}
        {fragment}
      </>
    )
  }
}
