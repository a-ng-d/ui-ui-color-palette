import { createPortal } from 'react-dom'
import React from 'react'
import { PureComponent } from 'preact/compat'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  ActionsItem,
  Button,
  Dialog,
  List,
  Menu,
  SemanticMessage,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import setPaletteMeta from '../../../utils/setPaletteMeta'
import { BaseProps, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PagePalettesProps extends BaseProps, WithConfigProps {
  localPalettesListStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  localPalettesList: Array<FullConfiguration>
  onCreatePalette: () => void
}

interface PagePalettesStates {
  isDeleteDialogOpen: boolean
  targetedPaletteId: string
  targetedPaletteName: string
  isContextActionLoading: Array<boolean>
  isDestructiveActionLoading: boolean
}

export default class PagePalettes extends PureComponent<
  PagePalettesProps,
  PagePalettesStates
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service
  ) => ({
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
      currentService: service,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
    }),
    OPEN_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'OPEN_PALETTE',
      planStatus: planStatus,
      currentService: service,
    }),
    DUPLICATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DUPLICATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
    }),
    DELETE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DELETE_PALETTE',
      planStatus: planStatus,
      currentService: service,
    }),
  })

  constructor(props: PagePalettesProps) {
    super(props)
    this.state = {
      isDeleteDialogOpen: false,
      targetedPaletteId: '',
      targetedPaletteName: '',
      isContextActionLoading: [],
      isDestructiveActionLoading: false,
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    window.addEventListener('message', this.handleMessage)
  }

  componentDidUpdate = (prevProps: Readonly<PagePalettesProps>): void => {
    if (
      prevProps.localPalettesList.length !== this.props.localPalettesList.length
    )
      this.setState({
        isContextActionLoading: Array(this.props.localPalettesList.length).fill(
          false
        ),
      })
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const path = e.data.type === undefined ? e.data.pluginMessage : e.data

    const actions: {
      [key: string]: () => void
    } = {
      STOP_LOADER: () =>
        this.setState({
          isContextActionLoading: Array(
            this.props.localPalettesList.length
          ).fill(false),
          isDestructiveActionLoading: false,
          isDeleteDialogOpen: false,
          targetedPaletteId: '',
          targetedPaletteName: '',
        }),
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
    this.setState({ isDestructiveActionLoading: true })

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
      <Feature
        isActive={
          PagePalettes.features(
            this.props.planStatus,
            this.props.config,
            this.props.service
          ).DELETE_PALETTE.isActive() && this.state.isDeleteDialogOpen
        }
      >
        {document.getElementById('modal') &&
          createPortal(
            <Dialog
              title={this.props.locales.browse.deletePaletteDialog.title}
              actions={{
                destructive: {
                  label: this.props.locales.browse.deletePaletteDialog.delete,
                  feature: 'DELETE_PALETTE',
                  state: this.state.isDestructiveActionLoading
                    ? 'LOADING'
                    : 'DEFAULT',
                  action: this.onDeletePalette,
                },
                secondary: {
                  label: this.props.locales.browse.deletePaletteDialog.cancel,
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
                  {this.props.locales.browse.deletePaletteDialog.message.replace(
                    '{$1}',
                    this.state.targetedPaletteName
                  )}
                </p>
              </div>
            </Dialog>,
            document.getElementById('modal') ?? document.createElement('app')
          )}
      </Feature>
    )
  }

  PagePalettesList = () => {
    return (
      <List
        isLoading={this.props.localPalettesListStatus === 'LOADING'}
        isMessage={this.props.localPalettesListStatus === 'EMPTY'}
        isFullHeight
        isTopBorderEnabled
      >
        {this.props.localPalettesListStatus === 'LOADED' && (
          <>
            {this.props.localPalettesList
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
                        ? this.props.locales.name
                        : palette.base.name
                    }
                    indicator={
                      palette.meta.publicationStatus.isPublished
                        ? {
                            label:
                              this.props.locales.publication.statusPublished,
                            status: 'ACTIVE',
                          }
                        : undefined
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
                                  this.props.locales.browse.actions
                                    .duplicatePalette,
                                type: 'OPTION',
                                isActive: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service
                                ).DUPLICATE_PALETTE.isActive(),
                                isBlocked:
                                  PagePalettes.features(
                                    this.props.planStatus,
                                    this.props.config,
                                    this.props.service
                                  ).DUPLICATE_PALETTE.isBlocked() ||
                                  PagePalettes.features(
                                    this.props.planStatus,
                                    this.props.config,
                                    this.props.service
                                  ).LOCAL_PALETTES.isReached(
                                    this.props.localPalettesList.length
                                  ),
                                isNew: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service
                                ).DUPLICATE_PALETTE.isNew(),
                                action: () => {
                                  this.setState({
                                    isContextActionLoading:
                                      this.state.isContextActionLoading.map(
                                        (loading, i) =>
                                          i === index ? true : loading
                                      ),
                                  })
                                  this.onDuplicatePalette(palette.meta.id)
                                },
                              },
                              {
                                label:
                                  this.props.locales.browse.actions
                                    .deletePalette,
                                type: 'OPTION',
                                isActive: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service
                                ).DELETE_PALETTE.isActive(),
                                isBlocked: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service
                                ).DELETE_PALETTE.isBlocked(),
                                isNew: PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service
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
                            state={
                              this.state.isContextActionLoading[index]
                                ? 'LOADING'
                                : 'DEFAULT'
                            }
                            helper={{
                              label:
                                this.props.locales.browse.actions
                                  .moreParameters,
                            }}
                          />
                        </Feature>
                        <Feature
                          isActive={PagePalettes.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service
                          ).OPEN_PALETTE.isActive()}
                        >
                          <Button
                            type="secondary"
                            label={
                              !this.props.editor.includes('dev')
                                ? this.props.locales.browse.actions.editPalette
                                : this.props.locales.browse.actions.openPalette
                            }
                            isBlocked={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service
                            ).OPEN_PALETTE.isBlocked()}
                            isNew={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service
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
                        {new Data(palette)
                          .makePaletteData()
                          .themes[
                            enabledThemeIndex
                          ].colors.map((color, index) => (
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
                          ))}
                      </div>
                    }
                  />
                )
              })}
          </>
        )}
        {this.props.localPalettesListStatus === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={`${this.props.locales.warning.noPaletteOnCurrrentPage}`}
            actionsSlot={
              <Button
                type="primary"
                label={this.props.locales.actions.createPalette}
                isNew={PagePalettes.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service
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
        <SimpleItem
          leftPartSlot={
            <span className={doClassnames([texts.type, texts.label])}>
              {this.props.locales.browse.page.title}
            </span>
          }
          isListItem={false}
        />
        {PagePalettes.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).LOCAL_PALETTES.isReached(this.props.localPalettesList.length) &&
          !this.props.editor.includes('dev') && (
            <div
              style={{
                padding: '0 var(--size-xsmall) var(--size-xxxsmall)',
              }}
            >
              <SemanticMessage
                type="INFO"
                message={this.props.locales.info.maxNumberOfLocalPalettes.replace(
                  '{$1}',
                  (
                    PagePalettes.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service
                    ).LOCAL_PALETTES.limit ?? 0
                  ).toString()
                )}
                actionsSlot={
                  this.props.config.plan.isTrialEnabled &&
                  this.props.trialStatus !== 'EXPIRED' ? (
                    <Button
                      type="secondary"
                      label={this.props.locales.plan.tryPro}
                      action={() =>
                        parent.postMessage(
                          { pluginMessage: { type: 'GET_TRIAL' } },
                          '*'
                        )
                      }
                    />
                  ) : (
                    <Button
                      type="secondary"
                      label={this.props.locales.plan.getPro}
                      action={() =>
                        parent.postMessage(
                          { pluginMessage: { type: 'GET_PRO_PLAN' } },
                          '*'
                        )
                      }
                    />
                  )
                }
              />
            </div>
          )}
        <this.PagePalettesList />
        <this.Modals />
      </>
    )
  }
}
