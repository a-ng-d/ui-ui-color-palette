import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import { Bar, Button, layouts, Tabs } from '@unoff/ui'
import {
  BaseConfiguration,
  DocumentConfiguration,
  FullConfiguration,
  MetaConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { ManagePaletteState } from '../services/ManagePalette'
import RemotePalettes from '../contexts/RemotePalettes'
import LocalPalettes from '../contexts/LocalPalettes'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { setContexts } from '../../utils/setContexts'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  Context,
  ContextItem,
  PlanStatus,
  Service,
  Editor,
} from '../../types/app'
import { $palette } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import { trackActionEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface BrowsePalettesProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  document: DocumentConfiguration
  sourceColors: Array<SourceColorConfiguration>
  onCreatePalette: React.Dispatch<Partial<ManagePaletteState>>
  onSeePalette: (palette: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }) => void
}

interface BrowsePalettesState {
  context: Context | ''
  localPalettesListStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  localPalettesList: Array<FullConfiguration>
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
}

export default class BrowsePalettes extends PureComponent<
  BrowsePalettesProps,
  BrowsePalettesState
> {
  private contexts: Array<ContextItem>
  private theme: string | null
  private remotePalettesRef = React.createRef<RemotePalettes>()
  private palette = $palette

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
    REMOTE_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_OPEN: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_OPEN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_CREATE: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_CREATE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return BrowsePalettes.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: BrowsePalettesProps) {
    super(props)
    this.contexts = setContexts(
      ['LOCAL_PALETTES', 'REMOTE_PALETTES'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service,
      props.t
    )
    this.palette = $palette
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      localPalettesListStatus: 'LOADING',
      localPalettesList: [],
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = () => {
    sendPluginMessage({ pluginMessage: { type: 'GET_PALETTES' } }, '*')

    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  componentDidUpdate(previousProps: Readonly<BrowsePalettesProps>): void {
    if (previousProps.t !== this.props.t) {
      this.contexts = setContexts(
        ['LOCAL_PALETTES', 'REMOTE_PALETTES'],
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
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    const actions: {
      [action: string]: () => void
    } = {
      EXPOSE_PALETTES: () =>
        this.setState({
          localPalettesListStatus: path.data.length > 0 ? 'LOADED' : 'EMPTY',
          localPalettesList: path.data,
        }),
      LOAD_PALETTES: () =>
        this.setState({ localPalettesListStatus: 'LOADING' }),
      STOP_LOADER: () =>
        this.setState({
          isPrimaryActionLoading: false,
          isSecondaryActionLoading: false,
        }),
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  navHandler = (e: Event) =>
    this.setState({
      context: (e.currentTarget as HTMLElement).dataset.feature as Context,
    })

  // Direct Actions
  onCreatePalette = () => {
    const sourceColors = this.props.sourceColors

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE',
          data: {
            sourceColors: sourceColors,
            exchange: {
              ...this.palette.value,
            },
          },
        },
      },
      '*'
    )

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.paletteCreate
      )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'CREATE_PALETTE',
        colors: sourceColors.length,
        stops: this.palette.value?.preset.stops.length,
      }
    )
  }

  onEditPalette = () => {
    sendPluginMessage(
      {
        pluginMessage: {
          type: 'JUMP_TO_PALETTE',
          id: this.props.document.id,
        },
      },
      '*'
    )
  }

  onCreateFromDocument = () => {
    sendPluginMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE_FROM_DOCUMENT',
        },
      },
      '*'
    )
  }

  onExplorePalettes = () => {
    this.setState(
      {
        context: 'REMOTE_PALETTES',
      },
      () => {
        if (this.remotePalettesRef.current)
          this.remotePalettesRef.current.setState({
            context: 'REMOTE_PALETTES_COMMUNITY',
          })
      }
    )
  }

  // Renders
  render() {
    let fragment
    let isFlex = true

    switch (this.theme) {
      case 'figma':
        isFlex = false
        break
      case 'penpot':
        isFlex = true
        break
      case 'sketch':
        isFlex = false
        break
      case 'framer':
        isFlex = true
        break
      default:
        isFlex = false
    }

    switch (this.state.context) {
      case 'LOCAL_PALETTES': {
        fragment = (
          <LocalPalettes
            {...this.props}
            {...this.state}
            onCreatePalette={this.onCreatePalette}
            onExplorePalettes={this.onExplorePalettes}
          />
        )
        break
      }
      case 'REMOTE_PALETTES': {
        fragment = (
          <RemotePalettes
            ref={this.remotePalettesRef}
            {...this.props}
            {...this.state}
          />
        )
        break
      }
    }

    const buttons = [] as React.ReactNode[]

    if (this.props.document.isLinkedToPalette !== undefined)
      if (this.props.document.isLinkedToPalette)
        buttons.push(
          <Feature isActive={this.features.DOCUMENT_OPEN.isActive()}>
            <Button
              type="secondary"
              label={this.props.t('browse.document.open')}
              isBlocked={this.features.DOCUMENT_OPEN.isBlocked()}
              isNew={this.features.DOCUMENT_OPEN.isNew()}
              shouldReflow={{
                icon: 'forward',
                isEnabled: true,
              }}
              onBlock={() => {
                sendPluginMessage(
                  {
                    pluginMessage: { type: 'GET_PRO' },
                  },
                  '*'
                )
              }}
              action={this.onEditPalette}
            />
          </Feature>
        )
      else
        buttons.push(
          <Feature isActive={this.features.DOCUMENT_CREATE.isActive()}>
            <Button
              type="secondary"
              label={this.props.t('browse.document.restore')}
              helper={
                this.features.LOCAL_PALETTES.isReached(
                  this.state.localPalettesList.length
                )
                  ? {
                      label: this.props.t('info.maxNumberOfLocalPalettes', {
                        count: (
                          this.features.LOCAL_PALETTES.limit ?? 3
                        ).toString(),
                      }),
                      type: 'MULTI_LINE',
                    }
                  : undefined
              }
              isLoading={this.state.isSecondaryActionLoading}
              isBlocked={
                this.features.DOCUMENT_CREATE.isBlocked() ||
                this.features.LOCAL_PALETTES.isReached(
                  this.state.localPalettesList.length
                ) ||
                this.features.CREATE_PALETTE.isReached(
                  (this.props.creditsCount -
                    this.props.config.fees.paletteCreate) *
                    -1 -
                    1
                )
              }
              isNew={this.features.DOCUMENT_CREATE.isNew()}
              shouldReflow={{
                icon: 'link-connected',
                isEnabled: true,
              }}
              onBlock={() => {
                sendPluginMessage(
                  {
                    pluginMessage: { type: 'GET_PRO' },
                  },
                  '*'
                )
              }}
              action={this.onCreateFromDocument}
            />
          </Feature>
        )

    if (this.features.CREATE_PALETTE.isActive())
      buttons.push(
        <Button
          type="primary"
          icon="plus"
          label={this.props.t('actions.createPalette')}
          helper={
            this.features.LOCAL_PALETTES.isReached(
              this.state.localPalettesList.length
            )
              ? {
                  label: this.props.t('info.maxNumberOfLocalPalettes', {
                    count: (this.features.LOCAL_PALETTES.limit ?? 3).toString(),
                  }),
                  type: 'MULTI_LINE',
                }
              : undefined
          }
          shouldReflow={{ isEnabled: true, icon: 'plus' }}
          isBlocked={
            this.features.LOCAL_PALETTES.isReached(
              this.state.localPalettesList.length
            ) ||
            this.features.CREATE_PALETTE.isReached(
              (this.props.creditsCount - this.props.config.fees.paletteCreate) *
                -1 -
                1
            )
          }
          onBlock={() => {
            sendPluginMessage(
              {
                pluginMessage: { type: 'GET_PRO' },
              },
              '*'
            )
          }}
          isNew={this.features.CREATE_PALETTE.isNew()}
          action={this.onCreatePalette}
        />
      )
    return (
      <>
        <Bar
          leftPartSlot={
            this.contexts.length > 1 ? (
              <Tabs
                tabs={this.contexts}
                active={this.state.context ?? ''}
                isFlex={isFlex}
                action={this.navHandler}
              />
            ) : undefined
          }
          rightPartSlot={
            buttons.length > 0 ? (
              <div className={layouts['snackbar--medium']}>{buttons}</div>
            ) : undefined
          }
          border={['BOTTOM']}
        />
        <section className="context">{fragment}</section>
      </>
    )
  }
}
