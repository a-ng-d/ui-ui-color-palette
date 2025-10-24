import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  FullConfiguration,
  ExternalPalettes,
  BaseConfiguration,
  ThemeConfiguration,
  MetaConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Layout, Tabs } from '@a_ng_d/figmug-ui'
import SelfPalettes from '../subcontexts/SelfPalettes'
import CommunityPalettes from '../subcontexts/CommunityPalettes'
import { WithConfigProps } from '../components/WithConfig'
import { setContexts } from '../../utils/setContexts'
import {
  BaseProps,
  Context,
  ContextItem,
  Editor,
  FetchStatus,
  PlanStatus,
  Service,
} from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface RemotePalettesProps extends BaseProps, WithConfigProps {
  localPalettesList: Array<FullConfiguration>
  onSeePalette: (palette: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }) => void
}

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
  RemotePalettesProps,
  RemotePalettesStates
> {
  private contexts: Array<ContextItem>

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    REMOTE_PALETTES_SELF: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES_SELF',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    REMOTE_PALETTES_COMMUNITY: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES_COMMUNITY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: RemotePalettesProps) {
    super(props)
    this.contexts = setContexts(
      ['REMOTE_PALETTES_SELF', 'REMOTE_PALETTES_COMMUNITY'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service
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
