import { createPortal } from 'react-dom'
import React from 'react'
import { PureComponent } from 'preact/compat'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
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
import { BaseProps, PlanStatus } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PagePalettesProps extends BaseProps, WithConfigProps {
  paletteListsStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  paletteLists: Array<FullConfiguration>
  onCreatePalette: () => void
}

interface PagePalettesStates {
  isDeleteDialogOpen: boolean
  targetedPaletteId: string
  targetedPaletteName: string
}

export default class PagePalettes extends PureComponent<
  PagePalettesProps,
  PagePalettesStates
> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
    }),
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
      isDeleteDialogOpen: false,
      targetedPaletteId: '',
      targetedPaletteName: '',
    }
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
        isLoading={this.props.paletteListsStatus === 'LOADING'}
        isMessage={this.props.paletteListsStatus === 'EMPTY'}
        isFullHeight
        isTopBorderEnabled
      >
        {this.props.paletteListsStatus === 'LOADED' && (
          <>
            {this.props.paletteLists
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
                                isBlocked:
                                  PagePalettes.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).DUPLICATE_PALETTE.isBlocked() ||
                                  PagePalettes.features(
                                    this.props.planStatus,
                                    this.props.config
                                  ).LOCAL_PALETTES.isReached(
                                    this.props.paletteLists.length
                                  ),
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
        {this.props.paletteListsStatus === 'EMPTY' && (
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
        <SimpleItem
          leftPartSlot={
            <span className={doClassnames([texts.type, texts.label])}>
              {this.props.locals.browse.page.title}
            </span>
          }
          isListItem={false}
        />
        {PagePalettes.features(
          this.props.planStatus,
          this.props.config
        ).LOCAL_PALETTES.isReached(this.props.paletteLists.length) &&
          !this.props.editor.includes('dev') && (
            <div
              style={{
                padding: '0 var(--size-xsmall) var(--size-xxxsmall)',
              }}
            >
              <SemanticMessage
                type="INFO"
                message={this.props.locals.info.maxNumberOfLocalPalettes.replace(
                  '{$1}',
                  (
                    PagePalettes.features(
                      this.props.planStatus,
                      this.props.config
                    ).LOCAL_PALETTES.limit ?? 0
                  ).toString()
                )}
                actionsSlot={
                  this.props.config.plan.isTrialEnabled &&
                  this.props.trialStatus !== 'EXPIRED' ? (
                    <Button
                      type="secondary"
                      label={this.props.locals.plan.tryPro}
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
                      label={this.props.locals.plan.getPro}
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
