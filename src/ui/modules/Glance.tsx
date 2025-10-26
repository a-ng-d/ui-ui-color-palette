import React from 'react'
import { createPortal, PureComponent } from 'preact/compat'
import {
  BaseConfiguration,
  MetaConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Dialog,
  layouts,
  SectionTitle,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import Properties from '../contexts/Properties'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  FetchStatus,
  PlanStatus,
  Service,
} from '../../types/app'
import {
  trackPublicationEvent,
  trackSignInEvent,
} from '../../external/tracking/eventsTracker'
import starPalette from '../../external/publication/starPalette'
import { getSupabase } from '../../external/auth/client'
import { signIn } from '../../external/auth/authentication'
import { ConfigContextType } from '../../config/ConfigContext'

interface GlanceProps extends BaseProps, WithConfigProps {
  id: string
  onSelectPalette: (id: string) => void
  onClosePalette: () => void
}

interface GlanceState {
  paletteStatus: FetchStatus
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  isStarred: boolean
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
    STAR_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'STAR_PALETTE',
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
      isSecondaryActionLoading: false,
      isStarred: false,
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

  // Direct Actions
  callUICPAgent = async (id: string) => {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data: paletteData, error: paletteError } = await supabase
      .from(this.props.config.dbs.palettesDbViewName)
      .select('*')
      .eq('palette_id', id)

    if (!paletteError && paletteData.length > 0)
      try {
        this.setState({
          palette: {
            base: {
              name: paletteData[0].name,
              description: paletteData[0].description,
              preset: paletteData[0].preset,
              shift: paletteData[0].shift,
              areSourceColorsLocked: paletteData[0].are_source_colors_locked,
              colors: paletteData[0].colors,
              colorSpace: paletteData[0].color_space,
              algorithmVersion: paletteData[0].algorithm_version,
            } as BaseConfiguration,
            themes: paletteData[0].themes,
            meta: {
              id: paletteData[0].palette_id,
              dates: {
                createdAt: paletteData[0].created_at,
                updatedAt: paletteData[0].updated_at,
                publishedAt: paletteData[0].published_at,
              },
              publicationStatus: {
                isPublished: true,
                isShared: paletteData[0].is_shared,
              },
              creatorIdentity: {
                creatorFullName: paletteData[0].creator_full_name,
                creatorAvatar: paletteData[0].creator_avatar_url,
                creatorId: paletteData[0].creator_id,
              },
            } as MetaConfiguration,
          },
          paletteStatus: 'LOADED',
        })

        if (this.props.userSession.connectionStatus === 'UNCONNECTED') return

        const { data: starredData, error: starredError } = await supabase
          .from(this.props.config.dbs.starredPalettesDbTableName)
          .select('*')
          .eq('palette_id', id)
          .eq('user_id', this.props.userSession.userId)

        if (!starredError && starredData.length > 0)
          this.setState({ isStarred: true })
        else this.setState({ isStarred: false })

        return
      } catch {
        this.setState({ paletteStatus: 'ERROR' })
        throw paletteError
      }
    else throw paletteError
  }

  onStarPalette = async () => {
    this.setState({ isSecondaryActionLoading: true })

    starPalette({
      id: this.props.id,
      starredPalettesDbTableName:
        this.props.config.dbs.starredPalettesDbTableName,
      userId: this.props.userSession.userId,
      mustBeStarred: !this.state.isStarred,
    })
      .then(() => {
        this.setState({ isStarred: !this.state.isStarred })

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
            feature: 'STAR_PALETTE',
          }
        )
      })
      .finally(() => {
        this.setState({ isSecondaryActionLoading: false })
      })
      .catch((error) => {
        console.error('Error starring/un-starring palette:', error)
        sendPluginMessage(
          {
            pluginMessage: {
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: this.props.locales.error.starPalette,
              },
            },
          },
          '*'
        )
      })
  }

  onAuthenticate = async () => {
    this.setState({ isSecondaryActionLoading: true })

    signIn({
      disinctId: this.props.userIdentity.id,
      authWorkerUrl: this.props.config.urls.authWorkerUrl,
      authUrl: this.props.config.urls.authUrl,
      platformUrl: this.props.config.urls.platformUrl,
      pluginId: this.props.config.env.pluginId,
    })
      .then(() => {
        trackSignInEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId === ''
            ? this.props.userIdentity.id === ''
              ? ''
              : this.props.userIdentity.id
            : this.props.userSession.userId,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false
        )
      })
      .finally(() => {
        this.setState({ isSecondaryActionLoading: false })
        this.callUICPAgent(this.props.id)
      })
      .catch((error) => {
        sendPluginMessage(
          {
            pluginMessage: {
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message:
                  error.message === 'Authentication timeout'
                    ? this.props.locales.error.timeout
                    : this.props.locales.error.authentication,
              },
            },
          },
          '*'
        )
      })
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
          pin="RIGHT"
          onClose={this.props.onClosePalette}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              maxWidth: '100%',
            }}
          >
            <Bar
              id="star-palette"
              leftPartSlot={
                <SectionTitle label={this.state.palette.base.name} />
              }
              rightPartSlot={
                <div className={layouts['snackbar--medium']}>
                  <Feature
                    isActive={
                      Glance.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).STAR_PALETTE.isActive() &&
                      this.props.userSession.connectionStatus === 'CONNECTED'
                    }
                  >
                    {this.state.isStarred ? (
                      <Button
                        type="icon"
                        icon="star-on"
                        helper={{
                          label:
                            this.props.locales.browse.actions.unstarPalette,
                        }}
                        isLoading={this.state.isSecondaryActionLoading}
                        isBlocked={Glance.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).STAR_PALETTE.isBlocked()}
                        action={this.onStarPalette}
                      />
                    ) : (
                      <Button
                        type="icon"
                        icon="star-off"
                        helper={{
                          label: this.props.locales.browse.actions.starPalette,
                        }}
                        isLoading={this.state.isSecondaryActionLoading}
                        isBlocked={Glance.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).STAR_PALETTE.isBlocked()}
                        action={this.onStarPalette}
                      />
                    )}
                  </Feature>
                  <Feature
                    isActive={
                      Glance.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).STAR_PALETTE.isActive() &&
                      this.props.userSession.connectionStatus === 'UNCONNECTED'
                    }
                  >
                    <Button
                      type="secondary"
                      icon="star-on"
                      label={this.props.locales.browse.actions.signInToStar}
                      isLoading={this.state.isSecondaryActionLoading}
                      isBlocked={Glance.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).STAR_PALETTE.isBlocked()}
                      action={this.onAuthenticate}
                    />
                  </Feature>
                  <Feature
                    isActive={Glance.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).ADD_PALETTE.isActive()}
                  >
                    <Button
                      type="primary"
                      label={this.props.locales.actions.addToLocal}
                      isLoading={this.state.isPrimaryActionLoading}
                      isBlocked={Glance.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).ADD_PALETTE.isBlocked()}
                      isNew={Glance.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).ADD_PALETTE.isNew()}
                      action={() => {
                        this.setState({ isPrimaryActionLoading: true })
                        this.props.onSelectPalette(this.props.id)
                      }}
                    />
                  </Feature>
                </div>
              }
              clip={['LEFT']}
              border={['BOTTOM']}
            />
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
