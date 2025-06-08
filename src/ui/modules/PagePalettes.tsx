import {
  ActionsItem,
  Bar,
  Button,
  Dialog,
  List,
  Menu,
  SemanticMessage,
  texts,
} from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { createPortal } from 'react-dom'
import { ConfigContextType } from '../../config/ConfigContext'
import { BaseProps, PlanStatus } from '../../types/app'
import setPaletteMeta from '../../utils/setPaletteMeta'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'

interface PagePalettesProps extends BaseProps, WithConfigProps {
  onCreatePalette: () => void
}

interface PagePalettesStates {
  paletteListsStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  paletteLists: Array<FullConfiguration>
  isDeleteDialogOpen: boolean
  targetedPaletteId: string
  targetedPaletteName: string
}

export default class PagePalettes extends PureComponent<
  PagePalettesProps,
  PagePalettesStates
> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
    }),
    OPEN_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'OPEN_PALETTE',
      planStatus: planStatus,
    }),
    DUPLICATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DUPLICATE_PALETTE',
      planStatus: planStatus,
    }),
    DELETE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DELETE_PALETTE',
      planStatus: planStatus,
    }),
  })

  constructor(props: PagePalettesProps) {
    super(props)
    this.state = {
      paletteListsStatus: 'LOADING',
      paletteLists: [],
      isDeleteDialogOpen: false,
      targetedPaletteId: '',
      targetedPaletteName: '',
    }
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
          paletteListsStatus: path.data.length > 0 ? 'LOADED' : 'EMPTY',
          paletteLists: path.data,
        }),
      LOAD_PALETTES: () => this.setState({ paletteListsStatus: 'LOADING' }),
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onEditPalette = (id: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'JUMP_TO_PALETTE',
          id: id,
        },
      },
      '*'
    )
  }

  onDuplicatePalette = (id: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'DUPLICATE_PALETTE',
          id: id,
        },
      },
      '*'
    )
  }

  onDeletePalette = () => {
    this.setState({
      isDeleteDialogOpen: false,
      targetedPaletteId: '',
      targetedPaletteName: '',
    })

    parent.postMessage(
      {
        pluginMessage: {
          type: 'DELETE_PALETTE',
          id: this.state.targetedPaletteId,
        },
      },
      '*'
    )
  }

  // Templates
  Modals = () => {
    return (
      <>
        <Feature
          isActive={
            PagePalettes.features(
              this.props.planStatus,
              this.props.config
            ).DELETE_PALETTE.isActive() && this.state.isDeleteDialogOpen
          }
        >
          {document.getElementById('modal') &&
            createPortal(
              <Dialog
                title={this.props.locals.browse.deletePaletteDialog.title}
                actions={{
                  destructive: {
                    label: this.props.locals.browse.deletePaletteDialog.delete,
                    feature: 'DELETE_PALETTE',
                    action: this.onDeletePalette,
                  },
                  secondary: {
                    label: this.props.locals.browse.deletePaletteDialog.cancel,
                    action: () =>
                      this.setState({
                        isDeleteDialogOpen: false,
                        targetedPaletteId: '',
                        targetedPaletteName: '',
                      }),
                  },
                }}
                onClose={() =>
                  this.setState({
                    isDeleteDialogOpen: false,
                    targetedPaletteId: '',
                    targetedPaletteName: '',
                  })
                }
              >
                <div className="dialog__text">
                  <p className={texts.type}>
                    {this.props.locals.browse.deletePaletteDialog.message.replace(
                      '{$1}',
                      this.state.targetedPaletteName
                    )}
                  </p>
                </div>
              </Dialog>,
              document.getElementById('modal') ?? document.createElement('app')
            )}
        </Feature>
      </>
    )
  }

  PagePalettesList = () => {
    return (
      <List
        isLoading={this.state.paletteListsStatus === 'LOADING'}
        isMessage={this.state.paletteListsStatus === 'EMPTY'}
        isFullHeight
      >
        {this.state.paletteListsStatus === 'LOADED' && (
          <>
            {this.state.paletteLists
              .sort(
                (a, b) =>
                  new Date(b.meta.dates.openedAt).getTime() -
                  new Date(a.meta.dates.openedAt).getTime()
              )
              .map((palette, index) => {
                const enabledThemeIndex = palette.themes.findIndex(
                  (theme) => theme.isEnabled
                )

                return (
                  <ActionsItem
                    id={palette.meta.id}
                    key={`palette-${index}`}
                    name={
                      palette.base.name === ''
                        ? this.props.locals.name
                        : palette.base.name
                    }
                    description={palette.base.preset.name}
                    subdescription={setPaletteMeta(
                      palette.base.colors,
                      palette.themes
                    )}
                    actionsSlot={
                      <>
                        <Feature isActive={!this.props.editor.includes('dev')}>
                          <Menu
                            id={`more-actions-${palette.meta.id}`}
                            icon="ellipses"
                            options={[
                              {
                                label:
                                  this.props.locals.browse.actions
                                    .duplicatePalette,
                                type: 'OPTION',
                                isActive: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).DUPLICATE_PALETTE.isActive(),
                                isBlocked: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).DUPLICATE_PALETTE.isBlocked(),
                                isNew: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).DUPLICATE_PALETTE.isNew(),
                                action: () =>
                                  this.onDuplicatePalette(palette.meta.id),
                              },
                              {
                                label:
                                  this.props.locals.browse.actions
                                    .deletePalette,
                                type: 'OPTION',
                                isActive: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).DELETE_PALETTE.isActive(),
                                isBlocked: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).DELETE_PALETTE.isBlocked(),
                                isNew: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config
                                ).DELETE_PALETTE.isNew(),
                                action: () =>
                                  this.setState({
                                    isDeleteDialogOpen: true,
                                    targetedPaletteId: palette.meta.id,
                                    targetedPaletteName: palette.base.name,
                                  }),
                              },
                            ]}
                            alignment="BOTTOM_RIGHT"
                            helper={{
                              label:
                                this.props.locals.browse.actions.moreParameters,
                            }}
                          />
                        </Feature>
                        <Feature
                          isActive={PagePalettes.features(
                            this.props.planStatus,
                            this.props.config
                          ).OPEN_PALETTE.isActive()}
                        >
                          <Button
                            type="secondary"
                            label={
                              !this.props.editor.includes('dev')
                                ? this.props.locals.browse.actions.editPalette
                                : this.props.locals.browse.actions.openPalette
                            }
                            isBlocked={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config
                            ).OPEN_PALETTE.isBlocked()}
                            isNew={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config
                            ).OPEN_PALETTE.isNew()}
                            action={() => this.onEditPalette(palette.meta.id)}
                          />
                        </Feature>
                      </>
                    }
                    complementSlot={
                      <div
                        style={{
                          borderRadius: 'var(--border-radius-med)',
                          overflow: 'hidden',
                        }}
                        className="preview__rows"
                      >
                        {palette.data.themes[enabledThemeIndex].colors.map(
                          (color, index) => (
                            <div
                              key={`color-${index}`}
                              className="preview__row"
                            >
                              {color.shades.map((shade, shadeIndex) => (
                                <div
                                  key={`color-${index}-${shadeIndex}`}
                                  className="preview__cell preview__cell--compact"
                                >
                                  <div
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      position: 'absolute',
                                      zIndex: '1',
                                      top: 0,
                                      left: 0,
                                      backgroundColor: shade.hex,
                                    }}
                                  />
                                  {shade.backgroundColor !== undefined && (
                                    <div
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        zIndex: '0',
                                        top: 0,
                                        left: 0,
                                        backgroundColor: Array.isArray(
                                          shade.backgroundColor
                                        )
                                          ? `rgba(${shade.backgroundColor[0]}, ${shade.backgroundColor[1]}, ${shade.backgroundColor[2]}, 1)`
                                          : undefined,
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    }
                  />
                )
              })}
          </>
        )}
        {this.state.paletteListsStatus === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={`${this.props.locals.warning.noPaletteOnCurrrentPage}`}
            actionsSlot={
              <Button
                type="primary"
                label={this.props.locals.actions.createPalette}
                isNew={PagePalettes.features(
                  this.props.planStatus,
                  this.props.config
                ).CREATE_PALETTE.isNew()}
                action={this.props.onCreatePalette}
              />
            }
            orientation="VERTICAL"
          />
        )}
      </List>
    )
  }

  // Render
  render() {
    return (
      <>
        <Bar
          leftPartSlot={
            <span className={doClassnames([texts.type, texts.label])}>
              {this.props.locals.browse.page.title}
            </span>
          }
        />
        <this.PagePalettesList />
        <this.Modals />
      </>
    )
  }
}
