import {
  PureComponent,
  ChangeEvent,
  MouseEvent,
  KeyboardEvent,
  MouseEventHandler,
  KeyboardEventHandler,
} from 'preact/compat'
import {
  CreatorConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  PublicationConfiguration,
} from '@yelbolt/engine-ui-color-palette'
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
import { OpenPaletteState } from '../subservices/OpenPalette'
import { ManagePaletteState } from '../services/ManagePalette'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import {
  getPublicationIcon,
  getPublicationLabel,
} from '../../utils/publication'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, Mode, PlanStatus, Service } from '../../types/app'
import { $palette } from '../../stores/palette'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

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
  isTertiaryLoading?: boolean
  onChangeMode: Dispatch<Partial<OpenPaletteState>>
  onSyncLocalStyles?: (
    e: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>
  ) => void
  onSyncLocalVariables?: (
    e: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>
  ) => void
  onSyncLocalTokens?: (
    e: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>
  ) => void
  onSimulatePalette?: () => void
  onGenerateDocument?: (e: MouseEvent<Element> | KeyboardEvent<Element>) => void
  onChangeView?: (
    e:
      | ChangeEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  onExportPalette?: MouseEventHandler<HTMLButtonElement> &
    KeyboardEventHandler<HTMLButtonElement>
  onUnloadPalette?: () => void
  onPublishPalette?: Dispatch<Partial<ManagePaletteState>>
}

