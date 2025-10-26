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
import StarredPalettes from '../subcontexts/StarredPalettes'
import SelfPalettes from '../subcontexts/SelfPalettes'
import OrgPalettes from '../subcontexts/OrgPalettes'
import CommunityPalettes from '../subcontexts/CommunityPalettes'
import { WithConfigProps } from '../components/WithConfig'
import { setContexts } from '../../utils/setContexts'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  BaseProps,
  Context,
  ContextItem,
  Editor,
  FetchStatus,
  PlanStatus,
  Service,
} from '../../types/app'
import { trackPublicationEvent } from '../../external/tracking/eventsTracker'
import { getSupabase } from '../../external/auth/client'
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
  orgPalettesListStatus: FetchStatus
  starredPalettesListStatus: FetchStatus
  selfCurrentPage: number
  communityCurrentPage: number
  orgCurrentPage: number
  starredCurrentPage: number
  selfPalettesSearchQuery: string
  communityPalettesSearchQuery: string
  orgPalettesSearchQuery: string
  starredPalettesSearchQuery: string
  selfPalettesList: Array<ExternalPalettes>
  communityPalettesList: Array<ExternalPalettes>
  orgPalettesList: Array<ExternalPalettes>
  starredPalettesList: Array<ExternalPalettes>
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
    REMOTE_PALETTES_ORG: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES_ORG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    REMOTE_PALETTES_STARRED: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES_STARRED',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: RemotePalettesProps) {
    super(props)
    this.contexts = setContexts(
      [
        'REMOTE_PALETTES_SELF',
        'REMOTE_PALETTES_ORG',
        'REMOTE_PALETTES_COMMUNITY',
        'REMOTE_PALETTES_STARRED',
      ],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      selfPalettesListStatus: 'UNLOADED',
      communityPalettesListStatus: 'UNLOADED',
      orgPalettesListStatus: 'UNLOADED',
      starredPalettesListStatus: 'UNLOADED',
      selfCurrentPage: 1,
      communityCurrentPage: 1,
      orgCurrentPage: 1,
      starredCurrentPage: 1,
      selfPalettesList: [],
      communityPalettesList: [],
      orgPalettesList: [],
      starredPalettesList: [],
      selfPalettesSearchQuery: '',
      communityPalettesSearchQuery: '',
      orgPalettesSearchQuery: '',
      starredPalettesSearchQuery: '',
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

  onSelectPalette = async (id: string) => {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data, error } = await supabase
      .from(this.props.config.dbs.palettesDbViewName)
      .select('*')
      .eq('palette_id', id)

    if (!error && data.length > 0)
      try {
        sendPluginMessage(
          {
            pluginMessage: {
              type: 'CREATE_PALETTE_FROM_REMOTE',
              data: {
                base: {
                  name: data[0].name,
                  description: data[0].description,
                  preset: data[0].preset,
                  shift: data[0].shift,
                  areSourceColorsLocked: data[0].are_source_colors_locked,
                  colors: data[0].colors,
                  colorSpace: data[0].color_space,
                  algorithmVersion: data[0].algorithm_version,
                } as BaseConfiguration,
                themes: data[0].themes,
                meta: {
                  id: data[0].palette_id,
                  dates: {
                    createdAt: data[0].created_at,
                    updatedAt: data[0].updated_at,
                    publishedAt: data[0].published_at,
                  },
                  publicationStatus: {
                    isPublished: true,
                    isShared: data[0].is_shared,
                  },
                  creatorIdentity: {
                    creatorFullName: data[0].creator_full_name,
                    creatorAvatar: data[0].creator_avatar_url,
                    creatorId: data[0].creator_id,
                  },
                } as MetaConfiguration,
              },
            },
          },
          '*'
        )

        // Increment add count pour Community palettes uniquement
        if (this.state.context === 'REMOTE_PALETTES_COMMUNITY')
          try {
            await supabase.rpc('increment_add_count', {
              p_palette_id: data[0].palette_id,
              p_by: 1,
            })
          } catch (error) {
            console.error('Failed to sync view count:', error)
          }

        trackPublicationEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId === ''
            ? this.props.userIdentity.id === ''
              ? ''
              : this.props.userIdentity.id
            : this.props.userSession.userId,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature:
              this.props.userSession.userId === data[0].creator_id
                ? 'REUSE_PALETTE'
                : 'ADD_PALETTE',
          }
        )

        return
      } catch {
        throw error
      }
    else throw error
  }

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
            searchQuery={this.state.selfPalettesSearchQuery}
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
              this.setState({ selfPalettesSearchQuery: query })
            }
            onLoadPalettesList={(palettesList) =>
              this.setState({ selfPalettesList: palettesList })
            }
            onSelectPalette={this.onSelectPalette}
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
            onSelectPalette={this.onSelectPalette}
          />
        )
        break
      }
      case 'REMOTE_PALETTES_ORG': {
        fragment = (
          <OrgPalettes
            {...this.props}
            context={this.state.context}
            currentPage={this.state.orgCurrentPage}
            searchQuery={this.state.orgPalettesSearchQuery}
            status={this.state.orgPalettesListStatus}
            palettesList={this.state.orgPalettesList}
            onChangeStatus={(status) =>
              this.setState({ orgPalettesListStatus: status })
            }
            onChangeCurrentPage={(page) =>
              this.setState({ orgCurrentPage: page })
            }
            onChangeSearchQuery={(query) =>
              this.setState({ orgPalettesSearchQuery: query })
            }
            onLoadPalettesList={(palettesList) =>
              this.setState({ orgPalettesList: palettesList })
            }
            onSelectPalette={this.onSelectPalette}
          />
        )
        break
      }
      case 'REMOTE_PALETTES_STARRED': {
        fragment = (
          <StarredPalettes
            {...this.props}
            context={this.state.context}
            currentPage={this.state.starredCurrentPage}
            searchQuery={this.state.starredPalettesSearchQuery}
            status={this.state.starredPalettesListStatus}
            palettesList={this.state.starredPalettesList}
            onChangeStatus={(status) =>
              this.setState({ starredPalettesListStatus: status })
            }
            onChangeCurrentPage={(page) =>
              this.setState({ starredCurrentPage: page })
            }
            onChangeSearchQuery={(query) =>
              this.setState({ starredPalettesSearchQuery: query })
            }
            onLoadPalettesList={(palettesList) =>
              this.setState({ starredPalettesList: palettesList })
            }
            onSelectPalette={this.onSelectPalette}
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
