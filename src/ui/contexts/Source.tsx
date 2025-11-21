import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  SourceColorConfiguration,
  ColourLovers,
  RgbModel,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Layout, Tabs } from '@a_ng_d/figmug-ui'
import Overview from '../subcontexts/Overview'
import ImagePalette from '../subcontexts/ImagePalette'
import GenAI from '../subcontexts/GenAI'
import Explore from '../subcontexts/Explore'
import ColorWheel from '../subcontexts/ColorWheel'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { setContexts } from '../../utils/setContexts'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  BaseProps,
  Context,
  ContextItem,
  Editor,
  FilterOptions,
  PlanStatus,
  Service,
} from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import { ConfigContextType } from '../../config/ConfigContext'

interface SourceProps extends BaseProps, WithConfigProps, WithTranslationProps {
  sourceColors: Array<SourceColorConfiguration>
  onChangeDefaultColor: (name: string, rgb: RgbModel) => void
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: SourceColorConfiguration['source']
  ) => void
}

interface SourceStates {
  context: Context | ''
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
  creditsCount: number
}

export default class Source extends PureComponent<SourceProps, SourceStates> {
  private contexts: Array<ContextItem>
  private subscribeCredits: (() => void) | undefined

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
      [
        'SOURCE_OVERVIEW',
        'SOURCE_AI',
        'SOURCE_IMAGE',
        'SOURCE_HARMONY',
        'SOURCE_EXPLORE',
      ],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service,
      props.t
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      colourLoversPaletteList: [],
      activeFilters: ['ANY'],
      creditsCount: this.props.config.plan.creditsLimit,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribeCredits = $creditsCount.subscribe((value) => {
      let adjustedValue = value
      if (adjustedValue < 0) adjustedValue = 0
      this.setState({ creditsCount: adjustedValue })

      sendPluginMessage(
        {
          pluginMessage: {
            type: 'SET_ITEMS',
            items: [
              {
                key: 'credits_count',
                value: adjustedValue,
              },
            ],
          },
          pluginId: this.props.config.env.pluginId,
        },
        this.props.config.urls.platformUrl
      )
    })
  }

  componentDidUpdate(previousProps: Readonly<SourceProps>): void {
    if (previousProps.t !== this.props.t) {
      this.contexts = setContexts(
        [
          'SOURCE_OVERVIEW',
          'SOURCE_AI',
          'SOURCE_IMAGE',
          'SOURCE_HARMONY',
          'SOURCE_EXPLORE',
        ],
        this.props.planStatus,
        this.props.config.features,
        this.props.editor,
        this.props.service,
        this.props.t
      )

      this.forceUpdate()
    }
  }

  componentWillUnmount = () => {
    if (this.subscribeCredits) this.subscribeCredits()
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.currentTarget as HTMLElement).dataset.feature as Context,
    })

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'SOURCE_OVERVIEW': {
        fragment = (
          <Overview
            {...this.props}
            creditsCount={this.state.creditsCount}
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
            creditsCount={this.state.creditsCount}
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
            creditsCount={this.state.creditsCount}
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
            creditsCount={this.state.creditsCount}
            onChangeContexts={(context: Context) =>
              this.setState({ context: context })
            }
          />
        )
        break
      }
      case 'SOURCE_AI': {
        fragment = (
          <GenAI
            {...this.props}
            creditsCount={this.state.creditsCount}
            onChangeContexts={(context: Context) =>
              this.setState({ context: context })
            }
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
