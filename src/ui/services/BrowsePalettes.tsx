import { Bar, Button, layouts, Tabs } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../config/ConfigContext'
import { BaseProps, Context, ContextItem, PlanStatus } from '../../types/app'
import { setContexts } from '../../utils/setContexts'
import { AppStates } from '../App'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'
import LocalPalettes from '../contexts/LocalPalettes'
import RemotePalettes from '../contexts/RemotePalettes'
import { DocumentConfiguration } from '@a_ng_d/utils-ui-color-palette'

interface BrowsePalettesProps extends BaseProps, WithConfigProps {
  document: DocumentConfiguration
  onCreatePalette: React.Dispatch<Partial<AppStates>>
}

interface BrowsePalettesStates {
  context: Context | ''
}

export default class BrowsePalettes extends PureComponent<
  BrowsePalettesProps,
  BrowsePalettesStates
> {
  private contexts: Array<ContextItem>

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
    }
  }

  // Handlers
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
    const theme = document.documentElement.getAttribute('data-theme')
    let isFlex = true

    switch (theme) {
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
            onCreatePalette={this.onCreatePalette}
          />
        )
        break
      }
      case 'REMOTE_PALETTES': {
        fragment = <RemotePalettes {...this.props} />
        break
      }
    }

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
            <div className={layouts['snackbar--medium']}>
              {this.props.document.isLinkedToPalette !== undefined &&
                this.props.document.isLinkedToPalette && (
                  <Feature
                    isActive={BrowsePalettes.features(
                      this.props.planStatus,
                      this.props.config
                    ).DOCUMENT_OPEN.isActive()}
                  >
                    <Button
                      type="secondary"
                      label={this.props.locals.browse.document.open}
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
                )}
              {this.props.document.isLinkedToPalette !== undefined &&
                !this.props.document.isLinkedToPalette &&
                !this.props.editor.includes('dev') && (
                  <Feature
                    isActive={BrowsePalettes.features(
                      this.props.planStatus,
                      this.props.config
                    ).DOCUMENT_CREATE.isActive()}
                  >
                    <Button
                      type="secondary"
                      label={this.props.locals.browse.document.create}
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
                )}
              <Feature
                isActive={
                  BrowsePalettes.features(
                    this.props.planStatus,
                    this.props.config
                  ).CREATE_PALETTE.isActive() && this.props.editor !== 'dev'
                }
              >
                <Button
                  type="primary"
                  icon="plus"
                  label={this.props.locals.browse.actions.new}
                  isBlocked={BrowsePalettes.features(
                    this.props.planStatus,
                    this.props.config
                  ).CREATE_PALETTE.isBlocked()}
                  isNew={BrowsePalettes.features(
                    this.props.planStatus,
                    this.props.config
                  ).CREATE_PALETTE.isNew()}
                  action={this.onCreatePalette}
                />
              </Feature>
            </div>
          }
        />
        <section className="context">{fragment}</section>
      </>
    )
  }
}
