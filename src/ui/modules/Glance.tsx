import React from 'react'
import { createPortal, PureComponent } from 'preact/compat'
import {
  BaseConfiguration,
  MetaConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, SemanticMessage } from '@a_ng_d/figmug-ui'
import Properties from '../contexts/Properties'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import {
  BaseProps,
  Editor,
  FetchStatus,
  PlanStatus,
  Service,
} from '../../types/app'
import { getSupabase } from '../../external/auth/client'
import { ConfigContextType } from '../../config/ConfigContext'

interface GlanceProps extends BaseProps, WithConfigProps {
  id: string
  onSelectPalette: (id: string) => void
  onClosePalette: () => void
}

interface GlanceState {
  paletteStatus: FetchStatus
  isPrimaryActionLoading: boolean
  palette: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }
}

export default class Glance extends PureComponent<GlanceProps, GlanceState> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    GLANCE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'GLANCE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    ADD_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'ADD_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  constructor(props: GlanceProps) {
    super(props)
    this.state = {
      paletteStatus: 'UNLOADED',
      isPrimaryActionLoading: false,
      palette: {
        base: {} as BaseConfiguration,
        themes: [] as Array<ThemeConfiguration>,
        meta: {} as MetaConfiguration,
      },
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    this.callUICPAgent(this.props.id)
    this.setState({ paletteStatus: 'LOADING' })
  }

  // Handlers

  // Direct Actions
  callUICPAgent = async (id: string) => {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data, error } = await supabase
      .from(this.props.config.dbs.palettesDbViewName)
      .select('*')
      .eq('palette_id', id)

    console.log(id, { data, error })

    if (!error && data.length > 0)
      try {
        this.setState({
          palette: {
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
          paletteStatus: 'LOADED',
        })

        return
      } catch {
        this.setState({ paletteStatus: 'ERROR' })
        throw error
      }
    else throw error
  }

  // Render
  render() {
    let modal
    if (this.state.paletteStatus === 'LOADING')
      modal = (
        <Dialog
          title={this.props.locales.pending.fetch}
          pin="RIGHT"
          isLoading
          onClose={this.props.onClosePalette}
        />
      )

    if (this.state.paletteStatus === 'ERROR')
      modal = (
        <Dialog
          title={'Error Fetching Palette'}
          pin="RIGHT"
          isMessage
          onClose={this.props.onClosePalette}
        >
          <SemanticMessage
            type="WARNING"
            message={this.props.locales.error.fetchPalette}
          />
        </Dialog>
      )

    if (this.state.paletteStatus === 'LOADED')
      modal = (
        <Dialog
          title={this.props.locales.browse.glancePalette.title}
          actions={{
            primary: Glance.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).ADD_PALETTE.isActive()
              ? {
                  label: this.props.locales.actions.addToLocal,
                  feature: 'ADD_PALETTE',
                  state: this.state.isPrimaryActionLoading
                    ? 'LOADING'
                    : 'DEFAULT',
                  action: () => {
                    this.setState({ isPrimaryActionLoading: true })
                    this.props.onSelectPalette(this.props.id)
                  },
                }
              : undefined,
          }}
          pin="RIGHT"
          onClose={this.props.onClosePalette}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <Properties
              {...this.props}
              id={this.props.id}
              name={this.state.palette.base.name}
              description={this.state.palette.base.description}
              preset={this.state.palette.base.preset}
              areSourceColorsLocked={
                this.state.palette.base.areSourceColorsLocked
              }
              colors={this.state.palette.base.colors}
              themes={this.state.palette.themes}
              colorSpace={this.state.palette.base.colorSpace}
              algorithmVersion={this.state.palette.base.algorithmVersion}
              dates={this.state.palette.meta.dates}
              publicationStatus={this.state.palette.meta.publicationStatus}
              creatorIdentity={this.state.palette.meta.creatorIdentity}
            />
          </div>
        </Dialog>
      )

    return (
      <Feature
        isActive={Glance.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).GLANCE_PALETTE.isActive()}
      >
        {document.getElementById('modal') &&
          createPortal(
            modal,
            document.getElementById('modal') ?? document.createElement('app')
          )}
      </Feature>
    )
  }
}
