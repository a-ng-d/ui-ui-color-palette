import { PureComponent } from 'preact/compat'
import {
  Data,
  FullConfiguration,
  ExternalPalettes,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import {
  ActionsItem,
  Bar,
  Button,
  Input,
  List,
  Message,
  SemanticMessage,
} from '@unoff/ui'
import Glance from '../modules/Glance'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import PalettesViewSwitch from '../components/PalettesViewSwitch'
import PalettesMosaic from '../components/PalettesMosaic'
import PalettePreview from '../components/PalettePreview'
import PaletteCard from '../components/PaletteCard'
import Feature from '../components/Feature'
import setPaletteMeta from '../../utils/setPaletteMeta'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  Context,
  Editor,
  FetchStatus,
  PalettesView,
  PlanStatus,
  Service,
} from '../../types/app'
import { $palettesView } from '../../stores/preferences'
import {
  trackPublicationEvent,
  trackSignInEvent,
} from '../../external/tracking/eventsTracker'
import starPalette from '../../external/publication/starPalette'
import { signIn } from '../../external/auth/authentication'
import { getSupabase } from '../../external/auth'
import { ConfigContextType } from '../../config/ConfigContext'

interface CommunityPalettesProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
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

interface CommunityPalettesState {
  palettesView: PalettesView
  isLoadMoreActionLoading: boolean
  isSignInLoading: boolean
  isSecondaryActionLoading: Array<boolean>
  isStarActionLoading: Array<boolean>
  starredIds: Array<string>
  isPaletteGlancing: boolean
  seenPaletteId: string
}

export default class CommunityPalettes extends PureComponent<
  CommunityPalettesProps,
  CommunityPalettesState
