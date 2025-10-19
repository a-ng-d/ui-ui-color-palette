import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  SourceColorConfiguration,
  ColourLovers,
  RgbModel,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Layout, Tabs } from '@a_ng_d/figmug-ui'
import ImagePalette from '../modules/sources/ImagePalette'
import ColorWheel from '../modules/sources/ColorWheel'
import { WithConfigProps } from '../components/WithConfig'
import { setContexts } from '../../utils/setContexts'
import {
  BaseProps,
  Context,
  ContextItem,
  Editor,
  FilterOptions,
  PlanStatus,
  Service,
  ThirdParty,
} from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import Overview from './Overview'
import Explore from './Explore'

interface SourceProps extends BaseProps, WithConfigProps {
  sourceColors: Array<SourceColorConfiguration>
  onChangeDefaultColor: (name: string, rgb: RgbModel) => void
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty | 'IMAGE' | 'HARMONY'
  ) => void
}

interface SourceStates {
  context: Context | ''
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
}

export default class Source extends PureComponent<SourceProps, SourceStates> {
  private contexts: Array<ContextItem>

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: SourceProps) {
    super(props)
    this.contexts = setContexts(
      ['SOURCE_OVERVIEW', 'SOURCE_IMAGE', 'SOURCE_HARMONY', 'SOURCE_EXPLORE'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service
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
            onChangeContexts={(context: Context) =>
              this.setState({ context: context })
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
      case 'SOURCE_IMAGE': {
        fragment = (
          <ImagePalette
            {...this.props}
            onChangeContexts={(context: Context) =>
              this.setState({ context: context })
            }
          />
        )
        break
      }
      case 'SOURCE_HARMONY': {
        fragment = (
          <ColorWheel
            {...this.props}
            baseColor={
              this.props.sourceColors.find(
                (color) => color.source === 'DEFAULT'
              )?.rgb || { r: 1, g: 1, b: 1 }
            }
            onChangeContexts={(context: Context) =>
              this.setState({ context: context })
            }
          />
        )
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
