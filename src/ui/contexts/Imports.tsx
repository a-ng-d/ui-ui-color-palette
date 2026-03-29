import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import { FeatureStatus } from '@unoff/utils'
import {
  Accordion,
  Bar,
  Button,
  ColorItem,
  FormItem,
  Input,
  Layout,
  List,
  Message,
  SectionTitle,
  SemanticMessage,
} from '@unoff/ui'
import {
  ColorConfiguration,
  SourceColorConfiguration,
  ThirdParty,
} from '@a_ng_d/utils-ui-color-palette'
import { ManagePaletteState } from '../services/ManagePalette'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { getClosestColorName } from '../../utils/colorNameHelper'
import { ColorsMessage, PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  Editor,
  ImportUrl,
  PlanStatus,
  Service,
} from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import {
  trackImportEvent,
  trackSourceColorsManagementEvent,
} from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface ImportsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  colors: Array<ColorConfiguration>
  creditsCount: number
  onChangeColors: React.Dispatch<Partial<ManagePaletteState>>
}

interface ImportsState {
  isSelectedColorsOpen: boolean
  isCoolorsImportOpen: boolean
  isRealtimeColorsImportOpen: boolean
  coolorsUrl: ImportUrl
  realtimeColorsUrl: ImportUrl
  sourceColors: Array<SourceColorConfiguration>
}

