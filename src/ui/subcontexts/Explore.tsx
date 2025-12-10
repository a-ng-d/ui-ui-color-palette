import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  SourceColorConfiguration,
  ColourLovers,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
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
} from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { getClosestColorName } from '../../utils/colorNameHelper'
import {
  BaseProps,
  Context,
  Editor,
  FetchStatus,
  FilterOptions,
  PlanStatus,
  Service,
  ThirdParty,
} from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import { trackImportEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface ExploreProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
  creditsCount: number
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onChangeContexts: (context: Context) => void
  onLoadColourLoversPalettesList: (
    palettes: Array<ColourLovers>,
    shouldBeEmpty: boolean
  ) => void
  onChangeFilters: (filters: Array<FilterOptions>) => void
}

interface ExploreStates {
  colourLoversPalettesListStatus: FetchStatus
  currentPage: number
  isLoadMoreActionLoading: boolean
}

export default class Explore extends PureComponent<
  ExploreProps,
  ExploreStates
> {
  private filters: Array<FilterOptions>

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SOURCE_EXPLORE_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_EXPLORE_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ExploreProps) {
    super(props)
    this.filters = ['ANY', 'YELLOW', 'ORANGE', 'RED', 'GREEN', 'VIOLET', 'BLUE']
    this.state = {
      colourLoversPalettesListStatus: 'LOADING',
      currentPage: 1,
      isLoadMoreActionLoading: false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    if (this.props.colourLoversPaletteList.length === 0) this.callUICPAgent()
    else
      this.setState({
        colourLoversPalettesListStatus: 'LOADED',
      })
  }

  componentDidUpdate = (
    prevProps: Readonly<ExploreProps>,
    prevState: Readonly<ExploreStates>
  ): void => {
    if (prevState.currentPage !== this.state.currentPage) this.callUICPAgent()

    if (this.state.colourLoversPalettesListStatus === 'ERROR') return

    if (this.props.activeFilters !== prevProps.activeFilters) {
      this.setState({
        currentPage: 1,
        colourLoversPalettesListStatus: 'LOADING',
      })
      this.props.onLoadColourLoversPalettesList([], true)
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
          }&hueOption=${this.props.activeFilters
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
        })
        this.props.onLoadColourLoversPalettesList(data, false)
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
        label: this.props.t(
          `source.colourLovers.filters.${filter.toLowerCase()}`
        ),
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
    if (value === 'ANY' || this.props.activeFilters.length === 0)
      this.props.onChangeFilters(
        this.props.activeFilters.filter((filter) => filter === 'ANY')
      )
    else if (this.props.activeFilters.includes(value))
      this.props.onChangeFilters(
        this.props.activeFilters.filter((filter) => filter !== value)
      )
    else this.props.onChangeFilters(this.props.activeFilters.concat(value))
  }

  onUsePalette = (palette: ColourLovers) => {
    this.props.onChangeContexts('SOURCE_OVERVIEW')
    this.props.onChangeColorsFromImport(
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
      }),
      'COLOUR_LOVERS'
    )

    if (this.props.config.plan.isProEnabled)
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.colourLoversImport
      )

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
          {this.props.colourLoversPaletteList.map((palette, index: number) => (
            <ActionsItem
              id={palette.id?.toString() ?? ''}
              key={`source-colors-${index}`}
              src={palette.imageUrl?.replace('http', 'https')}
              name={palette.title}
              description={`#${palette.rank}`}
              subdescription={this.props.t('source.colourLovers.meta', {
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
                      label: this.props.t('source.actions.openPalette'),
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
                  <Feature
                    isActive={Explore.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).SOURCE_EXPLORE_ADD.isActive()}
                  >
                    <Button
                      type="icon"
                      icon="plus"
                      helper={{
                        label: this.props.t('source.colourLovers.addColors'),
                        type: 'MULTI_LINE',
                      }}
                      isBlocked={Explore.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SOURCE_EXPLORE_ADD.isReached(
                        (this.props.creditsCount -
                          this.props.config.fees.colourLoversImport) *
                          -1 -
                          1
                      )}
                      isNew={Explore.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SOURCE_EXPLORE_ADD.isNew()}
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
                      label={this.props.t('source.colourLovers.filters.label')}
                      shouldFill={false}
                    >
                      <Dropdown
                        id="explore-filters"
                        options={this.setFilters()}
                        selected={
                          this.props.activeFilters.includes('ANY') &&
                          this.props.activeFilters.length > 1
                            ? this.props.activeFilters
                                .filter((filter) => filter !== 'ANY')
                                .join(', ')
                            : this.props.activeFilters.join(', ')
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
