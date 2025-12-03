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
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import setPaletteMeta from '../../../utils/setPaletteMeta'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { PluginMessageData } from '../../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PagePalettesProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  localPalettesListStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  localPalettesList: Array<FullConfiguration>
  onCreatePalette: () => void
  onExplorePalettes: () => void
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
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    OPEN_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'OPEN_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SEE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'SEE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DUPLICATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DUPLICATE_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DELETE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DELETE_PALETTE',
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
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
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
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

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
    sendPluginMessage(
      {
        pluginMessage: {
          type: 'JUMP_TO_PALETTE',
          id: id,
        },
      },
      '*'
    )
  }

  onSeePalette = (id: string) => {
    sendPluginMessage(
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
    sendPluginMessage(
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

    sendPluginMessage(
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
            this.props.service,
            this.props.editor
          ).DELETE_PALETTE.isActive() && this.state.isDeleteDialogOpen
        }
      >
        {document.getElementById('modal') &&
          createPortal(
            <Dialog
              title={this.props.t('browse.deletePaletteDialog.title')}
              actions={{
                destructive: {
                  label: this.props.t('browse.deletePaletteDialog.delete'),
                  feature: 'DELETE_PALETTE',
                  state: this.state.isDestructiveActionLoading
                    ? 'LOADING'
                    : 'DEFAULT',
                  action: this.onDeletePalette,
                },
                secondary: {
                  label: this.props.t('browse.deletePaletteDialog.cancel'),
                  isAutofocus: true,
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
                  {this.props.t('browse.deletePaletteDialog.message', {
                    name:
                      this.state.targetedPaletteName === ''
                        ? this.props.t('name')
                        : this.state.targetedPaletteName,
                  })}
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
                        ? this.props.t('name')
                        : palette.base.name
                    }
                    indicator={
                      palette.meta.publicationStatus.isPublished
                        ? {
                            label: this.props.t('publication.statusPublished'),
                            status: 'ACTIVE',
                          }
                        : undefined
                    }
                    description={palette.base.preset.name}
                    subdescription={setPaletteMeta({
                      colors: palette.base.colors,
                      themes: palette.themes,
                      locales: this.props.t,
                    })}
                    actionsSlot={
                      <>
                        <Menu
                          id={`more-actions-${palette.meta.id}`}
                          icon="ellipses"
                          options={[
                            {
                              label: this.props.t(
                                'browse.actions.duplicatePalette'
                              ),
                              type: 'OPTION',
                              isActive: PagePalettes.features(
                                this.props.planStatus,
                                this.props.config,
                                this.props.service,
                                this.props.editor
                              ).DUPLICATE_PALETTE.isActive(),
                              isBlocked:
                                PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).DUPLICATE_PALETTE.isBlocked() ||
                                PagePalettes.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).LOCAL_PALETTES.isReached(
                                  this.props.localPalettesList.length
                                ),
                              isNew: PagePalettes.features(
                                this.props.planStatus,
                                this.props.config,
                                this.props.service,
                                this.props.editor
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
                              label: this.props.t(
                                'browse.actions.deletePalette'
                              ),
                              type: 'OPTION',
                              isActive: PagePalettes.features(
                                this.props.planStatus,
                                this.props.config,
                                this.props.service,
                                this.props.editor
                              ).DELETE_PALETTE.isActive(),
                              isBlocked: PagePalettes.features(
                                this.props.planStatus,
                                this.props.config,
                                this.props.service,
                                this.props.editor
                              ).DELETE_PALETTE.isBlocked(),
                              isNew: PagePalettes.features(
                                this.props.planStatus,
                                this.props.config,
                                this.props.service,
                                this.props.editor
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
                            label: this.props.t(
                              'browse.actions.moreParameters'
                            ),
                          }}
                        />
                        <Feature
                          isActive={PagePalettes.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).OPEN_PALETTE.isActive()}
                        >
                          <Button
                            type="secondary"
                            label={this.props.t('browse.actions.openPalette')}
                            shouldReflow={{
                              isEnabled: true,
                              icon: 'forward',
                            }}
                            isBlocked={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).OPEN_PALETTE.isBlocked()}
                            isNew={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).OPEN_PALETTE.isNew()}
                            action={() => this.onEditPalette(palette.meta.id)}
                          />
                        </Feature>
                        <Feature
                          isActive={PagePalettes.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).SEE_PALETTE.isActive()}
                        >
                          <Button
                            type="secondary"
                            label={this.props.t('browse.actions.openPalette')}
                            shouldReflow={{
                              isEnabled: true,
                              icon: 'forward',
                            }}
                            isBlocked={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).SEE_PALETTE.isBlocked()}
                            isNew={PagePalettes.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).SEE_PALETTE.isNew()}
                            action={() => this.onSeePalette(palette.meta.id)}
                          />
                        </Feature>
                      </>
                    }
                    complementSlot={
                      <div
                        style={{
                          borderRadius: 'var(--border-radius-medium)',
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
            message={this.props.t('warning.noPaletteOnCurrrentPage')}
            actionsSlot={
              <>
                <Feature
                  isActive={PagePalettes.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).REMOTE_PALETTES_COMMUNITY.isActive()}
                >
                  <Button
                    type="secondary"
                    label={this.props.t('actions.explorePalettes')}
                    isNew={PagePalettes.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).REMOTE_PALETTES_COMMUNITY.isNew()}
                    action={this.props.onExplorePalettes}
                  />
                </Feature>
                <Feature
                  isActive={PagePalettes.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).CREATE_PALETTE.isActive()}
                >
                  <Button
                    type="primary"
                    label={this.props.t('actions.createPalette')}
                    isNew={PagePalettes.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).CREATE_PALETTE.isNew()}
                    action={this.props.onCreatePalette}
                  />
                </Feature>
                <Feature
                  isActive={
                    !PagePalettes.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).CREATE_PALETTE.isActive()
                  }
                >
                  <span className={doClassnames([texts.type, texts.label])}>
                    {this.props.t('info.askDesigner')}
                  </span>
                </Feature>
              </>
            }
            orientation="VERTICAL"
          />
        )}
      </List>
    )
  }

  // Render
  render() {
    const limit =
      PagePalettes.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).LOCAL_PALETTES.limit ?? 0
    const message =
      limit > 1
        ? this.props.t('info.maxNumberOfLocalPalettes.plural', {
            maxCount: limit.toString(),
          })
        : this.props.t('info.maxNumberOfLocalPalettes.single')

    return (
      <>
        <SimpleItem
          leftPartSlot={
            <span className={doClassnames([texts.type, texts.label])}>
              {this.props.t('browse.page.title')}
            </span>
          }
          isListItem={false}
        />
        {PagePalettes.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).LOCAL_PALETTES.isReached(this.props.localPalettesList.length) &&
          !this.props.editor.includes('dev') && (
            <div
              style={{
                padding: '0 var(--size-pos-xsmall) var(--size-pos-xxxsmall)',
              }}
            >
              <SemanticMessage
                type="INFO"
                message={message}
                actionsSlot={
                  this.props.config.plan.isTrialEnabled &&
                  this.props.trialStatus !== 'EXPIRED' ? (
                    <Button
                      type="secondary"
                      label={this.props.t('plan.tryPro')}
                      action={() =>
                        sendPluginMessage(
                          { pluginMessage: { type: 'GET_TRIAL' } },
                          '*'
                        )
                      }
                    />
                  ) : (
                    <Button
                      type="secondary"
                      label={this.props.t('plan.getPro')}
                      action={() =>
                        sendPluginMessage(
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
