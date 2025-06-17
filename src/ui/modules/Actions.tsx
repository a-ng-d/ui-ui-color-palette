import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  CreatorConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  PublicationConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Chip,
  Dropdown,
  DropdownOption,
  Icon,
  Input,
  layouts,
  Menu,
  texts,
  Tooltip,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppStates } from '../App'
import { BaseProps, PlanStatus } from '../../types/app'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'

interface ActionsProps extends BaseProps, WithConfigProps {
  sourceColors: Array<SourceColorConfiguration> | []
  id: string
  scale: ScaleConfiguration
  name?: string
  dates?: DatesConfiguration
  creatorIdentity?: CreatorConfiguration
  exportType?: string
  document?: DocumentConfiguration
  publicationStatus?: PublicationConfiguration
  isPrimaryLoading?: boolean
  isSecondaryLoading?: boolean
  onCreatePalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onSyncLocalStyles?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => void
  onSyncLocalVariables?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => void
  onPublishPalette?: (
    e: React.MouseEvent<Element> | React.KeyboardEvent<Element>
  ) => void
  onGenerateDocument?: (
    e: React.MouseEvent<Element> | React.KeyboardEvent<Element>
  ) => void
  onChangeView?: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  onExportPalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onChangeSettings?: React.Dispatch<Partial<AppStates>>
}

interface ActionsStates {
  isTooltipVisible: boolean
  canUpdateDocument: boolean
}

export default class Actions extends PureComponent<ActionsProps, ActionsStates> {
  private palette: typeof $palette

