import {
  ActionsItem,
  Bar,
  Button,
  Input,
  List,
  Message,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import {
  BaseConfiguration,
  MetaConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { supabase } from '../../index'
import { BaseProps, Context, FetchStatus } from '../../types/app'
import { trackPublicationEvent } from '../../utils/eventsTracker'
import getPaletteMeta from '../../utils/setPaletteMeta'
import { WithConfigProps } from '../components/WithConfig'
import { ExternalPalettes } from '@a_ng_d/utils-ui-color-palette/dist/types/data.types'

interface CommunityPalettesProps extends BaseProps, WithConfigProps {
  context: Context
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

    return actions[e.data.pluginMessage?.type ?? 'DEFAULT']?.()
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
      ;({ data, error } = await supabase
        .from(this.props.config.dbs.palettesDbTableName)
        .select(
          'palette_id, name, preset, colors, themes, creator_avatar, creator_full_name, is_shared'
        )
        .eq('is_shared', true)
        .order('published_at', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        ))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await supabase
        .from(this.props.config.dbs.palettesDbTableName)
        .select(
          'palette_id, name, preset, colors, themes, creator_avatar, creator_full_name, is_shared'
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
    const { data, error } = await supabase
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
              label={this.props.locals.palettes.lazyLoad.loadMore}
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
              messages={[this.props.locals.palettes.lazyLoad.completeList]}
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
      >
        {this.props.status === 'ERROR' && (
          <SemanticMessage
            type="WARNING"
            message={this.props.locals.error.fetchPalette}
          />
        )}
        {this.props.status === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.locals.warning.noCommunityPaletteOnRemote}
          />
        )}
        {this.props.status === 'NO_RESULT' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.locals.info.noResult}
          />
        )}
        {(this.props.status === 'LOADED' || this.props.status === 'COMPLETE') &&
          this.props.palettesList.map((palette, index: number) => (
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
                  label={this.props.locals.actions.addToLocal}
                  isLoading={this.state.isAddToLocalActionLoading[index]}
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
                                message: this.props.locals.error.addToLocal,
                              },
                            },
                          },
                          '*'
                        )
                      )
                  }}
                />
              }
            />
          ))}
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
                  placeholder={this.props.locals.palettes.lazyLoad.search}
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