interface ActionsState {
  isTooltipVisible: boolean
  canUpdateDocument: boolean
  isCopied: boolean
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
    SYNC_LOCAL_TOKENS: new FeatureStatus({
      features: config.features,
      featureName: 'SYNC_LOCAL_TOKENS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SIMULATE_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'SIMULATE_PALETTE',
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
    SHARE_LINK: new FeatureStatus({
      features: config.features,
      featureName: 'SHARE_LINK',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    FEEDBACK_LINK: new FeatureStatus({
      features: config.features,
      featureName: 'FEEDBACK_LINK',
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
      isCopied: false,
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
      | ChangeEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.palette.setKey('name', e.currentTarget.value)

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

  // Upgrade
  requestUpgrade = (origin: string) => {
    const isTrial =
      this.props.config.plan.isTrialEnabled &&
      this.props.trialStatus !== 'EXPIRED'

    sendPluginMessage(
      {
        pluginMessage: isTrial
          ? { type: 'GET_TRIAL' }
          : { type: 'GET_PRO', data: { origin } },
      },
      '*'
    )
  }

  // Options
  gatedOption = ({
    status,
    feature,
    label,
    value,
    fee,
    isNew,
    action,
  }: {
    status: FeatureStatus<Service>
    feature: string
    label: string
    value?: string
    fee: number
    isNew?: boolean
    action?: DropdownOption['action']
  }): DropdownOption => ({
    label,
    value,
    feature,
    type: 'OPTION',
    isActive: status.isActive(),
    isBlocked:
      status.isReached((this.props.creditsCount - fee) * -1 - 1) ||
      status.isBlocked(),
    isNew: isNew ?? status.isNew(),
    onBlock: () => this.requestUpgrade(feature),
    action,
  })

  documentOptionsHandler = (hasSeparator = true): Array<DropdownOption> => {
    const { fees } = this.props.config
    const options = [
      this.gatedOption({
        status: this.features.DOCUMENT_PALETTE,
        feature: 'GENERATE_PALETTE',
        label: this.props.t('actions.generateDocument.palette'),
        fee: fees.paletteGenerate,
        action: this.props.onGenerateDocument,
      }),
      this.gatedOption({
        status: this.features.DOCUMENT_PALETTE_PROPERTIES,
        feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
        label: this.props.t('actions.generateDocument.paletteWithProperties'),
        fee: fees.paletteWithPropsGenerate,
        action: this.props.onGenerateDocument,
      }),
      this.gatedOption({
        status: this.features.DOCUMENT_SHEET,
        feature: 'GENERATE_SHEET',
        label: this.props.t('actions.generateDocument.sheet'),
        fee: fees.sheetGenerate,
        action: this.props.onGenerateDocument,
      }),
    ]

    if (this.state.canUpdateDocument)
      options.push(
        ...(hasSeparator ? [{ type: 'SEPARATOR' as const }] : []),
        this.gatedOption({
          status: this.features.DOCUMENT_PUSH_UPDATES,
          feature: 'PUSH_UPDATES',
          label: this.props.t('actions.pushUpdates'),
          fee: fees.paletteUpdates,
          isNew: true,
          action: this.props.onGenerateDocument,
        })
      )

    return options
  }

  viewOptionsHandler = (): Array<DropdownOption> => {
    const { fees } = this.props.config

    return [
      this.gatedOption({
        status: this.features.VIEWS_PALETTE,
        feature: 'VIEWS_PALETTE',
        value: 'PALETTE',
        label: this.props.t('settings.global.views.simple'),
        fee: fees.paletteGenerate,
        action: this.props.onChangeView,
      }),
      this.gatedOption({
        status: this.features.VIEWS_PALETTE_WITH_PROPERTIES,
        feature: 'VIEWS_PALETTE_WITH_PROPERTIES',
        value: 'PALETTE_WITH_PROPERTIES',
        label: this.props.t('settings.global.views.detailed'),
        fee: fees.paletteWithPropsGenerate,
        action: this.props.onChangeView,
      }),
      this.gatedOption({
        status: this.features.VIEWS_SHEET,
        feature: 'VIEWS_SHEET',
        value: 'SHEET',
        label: this.props.t('settings.global.views.sheet'),
        fee: fees.sheetGenerate,
        action: this.props.onChangeView,
      }),
    ]
  }

  syncOptionsHandler = (): Array<DropdownOption> => {
    const { fees } = this.props.config

    return [
      this.gatedOption({
        status: this.features.SYNC_LOCAL_STYLES,
        feature: 'SYNC_LOCAL_STYLES',
        value: 'LOCAL_STYLES',
        label: this.props.t('actions.syncLocalStyles'),
        fee: fees.localStylesSync,
        action: (e) => this.props.onSyncLocalStyles?.(e),
      }),
      this.gatedOption({
        status: this.features.SYNC_LOCAL_VARIABLES,
        feature: 'SYNC_LOCAL_VARIABLES',
        value: 'LOCAL_VARIABLES',
        label: this.props.t('actions.syncLocalVariables'),
        fee: fees.localVariablesSync,
        action: (e) => this.props.onSyncLocalVariables?.(e),
      }),
      this.gatedOption({
        status: this.features.SYNC_LOCAL_TOKENS,
        feature: 'SYNC_LOCAL_TOKENS',
        value: 'LOCAL_TOKENS',
        label: this.props.t('actions.syncLocalTokens'),
        fee: fees.localTokensSync,
        action: (e) => this.props.onSyncLocalTokens?.(e),
      }),
    ]
  }

  private get deployActions() {
    const canSimulate =
      this.features.SIMULATE_PALETTE.isActive() &&
      this.props.onSimulatePalette !== undefined
    const canPublish =
      this.features.PUBLICATION.isActive() &&
      this.features.PUBLISH_PALETTE.isActive() &&
      this.props.onPublishPalette !== undefined
    const canSync =
      this.features.SYNC_LOCAL_STYLES.isActive() ||
      this.features.SYNC_LOCAL_VARIABLES.isActive() ||
      this.features.SYNC_LOCAL_TOKENS.isActive()
    const canDocument = this.features.DOCUMENT.isActive()
    const canChangeView = this.props.document?.id === this.props.id

    const primary: 'SIMULATE' | 'PUBLISH' | 'SYNC' = canSimulate
      ? 'SIMULATE'
      : canPublish
        ? 'PUBLISH'
        : 'SYNC'

    return {
      canSimulate,
      canPublish,
      canSync,
      canDocument,
      canChangeView,
      primary,
    }
  }

  private get publication() {
    const creatorIdentity = this.props.creatorIdentity as CreatorConfiguration

    return {
      label: getPublicationLabel({
        userSession: this.props.userSession,
        creatorIdentity,
        t: this.props.t,
      }),
      icon: getPublicationIcon({
        userSession: this.props.userSession,
        creatorIdentity,
      }),
      isNew:
        (this.props.publicationStatus?.isPublished ?? false) &&
        this.props.dates.publishedAt !== this.props.dates.updatedAt,
      action: () => this.props.onPublishPalette?.({ canBePublished: true }),
    }
  }

  compactOptionsHandler = (): Array<DropdownOption> => {
    const actions = this.deployActions
    const options: Array<DropdownOption> = []

    if (actions.canSimulate)
      options.push(
        this.gatedOption({
          status: this.features.SIMULATE_PALETTE,
          feature: 'SIMULATE_PALETTE',
          value: 'SIMULATE_PALETTE',
          label: this.props.t('actions.simulatePalette'),
          fee: 0,
          action: () => this.props.onSimulatePalette?.(),
        }),
        { type: 'SEPARATOR' }
      )

    if (actions.canSync)
      options.push({
        label: this.props.t('actions.sync'),
        value: 'SYNC',
        type: 'GROUP',
        children: this.syncOptionsHandler(),
      })

    if (actions.canDocument)
      options.push({
        label: this.props.t('actions.generateDocument.label'),
        value: 'GENERATE_DOCUMENT',
        type: 'GROUP',
        isNew: this.state.canUpdateDocument,
        children: this.documentOptionsHandler(false),
      })

    if (actions.canPublish)
      options.push({
        label: this.publication.label,
        value: 'PUBLICATION',
        type: 'OPTION',
        action: this.publication.action,
      })

    if (actions.canChangeView)
      options.push({
        label: this.props.t('settings.global.views.helper'),
        value: 'CHANGE_VIEW',
        type: 'GROUP',
        children: this.viewOptionsHandler(),
      })

    return options
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
          e: MouseEvent<HTMLButtonElement> & KeyboardEvent<HTMLButtonElement>
        ) => {
          const feature = e.currentTarget.dataset.feature as Mode
          this.props.onChangeMode({ mode: feature ?? 'EDIT' })
        }}
      />
    )
  }

  Deploy = () => {
    const actions = this.deployActions
    const isSyncPrimary = actions.primary === 'SYNC'

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
            {this.props.isMobile ? (
              <Menu
                id="main-actions"
                type="ICON"
                icon="ellipses"
                options={this.compactOptionsHandler()}
                alignment="BOTTOM_RIGHT"
                state={
                  this.props.isPrimaryLoading ||
                  this.props.isSecondaryLoading ||
                  this.props.isTertiaryLoading
                    ? 'LOADING'
                    : 'DEFAULT'
                }
                isNew={this.state.canUpdateDocument}
                onBlock={() => this.requestUpgrade('SYNC')}
              />
            ) : (
              <>
                <Feature
                  isActive={
                    actions.canChangeView && this.features.VIEWS.isActive()
                  }
                >
                  <Dropdown
                    id="views"
                    options={this.viewOptionsHandler()}
                    selected={this.props.document?.view}
                    pin="BOTTOM"
                    helper={{
                      label: this.props.t('settings.global.views.helper'),
                    }}
                    alignment="RIGHT"
                    isBlocked={this.features.VIEWS.isBlocked()}
                    isNew={this.features.VIEWS.isNew()}
                    onBlock={() => this.requestUpgrade('VIEWS')}
                  />
                </Feature>
                <Feature isActive={actions.canDocument}>
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
                    onBlock={() => this.requestUpgrade('DOCUMENT')}
                  />
                </Feature>
                <Feature isActive={actions.canSync}>
                  <Menu
                    id="main-actions"
                    type={isSyncPrimary ? 'PRIMARY' : 'ICON'}
                    icon={isSyncPrimary ? undefined : 'refresh'}
                    label={
                      isSyncPrimary ? this.props.t('actions.sync') : undefined
                    }
                    helper={
                      isSyncPrimary
                        ? undefined
                        : {
                            label: this.props.t('actions.sync'),
                            isSingleLine: true,
                          }
                    }
                    options={this.syncOptionsHandler()}
                    alignment="BOTTOM_RIGHT"
                    state={this.props.isPrimaryLoading ? 'LOADING' : 'DEFAULT'}
                    onBlock={() => this.requestUpgrade('SYNC')}
                  />
                </Feature>
                <Feature isActive={actions.canPublish}>
                  <div data-id="tour-publication-action">
                    <Button
                      type={
                        actions.primary === 'PUBLISH' ? 'primary' : 'secondary'
                      }
                      label={this.publication.label}
                      icon={this.publication.icon}
                      isBlocked={this.features.PUBLICATION.isBlocked()}
                      isNew={this.publication.isNew}
                      onBlock={() => this.requestUpgrade('PUBLICATION')}
                      action={this.publication.action}
                    />
                  </div>
                </Feature>
                <Feature isActive={actions.canSimulate}>
                  <Button
                    type="primary"
                    label={this.props.t('actions.simulatePalette')}
                    feature="SIMULATE_PALETTE"
                    helper={{
                      label: this.props.t('actions.simulateSelectionHelper'),
                      type: 'MULTI_LINE'
                    }}
                    isLoading={this.props.isTertiaryLoading}
                    isBlocked={this.features.SIMULATE_PALETTE.isBlocked()}
                    isNew={this.features.SIMULATE_PALETTE.isNew()}
                    onBlock={() => this.requestUpgrade('SIMULATE_PALETTE')}
                    action={() => this.props.onSimulatePalette?.()}
                  />
                </Feature>
              </>
            )}
            <this.Modes />
            <Feature isActive={this.features.SHARE_LINK.isActive()}>
              <Button
                type="icon"
                icon={this.state.isCopied ? 'check' : 'hyperlink'}
                feature="SHARE_LINK"
                helper={{
                  label: this.props.t('actions.copyPaletteLink'),
                }}
                action={() => {
                  this.setState({ isCopied: true })
                  setTimeout(() => {
                    this.setState({ isCopied: false })
                  }, 2000)

                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'COPY_SHARE_LINK',
                        id: this.props.id,
                      },
                    },
                    '*'
                  )
                }}
              />
            </Feature>
            <Feature isActive={this.features.FEEDBACK_LINK.isActive()}>
              <Button
                type="icon"
                icon="smiley"
                feature="FEEDBACK_LINK"
                helper={{
                  label: this.props.t('actions.giveFeedback'),
                }}
                action={() =>
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'OPEN_IN_BROWSER',
                        data: {
                          url: this.props.config.urls.feedbackUrl,
                        },
                      },
                    },
                    '*'
                  )
                }
              />
            </Feature>
          </div>
        }
        clip={['LEFT']}
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
            <Feature isActive={this.features.SHARE_LINK.isActive()}>
              <Button
                type="icon"
                icon={this.state.isCopied ? 'check' : 'hyperlink'}
                feature="SHARE_LINK"
                helper={{
                  label: this.props.t('actions.copyPaletteLink'),
                }}
                action={() => {
                  this.setState({ isCopied: true })
                  setTimeout(() => {
                    this.setState({ isCopied: false })
                  }, 2000)

                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'COPY_SHARE_LINK',
                        id: this.props.id,
                      },
                    },
                    '*'
                  )
                }}
              />
            </Feature>
            <Feature isActive={this.features.FEEDBACK_LINK.isActive()}>
              <Button
                type="icon"
                icon="smiley"
                feature="FEEDBACK_LINK"
                helper={{
                  label: this.props.t('actions.giveFeedback'),
                }}
                action={() =>
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'OPEN_IN_BROWSER',
                        data: {
                          url: this.props.config.urls.feedbackUrl,
                        },
                      },
                    },
                    '*'
                  )
                }
              />
            </Feature>
          </div>
        }
        clip={['LEFT']}
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
            <Feature isActive={this.features.SHARE_LINK.isActive()}>
              <Button
                type="icon"
                icon={this.state.isCopied ? 'check' : 'hyperlink'}
                feature="SHARE_LINK"
                helper={{
                  label: this.props.t('actions.copyPaletteLink'),
                }}
                action={() => {
                  this.setState({ isCopied: true })
                  setTimeout(() => {
                    this.setState({ isCopied: false })
                  }, 2000)

                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'COPY_SHARE_LINK',
                        id: this.props.id,
                      },
                    },
                    '*'
                  )
                }}
              />
            </Feature>
            <Feature isActive={this.features.FEEDBACK_LINK.isActive()}>
              <Button
                type="icon"
                icon="smiley"
                feature="FEEDBACK_LINK"
                helper={{
                  label: this.props.t('actions.giveFeedback'),
                }}
                action={() =>
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'OPEN_IN_BROWSER',
                        data: {
                          url: this.props.config.urls.feedbackUrl,
                        },
                      },
                    },
                    '*'
                  )
                }
              />
            </Feature>
          </div>
        }
        clip={['LEFT']}
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
