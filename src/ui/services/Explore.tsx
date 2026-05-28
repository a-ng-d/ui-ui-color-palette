import { uid } from 'uid'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
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
import {
  SourceColorConfiguration,
  ColourLovers,
} from '@a_ng_d/utils-ui-color-palette'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppState } from '../App'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { getClosestColorName } from '../../utils/colorNameHelper'
import {
  BaseProps,
  Editor,
  FetchStatus,
  FilterOptions,
  PlanStatus,
  Service,
} from '../../types/app'
import { $palette } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import {
  trackActionEvent,
  trackImportEvent,
} from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface ExploreProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  creditsCount: number
  onChangeService: Dispatch<Partial<AppState>>
}

interface ExploreState {
  isActionLoading: boolean
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
  colourLoversPalettesListStatus: FetchStatus
  currentPage: number
  isLoadMoreActionLoading: boolean
}

export default class Explore extends PureComponent<ExploreProps, ExploreState> {
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
        encodeURIComponent(
          `https://www.colourlovers.com/api/palettes?format=json&numResults=${this.props.config.limits.pageSize}&resultOffset=${
            this.state.currentPage - 1
          }&hueOption=${this.state.activeFilters
            .filter((filter) => filter !== 'ANY')
            .map((filter) => filter.toLowerCase())
            .join(',')}`
        ),
      {
        cache: 'no-cache',
        credentials: 'omit',
      }
    )
      .then((response) => {
        if (response.ok) return response.json()
        else throw new Error(this.props.t('error.badResponse'))
      })
      .then((data) => {
        this.setState({
          colourLoversPalettesListStatus:
            data.length === this.props.config.limits.pageSize
              ? 'LOADED'
              : 'COMPLETE',
          colourLoversPaletteList:
            this.state.colourLoversPaletteList.concat(data),
        })
      })
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
    if (value === 'ANY' || this.state.activeFilters.length === 0)
      this.setState({
        activeFilters: this.state.activeFilters.filter(
          (filter) => filter === 'ANY'
        ),
      })
    else if (this.state.activeFilters.includes(value))
      this.setState({
        activeFilters: this.state.activeFilters.filter(
          (filter) => filter !== value
        ),
      })
    else
      this.setState({
        activeFilters: this.state.activeFilters.concat(value),
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
        colors: 5,
        stops: this.palette.value?.preset.stops.length,
      }
    )
  }

  onUsePalette = (palette: ColourLovers) => {
    const sourceColors = palette.colors.map((color) => {
      const gl = chroma(color).gl()
      return {
        name: getClosestColorName(`#${color}`),
        rgb: {
          r: gl[0],
          g: gl[1],
          b: gl[2],
        },
        hue: {
          shift: 0,
          isLocked: false,
        },
        chroma: {
          shift: 100,
          isLocked: false,
        },
        id: uid(),
        source: 'COLOUR_LOVERS',
        isRemovable: true,
      }
    }) as Array<SourceColorConfiguration>

    this.props.onChangeService({
      service: 'MANAGE',
    })
    this.onCreatePalette(sourceColors)

    if (this.props.config.plan.isProEnabled) {
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
  ExternalSourceColorsList = () => {
    let fragment

    if (
      this.state.colourLoversPalettesListStatus === 'LOADED' ||
      this.state.colourLoversPalettesListStatus === 'COMPLETE'
    )
      fragment = (
        <>
          {this.state.colourLoversPaletteList.map((palette, index: number) => (
            <ActionsItem
              id={palette.id?.toString() ?? ''}
              key={`source-colors-${index}`}
              src={palette.imageUrl?.replace('http', 'https')}
              name={palette.title}
              description={`#${palette.rank}`}
              subdescription={this.props.t('explore.meta', {
                votes: palette.numVotes?.toString() ?? '0',
                views: palette.numViews?.toString() ?? '0',
                comments: palette.numComments?.toString() ?? '0',
              })}
              user={{
                avatar: undefined,
                name: palette.userName ?? '',
              }}
              actionsSlot={
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
                              url: palette.url?.replace('http', 'https'),
                            },
                          },
                        },
                        '*'
                      )
                    }
                  />
                  <Feature isActive={this.features.CREATE_PALETTE.isActive()}>
                    <Button
                      type="secondary"
                      label={this.props.t('explore.actions.newPalette')}
                      helper={{
                        label: this.props.t('explore.actions.addColors'),
                        type: 'MULTI_LINE',
                      }}
                      isLoading={this.state.isActionLoading}
                      isBlocked={this.features.CREATE_PALETTE.isReached(
                        (this.props.creditsCount -
                          this.props.config.fees.paletteCreate) *
                          -1 -
                          1
                      )}
                      isNew={this.features.CREATE_PALETTE.isNew()}
                      onBlock={() => {
                        sendPluginMessage(
                          {
                            pluginMessage: { type: 'GET_PRO' },
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
                      currentPage:
                        this.state.currentPage +
                        (this.props.config.limits.pageSize as number),
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
            padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
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
                  soloPartSlot={
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
