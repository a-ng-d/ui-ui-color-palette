import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  CreatorConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  PublicationConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Chip,
  Dropdown,
  DropdownOption,
  Icon,
  IconList,
  Input,
  layouts,
  Menu,
  texts,
  Tooltip,
} from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppStates } from '../App'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'

interface ActionsProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  sourceColors: Array<SourceColorConfiguration> | []
  id: string
  scale: ScaleConfiguration
  name?: string
  dates?: DatesConfiguration
  creatorIdentity?: CreatorConfiguration
  format?: string
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

export default class Actions extends PureComponent<
  ActionsProps,
  ActionsStates
> {
  private palette: typeof $palette

  static defaultProps = {
    sourceColors: [],
    scale: {},
    document: {},
  }

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SOURCE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE',
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
    SYNC_LOCAL_STYLES: new FeatureStatus({
      features: config.features,
      featureName: 'SYNC_LOCAL_STYLES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SYNC_LOCAL_VARIABLES: new FeatureStatus({
      features: config.features,
      featureName: 'SYNC_LOCAL_VARIABLES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_SHEET: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_SHEET',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_PALETTE_PROPERTIES: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PALETTE_PROPERTIES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_PUSH_UPDATES: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PUSH_UPDATES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_NAME: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VIEWS: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VIEWS_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VIEWS_PALETTE_WITH_PROPERTIES: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_PALETTE_WITH_PROPERTIES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VIEWS_SHEET: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_SHEET',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PUBLISH_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLISH_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PUBLICATION: new FeatureStatus({
      features: config.features,
      featureName: 'PUBLICATION',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_LOCK_SOURCE_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_LOCK_SOURCE_COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_NONE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_NONE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SCALE_CHROMA: new FeatureStatus({
      features: config.features,
      featureName: 'SCALE_CHROMA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOWNLOAD_EXPORT: new FeatureStatus({
      features: config.features,
      featureName: 'DOWNLOAD_EXPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
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
  componentDidMount = () => {
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
      sendPluginMessage(
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

  documentOptionsHandler = () => {
    const options = [
      {
        label: this.props.t('actions.generateDocument.palette'),
        feature: 'GENERATE_PALETTE',
        type: 'OPTION',
        isActive: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_PALETTE.isActive(),
        isBlocked: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_PALETTE.isBlocked(),
        isNew: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_PALETTE.isNew(),
        action: this.props.onGenerateDocument,
      },
      {
        label: this.props.t('actions.generateDocument.paletteWithProperties'),
        feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
        type: 'OPTION',
        isActive: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_PALETTE_PROPERTIES.isActive(),
        isBlocked: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_PALETTE_PROPERTIES.isBlocked(),
        isNew: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_PALETTE_PROPERTIES.isNew(),
        action: this.props.onGenerateDocument,
      },
      {
        label: this.props.t('actions.generateDocument.sheet'),
        feature: 'GENERATE_SHEET',
        type: 'OPTION',
        isActive: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_SHEET.isActive(),
        isBlocked: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_SHEET.isBlocked(),
        isNew: Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOCUMENT_SHEET.isNew(),
        action: this.props.onGenerateDocument,
      },
    ] as Array<DropdownOption>

    if (this.state.canUpdateDocument)
      options.push(
        {
          type: 'SEPARATOR',
        },
        {
          label: this.props.t('actions.pushUpdates'),
          feature: 'PUSH_UPDATES',
          type: 'OPTION',
          isActive: Actions.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).DOCUMENT_PUSH_UPDATES.isActive(),
          isBlocked: Actions.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).DOCUMENT_PUSH_UPDATES.isBlocked(),
          isNew: true,
          action: this.props.onGenerateDocument,
        }
      )

    return options
  }

  // Direct Actions
  publicationAction = (): Partial<DropdownOption> => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return {
        label: this.props.t('actions.publishOrSyncPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_SYNC_PALETTE',
      }
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return {
        label: this.props.t('actions.publishPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return {
        label: this.props.t('actions.syncPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'SYNC_PALETTE',
      }
    else
      return {
        label: this.props.t('actions.publishPalette'),
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
  }

  publicationLabel = (): string => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return this.props.t('actions.publishOrSyncPalette')
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return this.props.t('actions.publishPalette')
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return this.props.t('actions.syncPalette')
    else return this.props.t('actions.publishPalette')
  }

  publicationIcon = (): IconList => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return 'library'
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return 'library'
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return 'swap'
    else return 'library'
  }

  canSavePalette = (): boolean => {
    if (
      Actions.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).SOURCE.isReached(this.refinedNumberOfSourceColors() - 1)
    )
      return false
    if (
      $palette.get().preset.id.includes('CUSTOM') &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).PRESETS_CUSTOM_ADD.isReached(Object.keys(this.props.scale).length - 1)
    )
      return false
    if (
      $palette.get().areSourceColorsLocked &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      ).PREVIEW_LOCK_SOURCE_COLORS.isBlocked()
    )
      return false
    if (
      $palette.get().shift.chroma !== 100 &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      ).SCALE_CHROMA.isBlocked()
    )
      return false
    if (
      $palette.get().visionSimulationMode !== 'NONE' &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      )[
        `SETTINGS_VISION_SIMULATION_MODE_${$palette.get().visionSimulationMode}`
      ].isBlocked()
    )
      return false
    return true
  }

  proWarning = (): string => {
    const warningMessage = []

    if (
      Actions.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).SOURCE.isReached(this.refinedNumberOfSourceColors() - 1)
    )
      warningMessage.push(
        this.props.t('info.multipleBlockingMessages.sourceColors')
      )
    if (
      $palette.get().preset.id.includes('CUSTOM') &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).PRESETS_CUSTOM_ADD.isReached(Object.keys(this.props.scale).length - 1)
    )
      warningMessage.push(this.props.t('info.multipleBlockingMessages.stops'))
    if (
      $palette.get().areSourceColorsLocked &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      ).PREVIEW_LOCK_SOURCE_COLORS.isBlocked()
    )
      warningMessage.push(
        this.props.t('info.multipleBlockingMessages.lockedSourceColors')
      )
    if (
      $palette.get().shift.chroma !== 100 &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      ).SCALE_CHROMA.isBlocked()
    )
      warningMessage.push(this.props.t('info.multipleBlockingMessages.chroma'))
    if (
      $palette.get().visionSimulationMode !== 'NONE' &&
      Actions.features(
        this.props.planStatus,
        this.props.config,
        'EDIT',
        this.props.editor
      )[
        `SETTINGS_VISION_SIMULATION_MODE_${$palette.get().visionSimulationMode}`
      ].isBlocked()
    )
      warningMessage.push(
        this.props.t('info.multipleBlockingMessages.visionSimulationMode')
      )

    return warningMessage.join(', ')
  }

  refinedNumberOfSourceColors = (): number => {
    if (this.props.sourceColors.length > 1)
      return this.props.sourceColors.filter(
        (color) => color.source !== 'DEFAULT'
      ).length
    return this.props.sourceColors.length
  }

  // Templates
  Create = () => {
    const limit =
      Actions.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).SOURCE.limit ?? 0

    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--medium']}>
            <div
              style={{
                flex: '0 1 200px',
              }}
            >
              <Input
                id="update-palette-name"
                type="TEXT"
                placeholder={this.props.t('name')}
                value={this.props.name !== '' ? this.props.name : ''}
                charactersLimit={64}
                helper={{
                  label: this.props.t('settings.actions.paletteName'),
                  pin: 'TOP',
                }}
                isBlocked={Actions.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_NAME.isBlocked()}
                isNew={Actions.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_NAME.isNew()}
                feature="RENAME_PALETTE"
                onBlur={this.nameHandler}
                onValid={this.nameHandler}
              />
            </div>
            <span
              className={doClassnames([
                texts['type'],
                texts['type--secondary'],
              ])}
            >
              {this.props.t('separator')}
            </span>
            <div className={texts.type}>
              {this.refinedNumberOfSourceColors() > 1
                ? this.props.t('actions.sourceColorsNumber.several', {
                    count: this.refinedNumberOfSourceColors().toString(),
                  })
                : this.props.t('actions.sourceColorsNumber.single', {
                    count: this.refinedNumberOfSourceColors().toString(),
                  })}
            </div>
            {Actions.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).SOURCE.isReached(this.refinedNumberOfSourceColors() - 1) && (
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
                  <Tooltip pin="TOP">
                    {this.props.t('info.maxNumberOfSourceColors', {
                      count: limit.toString(),
                    })}
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
              this.props.config,
              this.props.service,
              this.props.editor
            ).CREATE_PALETTE.isActive()}
          >
            <Button
              type="primary"
              label={this.props.t('actions.savePalette')}
              feature="CREATE_PALETTE"
              warning={
                !this.canSavePalette()
                  ? {
                      label: this.props.t(
                        'info.multipleBlockingMessages.head',
                        {
                          messages: this.proWarning(),
                        }
                      ),
                      pin: 'TOP',
                      type: 'MULTI_LINE',
                    }
                  : undefined
              }
              isDisabled={this.props.sourceColors.length === 0}
              isLoading={this.props.isPrimaryLoading}
              action={(
                e:
                  | React.MouseEvent<HTMLButtonElement>
                  | React.KeyboardEvent<HTMLButtonElement>
              ) => {
                if (this.canSavePalette())
                  if ('key' in e)
                    this.props.onCreatePalette?.(
                      e as React.KeyboardEvent<HTMLButtonElement>
                    )
                  else
                    this.props.onCreatePalette?.(
                      e as React.MouseEvent<HTMLButtonElement>
                    )
                else
                  sendPluginMessage(
                    { pluginMessage: { type: 'GET_PRO_PLAN' } },
                    '*'
                  )
              }}
              onUnblock={() => {
                sendPluginMessage(
                  { pluginMessage: { type: 'GET_PRO_PLAN' } },
                  '*'
                )
              }}
            />
          </Feature>
        }
        padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
        shouldReflow
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
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).PUBLICATION.isActive() &&
                this.props.publicationStatus?.isPublished
              }
            >
              <Chip isSolo>{this.props.t('publication.statusPublished')}</Chip>
            </Feature>
            <div
              style={{
                flex: '0 1 200px',
              }}
            >
              <Input
                id="update-palette-name"
                type="TEXT"
                placeholder={this.props.t('name')}
                value={this.props.name !== '' ? this.props.name : ''}
                charactersLimit={64}
                helper={{
                  label: this.props.t('settings.actions.paletteName'),
                  pin: 'TOP',
                }}
                isBlocked={Actions.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_NAME.isBlocked()}
                isNew={Actions.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_NAME.isNew()}
                feature="RENAME_PALETTE"
                onBlur={this.nameHandler}
                onValid={this.nameHandler}
              />
            </div>

            {this.props.document?.id === this.props.id && (
              <Dropdown
                id="views"
                options={[
                  {
                    label: this.props.t('settings.global.views.simple'),
                    value: 'PALETTE',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_PALETTE.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_PALETTE.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_PALETTE.isNew(),
                    action: this.props.onChangeView,
                  },
                  {
                    label: this.props.t('settings.global.views.detailed'),
                    value: 'PALETTE_WITH_PROPERTIES',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_PALETTE_WITH_PROPERTIES.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_PALETTE_WITH_PROPERTIES.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_PALETTE_WITH_PROPERTIES.isNew(),
                    action: this.props.onChangeView,
                  },
                  {
                    label: this.props.t('settings.global.views.sheet'),
                    value: 'SHEET',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_SHEET.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_SHEET.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).VIEWS_SHEET.isNew(),
                    action: this.props.onChangeView,
                  },
                ]}
                selected={this.props.document.view}
                pin="BOTTOM"
                helper={{
                  label: this.props.t('settings.global.views.helper'),
                  pin: 'TOP',
                }}
                isBlocked={Actions.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).VIEWS.isBlocked()}
                isNew={Actions.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).VIEWS.isNew()}
              />
            )}
          </div>
        }
        rightPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Feature
              isActive={Actions.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).PUBLICATION.isActive()}
            >
              <Button
                type="icon"
                icon={this.publicationIcon()}
                helper={{
                  label: this.publicationLabel(),
                  pin: 'TOP',
                }}
                action={(
                  e: React.MouseEvent<Element> | React.KeyboardEvent<Element>
                ) => this.props.onPublishPalette?.(e)}
              />
            </Feature>
            <Feature
              isActive={Actions.features(
                this.props.planStatus,
                this.props.config,
                this.props.service,
                this.props.editor
              ).DOCUMENT.isActive()}
            >
              <Menu
                id="generate-documentation"
                type="ICON"
                icon="draft"
                options={this.documentOptionsHandler()}
                helper={{
                  label: this.props.t('actions.generateDocument.label'),
                  pin: 'TOP',
                  isSingleLine: true,
                }}
                alignment="TOP_RIGHT"
                state={this.props.isSecondaryLoading ? 'LOADING' : 'DEFAULT'}
                isNew={this.state.canUpdateDocument}
              />
            </Feature>
            <Menu
              id="main-actions"
              type="PRIMARY"
              label={this.props.t('actions.sync')}
              options={[
                {
                  label: this.props.t('actions.syncLocalStyles'),
                  value: 'LOCAL_STYLES',
                  feature: 'SYNC_LOCAL_STYLES',
                  type: 'OPTION',
                  isActive: Actions.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SYNC_LOCAL_STYLES.isActive(),
                  isBlocked: Actions.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SYNC_LOCAL_STYLES.isBlocked(),
                  isNew: Actions.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SYNC_LOCAL_STYLES.isNew(),
                  action: (e) => this.props.onSyncLocalStyles?.(e),
                },
                {
                  label: this.props.t('actions.syncLocalVariables'),
                  value: 'LOCAL_VARIABLES',
                  feature: 'SYNC_LOCAL_VARIABLES',
                  type: 'OPTION',
                  isActive: Actions.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SYNC_LOCAL_VARIABLES.isActive(),
                  isBlocked: Actions.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SYNC_LOCAL_VARIABLES.isBlocked(),
                  isNew: Actions.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SYNC_LOCAL_VARIABLES.isNew(),
                  action: (e) => this.props.onSyncLocalVariables?.(e),
                },
              ]}
              alignment="TOP_RIGHT"
              state={this.props.isPrimaryLoading ? 'LOADING' : 'DEFAULT'}
            />
          </div>
        }
        padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
        shouldReflow
        border={['TOP']}
      />
    )
  }

  Export = () => {
    return (
      <Feature
        isActive={Actions.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).DOWNLOAD_EXPORT.isActive()}
      >
        <Bar
          rightPartSlot={
            <Button
              type="primary"
              label={this.props.t('actions.export', {
                format: this.props.format || 'JSON',
              })}
              feature="EXPORT_PALETTE"
              action={this.props.onExportPalette}
            >
              <a></a>
            </Button>
          }
          padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
          border={['TOP']}
        />
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.service === 'CREATE' && <this.Create />}
        {this.props.service === 'EDIT' && <this.Deploy />}
        {this.props.service === 'SEE' && <this.Export />}
      </>
    )
  }
}