export default class Imports extends PureComponent<ImportsProps, ImportsState> {
  private colorsMessage: ColorsMessage

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_CANVAS: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_CANVAS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_COOLORS: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_COOLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_COOLORS_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_COOLORS_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_REALTIME_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_REALTIME_COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_REALTIME_COLORS_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_REALTIME_COLORS_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Imports.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ImportsProps) {
    super(props)
    this.colorsMessage = {
      type: 'UPDATE_COLORS',
      id: this.props.id,
      data: [],
    }
    this.state = {
      isSelectedColorsOpen: false,
      isCoolorsImportOpen: false,
      isRealtimeColorsImportOpen: false,
      coolorsUrl: {
        value: '' as string,
        state: 'DEFAULT' as 'DEFAULT' | 'ERROR',
        canBeSubmitted: false,
        helper: undefined,
      },
      realtimeColorsUrl: {
        value: '' as string,
        state: 'DEFAULT' as 'DEFAULT' | 'ERROR',
        canBeSubmitted: false,
        helper: undefined,
      },
      sourceColors: [],
    }
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
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

    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    try {
      const updateWhileColorSelected = () => {
        if (this.state.isSelectedColorsOpen)
          this.setState({
            sourceColors: this.state.sourceColors.concat(path.data.selection),
          })
      }

      const actions: {
        [action: string]: () => void
      } = {
        COLOR_SELECTED: () => updateWhileColorSelected(),
        DEFAULT: () => null,
      }

      return actions[path.type ?? 'DEFAULT']?.()
    } catch (error) {
      console.error(error)
      return
    }
  }

  colorsHandler = (e: Event) => {
    const currentElement = e.currentTarget as HTMLInputElement

    const addColor = () => {
      this.colorsMessage.data = this.props.colors
      this.state.sourceColors.forEach((sourceColor) =>
        this.colorsMessage.data.push({
          name: sourceColor.name,
          description: '',
          rgb: sourceColor.rgb,
          id: sourceColor.id,
          hue: sourceColor.hue ?? { shift: 0, isLocked: false },
          chroma: sourceColor.chroma ?? { shift: 100, isLocked: false },
          alpha: {
            isEnabled: false,
            backgroundColor: '#FFFFFF',
          },
        })
      )

      this.setState({
        sourceColors: [],
        isSelectedColorsOpen: false,
        isCoolorsImportOpen: false,
        isRealtimeColorsImportOpen: false,
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
      })

      sendPluginMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'ADD_COLOR',
        }
      )
    }

    const actions: {
      [action: string]: () => void
    } = {
      ADD_COLOR: () => addColor(),
      DEFAULT: () => null,
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

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
              message: this.props.t('source.coolors.url.infoMessage'),
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
              message: this.props.t('source.realtimeColors.url.infoMessage'),
            }
          : state.realtimeColorsUrl.helper,
      },
    }))

  importColorsFromCoolorsHandler = () => {
    const url: string = this.state.coolorsUrl.value,
      hexs = url.match(/([0-9a-fA-F]{6}-)+[0-9a-fA-F]{6}/)

    if (hexs !== null) {
      this.setState({
        coolorsUrl: {
          value: '',
          state: 'DEFAULT',
          canBeSubmitted: false,
          helper: undefined,
        },
        sourceColors: this.state.sourceColors.concat(
          hexs[0].split('-').map((hex) => {
            const gl = chroma(hex).gl()
            return {
              name: getClosestColorName(hex),
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
              source: 'COOLORS' as ThirdParty,
              id: uid(),
              isRemovable: true,
            }
          })
        ),
      })

      if (this.props.config.plan.isProEnabled)
        $creditsCount.set(
          $creditsCount.get() - this.props.config.fees.coolorsImport
        )

      trackImportEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
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
            message: this.props.t('source.coolors.url.errorMessage'),
          },
        },
      })
  }

  importColorsFromRealtimeColorsHandler = () => {
    const url: string = this.state.realtimeColorsUrl.value,
      hexs = url.match(/([0-9a-fA-F]{6}-)+[0-9a-fA-F]{6}/)

    if (hexs !== null) {
      this.setState({
        realtimeColorsUrl: {
          value: '',
          state: 'DEFAULT',
          canBeSubmitted: false,
          helper: undefined,
        },
        sourceColors: this.state.sourceColors.concat(
          hexs[0].split('-').map((hex) => {
            const gl = chroma(hex).gl()
            return {
              name: getClosestColorName(hex),
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
              source: 'REALTIME_COLORS' as ThirdParty,
              id: uid(),
              isRemovable: true,
            }
          })
        ),
      })

      if (this.props.config.plan.isProEnabled)
        $creditsCount.set(
          $creditsCount.get() - this.props.config.fees.realtimeColorsImport
        )

      trackImportEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
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
            message: this.props.t('source.realtimeColors.url.errorMessage'),
          },
        },
      })
  }

  removeSourceColorHandler = (colorId: string) => {
    this.setState({
      sourceColors: this.state.sourceColors.filter(
        (sourceColor) => sourceColor.id !== colorId
      ),
    })
  }

  // Templates
  SelectedColors = () => {
    return (
      <Feature isActive={this.features.IMPORTS_CANVAS.isActive()}>
        <Accordion
          label={this.props.t('source.canvas.title')}
          indicator={this.state.sourceColors
            .filter((sourceColor) => sourceColor.source === 'CANVAS')
            .length.toString()}
          helper={this.props.t('source.canvas.helper')}
          helpers={{
            add: this.props.t('source.canvas.add'),
            empty: this.props.t('source.canvas.empty'),
          }}
          isExpanded={this.state.isSelectedColorsOpen}
          isBlocked={this.features.IMPORTS_CANVAS.isBlocked()}
          isNew={this.features.IMPORTS_CANVAS.isNew()}
          onAdd={() => {
            this.setState({ isSelectedColorsOpen: true })
          }}
          onEmpty={() => {
            this.setState({
              isSelectedColorsOpen: false,
              sourceColors: this.state.sourceColors.filter(
                (sourceColor) => sourceColor.source !== 'CANVAS'
              ),
            })
          }}
        >
          {this.state.sourceColors.filter(
            (sourceColor) => sourceColor.source === 'CANVAS'
          ).length === 0 ? (
            <Message
              icon="info"
              messages={[
                this.props.t('source.canvas.tip', {
                  element: this.props.t(
                    `source.nodes.${this.props.config.env.platform}`
                  ),
                  canvas: this.props.t(
                    `platform.${this.props.config.env.platform}`
                  ),
                }),
              ]}
            />
          ) : (
            <List>
              {this.state.sourceColors
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
                      onRemoveColor={() =>
                        this.removeSourceColorHandler(sourceColor.id)
                      }
                    />
                  )
                })}
            </List>
          )}
        </Accordion>
      </Feature>
    )
  }

  CoolorsColors = () => {
    return (
      <Feature isActive={this.features.IMPORTS_COOLORS.isActive()}>
        <Accordion
          label={this.props.t('source.coolors.title')}
          indicator={this.state.sourceColors
            .filter((sourceColor) => sourceColor.source === 'COOLORS')
            .length.toString()}
          helper={this.props.t('source.coolors.helper')}
          helpers={{
            add: this.props.t('source.coolors.add'),
            empty: this.props.t('source.coolors.empty'),
          }}
          isExpanded={this.state.isCoolorsImportOpen}
          isBlocked={this.features.IMPORTS_COOLORS.isBlocked()}
          isNew={this.features.IMPORTS_COOLORS.isNew()}
          onAdd={() => {
            this.setState({ isCoolorsImportOpen: true })
          }}
          onEmpty={() => {
            this.setState({
              isCoolorsImportOpen: false,
              coolorsUrl: {
                value: '',
                state: 'DEFAULT',
                canBeSubmitted: false,
                helper: undefined,
              },
              sourceColors: this.state.sourceColors.filter(
                (sourceColor) => sourceColor.source !== 'COOLORS'
              ),
            })
          }}
        >
          {this.state.sourceColors.filter(
            (sourceColor) => sourceColor.source === 'COOLORS'
          ).length === 0 ? (
            <div style={{ padding: '0 var(--size-pos-xsmall)' }}>
              <FormItem
                id="update-coolors-url"
                helper={this.state.coolorsUrl.helper}
              >
                <Input
                  id="update-coolors-url"
                  type="TEXT"
                  state={this.state.coolorsUrl.state}
                  placeholder={this.props.t('source.coolors.url.placeholder')}
                  value={this.state.coolorsUrl.value}
                  helper={{
                    label: this.props.t('source.coolors.addColors'),
                  }}
                  isAutoFocus
                  isBlocked={this.features.IMPORTS_COOLORS_ADD.isReached(
                    (this.props.creditsCount -
                      this.props.config.fees.coolorsImport) *
                      -1 -
                      1
                  )}
                  onChange={this.isTypingCoolorsUrlHandler}
                  onBlur={() => {
                    if (this.state.coolorsUrl.canBeSubmitted)
                      this.importColorsFromCoolorsHandler()
                  }}
                />
              </FormItem>
            </div>
          ) : (
            <List>
              {this.state.sourceColors
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
                      canBeRemoved={sourceColor.isRemovable}
                      onRemoveColor={() =>
                        this.removeSourceColorHandler(sourceColor.id)
                      }
                    />
                  )
                })}
            </List>
          )}
        </Accordion>
      </Feature>
    )
  }

  RealtimeColorsColors = () => {
    return (
      <Feature isActive={this.features.IMPORTS_REALTIME_COLORS.isActive()}>
        <Accordion
          label={this.props.t('source.realtimeColors.title')}
          indicator={this.state.sourceColors
            .filter((sourceColor) => sourceColor.source === 'REALTIME_COLORS')
            .length.toString()}
          helper={this.props.t('source.realtimeColors.helper')}
          helpers={{
            add: this.props.t('source.realtimeColors.add'),
            empty: this.props.t('source.realtimeColors.empty'),
          }}
          isExpanded={this.state.isRealtimeColorsImportOpen}
          isBlocked={this.features.IMPORTS_REALTIME_COLORS.isBlocked()}
          isNew={this.features.IMPORTS_REALTIME_COLORS.isNew()}
          onAdd={() => {
            this.setState({ isRealtimeColorsImportOpen: true })
          }}
          onEmpty={() => {
            this.setState({
              isRealtimeColorsImportOpen: false,
              realtimeColorsUrl: {
                value: '',
                state: 'DEFAULT',
                canBeSubmitted: false,
                helper: undefined,
              },
              sourceColors: this.state.sourceColors.filter(
                (sourceColor) => sourceColor.source !== 'REALTIME_COLORS'
              ),
            })
          }}
        >
          {this.state.sourceColors.filter(
            (sourceColor) => sourceColor.source === 'REALTIME_COLORS'
          ).length === 0 ? (
            <div style={{ padding: '0 var(--size-pos-xsmall)' }}>
              <FormItem
                id="update-realtime-colors-url"
                helper={this.state.realtimeColorsUrl.helper}
              >
                <Input
                  id="update-realtime-colors-url"
                  type="TEXT"
                  state={this.state.realtimeColorsUrl.state}
                  placeholder={this.props.t(
                    'source.realtimeColors.url.placeholder'
                  )}
                  value={this.state.realtimeColorsUrl.value}
                  helper={{
                    label: this.props.t('source.realtimeColors.addColors'),
                  }}
                  isAutoFocus
                  isBlocked={this.features.IMPORTS_REALTIME_COLORS_ADD.isReached(
                    (this.props.creditsCount -
                      this.props.config.fees.realtimeColorsImport) *
                      -1 -
                      1
                  )}
                  onChange={this.isTypingRealtimeColorsUrlHandler}
                  onBlur={() => {
                    if (this.state.realtimeColorsUrl.canBeSubmitted)
                      this.importColorsFromRealtimeColorsHandler()
                  }}
                />
              </FormItem>
            </div>
          ) : (
            <List>
              {this.state.sourceColors
                .filter(
                  (sourceColor) => sourceColor.source === 'REALTIME_COLORS'
                )
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
                      onRemoveColor={() =>
                        this.removeSourceColorHandler(sourceColor.id)
                      }
                    />
                  )
                })}
            </List>
          )}
        </Accordion>
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="imports"
        column={[
          {
            node: (
              <>
                <Bar
                  id="imports-header"
                  leftPartSlot={
                    <SectionTitle label={this.props.t('contexts.imports')} />
                  }
                  rightPartSlot={
                    <Button
                      type="icon"
                      icon="plus"
                      feature="ADD_COLOR"
                      helper={{
                        label: this.props.t('colors.actions.new'),
                      }}
                      isBlocked={this.features.COLORS.isReached(
                        this.props.colors.length +
                          this.state.sourceColors.length -
                          1
                      )}
                      action={(e: Event) => this.colorsHandler(e)}
                    />
                  }
                  border={['BOTTOM']}
                />
                {this.features.COLORS.isReached(
                  this.props.colors.length + this.state.sourceColors.length - 1
                ) && (
                  <div
                    style={{
                      padding:
                        '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
                    }}
                  >
                    <SemanticMessage
                      type="INFO"
                      message={this.props.t('info.maxNumberOfSourceColors', {
                        count: this.features.COLORS.limit?.toString(),
                      })}
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
                                { pluginMessage: { type: 'GET_PRO' } },
                                '*'
                              )
                            }
                          />
                        )
                      }
                    />
                  </div>
                )}
                <List>
                  <this.SelectedColors />
                  <this.CoolorsColors />
                  <this.RealtimeColorsColors />
                </List>
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }
}
