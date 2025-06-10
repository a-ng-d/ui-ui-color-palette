import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
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
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { trackImportEvent } from '../../utils/eventsTracker'
import { BaseProps, ImportUrl, PlanStatus, ModalContext } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface OverviewProps extends BaseProps, WithConfigProps {
  sourceColors: Array<SourceColorConfiguration>
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onChangeContexts: () => void
  onGetProPlan: (context: { modalContext: ModalContext }) => void
}

interface OverviewStates {
  coolorsUrl: ImportUrl
  realtimeColorsUrl: ImportUrl
  isCoolorsImportOpen: boolean
  isRealtimeColorsImportOpen: boolean
  isColourLoversImportOpen: boolean
}

export default class Overview extends PureComponent<
  OverviewProps,
  OverviewStates
> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    SOURCE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE',
      planStatus: planStatus,
    }),
    SOURCE_CANVAS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_CANVAS',
      planStatus: planStatus,
    }),
    SOURCE_COOLORS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_COOLORS',
      planStatus: planStatus,
    }),
    SOURCE_REALTIME_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_REALTIME_COLORS',
      planStatus: planStatus,
    }),
    SOURCE_COLOUR_LOVERS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_COLOUR_LOVERS',
      planStatus: planStatus,
    }),
    SOURCE_EXPLORE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_EXPLORE',
      planStatus: planStatus,
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
              message: this.props.locals.source.coolors.url.infoMessage,
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
              message: this.props.locals.source.realtimeColors.url.infoMessage,
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
        this.props.userIdentity.id,
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
            message: this.props.locals.source.coolors.url.errorMessage,
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
        this.props.userIdentity.id,
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
            message: this.props.locals.source.realtimeColors.url.errorMessage,
          },
        },
      })
  }

  // Templates
  SelectedColors = () => {
    return (
      <>
        <SimpleItem
          id="watch-swatchs"
          leftPartSlot={
            <SectionTitle
              label={this.props.locals.source.canvas.title}
              indicator={
                this.props.sourceColors.filter(
                  (sourceColor) => sourceColor.source === 'CANVAS'
                ).length
              }
            />
          }
          alignment="CENTER"
        />
        {Overview.features(
          this.props.planStatus,
          this.props.config
        ).SOURCE.isReached(this.props.sourceColors.length - 1) && (
          <div
            style={{
              padding: 'var(--size-xxxsmall) var(--size-xsmall)',
            }}
          >
            <SemanticMessage
              type="INFO"
              message={this.props.locals.info.maxNumberOfSourceColors.replace(
                '{$1}',
                Overview.features(this.props.planStatus, this.props.config)
                  .SOURCE.limit
              )}
              actionsSlot={
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
              this.props.locals.source.canvas.tip
                .replace(
                  '{$1}',
                  this.props.locals.source.nodes[this.props.config.env.platform]
                )
                .replace(
                  '{$2}',
                  this.props.locals.platform[this.props.config.env.platform]
                ),
            ]}
          />
        )}
      </>
    )
  }

  CoolorsColors = () => {
    return (
      <>
        <Accordion
          label={this.props.locals.source.coolors.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'COOLORS')
            .length.toString()}
          helper={this.props.locals.source.coolors.helper}
          helpers={{
            add: this.props.locals.source.coolors.add,
            empty: this.props.locals.source.coolors.empty,
          }}
          isExpanded={this.state.isCoolorsImportOpen}
          isBlocked={Overview.features(
            this.props.planStatus,
            this.props.config
          ).SOURCE_COOLORS.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus,
            this.props.config
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
          <div style={{ padding: '0 var(--size-xsmall)' }}>
            <FormItem
              id="update-coolors-url"
              helper={this.state.coolorsUrl.helper}
            >
              <Input
                id="update-coolors-url"
                type="TEXT"
                state={this.state.coolorsUrl.state}
                placeholder={this.props.locals.source.coolors.url.placeholder}
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
      </>
    )
  }

  RealtimeColorsColors = () => {
    return (
      <>
        <Accordion
          label={this.props.locals.source.realtimeColors.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'REALTIME_COLORS')
            .length.toString()}
          helper={this.props.locals.source.realtimeColors.helper}
          helpers={{
            add: this.props.locals.source.realtimeColors.add,
            empty: this.props.locals.source.realtimeColors.empty,
          }}
          isExpanded={this.state.isRealtimeColorsImportOpen}
          isBlocked={Overview.features(
            this.props.planStatus,
            this.props.config
          ).SOURCE_REALTIME_COLORS.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus,
            this.props.config
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
          <div style={{ padding: '0 var(--size-xsmall)' }}>
            <FormItem
              id="update-realtime-colors-url"
              helper={this.state.realtimeColorsUrl.helper}
            >
              <Input
                id="update-realtime-colors-url"
                type="TEXT"
                state={this.state.realtimeColorsUrl.state}
                placeholder={
                  this.props.locals.source.realtimeColors.url.placeholder
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
      </>
    )
  }

  ColourLoversColors = () => {
    return (
      <>
        <Accordion
          label={this.props.locals.source.colourLovers.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'COLOUR_LOVERS')
            .length.toString()}
          icon="adjust"
          helper={this.props.locals.source.colourLovers.helper}
          helpers={{
            add: this.props.locals.source.colourLovers.add,
            empty: this.props.locals.source.colourLovers.empty,
          }}
          isExpanded={this.state.isColourLoversImportOpen}
          isBlocked={Overview.features(
            this.props.planStatus,
            this.props.config
          ).SOURCE_EXPLORE.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus,
            this.props.config
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
      </>
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="overview"
        column={[
          {
            node: (
              <Feature
                isActive={Overview.features(
                  this.props.planStatus,
                  this.props.config
                ).SOURCE_CANVAS.isActive()}
              >
                <this.SelectedColors />
              </Feature>
            ),
            typeModifier: 'LIST',
          },
          {
            node: (
              <>
                <Feature
                  isActive={Overview.features(
                    this.props.planStatus,
                    this.props.config
                  ).SOURCE_COOLORS.isActive()}
                >
                  <this.CoolorsColors />
                </Feature>
                <Feature
                  isActive={Overview.features(
                    this.props.planStatus,
                    this.props.config
                  ).SOURCE_REALTIME_COLORS.isActive()}
                >
                  <this.RealtimeColorsColors />
                </Feature>
                <Feature
                  isActive={Overview.features(
                    this.props.planStatus,
                    this.props.config
                  ).SOURCE_COLOUR_LOVERS.isActive()}
                >
                  <this.ColourLoversColors />
                </Feature>
              </>
            ),
            typeModifier: 'DRAWER',
            drawerOptions: {
              direction: 'HORIZONTAL',
              pin: 'RIGHT',
              defaultSize: {
                value: 276,
                unit: 'PIXEL',
              },
              maxSize: {
                value: 400,
                unit: 'PIXEL',
              },
              minSize: {
                value: 276,
                unit: 'PIXEL',
              },
            },
          },
        ]}
        isFullHeight
      />
    )
  }
}
