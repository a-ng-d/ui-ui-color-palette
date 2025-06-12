import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  SourceColorConfiguration,
  ColourLovers,
} from '@a_ng_d/utils-ui-color-palette'
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
import { WithConfigProps } from '../components/WithConfig'
import { trackImportEvent } from '../../utils/eventsTracker'
import {
  BaseProps,
  FetchStatus,
  FilterOptions,
  ThirdParty,
} from '../../types/app'

interface ExploreProps extends BaseProps, WithConfigProps {
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onChangeContexts: () => void
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

  constructor(props: ExploreProps) {
    super(props)
    ;(this.filters = [
      'ANY',
      'YELLOW',
      'ORANGE',
      'RED',
      'GREEN',
      'VIOLET',
      'BLUE',
    ]),
      (this.state = {
        colourLoversPalettesListStatus: 'LOADING',
        currentPage: 1,
        isLoadMoreActionLoading: false,
      })
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
      'https://corsproxy.io/?' +
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
        else throw new Error(this.props.locals.error.badResponse)
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
      .catch(() =>
        this.setState({
          colourLoversPalettesListStatus: 'ERROR',
        })
      )
  }

  setFilters = () => {
    return this.filters.map((filter) => {
      return {
        label:
          this.props.locals.source.colourLovers.filters[
            filter.toLowerCase() as keyof typeof this.props.locals.source.colourLovers.filters
          ],
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
              subdescription={`${palette.numVotes} votes, ${palette.numViews} views, ${palette.numComments} comments`}
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
                      label: this.props.locals.source.actions.openPalette,
                    }}
                    action={() =>
                      window
                        .open(palette.url?.replace('http', 'https'), '_blank')
                        ?.focus()
                    }
                  />
                  <Button
                    type="secondary"
                    label={this.props.locals.actions.addToSource}
                    action={() => {
                      this.props.onChangeContexts()
                      this.props.onChangeColorsFromImport(
                        palette.colors.map((color) => {
                          const gl = chroma(color).gl()
                          return {
                            name: color,
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
                      trackImportEvent(
                        this.props.userIdentity.id,
                        this.props.userConsent.find(
                          (consent) => consent.id === 'mixpanel'
                        )?.isConsented ?? false,
                        {
                          feature: 'IMPORT_COLOUR_LOVERS',
                        }
                      )
                    }}
                  />
                </>
              }
            />
          ))}
          <Bar
            soloPartSlot={
              this.state.colourLoversPalettesListStatus === 'LOADED' ? (
                <Button
                  type="secondary"
                  label={this.props.locals.browse.lazyLoad.loadMore}
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
                  {this.props.locals.browse.lazyLoad.completeList}
                </div>
              )
            }
            padding="var(--size-xxsmall) var(--size-xsmall)"
          />
        </>
      )
    else if (this.state.colourLoversPalettesListStatus === 'ERROR')
      fragment = (
        <SemanticMessage
          type="WARNING"
          message={this.props.locals.error.fetchPalette}
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
                      label={
                        this.props.locals.source.colourLovers.filters.label
                      }
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
