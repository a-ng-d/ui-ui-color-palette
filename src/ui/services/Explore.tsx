import { uid } from 'uid'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  SourceColorConfiguration,
  makeDefaultShift,
} from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import {
  ActionsItem,
  Bar,
  Button,
  Dropdown,
  DropdownOption,
  FormItem,
  Layout,
  List,
  SemanticMessage,
  texts,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import PalettesViewSwitch from '../components/PalettesViewSwitch'
import PalettesMosaic from '../components/PalettesMosaic'
import PalettePreview from '../components/PalettePreview'
import PaletteCard from '../components/PaletteCard'
import Feature from '../components/Feature'
import { AppState } from '../App'
import setPreviewPalette from '../../utils/setPreviewPalette'
import { computeScaleForStops } from '../../utils/scaleStops'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { getClosestColorName } from '../../utils/colorNameHelper'
import {
  BaseProps,
  Editor,
  FetchStatus,
  FilterOptions,
  PalettesView,
  PlanStatus,
  Service,
} from '../../types/app'
import { $palettesView } from '../../stores/preferences'
import { $palette } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import {
  trackActionEvent,
  trackImportEvent,
} from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface ColorHuntPalette {
  code: string
  colors: Array<string>
  likes: number
  date: string
  url: string
}

const colorHuntTags: Partial<Record<FilterOptions, string>> = {
  YELLOW: 'yellow',
  ORANGE: 'orange',
  RED: 'red',
  GREEN: 'green',
  VIOLET: 'purple',
  BLUE: 'blue',
}

interface ExploreProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  creditsCount: number
  localPalettesCount: number
  onChangeService: Dispatch<Partial<AppState>>
}

interface ExploreState {
  palettesView: PalettesView
  isActionLoading: boolean
  colourLoversPaletteList: Array<ColorHuntPalette>
  activeFilters: Array<FilterOptions>
  colourLoversPalettesListStatus: FetchStatus
  currentPage: number
  isLoadMoreActionLoading: boolean
}

