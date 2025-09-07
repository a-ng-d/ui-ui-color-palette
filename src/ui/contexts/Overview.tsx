import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  RgbModel,
  SourceColorConfiguration,
  ThirdParty,
} from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Accordion,
  Button,
  ColorItem,
  FormItem,
  Input,
  Layout,
  List,
  Message,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import {
  BaseProps,
  Editor,
  ImportUrl,
  PlanStatus,
  Service,
} from '../../types/app'
import { trackImportEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface OverviewProps extends BaseProps, WithConfigProps {
  sourceColors: Array<SourceColorConfiguration>
  onChangeDefaultColor: (defaultColor: RgbModel) => void
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onChangeContexts: () => void
}

interface OverviewStates {
  coolorsUrl: ImportUrl
  realtimeColorsUrl: ImportUrl
  isCoolorsImportOpen: boolean
  isRealtimeColorsImportOpen: boolean
  isColourLoversImportOpen: boolean
}

export default class Overview extends PureComponent<OverviewProps, OverviewStates> {
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
    SOURCE_CANVAS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_CANVAS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_DEFAULT: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_DEFAULT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_COOLORS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_COOLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_REALTIME_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_REALTIME_COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_COLOUR_LOVERS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_COLOUR_LOVERS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_EXPLORE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_EXPLORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })
  constructor(props: OverviewProps) {
    super(props)
    this.state = {
      coolorsUrl: {
        value: '' as string,
        state: 'DEFAULT' as 'DEFAULT' | 'ERROR',
        canBeSubmitted: false,
        helper: undefined,
      },
      isCoolorsImportOpen:
        this.props.sourceColors.filter((color) => color.source === 'COOLORS')
          .length > 0,
      realtimeColorsUrl: {
        value: '' as string,
        state: 'DEFAULT' as 'DEFAULT' | 'ERROR',
        canBeSubmitted: false,
        helper: undefined,
      },
      isRealtimeColorsImportOpen:
        this.props.sourceColors.filter(
          (color) => color.source === 'REALTIME_COLORS'
        ).length > 0,
      isColourLoversImportOpen:
        this.props.sourceColors.filter(
          (color) => color.source === 'COLOUR_LOVERS'
        ).length > 0,
    }
  }

  // Lifecycle
  componentDidUpdate = (previousProps: Readonly<OverviewProps>) => {
    if (previousProps.sourceColors !== this.props.sourceColors)
      this.setState({
        isCoolorsImportOpen:
          this.props.sourceColors.filter((color) => color.source === 'COOLORS')
            .length > 0,
        isRealtimeColorsImportOpen:
          this.props.sourceColors.filter(
            (color) => color.source === 'REALTIME_COLORS'
          ).length > 0,
        isColourLoversImportOpen:
          this.props.sourceColors.filter(
            (color) => color.source === 'COLOUR_LOVERS'
          ).length > 0,
      })
  }

  componentWillUnmount = () => {
    this.setState({
      coolorsUrl: {
        value: '',
        state: 'DEFAULT',
        canBeSubmitted: false,
        helper: undefined,
      },
      realtimeColorsUrl: {
        value: '',
        state: 'DEFAULT',
        canBeSubmitted: false,
        helper: undefined,
      },
    })
  }

  // Handlers
  isTypingCoolorsUrlHandler = (e: Event) =>
    this.setState((state) => ({
      coolorsUrl: {
        value: (e.target as HTMLInputElement).value,
        state: !(e.target as HTMLInputElement).value.includes(
          'https://coolors.co'
        )
          ? 'DEFAULT'
          : state.coolorsUrl.state,
        canBeSubmitted: (e.target as HTMLInputElement).value.includes(
          'https://coolors.co'
        )
          ? true
          : false,
        helper: !(e.target as HTMLInputElement).value.includes(
          'https://coolors.co'
        )
          ? {
              type: 'INFO',
              message: this.props.locales.source.coolors.url.infoMessage,
            }
          : state.coolorsUrl.helper,
      },
    }))

  isTypingRealtimeColorsUrlHandler = (e: Event) =>
    this.setState((state) => ({
      realtimeColorsUrl: {
        value: (e.target as HTMLInputElement).value,
        state: !(e.target as HTMLInputElement).value.includes(
          'https://www.realtimecolors.com'
        )
          ? 'DEFAULT'
          : state.realtimeColorsUrl.state,
        canBeSubmitted: (e.target as HTMLInputElement).value.includes(
          'https://www.realtimecolors.com'
        )
          ? true
          : false,
        helper: !(e.target as HTMLInputElement).value.includes(
          'https://www.realtimecolors.com'
        )
          ? {
              type: 'INFO',
              message: this.props.locales.source.realtimeColors.url.infoMessage,
            }
          : state.realtimeColorsUrl.helper,
      },
    }))

  importColorsFromCoolorsHandler = () => {
    const url: string = this.state.coolorsUrl.value,
      hexs = url.match(/([0-9a-fA-F]{6}-)+[0-9a-fA-F]{6}/)

    if (hexs !== null) {
      this.props.onChangeColorsFromImport(
        hexs[0].split('-').map((hex) => {
          const gl = chroma(hex).gl()
          return {
            name: hex,
            rgb: {
              r: gl[0],
              g: gl[1],
              b: gl[2],
            },
            hue: {
              shift: 0,
              isLocked: false,
            },
            chroma: {
              shift: 0,
              isLocked: false,
            },
            source: 'COOLORS',
            id: uid(),
            isRemovable: false,
          }
        }),
        'COOLORS'
      )
      this.setState({
        coolorsUrl: {
          value: '',
          state: 'DEFAULT',
          canBeSubmitted: false,
          helper: undefined,
        },
      })
      trackImportEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'IMPORT_COOLORS',
        }
      )
    } else
      this.setState({
        coolorsUrl: {
          value: this.state.coolorsUrl.value,
          state: 'ERROR',
          canBeSubmitted: this.state.coolorsUrl.canBeSubmitted,
          helper: {
            type: 'ERROR',
            message: this.props.locales.source.coolors.url.errorMessage,
          },
        },
      })
  }

  importColorsFromRealtimeColorsHandler = () => {
    const url: string = this.state.realtimeColorsUrl.value,
      hexs = url.match(/([0-9a-fA-F]{6}-)+[0-9a-fA-F]{6}/)

    if (hexs !== null) {
      this.props.onChangeColorsFromImport(
        hexs[0].split('-').map((hex) => {
          const gl = chroma(hex).gl()
          return {
            name: hex,
            rgb: {
              r: gl[0],
              g: gl[1],
              b: gl[2],
            },
            hue: {
              shift: 0,
              isLocked: false,
            },
            chroma: {
              shift: 100,
              isLocked: false,
            },
            source: 'REALTIME_COLORS',
            id: uid(),
            isRemovable: false,
          }
        }),
        'REALTIME_COLORS'
      )
      this.setState({
        realtimeColorsUrl: {
          value: '',
          state: 'DEFAULT',
          canBeSubmitted: false,
          helper: undefined,
        },
      })
      trackImportEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'IMPORT_REALTIME_COLORS',
        }
      )
    } else
      this.setState({
        realtimeColorsUrl: {
          value: this.state.realtimeColorsUrl.value,
          state: 'ERROR',
          canBeSubmitted: this.state.realtimeColorsUrl.canBeSubmitted,
          helper: {
            type: 'ERROR',
            message: this.props.locales.source.realtimeColors.url.errorMessage,
          },
        },
      })
  }

  // Templates
  SelectedColors = () => {
    return (
      <Feature
        isActive={Overview.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE_CANVAS.isActive()}
      >
        <SimpleItem
          id="watch-swatchs"
          leftPartSlot={
            <SectionTitle
              label={this.props.locales.source.canvas.title}
              indicator={
                this.props.sourceColors.filter(
                  (sourceColor) => sourceColor.source === 'CANVAS'
                ).length
              }
            />
          }
          alignment="CENTER"
          isListItem={false}
        />
        {Overview.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE.isReached(this.props.sourceColors.length - 1) && (
          <div
            style={{
              padding: '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
            }}
          >
            <SemanticMessage
              type="INFO"
              message={this.props.locales.info.maxNumberOfSourceColors.replace(
                '{maxCount}',
                (
                  Overview.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SOURCE.limit ?? 0
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
        {this.props.sourceColors.filter(
          (sourceColor) => sourceColor.source === 'CANVAS'
        ).length > 0 ? (
          <List isTopBorderEnabled>
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'CANVAS')
              .sort((a, b) => {
                if (a.name.localeCompare(b.name) > 0) return 1
                else if (a.name.localeCompare(b.name) < 0) return -1
                else return 0
              })
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                    canBeRemoved={sourceColor.isRemovable}
                  />
                )
              })}
          </List>
        ) : (
          <Message
            icon="info"
            messages={[
              this.props.locales.source.canvas.tip
                .replace(
                  '{element}',
                  this.props.locales.source.nodes[
                    this.props.config.env.platform
                  ]
                )
                .replace(
                  '{canvas}',
                  this.props.locales.platform[this.props.config.env.platform]
                ),
            ]}
          />
        )}
      </Feature>
    )
  }

  defaultColor = () => {
    const defaultColor = this.props.sourceColors.find(
      (color) => color.source === 'DEFAULT'
    )?.rgb

    return (
      <Feature
        isActive={Overview.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE_DEFAULT.isActive()}
      >
        <Section
          id="change-default-color"
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle
                  label={this.props.locales.source.default.title}
                  helper={this.props.locales.source.default.helper}
                />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <Input
                  id="change-default-color"
                  type="COLOR"
                  value={chroma([
                    (defaultColor?.r ?? 1) * 255,
                    (defaultColor?.g ?? 1) * 255,
                    (defaultColor?.b ?? 1) * 255,
                  ])
                    .hex()
                    .toUpperCase()}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement | null
                    if (target && chroma.valid(target.value))
                      this.props.onChangeDefaultColor({
                        r: chroma(target.value).get('rgb.r') / 255,
                        g: chroma(target.value).get('rgb.g') / 255,
                        b: chroma(target.value).get('rgb.b') / 255,
                      })
                  }}
                />
              ),
              spacingModifier: 'LARGE',
            },
          ]}
          border={['BOTTOM']}
        ></Section>
      </Feature>
    )
  }

  CoolorsColors = () => {
    return (
      <Feature
        isActive={Overview.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE_COOLORS.isActive()}
      >
        <Accordion
          label={this.props.locales.source.coolors.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'COOLORS')
            .length.toString()}
          helper={this.props.locales.source.coolors.helper}
          helpers={{
            add: this.props.locales.source.coolors.add,
            empty: this.props.locales.source.coolors.empty,
          }}
          isExpanded={this.state.isCoolorsImportOpen}
          isBlocked={Overview.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_COOLORS.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_COOLORS.isNew()}
          onAdd={() => {
            this.setState({ isCoolorsImportOpen: true })
          }}
          onEmpty={() => {
            this.props.onChangeColorsFromImport([], 'COOLORS')
            this.setState({
              isCoolorsImportOpen: false,
              coolorsUrl: {
                value: '',
                state: 'DEFAULT',
                canBeSubmitted: false,
                helper: undefined,
              },
            })
          }}
        >
          <div style={{ padding: '0 var(--size-pos-xsmall)' }}>
            <FormItem
              id="update-coolors-url"
              helper={this.state.coolorsUrl.helper}
            >
              <Input
                id="update-coolors-url"
                type="TEXT"
                state={this.state.coolorsUrl.state}
                placeholder={this.props.locales.source.coolors.url.placeholder}
                value={this.state.coolorsUrl.value}
                isAutoFocus
                onChange={this.isTypingCoolorsUrlHandler}
                onBlur={() => {
                  if (this.state.coolorsUrl.canBeSubmitted)
                    this.importColorsFromCoolorsHandler()
                }}
              />
            </FormItem>
          </div>
          <List>
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'COOLORS')
              .sort((a, b) => {
                if (a.name.localeCompare(b.name) > 0) return 1
                else if (a.name.localeCompare(b.name) < 0) return -1
                else return 0
              })
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                  />
                )
              })}
          </List>
        </Accordion>
      </Feature>
    )
  }

  RealtimeColorsColors = () => {
    return (
      <Feature
        isActive={Overview.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE_REALTIME_COLORS.isActive()}
      >
        <Accordion
          label={this.props.locales.source.realtimeColors.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'REALTIME_COLORS')
            .length.toString()}
          helper={this.props.locales.source.realtimeColors.helper}
          helpers={{
            add: this.props.locales.source.realtimeColors.add,
            empty: this.props.locales.source.realtimeColors.empty,
          }}
          isExpanded={this.state.isRealtimeColorsImportOpen}
          isBlocked={Overview.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_REALTIME_COLORS.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_REALTIME_COLORS.isNew()}
          onAdd={() => {
            this.setState({ isRealtimeColorsImportOpen: true })
          }}
          onEmpty={() => {
            this.props.onChangeColorsFromImport([], 'REALTIME_COLORS')
            this.setState({
              isRealtimeColorsImportOpen: false,
              realtimeColorsUrl: {
                value: '',
                state: 'DEFAULT',
                canBeSubmitted: false,
                helper: undefined,
              },
            })
          }}
        >
          <div style={{ padding: '0 var(--size-pos-xsmall)' }}>
            <FormItem
              id="update-realtime-colors-url"
              helper={this.state.realtimeColorsUrl.helper}
            >
              <Input
                id="update-realtime-colors-url"
                type="TEXT"
                state={this.state.realtimeColorsUrl.state}
                placeholder={
                  this.props.locales.source.realtimeColors.url.placeholder
                }
                value={this.state.realtimeColorsUrl.value}
                isAutoFocus
                onChange={this.isTypingRealtimeColorsUrlHandler}
                onBlur={() => {
                  if (this.state.realtimeColorsUrl.canBeSubmitted)
                    this.importColorsFromRealtimeColorsHandler()
                }}
              />
            </FormItem>
          </div>
          <List>
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'REALTIME_COLORS')
              .sort((a, b) => {
                if (a.name.localeCompare(b.name) > 0) return 1
                else if (a.name.localeCompare(b.name) < 0) return -1
                else return 0
              })
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                  />
                )
              })}
          </List>
        </Accordion>
      </Feature>
    )
  }

  ColourLoversColors = () => {
    return (
      <Feature
        isActive={Overview.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).SOURCE_COLOUR_LOVERS.isActive()}
      >
        <Accordion
          label={this.props.locales.source.colourLovers.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'COLOUR_LOVERS')
            .length.toString()}
          icon="adjust"
          helper={this.props.locales.source.colourLovers.helper}
          helpers={{
            add: this.props.locales.source.colourLovers.add,
            empty: this.props.locales.source.colourLovers.empty,
          }}
          isExpanded={this.state.isColourLoversImportOpen}
          isBlocked={Overview.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_EXPLORE.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus,
            this.props.config,
            this.props.service,
            this.props.editor
          ).SOURCE_EXPLORE.isNew()}
          onAdd={this.props.onChangeContexts}
          onEmpty={() => {
            this.props.onChangeColorsFromImport([], 'COLOUR_LOVERS')
            this.setState({
              isColourLoversImportOpen: false,
            })
          }}
        >
          <List>
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'COLOUR_LOVERS')
              .sort((a, b) => {
                if (a.name.localeCompare(b.name) > 0) return 1
                else if (a.name.localeCompare(b.name) < 0) return -1
                else return 0
              })
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                  />
                )
              })}
          </List>
        </Accordion>
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="overview"
        column={[
          {
            node: <this.SelectedColors />,
            typeModifier: 'LIST',
          },
          {
            node: (
              <>
                <this.CoolorsColors />
                <this.RealtimeColorsColors />
                <this.ColourLoversColors />
              </>
            ),
            typeModifier: 'DRAWER',
            drawerOptions: {
              direction: 'HORIZONTAL',
              pin: 'RIGHT',
              defaultSize: {
                value: 272,
                unit: 'PIXEL',
              },
              maxSize: {
                value: 400,
                unit: 'PIXEL',
              },
              minSize: {
                value: 272,
                unit: 'PIXEL',
              },
              isScrolling: true,
            },
          },
        ]}
        isFullHeight
      />
    )
  }
}
