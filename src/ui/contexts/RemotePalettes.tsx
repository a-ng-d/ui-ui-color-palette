import { Layout, Tabs } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../config/ConfigContext'
import {
  BaseProps,
  Context,
  ContextItem,
  FetchStatus,
  PlanStatus,
} from '../../types/app'
import { setContexts } from '../../utils/setContexts'
import { WithConfigProps } from '../components/WithConfig'
import CommunityPalettes from '../modules/CommunityPalettes'
import SelfPalettes from '../modules/SelfPalettes'
import { ExternalPalettes } from '@a_ng_d/utils-ui-color-palette/dist/types/data.types'

interface RemotePalettesStates {
  context: Context | ''
  selfPalettesListStatus: FetchStatus
  communityPalettesListStatus: FetchStatus
  selfCurrentPage: number
  communityCurrentPage: number
  seftPalettesSearchQuery: string
  communityPalettesSearchQuery: string
  selfPalettesList: Array<ExternalPalettes>
  communityPalettesList: Array<ExternalPalettes>
}

export default class RemotePalettes extends PureComponent<
  BaseProps & WithConfigProps,
  RemotePalettesStates
> {
  private contexts: Array<ContextItem>

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    REMOTE_PALETTES_SELF: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES_SELF',
      planStatus: planStatus,
    }),
    REMOTE_PALETTES_COMMUNITY: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES_COMMUNITY',
      planStatus: planStatus,
    }),
  })

  constructor(props: BaseProps & WithConfigProps) {
    super(props)
    this.contexts = setContexts(
      ['REMOTE_PALETTES_SELF', 'REMOTE_PALETTES_COMMUNITY'],
      props.planStatus,
      props.config.features
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      selfPalettesListStatus: 'UNLOADED',
      communityPalettesListStatus: 'UNLOADED',
      selfCurrentPage: 1,
      communityCurrentPage: 1,
      selfPalettesList: [],
      communityPalettesList: [],
      seftPalettesSearchQuery: '',
      communityPalettesSearchQuery: '',
    }
  }

  // Lifecycle
  componentDidUpdate = (
    prevProps: Readonly<BaseProps & WithConfigProps>
  ): void => {
    if (
      prevProps.userSession.connectionStatus !==
        this.props.userSession.connectionStatus &&
      this.state.selfPalettesList.length === 0
    )
      this.setState({
        selfPalettesListStatus: 'LOADING',
      })
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
      case 'REMOTE_PALETTES_SELF': {
        fragment = (
          <SelfPalettes
            {...this.props}
            context={this.state.context}
            currentPage={this.state.selfCurrentPage}
            searchQuery={this.state.seftPalettesSearchQuery}
            status={
              this.props.userSession.connectionStatus === 'CONNECTED'
                ? this.state.selfPalettesListStatus
                : 'SIGN_IN_FIRST'
            }
            palettesList={this.state.selfPalettesList}
            onChangeStatus={(status) =>
              this.setState({ selfPalettesListStatus: status })
            }
            onChangeCurrentPage={(page) =>
              this.setState({ selfCurrentPage: page })
            }
            onChangeSearchQuery={(query) =>
              this.setState({ seftPalettesSearchQuery: query })
            }
            onLoadPalettesList={(palettesList) =>
              this.setState({ selfPalettesList: palettesList })
            }
          />
        )
        break
      }
      case 'REMOTE_PALETTES_COMMUNITY': {
        fragment = (
          <CommunityPalettes
            {...this.props}
            context={this.state.context}
            currentPage={this.state.communityCurrentPage}
            searchQuery={this.state.communityPalettesSearchQuery}
            status={this.state.communityPalettesListStatus}
            palettesList={this.state.communityPalettesList}
            onChangeStatus={(status) =>
              this.setState({ communityPalettesListStatus: status })
            }
            onChangeCurrentPage={(page) =>
              this.setState({ communityCurrentPage: page })
            }
            onChangeSearchQuery={(query) =>
              this.setState({ communityPalettesSearchQuery: query })
            }
            onLoadPalettesList={(palettesList) =>
              this.setState({ communityPalettesList: palettesList })
            }
          />
        )
        break
      }
    }

    return (
      <Layout
        id="local-palettes"
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
    )
  }
}
