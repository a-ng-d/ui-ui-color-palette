import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import {
  Bar,
  Button,
  Chip,
  Dropdown,
  DropdownOption,
  IconList,
  Input,
  layouts,
  Menu,
  SegmentedControl,
  texts,
} from '@unoff/ui'
import {
  CreatorConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  PublicationConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { OpenPaletteState } from '../subservices/OpenPalette'
import { ManagePaletteState } from '../services/ManagePalette'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, Mode, PlanStatus, Service } from '../../types/app'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'

interface ActionsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  mode: Mode
  id: string
  name: string
  dates: DatesConfiguration
  creatorIdentity?: CreatorConfiguration
  format?: string
  document?: DocumentConfiguration
  publicationStatus?: PublicationConfiguration
  isPrimaryLoading?: boolean
  isSecondaryLoading?: boolean
  onChangeMode: React.Dispatch<Partial<OpenPaletteState>>
  onSyncLocalStyles?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => void
  onSyncLocalVariables?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
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
  onChangeSettings?: React.Dispatch<Partial<ManagePaletteState>>
  onUnloadPalette?: () => void
}

interface ActionsState {
  isTooltipVisible: boolean
  canUpdateDocument: boolean
}

export default class Actions extends PureComponent<ActionsProps, ActionsState> {
  private palette: typeof $palette