  static defaultProps = {
    sourceColors: [],
    scale: {},
    document: {},
  }

  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    SOURCE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE',
      planStatus: planStatus,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
    }),
    SYNC_LOCAL_STYLES: new FeatureStatus({
      features: config.features,
      featureName: 'SYNC_LOCAL_STYLES',
      planStatus: planStatus,
    }),
    SYNC_LOCAL_VARIABLES: new FeatureStatus({
      features: config.features,
      featureName: 'SYNC_LOCAL_VARIABLES',
      planStatus: planStatus,
    }),
    DOCUMENT_SHEET: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_SHEET',
      planStatus: planStatus,
    }),
    DOCUMENT_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PALETTE',
      planStatus: planStatus,
    }),
    DOCUMENT_PALETTE_PROPERTIES: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PALETTE_PROPERTIES',
      planStatus: planStatus,
    }),
    DOCUMENT_PUSH_UPDATES: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PUSH_UPDATES',
      planStatus: planStatus,
    }),
    SETTINGS_NAME: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
    }),
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
    }),
    VIEWS: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_PALETTE',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE_WITH_PROPERTIES: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_PALETTE_WITH_PROPERTIES',
      planStatus: planStatus,
    }),
    VIEWS_SHEET: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_SHEET',
      planStatus: planStatus,
    }),
    PUBLISH_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLISH_PALETTE',
      planStatus: planStatus,
    }),
    PUBLICATION: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLICATION',
      planStatus: planStatus,
    }),
  })

  constructor(props: ActionsProps) {
    super(props)
    this.palette = $palette
    this.state = {
      isTooltipVisible: false,
      canUpdateDocument: false,
    }
  }

  // Lifecycle
  componentDidUpdate = () => {
    if (
      this.props.document &&
      Object.entries(this.props.document).length > 0 &&
      this.props.document.updatedAt !== this.props.dates?.updatedAt &&
      this.props.document.id === this.props.id
    )
      this.setState({
        canUpdateDocument: true,
      })
    else
      this.setState({
        canUpdateDocument: false,
      })
  }

  // Handlers
  nameHandler = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.palette.setKey('name', e.currentTarget.value)
    if (this.props.onChangeSettings)
      this.props.onChangeSettings({
        name: e.currentTarget.value,
      })
    if (this.props.service === 'EDIT')
      parent.postMessage(
        {
          pluginMessage: {
            type: 'UPDATE_PALETTE',
            id: this.props.id,
            items: [
              {
                key: 'base.name',
                value: e.currentTarget.value,
              },
            ],
          },
        },
        '*'
      )
  }

  optionsHandler = () => {
    const options = [
      {
        label: this.publicationLabel(),
        feature: 'PUBLISH_PALETTE',
        type: 'OPTION',
        isActive: Actions.features(
          this.props.planStatus,
          this.props.config
        ).PUBLISH_PALETTE.isActive(),
        isBlocked: Actions.features(
          this.props.planStatus,
          this.props.config
        ).PUBLISH_PALETTE.isBlocked(),
        isNew: Actions.features(
          this.props.planStatus,
          this.props.config
        ).PUBLISH_PALETTE.isNew(),
        action: this.props.onPublishPalette,
      },
      {
        label: this.props.locales.actions.generateDocument.label,
        value: 'DOCUMENT',
        type: 'OPTION',
        children: [
          {
            label: this.props.locales.actions.generateDocument.palette,
            feature: 'GENERATE_PALETTE',
            type: 'OPTION',
            isActive: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_PALETTE.isActive(),
            isBlocked: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_PALETTE.isBlocked(),
            isNew: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_PALETTE.isNew(),
            action: this.props.onGenerateDocument,
          },
          {
            label:
              this.props.locales.actions.generateDocument.paletteWithProperties,
            feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
            type: 'OPTION',
            isActive: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_PALETTE_PROPERTIES.isActive(),
            isBlocked: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_PALETTE_PROPERTIES.isBlocked(),
            isNew: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_PALETTE_PROPERTIES.isNew(),
            action: this.props.onGenerateDocument,
          },
          {
            label: this.props.locales.actions.generateDocument.sheet,
            feature: 'GENERATE_SHEET',
            type: 'OPTION',
            isActive: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_SHEET.isActive(),
            isBlocked: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_SHEET.isBlocked(),
            isNew: Actions.features(
              this.props.planStatus,
              this.props.config
            ).DOCUMENT_SHEET.isNew(),
            action: this.props.onGenerateDocument,
          },
        ],
      },
    ] as Array<DropdownOption>

    if (this.state.canUpdateDocument)
      options.push({
        label: this.props.locales.actions.pushUpdates,
        feature: 'PUSH_UPDATES',
        type: 'OPTION',
        isActive: Actions.features(
          this.props.planStatus,
          this.props.config
        ).DOCUMENT_PUSH_UPDATES.isActive(),
        isBlocked: Actions.features(
          this.props.planStatus,
          this.props.config
        ).DOCUMENT_PUSH_UPDATES.isBlocked(),
        isNew: Actions.features(
          this.props.planStatus,
          this.props.config
        ).DOCUMENT_PUSH_UPDATES.isNew(),
        action: this.props.onGenerateDocument,
      })

    return options
  }

  // Direct Actions
  publicationAction = (): Partial<DropdownOption> => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return {
        label: this.props.locales.actions.publishOrSyncPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_SYNC_PALETTE',
      }
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return {
        label: this.props.locales.actions.publishPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return {
        label: this.props.locales.actions.syncPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'SYNC_PALETTE',
      }
    else
      return {
        label: this.props.locales.actions.publishPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
  }

  publicationLabel = (): string => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return this.props.locales.actions.publishOrSyncPalette
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return this.props.locales.actions.publishPalette
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return this.props.locales.actions.syncPalette
    else return this.props.locales.actions.publishPalette
  }

  // Templates
  Create = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={this.props.locales.name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
              helper={{
                label: this.props.locales.settings.actions.paletteName,
                pin: 'TOP',
                type: 'SINGLE_LINE',
              }}
              isBlocked={Actions.features(
                this.props.planStatus,
                this.props.config
              ).SETTINGS_NAME.isBlocked()}
              isNew={Actions.features(
                this.props.planStatus,
                this.props.config
              ).SETTINGS_NAME.isNew()}
              feature="RENAME_PALETTE"
              onChange={this.nameHandler}
              onFocus={this.nameHandler}
              onBlur={this.nameHandler}
            />
            <span
              className={doClassnames([
                texts['type'],
                texts['type--secondary'],
              ])}
            >
              {this.props.locales.separator}
            </span>
            <div className={texts.type}>
              {this.props.sourceColors.length > 1
                ? this.props.locales.actions.sourceColorsNumber.several.replace(
                    '{$1}',
                    this.props.sourceColors.length.toString()
                  )
                : this.props.locales.actions.sourceColorsNumber.single.replace(
                    '{$1}',
                    this.props.sourceColors.length.toString()
                  )}
            </div>
            {Actions.features(
              this.props.planStatus,
              this.props.config
            ).SOURCE.isReached(this.props.sourceColors.length - 1) && (
              <div
                style={{
                  position: 'relative',
                }}
                onMouseEnter={() =>
                  this.setState({
                    isTooltipVisible: true,
                  })
                }
                onMouseLeave={() =>
                  this.setState({
                    isTooltipVisible: false,
                  })
                }
              >
                <Icon
                  type="PICTO"
                  iconName="warning"
                />
                {this.state.isTooltipVisible && (
                  <Tooltip>
                    {this.props.locales.info.maxNumberOfSourceColors.replace(
                      '{$1}',
                      String(
                        Actions.features(
                          this.props.planStatus,
                          this.props.config
                        ).SOURCE.limit ?? 0
                      )
                    )}
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        }
        rightPartSlot={
          <Feature
            isActive={Actions.features(
              this.props.planStatus,
              this.props.config
            ).CREATE_PALETTE.isActive()}
          >
            <Button
              type="primary"
              label={this.props.locales.actions.savePalette}
              feature="CREATE_PALETTE"
              isDisabled={this.props.sourceColors.length === 0}
              isBlocked={
                Actions.features(
                  this.props.planStatus,
                  this.props.config
                ).SOURCE.isReached(this.props.sourceColors.length - 1) ||
                Actions.features(
                  this.props.planStatus,
                  this.props.config
                ).PRESETS_CUSTOM_ADD.isReached(
                  Object.keys(this.props.scale).length - 1
                )
              }
              isLoading={this.props.isPrimaryLoading}
              action={this.props.onCreatePalette}
            />
          </Feature>
        }
        padding="var(--size-xxsmall) var(--size-xsmall)"
        border={['TOP']}
      />
    )
  }

  Deploy = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Feature
              isActive={
                Actions.features(
                  this.props.planStatus,
                  this.props.config
                ).PUBLICATION.isActive() &&
                this.props.publicationStatus?.isPublished
              }
            >
              <Chip isSolo>
                {this.props.locales.publication.statusPublished}
              </Chip>
            </Feature>
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={this.props.locales.name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
              helper={{
                label: this.props.locales.settings.actions.paletteName,
                pin: 'TOP',
                type: 'SINGLE_LINE',
              }}
              isBlocked={Actions.features(
                this.props.planStatus,
                this.props.config
              ).SETTINGS_NAME.isBlocked()}
              isNew={Actions.features(
                this.props.planStatus,
                this.props.config
              ).SETTINGS_NAME.isNew()}
              feature="RENAME_PALETTE"
              onChange={this.nameHandler}
              onFocus={this.nameHandler}
              onBlur={this.nameHandler}
            />
            {this.props.document?.id === this.props.id && (
              <Dropdown
                id="views"
                options={[
                  {
                    label: this.props.locales.settings.global.views.simple,
                    value: 'PALETTE',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_PALETTE.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_PALETTE.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_PALETTE.isNew(),
                    action: this.props.onChangeView,
                  },
                  {
                    label: this.props.locales.settings.global.views.detailed,
                    value: 'PALETTE_WITH_PROPERTIES',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_PALETTE_WITH_PROPERTIES.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_PALETTE_WITH_PROPERTIES.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_PALETTE_WITH_PROPERTIES.isNew(),
                    action: this.props.onChangeView,
                  },
                  {
                    label: this.props.locales.settings.global.views.sheet,
                    value: 'SHEET',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_SHEET.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_SHEET.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus,
                      this.props.config
                    ).VIEWS_SHEET.isNew(),
                    action: this.props.onChangeView,
                  },
                ]}
                selected={this.props.document.view}
                isBlocked={Actions.features(
                  this.props.planStatus,
                  this.props.config
                ).VIEWS.isBlocked()}
                isNew={Actions.features(
                  this.props.planStatus,
                  this.props.config
                ).VIEWS.isNew()}
              />
            )}
          </div>
        }
        rightPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Menu
              id="more-actions"
              type="ICON"
              icon="ellipses"
              options={this.optionsHandler()}
              alignment="TOP_RIGHT"
              state={this.props.isSecondaryLoading ? 'LOADING' : 'DEFAULT'}
            />
            <Menu
              id="main-actions"
              type="PRIMARY"
              label={this.props.locales.actions.sync}
              options={[
                {
                  label: this.props.locales.actions.syncLocalStyles,
                  value: 'LOCAL_STYLES',
                  feature: 'SYNC_LOCAL_STYLES',
                  type: 'OPTION',
                  isActive: Actions.features(
                    this.props.planStatus,
                    this.props.config
                  ).SYNC_LOCAL_STYLES.isActive(),
                  isBlocked: Actions.features(
                    this.props.planStatus,
                    this.props.config
                  ).SYNC_LOCAL_STYLES.isBlocked(),
                  isNew: Actions.features(
                    this.props.planStatus,
                    this.props.config
                  ).SYNC_LOCAL_STYLES.isNew(),
                  action: (e) => this.props.onSyncLocalStyles?.(e),
                },
                {
                  label: this.props.locales.actions.syncLocalVariables,
                  value: 'LOCAL_VARIABLES',
                  feature: 'SYNC_LOCAL_VARIABLES',
                  type: 'OPTION',
                  isActive: Actions.features(
                    this.props.planStatus,
                    this.props.config
                  ).SYNC_LOCAL_VARIABLES.isActive(),
                  isBlocked: Actions.features(
                    this.props.planStatus,
                    this.props.config
                  ).SYNC_LOCAL_VARIABLES.isBlocked(),
                  isNew: Actions.features(
                    this.props.planStatus,
                    this.props.config
                  ).SYNC_LOCAL_VARIABLES.isNew(),
                  action: (e) => this.props.onSyncLocalVariables?.(e),
                },
              ]}
              alignment="TOP_RIGHT"
              state={this.props.isSecondaryLoading ? 'LOADING' : 'DEFAULT'}
            />
          </div>
        }
        padding="var(--size-xxsmall) var(--size-xsmall)"
        border={['TOP']}
      />
    )
  }

  Export = () => {
    return (
      <Bar
        rightPartSlot={
          <Button
            type="primary"
            label={this.props.exportType}
            feature="EXPORT_PALETTE"
            action={this.props.onExportPalette}
          >
            <a></a>
          </Button>
        }
        padding="var(--size-xxsmall) var(--size-xsmall)"
        border={['TOP']}
      />
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.service === 'CREATE' && <this.Create />}
        {this.props.service === 'EDIT' && <this.Deploy />}
        {this.props.service === 'TRANSFER' && <this.Export />}
      </>
    )
  }
}
