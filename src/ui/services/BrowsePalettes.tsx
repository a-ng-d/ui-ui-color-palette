import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  DocumentConfiguration,
  FullConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Bar, Button, layouts, Tabs } from '@a_ng_d/figmug-ui'
import RemotePalettes from '../contexts/RemotePalettes'
import LocalPalettes from '../contexts/LocalPalettes'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppStates } from '../App'
import { setContexts } from '../../utils/setContexts'
import { BaseProps, Context, ContextItem, PlanStatus } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface BrowsePalettesProps extends BaseProps, WithConfigProps {
  document: DocumentConfiguration
  onCreatePalette: React.Dispatch<Partial<AppStates>>
}

interface BrowsePalettesStates {
  context: Context | ''
  localPalettesListStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  localPalettesList: Array<FullConfiguration>
}

export default class BrowsePalettes extends PureComponent<
  BrowsePalettesProps,
  BrowsePalettesStates
> {
  private contexts: Array<ContextItem>
  private theme: string | null

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
    }),
    REMOTE_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'REMOTE_PALETTES',
      planStatus: planStatus,
    }),
    DOCUMENT_OPEN: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_OPEN',
      planStatus: planStatus,
    }),
    DOCUMENT_CREATE: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_CREATE',
      planStatus: planStatus,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
    }),
  })

  constructor(props: BrowsePalettesProps) {
    super(props)
    this.contexts = setContexts(
      ['LOCAL_PALETTES', 'REMOTE_PALETTES'],
      props.planStatus,
      props.config.features,
      props.editor
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      localPalettesListStatus: 'LOADING',
      localPalettesList: [],
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = () => {
    parent.postMessage({ pluginMessage: { type: 'GET_PALETTES' } }, '*')

    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const path = e.data

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
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  // Direct Actions
  onCreatePalette = () => {
    this.props.onCreatePalette({
      service: 'CREATE',
    })
  }

  onEditPalette = () => {
    parent.postMessage(
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
    parent.postMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE_FROM_DOCUMENT',
        },
      },
      '*'
    )
  }

  // Renders
  render() {
    let fragment
    let isFlex = true

    switch (this.theme) {
      case 'penpot':
        isFlex = true
        break
      case 'figma-ui3':
        isFlex = false
        break
      default:
        isFlex = true
    }

    switch (this.state.context) {
      case 'LOCAL_PALETTES': {
        fragment = (
          <LocalPalettes
            {...this.props}
            {...this.state}
            onCreatePalette={this.onCreatePalette}
          />
        )
        break
      }
      case 'REMOTE_PALETTES': {
        fragment = (
          <RemotePalettes
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
          <Feature
            isActive={BrowsePalettes.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_OPEN.isActive()}
          >
            <Button
              type="secondary"
              label={this.props.locales.browse.document.open}
              isBlocked={BrowsePalettes.features(
                this.props.planStatus,
                this.props.config
              ).DOCUMENT_OPEN.isBlocked()}
              isNew={BrowsePalettes.features(
                this.props.planStatus,
                this.props.config
              ).DOCUMENT_OPEN.isNew()}
              action={this.onEditPalette}
            />
          </Feature>
        )
      else
        buttons.push(
          <Feature
            isActive={
              BrowsePalettes.features(
                this.props.planStatus,
                this.props.config
              ).DOCUMENT_CREATE.isActive() && !this.props.editor.includes('dev')
            }
          >
            <Button
              type="secondary"
              label={this.props.locales.browse.document.create}
              isBlocked={BrowsePalettes.features(
                this.props.planStatus,
                this.props.config
              ).DOCUMENT_CREATE.isBlocked()}
              isNew={BrowsePalettes.features(
                this.props.planStatus,
                this.props.config
              ).DOCUMENT_CREATE.isNew()}
              action={this.onCreateFromDocument}
            />
          </Feature>
        )

    if (
      BrowsePalettes.features(
        this.props.planStatus,
        this.props.config
      ).CREATE_PALETTE.isActive() &&
      !this.props.editor.includes('dev')
    )
      buttons.push(
        <Button
          type="primary"
          icon="plus"
          label={this.props.locales.browse.actions.new}
          isBlocked={
            BrowsePalettes.features(
              this.props.planStatus,
              this.props.config
            ).CREATE_PALETTE.isBlocked() ||
            BrowsePalettes.features(
              this.props.planStatus,
              this.props.config
            ).LOCAL_PALETTES.isReached(this.state.localPalettesList.length)
          }
          isNew={BrowsePalettes.features(
            this.props.planStatus,
            this.props.config
          ).CREATE_PALETTE.isNew()}
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
