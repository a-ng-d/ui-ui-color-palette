import {
  Bar,
  Button,
  Dropdown,
  DropdownOption,
  Icon,
  Input,
  layouts,
  Menu,
  texts,
  Tooltip,
} from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../config/ConfigContext'
import { $palette } from '../../stores/palette'
import { BaseProps, PlanStatus, Service } from '../../types/app'
import {
  CreatorConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  ViewConfiguration,
} from '../../types/configurations'
import { AppStates } from '../App'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'

interface ActionsProps extends BaseProps, WithConfigProps {
  service: Service
  sourceColors: Array<SourceColorConfiguration> | []
  id: string
  scale: ScaleConfiguration
  name?: string
  dates?: DatesConfiguration
  creatorIdentity?: CreatorConfiguration
  exportType?: string
  document?: DocumentConfiguration
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
  onChangeDocument?: (view?: ViewConfiguration) => void
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

  onChangeView = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const currentElement = e.currentTarget as HTMLInputElement

    this.props.onChangeDocument?.(
      currentElement.dataset.value as ViewConfiguration
    )

    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_DOCUMENT',
          view: currentElement.dataset.value,
        },
      },
      '*'
    )
  }

  documentHandler = (e: Event) => {
    const currentElement = e.currentTarget as HTMLInputElement

    const generateSheet = () => {
      this.props.onChangeDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'SHEET',
          },
        },
        '*'
      )
    }

    const generatePaletteWithProperties = () => {
      this.props.onChangeDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'PALETTE_WITH_PROPERTIES',
          },
        },
        '*'
      )
    }

    const generatePalette = () => {
      this.props.onChangeDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'PALETTE',
          },
        },
        '*'
      )
    }

    const pushUpdates = () => {
      this.props.onChangeDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'UPDATE_DOCUMENT',
            view: this.props.document?.view ?? 'PALETTE',
          },
        },
        '*'
      )
    }

    const actions: { [action: string]: () => void } = {
      GENERATE_SHEET: () => generateSheet(),
      GENERATE_PALETTE_WITH_PROPERTIES: () => generatePaletteWithProperties(),
      GENERATE_PALETTE: () => generatePalette(),
      PUSH_UPDATES: () => pushUpdates(),
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  optionsHandler = () => {
    const options = [
      {
        label: this.props.locals.actions.generateDocument.label,
        value: 'DOCUMENT',
        type: 'OPTION',
        children: [
          {
            label: this.props.locals.actions.generateDocument.palette,
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
            action: this.documentHandler,
          },
          {
            label:
              this.props.locals.actions.generateDocument.paletteWithProperties,
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
            action: this.documentHandler,
          },
          {
            label: this.props.locals.actions.generateDocument.sheet,
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
            action: this.documentHandler,
          },
        ],
      },
    ] as Array<DropdownOption>

    if (this.state.canUpdateDocument)
      options.push({
        label: this.props.locals.actions.pushUpdates,
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
        action: this.documentHandler,
      })

    return options
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
              placeholder={this.props.locals.name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
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
              {this.props.locals.separator}
            </span>
            <div className={texts.type}>
              {this.props.sourceColors.length > 1
                ? this.props.locals.actions.sourceColorsNumber.several.replace(
                    '{$1}',
                    this.props.sourceColors.length
                  )
                : this.props.locals.actions.sourceColorsNumber.single.replace(
                    '{$1}',
                    this.props.sourceColors.length
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
                    {this.props.locals.info.maxNumberOfSourceColors.replace(
                      '{$1}',
                      Actions.features(this.props.planStatus, this.props.config)
                        .SOURCE.limit
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
              label={this.props.locals.actions.createPalette}
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
      />
    )
  }

  Deploy = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={this.props.locals.name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
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
                    label: this.props.locals.settings.global.views.simple,
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
                    action: this.onChangeView,
                  },
                  {
                    label: this.props.locals.settings.global.views.detailed,
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
                    action: this.onChangeView,
                  },
                  {
                    label: this.props.locals.settings.global.views.sheet,
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
                    action: this.onChangeView,
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
              id="display-more-actions"
              type="ICON"
              icon="ellipses"
              options={this.optionsHandler()}
              alignment="TOP_RIGHT"
              state={this.props.isSecondaryLoading ? 'LOADING' : 'DEFAULT'}
            />
            <Menu
              id="display-main-actions"
              type="PRIMARY"
              label={this.props.locals.actions.sync}
              options={[
                {
                  label: this.props.locals.actions.syncLocalStyles,
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
                  label: this.props.locals.actions.syncLocalVariables,
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