export default class Explore extends PureComponent<ExploreProps, ExploreState> {
  private subscribePalettesView: (() => void) | undefined
  private filters: Array<FilterOptions>
  private palette = $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Explore.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ExploreProps) {
    super(props)
    this.filters = ['ANY', 'YELLOW', 'ORANGE', 'RED', 'GREEN', 'VIOLET', 'BLUE']
    this.palette = $palette
    this.state = {
      palettesView: $palettesView.get(),
      isActionLoading: false,
      colourLoversPaletteList: [],
      activeFilters: ['ANY'],
      colourLoversPalettesListStatus: 'LOADING',
      currentPage: 1,
      isLoadMoreActionLoading: false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.callUICPAgent()

    this.subscribePalettesView = $palettesView.subscribe((value) => {
      this.setState({ palettesView: value })
    })
  }

  componentWillUnmount = () => {
    if (this.subscribePalettesView) this.subscribePalettesView()
  }

  componentDidUpdate = (
    prevProps: Readonly<ExploreProps>,
    prevState: Readonly<ExploreState>
  ): void => {
    if (prevState.currentPage !== this.state.currentPage) this.callUICPAgent()

    if (this.state.colourLoversPalettesListStatus === 'ERROR') return

    if (this.state.activeFilters !== prevState.activeFilters) {
      this.setState({
        currentPage: 1,
        colourLoversPaletteList: [],
        colourLoversPalettesListStatus: 'LOADING',
      })
      this.callUICPAgent()
    }
  }

  // Direct Actions
  callUICPAgent = async () => {
    return fetch(
      this.props.config.urls.corsWorkerUrl +
        '?' +
        encodeURIComponent('https://colorhunt.co/php/feed.php'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          step: (this.state.currentPage - 1).toString(),
          sort: 'new',
          tags: this.state.activeFilters
            .filter((filter) => filter !== 'ANY')
            .map((filter) => colorHuntTags[filter] ?? '')
            .filter((tag) => tag !== '')
            .join(','),
        }).toString(),
        cache: 'no-cache',
        credentials: 'omit',
      }
    )
      .then((response) => {
        if (response.ok) return response.json()
        else throw new Error(this.props.t('error.badResponse'))
      })
      .then(
        (
          data: Array<{ code: string; likes: string; date: string }>
        ) => {
          const palettes: Array<ColorHuntPalette> = data.map((item) => ({
            code: item.code,
            colors: [
              item.code.slice(0, 6),
              item.code.slice(6, 12),
              item.code.slice(12, 18),
              item.code.slice(18, 24),
            ],
            likes: Number(item.likes),
            date: item.date,
            url: `https://colorhunt.co/palette/${item.code}`,
          }))
          this.setState({
            colourLoversPalettesListStatus:
              palettes.length === 0 ? 'COMPLETE' : 'LOADED',
            colourLoversPaletteList:
              this.state.colourLoversPaletteList.concat(palettes),
          })
        }
      )
      .finally(() =>
        this.setState({
          isLoadMoreActionLoading: false,
        })
      )
      .catch((error) => {
        console.error(error)
        this.setState({
          colourLoversPalettesListStatus: 'ERROR',
        })
      })
  }

  setFilters = () => {
    return this.filters.map((filter) => {
      return {
        label: this.props.t(`explore.filters.${filter.toLowerCase()}`),
        value: filter,
        feature: 'EDIT_FILTER',
        type: 'OPTION',
        isActive: true,
        isBlocked: false,
        children: [],
        action: () => this.onAddFilter(filter),
      }
    }) as Array<DropdownOption>
  }

  onAddFilter = (value: FilterOptions) => {
    if (value === 'ANY' || this.state.activeFilters.includes(value))
      this.setState({
        activeFilters: ['ANY'],
      })
    else
      this.setState({
        activeFilters: [value],
      })
  }

  onCreatePalette = (sourceColors: Array<SourceColorConfiguration>) => {
    this.setState({
      isActionLoading: true,
    })

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE',
          data: {
            sourceColors: sourceColors,
            exchange: {
              ...this.palette.value,
            },
          },
        },
      },
      '*'
    )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'CREATE_PALETTE',
        colors: sourceColors.length,
        stops: this.palette.value?.preset.stops.length,
      }
    )
  }

  getSourceColors = (
    palette: ColorHuntPalette
  ): Array<SourceColorConfiguration> =>
    palette.colors.map((color) => {
      const gl = chroma(color).gl()
      return {
        name: getClosestColorName(`#${color}`),
        rgb: {
          r: gl[0],
          g: gl[1],
          b: gl[2],
        },
        hue: {
          shift: makeDefaultShift('HUE'),
          isLocked: false,
        },
        chroma: {
          shift: makeDefaultShift('CHROMA'),
          isLocked: false,
        },
        id: uid(),
        source: 'COLOUR_LOVERS',
        isRemovable: true,
      }
    }) as Array<SourceColorConfiguration>

  onUsePalette = (palette: ColorHuntPalette) => {
    if (
      !this.features.CREATE_PALETTE.isActive() ||
      this.features.LOCAL_PALETTES.isReached(this.props.localPalettesCount)
    )
      return

    const sourceColors = this.getSourceColors(palette)

    this.props.onChangeService({
      service: 'MANAGE',
    })
    this.onCreatePalette(sourceColors)

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    ) {
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.colourLoversImport
      )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.paletteCreate
      )
    }

    trackImportEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'IMPORT_COLOUR_LOVERS',
      }
    )
  }

  // Templates
  PaletteActions = ({
    palette,
    isCompact = false,
  }: {
    palette: ColorHuntPalette
    isCompact?: boolean
  }) => (
    <>
      <Button
        type="icon"
        icon="link-connected"
        helper={{
          label: this.props.t('explore.actions.openPalette'),
        }}
        action={() =>
          sendPluginMessage(
            {
              pluginMessage: {
                type: 'OPEN_IN_BROWSER',
                data: {
                  url: palette.url,
                },
              },
            },
            '*'
          )
        }
      />
      <Feature isActive={this.features.CREATE_PALETTE.isActive() && !isCompact}>
        <Button
          type="secondary"
          label={this.props.t('explore.actions.newPalette')}
          helper={{
            label: this.features.LOCAL_PALETTES.isReached(
              this.props.localPalettesCount
            )
              ? this.props.t('info.maxNumberOfLocalPalettes', {
                  count: (this.features.LOCAL_PALETTES.limit ?? 3).toString(),
                })
              : this.props.t('explore.actions.addColors'),
            type: 'MULTI_LINE',
          }}
          isLoading={this.state.isActionLoading}
          isBlocked={this.features.LOCAL_PALETTES.isReached(
            this.props.localPalettesCount
          )}
          isNew={this.features.CREATE_PALETTE.isNew()}
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
          action={() => {
            this.onUsePalette(palette)
          }}
        />
      </Feature>
    </>
  )

  getPaletteTitle = (palette: ColorHuntPalette): string =>
    palette.colors
      .slice(0, 2)
      .map((color) => getClosestColorName(`#${color}`))
      .join(' & ')

  getPreviewExchange = () => {
    const exchange = this.palette.get()
    return {
      ...exchange,
      scale: computeScaleForStops(
        exchange.preset.stops,
        exchange.scale,
        exchange.preset.easing
      ),
    }
  }

  SourceColorsMosaic = () => (
    <PalettesMosaic>
      {this.state.colourLoversPaletteList.map((palette, index: number) => (
        <PaletteCard
          key={`source-colors-${index}`}
          colors={setPreviewPalette(
            this.getSourceColors(palette),
            this.getPreviewExchange()
          )}
          name={this.getPaletteTitle(palette)}
          subdescription={this.props.t('explore.meta', {
            likes: palette.likes.toString(),
            date: palette.date,
          })}
          actionsSlot={
            <this.PaletteActions
              palette={palette}
              isCompact
            />
          }
          action={() => this.onUsePalette(palette)}
        />
      ))}
    </PalettesMosaic>
  )

  ExternalSourceColorsList = () => {
    let fragment

    if (
      this.state.colourLoversPalettesListStatus === 'LOADED' ||
      this.state.colourLoversPalettesListStatus === 'COMPLETE'
    )
      fragment = (
        <>
          {this.state.palettesView === 'MOSAIC' && <this.SourceColorsMosaic />}
          {this.state.palettesView === 'LIST' &&
            this.state.colourLoversPaletteList.map((palette, index: number) => (
              <ActionsItem
                id={palette.code}
                key={`source-colors-${index}`}
                name={this.getPaletteTitle(palette)}
                subdescription={this.props.t('explore.meta', {
                  likes: palette.likes.toString(),
                  date: palette.date,
                })}
                actionsSlot={
                  <>
                    <this.PaletteActions palette={palette} />
                  </>
                }
                complementSlot={
                  <PalettePreview
                    colors={setPreviewPalette(
                      this.getSourceColors(palette),
                      this.getPreviewExchange()
                    )}
                  />
                }
              />
            ))}
          <Bar
            soloPartSlot={
              this.state.colourLoversPalettesListStatus === 'LOADED' ? (
                <Button
                  type="secondary"
                  label={this.props.t('browse.lazyLoad.loadMore')}
                  isLoading={this.state.isLoadMoreActionLoading}
                  action={() =>
                    this.setState({
                      isLoadMoreActionLoading: true,
                      currentPage: this.state.currentPage + 1,
                    })
                  }
                />
              ) : (
                <div className={texts['type--secondary']}>
                  {this.props.t('browse.lazyLoad.completeList')}
                </div>
              )
            }
            isCentered
            padding="var(--scale-pos-xxsmall) var(--scale-pos-xsmall)"
          />
        </>
      )
    else if (this.state.colourLoversPalettesListStatus === 'ERROR')
      fragment = (
        <SemanticMessage
          type="WARNING"
          message={this.props.t('error.fetchPalette')}
        />
      )
    return (
      <List
        isLoading={this.state.colourLoversPalettesListStatus === 'LOADING'}
        isMessage={this.state.colourLoversPalettesListStatus === 'ERROR'}
        isFullHeight
        isFullWidth
      >
        {fragment}
      </List>
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="explore"
        column={[
          {
            node: (
              <>
                <Bar
                  leftPartSlot={
                    <FormItem
                      id="explore-filters"
                      label={this.props.t('explore.filters.label')}
                      shouldFill={false}
                    >
                      <Dropdown
                        id="explore-filters"
                        options={this.setFilters()}
                        selected={
                          this.state.activeFilters.includes('ANY') &&
                          this.state.activeFilters.length > 1
                            ? this.state.activeFilters
                                .filter((filter) => filter !== 'ANY')
                                .join(', ')
                            : this.state.activeFilters.join(', ')
                        }
                        pin="TOP"
                        isDisabled={
                          this.state.colourLoversPalettesListStatus ===
                            'LOADING' ||
                          this.state.colourLoversPalettesListStatus === 'ERROR'
                        }
                      />
                    </FormItem>
                  }
                  rightPartSlot={<PalettesViewSwitch />}
                  border={['BOTTOM']}
                />
                <this.ExternalSourceColorsList />
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }
}