> {
  private subscribePalettesView: (() => void) | undefined
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
    OPEN_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'OPEN_PALETTE',
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
    STAR_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'STAR_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return CommunityPalettes.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: CommunityPalettesProps) {
    super(props)
    this.state = {
      palettesView: $palettesView.get(),
      isLoadMoreActionLoading: false,
      isSignInLoading: false,
      isSecondaryActionLoading: [],
      isStarActionLoading: [],
      starredIds: [],
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

    this.subscribePalettesView = $palettesView.subscribe((value) => {
      this.setState({ palettesView: value })
    })

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

    this.fetchStarredIds()

    return actions[this.props.status]?.()
  }

  componentDidUpdate = (prevProps: Readonly<CommunityPalettesProps>): void => {
    if (
      prevProps.userSession.connectionStatus !==
      this.props.userSession.connectionStatus
    )
      this.fetchStarredIds()

    if (prevProps.palettesList.length !== this.props.palettesList.length)
      this.setState({
        isSecondaryActionLoading: Array(this.props.palettesList.length).fill(
          false
        ),
        isStarActionLoading: Array(this.props.palettesList.length).fill(false),
      })
  }

  componentWillUnmount = () => {
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )

    if (this.subscribePalettesView) this.subscribePalettesView()
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

    if (searchQuery === '')
      ({ data, error } = await supabase
        .from(this.props.config.dbs.palettesDbViewName)
        .select(
          'palette_id, name, description, preset, shift, are_source_colors_locked, colors, themes, color_space, algorithm_version, creator_avatar_url, creator_full_name, is_shared, star_count'
        )
        .eq('is_shared', true)
        .eq('type', 'MEMBER')
        .order('published_at', { ascending: false })
        .order('add_count', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        ))
    else
      ({ data, error } = await supabase
        .from(this.props.config.dbs.palettesDbViewName)
        .select(
          'palette_id, name, description, preset, shift, are_source_colors_locked, colors, themes, color_space, algorithm_version, creator_avatar_url, creator_full_name, is_shared, star_count'
        )
        .eq('is_shared', true)
        .eq('type', 'MEMBER')
        .order('published_at', { ascending: false })
        .order('add_count', { ascending: false })
        .range(
          this.props.config.limits.pageSize * (currentPage - 1),
          this.props.config.limits.pageSize * currentPage - 1
        )
        .ilike('name', `%${searchQuery}%`))

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

  fetchStarredIds = async () => {
    const supabase = getSupabase()

    if (
      !supabase ||
      this.props.userSession.connectionStatus !== 'CONNECTED' ||
      !this.features.STAR_PALETTE.isActive()
    ) {
      this.setState({ starredIds: [] })
      return
    }

    const { data, error } = await supabase
      .from(this.props.config.dbs.starredPalettesDbTableName)
      .select('palette_id')
      .eq('user_id', this.props.userSession.userId)

    if (!error && data)
      this.setState({
        starredIds: data.map((item: { palette_id: string }) => item.palette_id),
      })
  }

  onAddToLocal = (palette: ExternalPalettes, index: number) => {
    if (!this.features.ADD_PALETTE.isActive()) return

    if (
      this.features.LOCAL_PALETTES.isReached(
        this.props.localPalettesList.length
      )
    ) {
      const isTrial =
        this.props.config.plan.isTrialEnabled &&
        this.props.trialStatus !== 'EXPIRED'
      sendPluginMessage(
        {
          pluginMessage: isTrial
            ? { type: 'GET_TRIAL' }
            : { type: 'GET_PRO', data: { origin: 'LOCAL_PALETTES' } },
        },
        '*'
      )
      return
    }

    this.setState({
      isSecondaryActionLoading: this.state.isSecondaryActionLoading.map(
        (loading, i) => (i === index ? true : loading)
      ),
    })

    this.onSelectPalette(palette.palette_id)
      .finally(() =>
        this.setState({
          isSecondaryActionLoading: Array(this.props.palettesList.length).fill(
            false
          ),
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
  }

  onToggleStar = (palette: ExternalPalettes, index: number) => {
    const isStarred = this.state.starredIds.includes(palette.palette_id)
    const setLoading = (value: boolean) =>
      this.setState({
        isStarActionLoading: this.props.palettesList.map((_, i) =>
          i === index ? value : (this.state.isStarActionLoading[i] ?? false)
        ),
      })

    setLoading(true)

    starPalette({
      id: palette.palette_id,
      starredPalettesDbTableName:
        this.props.config.dbs.starredPalettesDbTableName,
      userId: this.props.userSession.userId,
      mustBeStarred: !isStarred,
    })
      .then(() => {
        this.setState({
          starredIds: isStarred
            ? this.state.starredIds.filter((id) => id !== palette.palette_id)
            : [...this.state.starredIds, palette.palette_id],
        })

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
      .finally(() => setLoading(false))
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

  onAuthenticate = (index: number) => {
    this.setState({
      isStarActionLoading: this.props.palettesList.map((_, i) => i === index),
    })

    signIn({
      authWorkerUrl: this.props.config.urls.authWorkerUrl,
      authUrl: this.props.config.urls.authUrl,
      platformUrl: this.props.config.urls.platformUrl,
      pluginId: this.props.config.env.pluginId,
    })
      .then(() => {
        trackSignInEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId,
          this.props.userIdentity.id,
          this.props.planStatus,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false
        )
      })
      .finally(() => {
        this.setState({
          isStarActionLoading: Array(this.props.palettesList.length).fill(
            false
          ),
        })
        this.fetchStarredIds()
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
  }

  onOpenPalette = (palette: ExternalPalettes, index: number) => {
    if (
      !this.features.SEE_PALETTE.isActive() ||
      this.features.SEE_PALETTE.isBlocked()
    )
      return

    this.setState({
      isSecondaryActionLoading: this.state.isSecondaryActionLoading.map(
        (loading, i) => (i === index ? true : loading)
      ),
    })

    this.onSeePalette(palette.palette_id)
      .finally(() =>
        this.setState({
          isSecondaryActionLoading: Array(this.props.palettesList.length).fill(
            false
          ),
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
                message: this.props.t('error.openPalette'),
              },
            },
          },
          '*'
        )
      })
  }

  onSeePalette = async (id: string) => {
    await this.props.onSeePalette(id)
  }

  // Templates
  PaletteActions = ({
    palette,
    index,
    isCompact = false,
  }: {
    palette: ExternalPalettes
    index: number
    isCompact?: boolean
  }) => (
    <>
      <Feature isActive={this.features.GLANCE_PALETTE.isActive()}>
        <Button
          type="icon"
          icon="visible"
          helper={{
            label: this.props.t('browse.actions.glancePalette'),
          }}
          isBlocked={this.features.GLANCE_PALETTE.isBlocked()}
          isNew={this.features.GLANCE_PALETTE.isNew()}
          onBlock={() => {
            const isTrial =
              this.props.config.plan.isTrialEnabled &&
              this.props.trialStatus !== 'EXPIRED'
            sendPluginMessage(
              {
                pluginMessage: isTrial
                  ? { type: 'GET_TRIAL' }
                  : {
                      type: 'GET_PRO',
                      data: { origin: 'GLANCE_PALETTE' },
                    },
              },
              '*'
            )
          }}
          action={() => {
            this.setState({
              isPaletteGlancing: true,
              seenPaletteId: palette.palette_id,
            })
          }}
        />
      </Feature>
      <Feature isActive={this.features.STAR_PALETTE.isActive()}>
        <Button
          type="icon"
          icon={
            this.props.userSession.connectionStatus === 'CONNECTED' &&
            this.state.starredIds.includes(palette.palette_id)
              ? 'star-on'
              : 'star-off'
          }
          helper={{
            label:
              this.props.userSession.connectionStatus !== 'CONNECTED'
                ? this.props.t('browse.actions.signInToStar')
                : this.state.starredIds.includes(palette.palette_id)
                  ? this.props.t('browse.actions.unstarPalette')
                  : this.props.t('browse.actions.starPalette'),
          }}
          isLoading={this.state.isStarActionLoading[index]}
          isBlocked={this.features.STAR_PALETTE.isBlocked()}
          isNew={this.features.STAR_PALETTE.isNew()}
          onBlock={() => {
            const isTrial =
              this.props.config.plan.isTrialEnabled &&
              this.props.trialStatus !== 'EXPIRED'
            sendPluginMessage(
              {
                pluginMessage: isTrial
                  ? { type: 'GET_TRIAL' }
                  : {
                      type: 'GET_PRO',
                      data: { origin: 'STAR_PALETTE' },
                    },
              },
              '*'
            )
          }}
          action={() =>
            this.props.userSession.connectionStatus === 'CONNECTED'
              ? this.onToggleStar(palette, index)
              : this.onAuthenticate(index)
          }
        />
      </Feature>
      <Feature isActive={this.features.SEE_PALETTE.isActive() && !isCompact}>
        <Button
          type="secondary"
          label={this.props.t('browse.actions.openPalette')}
          isLoading={this.state.isSecondaryActionLoading[index]}
          shouldReflow={{
            isEnabled: true,
            icon: 'forward',
          }}
          isBlocked={this.features.SEE_PALETTE.isBlocked()}
          isNew={this.features.SEE_PALETTE.isNew()}
          onBlock={() => {
            const isTrial =
              this.props.config.plan.isTrialEnabled &&
              this.props.trialStatus !== 'EXPIRED'
            sendPluginMessage(
              {
                pluginMessage: isTrial
                  ? { type: 'GET_TRIAL' }
                  : {
                      type: 'GET_PRO',
                      data: { origin: 'SEE_PALETTE' },
                    },
              },
              '*'
            )
          }}
          action={() => this.onOpenPalette(palette, index)}
        />
      </Feature>
      <Feature isActive={this.features.ADD_PALETTE.isActive()}>
        <Button
          type={isCompact ? 'icon' : 'secondary'}
          icon={isCompact ? 'plus' : undefined}
          label={isCompact ? undefined : this.props.t('actions.addToLocal')}
          helper={
            this.features.LOCAL_PALETTES.isReached(
              this.props.localPalettesList.length
            )
              ? {
                  label: this.props.t('info.maxNumberOfLocalPalettes', {
                    count: (this.features.LOCAL_PALETTES.limit ?? 3).toString(),
                  }),
                  type: 'MULTI_LINE',
                }
              : isCompact
                ? { label: this.props.t('actions.addToLocal') }
                : undefined
          }
          isLoading={this.state.isSecondaryActionLoading[index]}
          shouldReflow={{
            isEnabled: true,
            icon: 'plus',
          }}
          isBlocked={this.features.LOCAL_PALETTES.isReached(
            this.props.localPalettesList.length
          )}
          isNew={this.features.ADD_PALETTE.isNew()}
          onBlock={() => {
            const isTrial =
              this.props.config.plan.isTrialEnabled &&
              this.props.trialStatus !== 'EXPIRED'
            sendPluginMessage(
              {
                pluginMessage: isTrial
                  ? { type: 'GET_TRIAL' }
                  : {
                      type: 'GET_PRO',
                      data: { origin: 'LOCAL_PALETTES' },
                    },
              },
              '*'
            )
          }}
          action={() => this.onAddToLocal(palette, index)}
        />
      </Feature>
    </>
  )

  PalettesMosaic = () => (
    <PalettesMosaic>
      {this.props.palettesList.map((palette, index: number) => {
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
          <PaletteCard
            key={`palette-${index}`}
            name={palette.name}
            description={palette.preset?.name}
            subdescription={setPaletteMeta({
              colors: palette.colors ?? [],
              themes: palette.themes ?? [],
              stars: palette.star_count ?? 0,
              locales: this.props.t,
            })}
            colors={data.themes[enabledThemeIndex].colors}
            user={{
              avatar: palette.creator_avatar_url ?? '',
              name: palette.creator_full_name ?? '',
            }}
            actionsSlot={
              <this.PaletteActions
                palette={palette}
                index={index}
                isCompact
              />
            }
            action={() => this.onAddToLocal(palette, index)}
          />
        )
      })}
    </PalettesMosaic>
  )

  ExternalPalettesList = () => {
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
          padding="var(--scale-pos-xxsmall) var(--scale-pos-xsmall)"
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
          padding="var(--scale-pos-xxsmall) var(--scale-pos-xsmall)"
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
        isFullWidth
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
            message={this.props.t('warning.noCommunityPaletteOnRemote')}
          />
        )}
        {this.props.status === 'NO_RESULT' && (
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.t('info.noResult')}
          />
        )}
        {(this.props.status === 'LOADED' || this.props.status === 'COMPLETE') &&
          this.state.palettesView === 'MOSAIC' && <this.PalettesMosaic />}
        {(this.props.status === 'LOADED' || this.props.status === 'COMPLETE') &&
          this.state.palettesView === 'LIST' &&
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
                    <this.PaletteActions
                      palette={palette}
                      index={index}
                    />
                  </>
                }
                complementSlot={
                  <PalettePreview
                    colors={data.themes[enabledThemeIndex].colors}
                  />
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
              leftPartSlot={
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
              rightPartSlot={<PalettesViewSwitch />}
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