  static defaultProps = {
    scale: {},
    document: {},
  }

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    EDIT: new FeatureStatus({
      features: config.features,
      featureName: 'EDIT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    INSPECT: new FeatureStatus({
      features: config.features,
      featureName: 'INSPECT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT',
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
    DOCUMENT_SHEET: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_SHEET',
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

  private get features() {
    return Actions.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  private get specificFeatures() {
    return Actions.features(
      this.props.planStatus,
      this.props.config,
      'MANAGE',
      this.props.editor
    )
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
        isActive: this.features.DOCUMENT_PALETTE.isActive(),
        isBlocked: this.features.DOCUMENT_PALETTE.isReached(
          (this.props.creditsCount - this.props.config.fees.paletteGenerate) *
            -1 -
            1
        ),
        isNew: this.features.DOCUMENT_PALETTE.isNew(),
        action: this.props.onGenerateDocument,
      },
      {
        label: this.props.t('actions.generateDocument.paletteWithProperties'),
        feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
        type: 'OPTION',
        isActive: this.features.DOCUMENT_PALETTE_PROPERTIES.isActive(),
        isBlocked: this.features.DOCUMENT_PALETTE_PROPERTIES.isReached(
          (this.props.creditsCount -
            this.props.config.fees.paletteWithPropsGenerate) *
            -1 -
            1
        ),
        isNew: this.features.DOCUMENT_PALETTE_PROPERTIES.isNew(),
        action: this.props.onGenerateDocument,
      },
      {
        label: this.props.t('actions.generateDocument.sheet'),
        feature: 'GENERATE_SHEET',
        type: 'OPTION',
        isActive: this.features.DOCUMENT_SHEET.isActive(),
        isBlocked: this.features.DOCUMENT_SHEET.isReached(
          (this.props.creditsCount - this.props.config.fees.sheetGenerate) *
            -1 -
            1
        ),
        isNew: this.features.DOCUMENT_SHEET.isNew(),
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
          isActive: this.features.DOCUMENT_PUSH_UPDATES.isActive(),
          isBlocked: this.features.DOCUMENT_PUSH_UPDATES.isReached(
            (this.props.creditsCount - this.props.config.fees.paletteUpdates) *
              -1 -
              1
          ),
          isNew: true,
          action: this.props.onGenerateDocument,
        }
      )

    return options
  }

  viewOptionsHandler = () => {
    return [
      {
        label: this.props.t('settings.global.views.simple'),
        value: 'PALETTE',
        type: 'OPTION' as const,
        isActive: this.features.VIEWS_PALETTE.isActive(),
        isBlocked: this.features.VIEWS_PALETTE.isReached(
          (this.props.creditsCount - this.props.config.fees.paletteGenerate) *
            -1 -
            1
        ),
        isNew: this.features.VIEWS_PALETTE.isNew(),
        action: this.props.onChangeView,
      },
      {
        label: this.props.t('settings.global.views.detailed'),
        value: 'PALETTE_WITH_PROPERTIES',
        type: 'OPTION' as const,
        isActive: this.features.VIEWS_PALETTE_WITH_PROPERTIES.isActive(),
        isBlocked: this.features.VIEWS_PALETTE_WITH_PROPERTIES.isReached(
          (this.props.creditsCount -
            this.props.config.fees.paletteWithPropsGenerate) *
            -1 -
            1
        ),
        isNew: this.features.VIEWS_PALETTE_WITH_PROPERTIES.isNew(),
        action: this.props.onChangeView,
      },
      {
        label: this.props.t('settings.global.views.sheet'),
        value: 'SHEET',
        type: 'OPTION' as const,
        isActive: this.features.VIEWS_SHEET.isActive(),
        isBlocked: this.features.VIEWS_SHEET.isReached(
          (this.props.creditsCount - this.props.config.fees.sheetGenerate) *
            -1 -
            1
        ),
        isNew: this.features.VIEWS_SHEET.isNew(),
        action: this.props.onChangeView,
      },
    ]
  }

  // Templates
  Modes = () => {
    return (
      <SegmentedControl
        items={[
          ...(this.features.EDIT.isActive()
            ? [
                {
                  id: 'EDIT',
                  icon: {
                    type: 'PICTO' as const,
                    name: 'adjust' as IconList,
                  },
                  helper: {
                    label: this.props.t('modes.edit'),
                    pin: 'BOTTOM' as const,
                  },
                },
              ]
            : []),
          ...(this.features.INSPECT.isActive()
            ? [
                {
                  id: 'INSPECT',
                  icon: {
                    type: 'PICTO' as const,
                    name: 'visible' as IconList,
                  },
                  helper: {
                    label: this.props.t('modes.inspect'),
                    pin: 'BOTTOM' as const,
                  },
                },
              ]
            : []),
          ...(this.features.EXPORT.isActive()
            ? [
                {
                  id: 'EXPORT',
                  icon: {
                    type: 'PICTO' as const,
                    name: 'code' as IconList,
                  },
                  helper: {
                    label: this.props.t('modes.export'),
                    pin: 'BOTTOM' as const,
                  },
                },
              ]
            : []),
        ]}
        active={this.props.mode}
        action={(
          e: React.MouseEvent<HTMLButtonElement> &
            React.KeyboardEvent<HTMLButtonElement>
        ) => {
          const feature = e.currentTarget.dataset.feature as Mode
          this.props.onChangeMode({ mode: feature ?? 'EDIT' })
        }}
      />
    )
  }

  Deploy = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Button
              type="icon"
              icon="back"
              helper={{
                label: this.props.t('contexts.back'),
              }}
              action={this.props.onUnloadPalette}
            />
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
                }}
                isBlocked={this.features.SETTINGS_NAME.isBlocked()}
                isNew={this.features.SETTINGS_NAME.isNew()}
                feature="RENAME_PALETTE"
                onBlur={this.nameHandler}
                onValid={this.nameHandler}
              />
            </div>
            <Feature
              isActive={
                this.features.PUBLICATION.isActive() &&
                this.props.publicationStatus?.isPublished
              }
            >
              <Chip isSolo>{this.props.t('publication.statusPublished')}</Chip>
            </Feature>
          </div>
        }
        rightPartSlot={
          <div
            className={doClassnames([
              layouts['snackbar--medium'],
              layouts['snackbar--right'],
              layouts['snackbar--wrap'],
            ])}
          >
            {this.props.documentWidth > 460 ? (
              <>
                {this.props.document?.id === this.props.id && (
                  <Dropdown
                    id="views"
                    options={this.viewOptionsHandler()}
                    selected={this.props.document.view}
                    pin="BOTTOM"
                    helper={{
                      label: this.props.t('settings.global.views.helper'),
                    }}
                    isBlocked={this.features.VIEWS.isBlocked()}
                    isNew={this.features.VIEWS.isNew()}
                  />
                )}
                <Feature isActive={this.features.DOCUMENT.isActive()}>
                  <Menu
                    id="generate-documentation"
                    type="ICON"
                    icon="draft"
                    options={this.documentOptionsHandler()}
                    helper={{
                      label: this.props.t('actions.generateDocument.label'),
                      isSingleLine: true,
                    }}
                    alignment="BOTTOM_RIGHT"
                    state={
                      this.props.isSecondaryLoading ? 'LOADING' : 'DEFAULT'
                    }
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
                      isActive: this.features.SYNC_LOCAL_STYLES.isActive(),
                      isBlocked: this.features.SYNC_LOCAL_STYLES.isReached(
                        (this.props.creditsCount -
                          this.props.config.fees.localStylesSync) *
                          -1 -
                          1
                      ),
                      isNew: this.features.SYNC_LOCAL_STYLES.isNew(),
                      action: (e) => this.props.onSyncLocalStyles?.(e),
                    },
                    {
                      label: this.props.t('actions.syncLocalVariables'),
                      value: 'LOCAL_VARIABLES',
                      feature: 'SYNC_LOCAL_VARIABLES',
                      type: 'OPTION',
                      isActive: this.features.SYNC_LOCAL_VARIABLES.isActive(),
                      isBlocked: this.features.SYNC_LOCAL_VARIABLES.isReached(
                        (this.props.creditsCount -
                          this.props.config.fees.localVariablesSync) *
                          -1 -
                          1
                      ),
                      isNew: this.features.SYNC_LOCAL_VARIABLES.isNew(),
                      action: (e) => this.props.onSyncLocalVariables?.(e),
                    },
                  ]}
                  alignment="BOTTOM_RIGHT"
                  state={this.props.isPrimaryLoading ? 'LOADING' : 'DEFAULT'}
                />
              </>
            ) : (
              <Menu
                id="main-actions"
                type="ICON"
                icon="play"
                label={this.props.t('actions.sync')}
                options={[
                  {
                    label: this.props.t('actions.syncLocalStyles'),
                    value: 'LOCAL_STYLES',
                    feature: 'SYNC_LOCAL_STYLES',
                    type: 'OPTION',
                    isActive: this.features.SYNC_LOCAL_STYLES.isActive(),
                    isBlocked: this.features.SYNC_LOCAL_STYLES.isReached(
                      (this.props.creditsCount -
                        this.props.config.fees.localStylesSync) *
                        -1 -
                        1
                    ),
                    isNew: this.features.SYNC_LOCAL_STYLES.isNew(),
                    action: (e) => this.props.onSyncLocalStyles?.(e),
                  },
                  {
                    label: this.props.t('actions.syncLocalVariables'),
                    value: 'LOCAL_VARIABLES',
                    feature: 'SYNC_LOCAL_VARIABLES',
                    type: 'OPTION',
                    isActive: this.features.SYNC_LOCAL_VARIABLES.isActive(),
                    isBlocked: this.features.SYNC_LOCAL_VARIABLES.isReached(
                      (this.props.creditsCount -
                        this.props.config.fees.localVariablesSync) *
                        -1 -
                        1
                    ),
                    isNew: this.features.SYNC_LOCAL_VARIABLES.isNew(),
                    action: (e) => this.props.onSyncLocalVariables?.(e),
                  },
                  {
                    type: 'SEPARATOR',
                  },
                  ...this.documentOptionsHandler(),
                  ...(this.props.document?.id === this.props.id
                    ? [
                        {
                          type: 'SEPARATOR' as const,
                        },
                        ...this.viewOptionsHandler(),
                      ]
                    : []),
                ]}
                alignment="BOTTOM_RIGHT"
                state={this.props.isPrimaryLoading ? 'LOADING' : 'DEFAULT'}
              />
            )}
            <this.Modes />
          </div>
        }
        border={['BOTTOM']}
      />
    )
  }

  Inspect = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--tight']}>
            <Button
              type="icon"
              icon="back"
              helper={{
                label: this.props.t('contexts.back'),
              }}
              action={this.props.onUnloadPalette}
            />
            <span
              className={doClassnames([texts.type, texts['type--truncated']])}
            >
              {this.props.name !== '' ? this.props.name : this.props.t('name')}
            </span>
            <Feature
              isActive={
                this.features.PUBLICATION.isActive() &&
                this.props.publicationStatus?.isPublished
              }
            >
              <Chip isSolo>{this.props.t('publication.statusPublished')}</Chip>
            </Feature>
          </div>
        }
        rightPartSlot={
          <div
            className={doClassnames([
              layouts['snackbar--medium'],
              layouts['snackbar--right'],
              layouts['snackbar--wrap'],
            ])}
          >
            <this.Modes />
          </div>
        }
        border={['BOTTOM']}
      />
    )
  }

  Export = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--tight']}>
            <Button
              type="icon"
              icon="back"
              helper={{
                label: this.props.t('contexts.back'),
              }}
              action={this.props.onUnloadPalette}
            />
            <span
              className={doClassnames([texts.type, texts['type--truncated']])}
            >
              {this.props.name !== '' ? this.props.name : this.props.t('name')}
            </span>
            <Feature
              isActive={
                this.features.PUBLICATION.isActive() &&
                this.props.publicationStatus?.isPublished
              }
            >
              <Chip isSolo>{this.props.t('publication.statusPublished')}</Chip>
            </Feature>
          </div>
        }
        rightPartSlot={
          <div
            className={doClassnames([
              layouts['snackbar--medium'],
              layouts['snackbar--right'],
              layouts['snackbar--wrap'],
            ])}
          >
            <Feature isActive={this.features.DOWNLOAD_EXPORT.isActive()}>
              <Button
                type="primary"
                label={this.props.t('actions.export', {
                  format: this.props.format || 'JSON',
                })}
                feature="EXPORT_PALETTE"
                shouldReflow={{
                  isEnabled: true,
                  icon: 'draft',
                }}
                action={this.props.onExportPalette}
              >
                <a></a>
              </Button>
            </Feature>
            <this.Modes />
          </div>
        }
        border={['BOTTOM']}
      />
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.mode === 'EDIT' && <this.Deploy />}
        {this.props.mode === 'INSPECT' && <this.Inspect />}
        {this.props.mode === 'EXPORT' && <this.Export />}
      </>
    )
  }
}
