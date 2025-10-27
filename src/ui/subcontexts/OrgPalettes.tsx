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
import Glance from '../modules/Glance'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import getPaletteMeta from '../../utils/setPaletteMeta'
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
import { ConfigContextType } from '../../index'
import { getSupabase } from '../../external/auth/client'

interface OrgPalettesProps extends BaseProps, WithConfigProps {
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

interface OrgPalettesStates {
  isLoadMoreActionLoading: boolean
  isSignInLoading: boolean
  isSecondaryActionLoading: Array<boolean>
  isPaletteGlancing: boolean
  seenPaletteId: string
}

export default class OrgPalettes extends PureComponent<
  OrgPalettesProps,
  OrgPalettesStates
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
    GLANCE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'GLANCE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: OrgPalettesProps) {
    super(props)
    this.state = {
      isLoadMoreActionLoading: false,
      isSignInLoading: false,
      isSecondaryActionLoading: [],
      isPaletteGlancing: false,
      seenPaletteId: '',
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

  componentDidUpdate = (prevProps: Readonly<OrgPalettesProps>): void => {
    if (prevProps.palettesList.length !== this.props.palettesList.length)
      this.setState({
        isSecondaryActionLoading: Array(this.props.palettesList.length).fill(
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
          isSecondaryActionLoading: Array(this.props.palettesList.length).fill(
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

    const supabase = getSupabase()

    if (!supabase) {
      this.props.onChangeStatus('ERROR')
      return
    }

    if (searchQuery === '') {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await supabase
        .from(this.props.config.dbs.palettesDbViewName)
        .select(
          'palette_id, name, description, preset, shift, are_source_colors_locked, colors, themes, color_space, algorithm_version, org_name, org_avatar_url, is_shared, star_count'
        )
        .eq('type', 'ORG')
        .order('published_at', { ascending: false })
        .order('add_count', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        ))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await supabase
        .from(this.props.config.dbs.palettesDbViewName)
        .select(
          'palette_id, name, description, preset, shift, are_source_colors_locked, colors, themes, color_space, algorithm_version, org_name, org_avatar_url, is_shared, star_count'
        )
        .eq('type', 'ORG')
        .order('published_at', { ascending: false })
        .order('add_count', { ascending: false })
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
    await this.props.onSelectPalette(id)
    this.setState({ isPaletteGlancing: false, seenPaletteId: '' })
  }

  onSeePalette = async (id: string) => {
    await this.props.onSeePalette(id)
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
          padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
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
            message={this.props.locales.error.fetchPalette}
          />
        )}
        {this.props.status === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.locales.warning.noOrgPalettes}
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
                  palette.themes ?? [],
                  palette.star_count ?? 0
                )}
                user={{
                  avatar: palette.org_avatar_url ?? '',
                  name: palette.org_name ?? '',
                }}
                actionsSlot={
                  <>
                    <Feature
                      isActive={OrgPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).GLANCE_PALETTE.isActive()}
                    >
                      <Button
                        type="icon"
                        icon="visible"
                        helper={{
                          label:
                            this.props.locales.browse.actions.glancePalette,
                        }}
                        isBlocked={OrgPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).GLANCE_PALETTE.isBlocked()}
                        isNew={OrgPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).GLANCE_PALETTE.isNew()}
                        action={() => {
                          this.setState({
                            isPaletteGlancing: true,
                            seenPaletteId: palette.palette_id,
                          })
                        }}
                      />
                    </Feature>
                    <Feature
                      isActive={OrgPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SEE_PALETTE.isActive()}
                    >
                      <Button
                        type="secondary"
                        label={this.props.locales.browse.actions.openPalette}
                        isLoading={this.state.isSecondaryActionLoading[index]}
                        isBlocked={OrgPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SEE_PALETTE.isBlocked()}
                        isNew={OrgPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SEE_PALETTE.isNew()}
                        action={() => {
                          this.setState({
                            isSecondaryActionLoading: this.state[
                              'isSecondaryActionLoading'
                            ].map((loading, i) =>
                              i === index ? true : loading
                            ),
                          })

                          this.onSeePalette(palette.palette_id)
                            .finally(() =>
                              this.setState({
                                isSecondaryActionLoading: Array(
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
                                        this.props.locales.error.openPalette,
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
                      isActive={OrgPalettes.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).ADD_PALETTE.isActive()}
                    >
                      <Button
                        type="secondary"
                        label={this.props.locales.actions.addToLocal}
                        isLoading={this.state.isSecondaryActionLoading[index]}
                        isBlocked={OrgPalettes.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).LOCAL_PALETTES.isReached(
                          this.props.localPalettesList.length
                        )}
                        action={() => {
                          this.setState({
                            isSecondaryActionLoading: this.state[
                              'isSecondaryActionLoading'
                            ].map((loading, i) =>
                              i === index ? true : loading
                            ),
                          })

                          this.onSelectPalette(palette.palette_id)
                            .finally(() =>
                              this.setState({
                                isSecondaryActionLoading: Array(
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
                                        this.props.locales.error.addToLocal,
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
        <Feature
          isActive={
            Glance.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).GLANCE_PALETTE.isActive() && this.state.isPaletteGlancing
          }
        >
          <Glance
            {...this.props}
            id={this.state.seenPaletteId}
            onSelectPalette={(id: string) => this.onSelectPalette(id)}
            onClosePalette={() => {
              this.setState({ isPaletteGlancing: false, seenPaletteId: '' })
            }}
          />
        </Feature>
      </>
    )
  }
}
