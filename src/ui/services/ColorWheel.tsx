import { uid } from 'uid'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  ColorHarmony,
  makeDefaultShift,
} from '@yelbolt/engine-ui-color-palette'
import {
  SourceColorConfiguration,
  ColorHarmonyResult,
  Channel,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { Bar, Dropdown, FormItem, Layout, texts } from '@unoff/ui'
import { Input } from '@unoff/ui'
import { layouts } from '@unoff/ui'
import { Chip } from '@unoff/ui'
import { Button } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import PalettePreview from '../components/PalettePreview'
import Feature from '../components/Feature'
import { AppState } from '../App'
import setPreviewPalette from '../../utils/setPreviewPalette'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { getClosestColorName } from '../../utils/colorNameHelper'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $palette } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import {
  trackActionEvent,
  trackImportEvent,
} from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import type { Dispatch } from 'preact/hooks'

interface ColorWheelProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  creditsCount: number
  localPalettesCount: number
  onChangeService: Dispatch<Partial<AppState>>
}

interface ColorWheelState {
  isActionLoading: boolean
  baseColor: Channel
  wheelRule: string
  colorHarmony: ColorHarmonyResult
}

export default class ColorWheel extends PureComponent<
  ColorWheelProps,
  ColorWheelState
> {
  private harmony: ColorHarmony
  private palette = $palette

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    WHEEL_BASE: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL_BASE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL_ALGORITHM: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL_ALGORITHM',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL_ALGORITHM_ANALOGOUS: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL_ALGORITHM_ANALOGOUS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL_ALGORITHM_COMPLEMENTARY: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL_ALGORITHM_COMPLEMENTARY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL_ALGORITHM_COMPOUND: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL_ALGORITHM_COMPOUND',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL_ALGORITHM_TRIADIC: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL_ALGORITHM_TRIADIC',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL_ALGORITHM_TETRADIC: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL_ALGORITHM_TETRADIC',
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
    LOCAL_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return ColorWheel.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ColorWheelProps) {
    super(props)
    this.harmony = new ColorHarmony({
      baseColor: [0.533 * 255, 0.921 * 255, 0.976 * 255],
      analogousSpread: 30,
    })
    this.palette = $palette
    this.state = {
      isActionLoading: false,
      baseColor: [0.533 * 255, 0.921 * 255, 0.976 * 255],
      wheelRule: 'ANALOGOUS',
      colorHarmony: this.harmony.generateAnalogous(),
    }
  }

  // Lifecycle
  componentDidUpdate(
    _: Readonly<ColorWheelProps>,
    previousState: Readonly<ColorWheelState>
  ): void {
    if (
      previousState.baseColor !== this.state.baseColor ||
      previousState.wheelRule !== this.state.wheelRule
    ) {
      this.harmony.setBaseColor(this.state.baseColor)
      let newHarmony: ColorHarmonyResult = this.state.colorHarmony

      if (this.state.wheelRule === 'ANALOGOUS')
        newHarmony = this.harmony.generateAnalogous()
      else if (this.state.wheelRule === 'COMPLEMENTARY')
        newHarmony = this.harmony.generateComplementary()
      else if (this.state.wheelRule === 'COMPOUND')
        newHarmony = this.harmony.generateCompound()
      else if (this.state.wheelRule === 'TRIADIC')
        newHarmony = this.harmony.generateTriadic()
      else if (this.state.wheelRule === 'TETRADIC')
        newHarmony = this.harmony.generateTetradic()

      this.setState({
        colorHarmony: newHarmony,
      })
    }
  }

  // Direct Actions
  onCreatePalette = (sourceColors: Array<SourceColorConfiguration>) => {
    this.setState({
      isActionLoading: true,
    })

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE',
          data: {
            sourceColors: sourceColors,
            exchange: {
              ...this.palette.value,
            },
          },
        },
      },
      '*'
    )

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.paletteCreate
      )

    trackActionEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'CREATE_PALETTE',
        colors: sourceColors.length,
        stops: this.palette.value?.preset.stops.length,
      }
    )
  }

  getSourceColors = (): Array<SourceColorConfiguration> =>
    this.state.colorHarmony.hexColors.map((color) => {
      const gl = chroma(color).gl()
      return {
        name: getClosestColorName(color),
        rgb: {
          r: gl[0],
          g: gl[1],
          b: gl[2],
        },
        hue: {
          shift: makeDefaultShift('HUE'),
          isLocked: false,
        },
        chroma: {
          shift: makeDefaultShift('CHROMA'),
          isLocked: false,
        },
        source: 'HARMONY',
        id: uid(),
        isRemovable: false,
      }
    }) as Array<SourceColorConfiguration>

  onUsePalette = () => {
    const sourceColors = this.getSourceColors()

    this.props.onChangeService({
      service: 'MANAGE',
    })
    this.onCreatePalette(sourceColors)

    if (
      this.props.config.plan.isProEnabled &&
      this.props.config.plan.isCreditsEnabled
    )
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.harmonyCreate
      )

    trackImportEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'CREATE_COLOR_HARMONY',
      }
    )
  }

  // Templates
  HarmonyPreview = () => {
    return (
      <div
        className="preview__palette"
        style={{
          position: 'relative',
        }}
      >
        {this.features.WHEEL_BASE.isReached(
          (this.props.creditsCount - this.props.config.fees.harmonyCreate) *
            -1 -
            1
        ) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#CCC',
              opacity: 0.7,
              zIndex: 2,
            }}
          />
        )}
        <div className="preview__rows preview__rows--free">
          <div className="preview__row preview__row--free">
            {this.state.colorHarmony.hexColors.map((color, index) => (
              <div
                key={index}
                className="preview__cell preview__cell--free"
                style={{
                  backgroundColor: color,
                }}
              >
                <Chip state="ON_BACKGROUND">
                  {color.toUpperCase().replace('#', '')}
                </Chip>
                <Chip state="ON_BACKGROUND">{getClosestColorName(color)}</Chip>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="color-harmony"
        column={[
          {
            node: (
              <>
                <this.HarmonyPreview />
                <div
                  style={{
                    padding: 'var(--size-pos-xxsmall) var(--size-pos-xsmall)',
                  }}
                >
                  <PalettePreview
                    colors={setPreviewPalette(
                      this.getSourceColors(),
                      this.palette.get()
                    )}
                  />
                </div>
                <Bar
                  leftPartSlot={
                    <Feature isActive={this.features.WHEEL_BASE.isActive()}>
                      <FormItem
                        id="color-harmony-base-color"
                        label={this.props.t('wheel.base')}
                        shouldFill={false}
                        isBlocked={this.features.WHEEL_BASE.isReached(
                          (this.props.creditsCount -
                            this.props.config.fees.harmonyCreate) *
                            -1 -
                            1
                        )}
                      >
                        <Input
                          id="color-harmony-base-color"
                          type="COLOR"
                          value={chroma([
                            0.533 * 255,
                            0.921 * 255,
                            0.976 * 255,
                          ]).hex()}
                          isBlocked={this.features.WHEEL_BASE.isReached(
                            (this.props.creditsCount -
                              this.props.config.fees.harmonyCreate) *
                              -1 -
                              1
                          )}
                          isNew={this.features.WHEEL_BASE.isNew()}
                          onPick={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            const rgb = chroma(value).rgb()

                            this.setState({ baseColor: rgb as Channel })
                          }}
                        />
                      </FormItem>
                    </Feature>
                  }
                  rightPartSlot={
                    <div
                      className={doClassnames([
                        layouts['snackbar--medium'],
                        layouts['snackbar--right'],
                        layouts['snackbar--wrap'],
                      ])}
                    >
                      <Feature
                        isActive={this.features.WHEEL_ALGORITHM.isActive()}
                      >
                        <FormItem
                          id="color-harmony-algorithm"
                          label={this.props.t('wheel.algorithm.label')}
                          shouldFill={false}
                          isBlocked={this.features.WHEEL_ALGORITHM.isBlocked()}
                        >
                          <Dropdown
                            id="color-harmony-algorithm"
                            options={[
                              {
                                type: 'OPTION',
                                label: this.props.t(
                                  'wheel.algorithm.analogous'
                                ),
                                value: 'ANALOGOUS',
                                isActive:
                                  this.features.WHEEL_ALGORITHM_ANALOGOUS.isActive(),
                                isBlocked:
                                  this.features.WHEEL_ALGORITHM_ANALOGOUS.isBlocked(),
                                isNew:
                                  this.features.WHEEL_ALGORITHM_ANALOGOUS.isNew(),
                                onBlock: () => {
                                  sendPluginMessage(
                                    {
                                      pluginMessage: {
                                        type:
                                          this.props.config.plan
                                            .isTrialEnabled &&
                                          this.props.trialStatus !== 'EXPIRED'
                                            ? 'GET_TRIAL'
                                            : 'GET_PRO',
                                      },
                                    },
                                    '*'
                                  )
                                },
                                action: () => {
                                  this.setState({
                                    wheelRule: 'ANALOGOUS',
                                  })
                                },
                              },
                              {
                                type: 'OPTION',
                                label: this.props.t(
                                  'wheel.algorithm.complementary'
                                ),
                                value: 'COMPLEMENTARY',
                                isActive:
                                  this.features.WHEEL_ALGORITHM_COMPLEMENTARY.isActive(),
                                isBlocked:
                                  this.features.WHEEL_ALGORITHM_COMPLEMENTARY.isBlocked(),
                                isNew:
                                  this.features.WHEEL_ALGORITHM_COMPLEMENTARY.isNew(),
                                onBlock: () => {
                                  sendPluginMessage(
                                    {
                                      pluginMessage: {
                                        type:
                                          this.props.config.plan
                                            .isTrialEnabled &&
                                          this.props.trialStatus !== 'EXPIRED'
                                            ? 'GET_TRIAL'
                                            : 'GET_PRO',
                                      },
                                    },
                                    '*'
                                  )
                                },
                                action: () => {
                                  this.setState({
                                    wheelRule: 'COMPLEMENTARY',
                                  })
                                },
                              },
                              {
                                type: 'OPTION',
                                label: this.props.t('wheel.algorithm.compound'),
                                value: 'COMPOUND',
                                isActive:
                                  this.features.WHEEL_ALGORITHM_COMPOUND.isActive(),
                                isBlocked:
                                  this.features.WHEEL_ALGORITHM_COMPOUND.isBlocked(),
                                isNew:
                                  this.features.WHEEL_ALGORITHM_COMPOUND.isNew(),
                                onBlock: () => {
                                  sendPluginMessage(
                                    {
                                      pluginMessage: {
                                        type:
                                          this.props.config.plan
                                            .isTrialEnabled &&
                                          this.props.trialStatus !== 'EXPIRED'
                                            ? 'GET_TRIAL'
                                            : 'GET_PRO',
                                      },
                                    },
                                    '*'
                                  )
                                },
                                action: () => {
                                  this.setState({
                                    wheelRule: 'COMPOUND',
                                  })
                                },
                              },
                              {
                                type: 'OPTION',
                                label: this.props.t('wheel.algorithm.triadic'),
                                value: 'TRIADIC',
                                isActive:
                                  this.features.WHEEL_ALGORITHM_TRIADIC.isActive(),
                                isBlocked:
                                  this.features.WHEEL_ALGORITHM_TRIADIC.isBlocked(),
                                isNew:
                                  this.features.WHEEL_ALGORITHM_TRIADIC.isNew(),
                                onBlock: () => {
                                  sendPluginMessage(
                                    {
                                      pluginMessage: {
                                        type:
                                          this.props.config.plan
                                            .isTrialEnabled &&
                                          this.props.trialStatus !== 'EXPIRED'
                                            ? 'GET_TRIAL'
                                            : 'GET_PRO',
                                      },
                                    },
                                    '*'
                                  )
                                },
                                action: () => {
                                  this.setState({ wheelRule: 'TRIADIC' })
                                },
                              },
                              {
                                type: 'OPTION',
                                label: this.props.t('wheel.algorithm.tetradic'),
                                value: 'TETRADIC',
                                isActive:
                                  this.features.WHEEL_ALGORITHM_TETRADIC.isActive(),
                                isBlocked:
                                  this.features.WHEEL_ALGORITHM_TETRADIC.isBlocked(),
                                isNew:
                                  this.features.WHEEL_ALGORITHM_TETRADIC.isNew(),
                                onBlock: () => {
                                  sendPluginMessage(
                                    {
                                      pluginMessage: {
                                        type:
                                          this.props.config.plan
                                            .isTrialEnabled &&
                                          this.props.trialStatus !== 'EXPIRED'
                                            ? 'GET_TRIAL'
                                            : 'GET_PRO',
                                      },
                                    },
                                    '*'
                                  )
                                },
                                action: () => {
                                  this.setState({
                                    wheelRule: 'TETRADIC',
                                  })
                                },
                              },
                            ]}
                            selected={this.state.wheelRule}
                            alignment="RIGHT"
                            pin="BOTTOM"
                          />
                        </FormItem>
                      </Feature>
                      <Feature
                        isActive={this.features.CREATE_PALETTE.isActive()}
                      >
                        <span
                          className={doClassnames([
                            texts.type,
                            texts['type--secondary'],
                          ])}
                        >
                          {this.props.t('separator')}
                        </span>
                        <Button
                          type="secondary"
                          label={this.props.t('wheel.actions.newPalette')}
                          helper={{
                            label: this.features.LOCAL_PALETTES.isReached(
                              this.props.localPalettesCount
                            )
                              ? this.props.t('info.maxNumberOfLocalPalettes', {
                                  count: (
                                    this.features.LOCAL_PALETTES.limit ?? 3
                                  ).toString(),
                                })
                              : this.props.t('wheel.actions.addColors'),
                            type: 'MULTI_LINE',
                            pin: 'TOP',
                          }}
                          isLoading={this.state.isActionLoading}
                          isBlocked={this.features.LOCAL_PALETTES.isReached(
                            this.props.localPalettesCount
                          )}
                          isNew={this.features.CREATE_PALETTE.isNew()}
                          onBlock={() => {
                            sendPluginMessage(
                              {
                                pluginMessage: {
                                  type:
                                    this.props.config.plan.isTrialEnabled &&
                                    this.props.trialStatus !== 'EXPIRED'
                                      ? 'GET_TRIAL'
                                      : 'GET_PRO',
                                },
                              },
                              '*'
                            )
                          }}
                          action={this.onUsePalette}
                        />
                      </Feature>
                    </div>
                  }
                  shouldReflow
                  isInverted
                  border={['TOP']}
                />
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullWidth
        isFullHeight
        shouldReflow
      />
    )
  }
}
