import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  BaseConfiguration,
  Data,
  FullConfiguration,
  MetaConfiguration,
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
import { WithConfigProps } from '../../components/WithConfig'
import getPaletteMeta from '../../../utils/setPaletteMeta'
import { trackPublicationEvent } from '../../../utils/eventsTracker'
import { BaseProps, Context, FetchStatus, PlanStatus } from '../../../types/app'
import { ConfigContextType } from '../../../index'
import { getSupabase } from '../../../external/auth/client'

interface CommunityPalettesProps extends BaseProps, WithConfigProps {
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
}

interface CommunityPalettesStates {
  isLoadMoreActionLoading: boolean
  isSignInLoading: boolean
  isAddToLocalActionLoading: Array<boolean>
}

export default class CommunityPalettes extends PureComponent<
  CommunityPalettesProps,
  CommunityPalettesStates
> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
    }),
  })

  constructor(props: CommunityPalettesProps) {
    super(props)
    this.state = {
      isLoadMoreActionLoading: false,
      isSignInLoading: false,
      isAddToLocalActionLoading: [],
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    window.addEventListener('message', this.handleMessage)

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

  componentDidUpdate = (prevProps: Readonly<CommunityPalettesProps>): void => {
    if (prevProps.palettesList.length !== this.props.palettesList.length)
      this.setState({
        isAddToLocalActionLoading: Array(this.props.palettesList.length).fill(
          false
        ),
      })
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
      STOP_LOADER: () =>
        this.setState({
          isAddToLocalActionLoading: Array(this.props.palettesList.length).fill(
            false
          ),
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
    let data, error

    if (searchQuery === '') {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await getSupabase()
        .from(this.props.config.dbs.palettesDbTableName)
        .select(
          'palette_id, name, description, preset, shift, are_source_colors_locked, colors, themes, color_space, algorithm_version, creator_avatar, creator_full_name, is_shared'
        )
        .eq('is_shared', true)
        .order('published_at', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        ))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await getSupabase()
        .from(this.props.config.dbs.palettesDbTableName)
        .select(
          'palette_id, name, description, preset, shift, are_source_colors_locked, colors, themes, color_space, algorithm_version, creator_avatar, creator_full_name, is_shared'
        )
        .eq('is_shared', true)
        .order('published_at', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        )
        .ilike('name', `%${searchQuery}%`))
    }

    if (!error) {
      const batch = this.props.palettesList.concat(
        data as unknown as Array<ExternalPalettes>
      )
      this.props.onLoadPalettesList(batch)
      this.props.onChangeStatus(
        this.updateStatus(
          data as unknown as Array<ExternalPalettes>,
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
    const { data, error } = await getSupabase()
      .from(this.props.config.dbs.palettesDbTableName)
      .select('*')
      .eq('palette_id', id)

    if (!error && data.length > 0)
      try {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'CREATE_PALETTE_FROM_REMOTE',
              data: {
                base: {
                  name: data[0].name,
                  description: data[0].description,
                  preset: data[0].preset,
                  shift: data[0].shift,
                  areSourceColorsLocked: data[0].are_source_colors_locked,
                  colors: data[0].colors,
                  colorSpace: data[0].color_space,
                  algorithmVersion: data[0].algorithm_version,
                } as BaseConfiguration,
                themes: data[0].themes,
                meta: {
                  id: data[0].palette_id,
                  dates: {
                    createdAt: data[0].created_at,
                    updatedAt: data[0].updated_at,
                    publishedAt: data[0].published_at,
                  },
                  publicationStatus: {
                    isPublished: true,
                    isShared: data[0].is_shared,
                  },
                  creatorIdentity: {
                    creatorFullName: data[0].creator_full_name,
                    creatorAvatar: data[0].creator_avatar,
                    creatorId: data[0].creator_id,
                  },
                } as MetaConfiguration,
              },
            },
          },
          '*'
        )

        trackPublicationEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature:
              this.props.userSession.userId === data[0].creator_id
                ? 'REUSE_PALETTE'
                : 'ADD_PALETTE',
          }
        )

        return
      } catch {
        throw error
      }
    else throw error
  }

  // Templates
  ExternalPalettesList = () => {
    let fragment

    if (this.props.status === 'LOADED')
      fragment = (
        <Bar
          soloPartSlot={
            <Button
              type="secondary"
              label={this.props.locales.browse.lazyLoad.loadMore}
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
          padding="var(--size-xxsmall) var(--size-xsmall)"
        />
      )
    else if (this.props.status === 'COMPLETE')
      fragment = (
        <Bar
          soloPartSlot={
            <Message
              icon="check"
              messages={[this.props.locales.browse.lazyLoad.completeList]}
            />
          }
          isCentered
          padding="var(--size-xxsmall) var(--size-xsmall)"
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
            message={this.props.locales.error.fetchPalette}
          />
        )}
        {this.props.status === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.locales.warning.noCommunityPaletteOnRemote}
          />
        )}
        {this.props.status === 'NO_RESULT' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.locales.info.noResult}
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
                subdescription={getPaletteMeta(
                  palette.colors ?? [],
                  palette.themes ?? []
                )}
                user={{
                  avatar: palette.creator_avatar ?? '',
                  name: palette.creator_full_name ?? '',
                }}
                actionsSlot={
                  <Button
                    type="secondary"
                    label={this.props.locales.actions.addToLocal}
                    isLoading={this.state.isAddToLocalActionLoading[index]}
                    isBlocked={CommunityPalettes.features(
                      this.props.planStatus,
                      this.props.config
                    ).LOCAL_PALETTES.isReached(
                      this.props.localPalettesList.length
                    )}
                    action={() => {
                      this.setState({
                        isAddToLocalActionLoading: this.state[
                          'isAddToLocalActionLoading'
                        ].map((loading, i) => (i === index ? true : loading)),
                      })

                      this.onSelectPalette(palette.palette_id)
                        .finally(() =>
                          this.setState({
                            isAddToLocalActionLoading: Array(
                              this.props.palettesList.length
                            ).fill(false),
                          })
                        )
                        .catch(() =>
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'POST_MESSAGE',
                                data: {
                                  type: 'ERROR',
                                  message: this.props.locales.error.addToLocal,
                                },
                              },
                            },
                            '*'
                          )
                        )
                    }}
                  />
                }
                complementSlot={
                  <div
                    style={{
                      borderRadius: 'var(--border-radius-med)',
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
                  placeholder={this.props.locales.browse.lazyLoad.search}
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
        <this.ExternalPalettesList />
      </>
    )
  }
}
