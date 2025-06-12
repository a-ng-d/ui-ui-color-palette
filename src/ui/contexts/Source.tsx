import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  SourceColorConfiguration,
  ColourLovers,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Layout, Tabs } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import { setContexts } from '../../utils/setContexts'
import {
  BaseProps,
  Context,
  ContextItem,
  FilterOptions,
  PlanStatus,
  ThirdParty,
} from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import Overview from './Overview'
import Explore from './Explore'

interface SourceProps extends BaseProps, WithConfigProps {
  sourceColors: Array<SourceColorConfiguration>
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
}

interface SourceStates {
  context: Context | ''
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
}

export default class Source extends PureComponent<SourceProps, SourceStates> {
  private contexts: Array<ContextItem>

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    PREVIEW: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
    }),
  })

  constructor(props: SourceProps) {
    super(props)
    this.contexts = setContexts(
      ['SOURCE_OVERVIEW', 'SOURCE_EXPLORE'],
      props.planStatus,
      props.config.features,
      props.editor
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      colourLoversPaletteList: [],
      activeFilters: ['ANY'],
    }
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'SOURCE_OVERVIEW': {
        fragment = (
          <Overview
            {...this.props}
            onChangeContexts={() =>
              this.setState({ context: 'SOURCE_EXPLORE' })
            }
          />
        )
        break
      }
      case 'SOURCE_EXPLORE': {
        fragment = (
          <Explore
            {...this.props}
            activeFilters={this.state.activeFilters}
            colourLoversPaletteList={this.state.colourLoversPaletteList}
            onChangeContexts={() =>
              this.setState({ context: 'SOURCE_OVERVIEW' })
            }
            onLoadColourLoversPalettesList={(e, shouldBeEmpty) =>
              this.setState({
                colourLoversPaletteList: !shouldBeEmpty
                  ? this.state.colourLoversPaletteList.concat(e)
                  : [],
              })
            }
            onChangeFilters={(e) => this.setState({ activeFilters: e })}
          />
        )
        break
      }
    }

    return (
      <>
        <Layout
          id="source"
          column={[
            {
              node: (
                <Tabs
                  tabs={this.contexts}
                  active={this.state.context ?? ''}
                  direction="VERTICAL"
                  action={this.navHandler}
                />
              ),
              typeModifier: 'FIXED',
              fixedWidth: '148px',
            },
            {
              node: fragment,
              typeModifier: 'BLANK',
            },
          ]}
          isFullHeight
          isFullWidth
        />
      </>
    )
  }
}
