import { uid } from 'uid'
import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  SourceColorConfiguration,
  ColorHarmonyResult,
  RgbModel,
  Channel,
} from '@a_ng_d/utils-ui-color-palette'
import { ColorHarmony } from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Bar, Dropdown, FormItem, Layout } from '@a_ng_d/figmug-ui'
import { Input } from '@a_ng_d/figmug-ui'
import { layouts } from '@a_ng_d/figmug-ui'
import { Chip } from '@a_ng_d/figmug-ui'
import { Button } from '@a_ng_d/figmug-ui'
import { texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { getClosestColorName } from '../../utils/colorNameHelper'
import {
  BaseProps,
  Context,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import { trackImportEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface ColorWheelProps extends BaseProps, WithConfigProps {
  baseColor: RgbModel
  creditsCount: number
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: SourceColorConfiguration['source']
  ) => void
  onChangeContexts: (context: Context) => void
}

interface ColorWheelStates {
  baseColor: Channel
  wheelRule: string
  colorHarmony: ColorHarmonyResult
}

export default class ColorWheel extends PureComponent<
  ColorWheelProps,
  ColorWheelStates
> {
  private harmony: ColorHarmony

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    SOURCE_HARMONY_BASE: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_BASE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY_WHEEL: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_WHEEL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY_WHEEL_ANALOGOUS: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_WHEEL_ANALOGOUS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY_WHEEL_COMPLEMENTARY: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_WHEEL_COMPLEMENTARY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY_WHEEL_COMPOUND: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_WHEEL_COMPOUND',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY_WHEEL_TRIADIC: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_WHEEL_TRIADIC',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY_WHEEL_TETRADIC: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_WHEEL_TETRADIC',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SOURCE_HARMONY_ADD: new FeatureStatus({
      features: config.features,
      featureName: 'SOURCE_HARMONY_ADD',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ColorWheelProps) {
    super(props)
    this.harmony = new ColorHarmony({
      baseColor: [
        this.props.baseColor.r * 255,
        this.props.baseColor.g * 255,
        this.props.baseColor.b * 255,
      ],
      analogousSpread: 30,
    })
    this.state = {
      baseColor: [
        this.props.baseColor.r * 255,
        this.props.baseColor.g * 255,
        this.props.baseColor.b * 255,
      ],
      wheelRule: 'ANALOGOUS',
      colorHarmony: this.harmony.generateAnalogous(),
    }
  }

  // Lifecycle
  componentDidUpdate(
    _: Readonly<ColorWheelProps>,
    previousState: Readonly<ColorWheelStates>
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
  onUsePalette = () => {
    this.props.onChangeColorsFromImport(
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
            shift: 0,
            isLocked: false,
          },
          chroma: {
            shift: 0,
            isLocked: false,
          },
          source: 'HARMONY',
          id: uid(),
          isRemovable: false,
        }
      }),
      'HARMONY'
    )
    this.props.onChangeContexts('SOURCE_OVERVIEW')

    if (this.props.config.plan.isProEnabled)
      $creditsCount.set(
        $creditsCount.get() - this.props.config.fees.harmonyCreate
      )

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
        feature: 'CREATE_COLOR_HARMONY',
      }
    )
  }

  // Templates
  HarmonyPreview = () => {
    return (
      <div className="preview__palette">
        <div className="preview__rows">
          <div className="preview__row">
            {this.state.colorHarmony.hexColors.map((color, index) => (
              <div
                key={index}
                className="preview__cell"
                style={{
                  backgroundColor: color,
                }}
              >
                <div className={layouts.centered}>
                  <div
                    className={doClassnames([
                      layouts['stackbar--tight'],
                      layouts['stackbar--centered'],
                    ])}
                  >
                    <Chip state="ON_BACKGROUND">
                      {color.toUpperCase().replace('#', '')}
                    </Chip>
                    <Chip state="ON_BACKGROUND">
                      {getClosestColorName(color)}
                    </Chip>
                  </div>
                </div>
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
                <Bar
                  leftPartSlot={
                    <Feature
                      isActive={ColorWheel.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SOURCE_HARMONY_BASE.isActive()}
                    >
                      <FormItem
                        id="color-harmony-base-color"
                        label={this.props.locales.source.wheel.base}
                        shouldFill={false}
                      >
                        <Input
                          id="color-harmony-base-color"
                          type="COLOR"
                          value={chroma([
                            this.props.baseColor.r * 255,
                            this.props.baseColor.g * 255,
                            this.props.baseColor.b * 255,
                          ]).hex()}
                          isBlocked={ColorWheel.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).SOURCE_HARMONY_BASE.isReached(
                            this.props.creditsCount * -1 - 1
                          )}
                          isNew={ColorWheel.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).SOURCE_HARMONY_BASE.isNew()}
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
                    <div className={layouts['snackbar--medium']}>
                      <Feature
                        isActive={ColorWheel.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SOURCE_HARMONY_WHEEL.isActive()}
                      >
                        <FormItem
                          id="color-harmony-algorithm"
                          label={
                            this.props.locales.source.wheel.algorithm.label
                          }
                          isBlocked={ColorWheel.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).SOURCE_HARMONY_WHEEL.isBlocked()}
                          shouldFill={false}
                        >
                          <Dropdown
                            id="color-harmony-algorithm"
                            options={[
                              {
                                type: 'OPTION',
                                label:
                                  this.props.locales.source.wheel.algorithm
                                    .analogous,
                                value: 'ANALOGOUS',
                                isActive: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_ANALOGOUS.isActive(),
                                isBlocked: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_ANALOGOUS.isBlocked(),
                                isNew: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_ANALOGOUS.isNew(),
                                action: () => {
                                  this.setState({
                                    wheelRule: 'ANALOGOUS',
                                  })
                                },
                              },
                              {
                                type: 'OPTION',
                                label:
                                  this.props.locales.source.wheel.algorithm
                                    .complementary,
                                value: 'COMPLEMENTARY',
                                isActive: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_COMPLEMENTARY.isActive(),
                                isBlocked: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_COMPLEMENTARY.isBlocked(),
                                isNew: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_COMPLEMENTARY.isNew(),
                                action: () => {
                                  this.setState({
                                    wheelRule: 'COMPLEMENTARY',
                                  })
                                },
                              },
                              {
                                type: 'OPTION',
                                label:
                                  this.props.locales.source.wheel.algorithm
                                    .compound,
                                value: 'COMPOUND',
                                isActive: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_COMPOUND.isActive(),
                                isBlocked: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_COMPOUND.isBlocked(),
                                isNew: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_COMPOUND.isNew(),
                                action: () => {
                                  this.setState({
                                    wheelRule: 'COMPOUND',
                                  })
                                },
                              },
                              {
                                type: 'OPTION',
                                label:
                                  this.props.locales.source.wheel.algorithm
                                    .triadic,
                                value: 'TRIADIC',
                                isActive: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_TRIADIC.isActive(),
                                isBlocked: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_TRIADIC.isBlocked(),
                                isNew: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_TRIADIC.isNew(),
                                action: () => {
                                  this.setState({ wheelRule: 'TRIADIC' })
                                },
                              },
                              {
                                type: 'OPTION',
                                label:
                                  this.props.locales.source.wheel.algorithm
                                    .tetradic,
                                value: 'TETRADIC',
                                isActive: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_TETRADIC.isActive(),
                                isBlocked: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_TETRADIC.isBlocked(),
                                isNew: ColorWheel.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).SOURCE_HARMONY_WHEEL_TETRADIC.isNew(),
                                action: () => {
                                  this.setState({
                                    wheelRule: 'TETRADIC',
                                  })
                                },
                              },
                            ]}
                            selected={this.state.wheelRule}
                            alignment="RIGHT"
                            pin="TOP"
                          />
                        </FormItem>
                      </Feature>
                      <span
                        className={doClassnames([
                          texts['type'],
                          texts['type--secondary'],
                        ])}
                      >
                        {this.props.locales.separator}
                      </span>
                      <Feature
                        isActive={ColorWheel.features(
                          this.props.planStatus,
                          this.props.config,
                          this.props.service,
                          this.props.editor
                        ).SOURCE_HARMONY_ADD.isActive()}
                      >
                        <Button
                          type="icon"
                          icon="plus"
                          helper={{
                            label:
                              this.props.locales.source.wheel.addColors.replace(
                                '{fee}',
                                this.props.config.fees.harmonyCreate.toString()
                              ),
                            type: 'MULTI_LINE',
                          }}
                          isBlocked={ColorWheel.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).SOURCE_HARMONY_ADD.isReached(
                            this.props.creditsCount * -1 - 1
                          )}
                          isNew={ColorWheel.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
                          ).SOURCE_HARMONY_ADD.isNew()}
                          action={this.onUsePalette}
                        />
                      </Feature>
                    </div>
                  }
                  shouldReflow
                  border={['BOTTOM']}
                />
                <this.HarmonyPreview />
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
