import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  Color,
  ColorConfiguration,
  HexModel,
  ScaleConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  LockedSourceColorsConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Chip,
  Drawer,
  Dropdown,
  layouts,
  Menu,
  Select,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import Source from '../components/Source'
import Shade from '../components/Shade'
import Feature from '../components/Feature'
import { AppStates } from '../App'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $isAPCADisplayed, $isWCAGDisplayed } from '../../stores/preferences'
import { $palette } from '../../stores/palette'
import { trackPreviewManagementEvent } from '../../external/tracking/eventsTracker'
import lsc from '../../content/images/lock_source_colors.gif'
import { ConfigContextType } from '../../config/ConfigContext'

interface PreviewProps extends BaseProps, WithConfigProps {
  id: string
  colors: Array<SourceColorConfiguration> | Array<ColorConfiguration> | []
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  themes?: Array<ThemeConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  onLockSourceColors: React.Dispatch<Partial<AppStates>>
  onResetSourceColors?: () => void
  onChangeSettings: React.Dispatch<Partial<AppStates>>
}

interface PreviewStates {
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  isDrawerCollapsed: boolean
  drawerMaxHeight?: number
}

export default class Preview extends PureComponent<
  PreviewProps,
  PreviewStates
> {
  private subscribeWCAG: (() => void) | undefined
  private subscribeAPCA: (() => void) | undefined
  private palette: typeof $palette
  private drawerRef: React.RefObject<Drawer>
  private resizeObserver: ResizeObserver | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW_SCORES: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SCORES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_SCORES_WCAG: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SCORES_WCAG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_SCORES_APCA: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SCORES_APCA',
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
    SETTINGS_COLOR_SPACE: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_LCH: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_LCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_OKLCH: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_LAB: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_LAB',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_OKLAB: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLAB',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_HSL: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SETTINGS_COLOR_SPACE_HSLUV: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_COLOR_SPACE_HSLUV',
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
  })

  static defaultProps = {
    sourceColors: [],
    scale: {},
  }

  constructor(props: PreviewProps) {
    super(props)
    this.palette = $palette
    this.state = {
      isWCAGDisplayed: true,
      isAPCADisplayed: true,
      isDrawerCollapsed: false,
    }
    this.drawerRef = React.createRef() as React.RefObject<Drawer>
    this.resizeObserver = null
  }

  // Lifecycle
  componentDidMount = (): void => {
    this.subscribeWCAG = $isWCAGDisplayed.subscribe((value) => {
      this.setState({ isWCAGDisplayed: value })
    })
    this.subscribeAPCA = $isAPCADisplayed.subscribe((value) => {
      this.setState({ isAPCADisplayed: value })
    })
    if (
      this.drawerRef.current &&
      (this.drawerRef.current.base as unknown as HTMLElement).parentElement
    ) {
      const parent = (this.drawerRef.current.base as unknown as HTMLElement)
        .parentElement
      if (parent) {
        this.resizeObserver = new window.ResizeObserver(
          this.updateDrawerMaxHeight
        )
        this.resizeObserver.observe(parent)
      }
    }
    setTimeout(this.updateDrawerMaxHeight, 0)
  }

  componentDidUpdate = (): void => {
    this.updateDrawerMaxHeight()
  }

  componentWillUnmount = (): void => {
    if (this.subscribeWCAG) this.subscribeWCAG()
    if (this.subscribeAPCA) this.subscribeAPCA()
    if (
      this.resizeObserver &&
      this.drawerRef.current &&
      (this.drawerRef.current.base as unknown as HTMLElement).parentElement
    ) {
      const parent = (this.drawerRef.current as unknown as HTMLElement)
        .parentElement
      if (parent) this.resizeObserver.unobserve(parent)
    }
  }

  // Handlers
  updateDrawerMaxHeight = () => {
    if (!this.drawerRef.current) return

    const drawerEl = this.drawerRef.current.base as unknown as HTMLElement
    const parent = drawerEl?.parentElement

    if (!parent) return

    const parentHeight = parent.offsetHeight
    const siblings = Array.from(parent.children).filter(
      (el) => el !== drawerEl && !el.classList.contains('context')
    )
    const siblingsHeight = siblings.reduce(
      (acc, el) => acc + (el as HTMLElement).offsetHeight,
      0
    )
    const maxHeight = parentHeight - siblingsHeight

    drawerEl.style.maxHeight = `${maxHeight}px`
    this.setState({ drawerMaxHeight: maxHeight })
  }

  displayHandler = (): string => {
    const options = []
    if (this.state.isWCAGDisplayed) options.push('ENABLE_WCAG_SCORE')
    if (this.state.isAPCADisplayed) options.push('ENABLE_APCA_SCORE')
    return options.join(', ')
  }

  colorSettingsHandler = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLLIElement>
  ) => {
    const lockSourceColors = () => {
      const target = e.target as HTMLInputElement
      this.palette.setKey('areSourceColorsLocked', target.checked ?? false)

      this.props.onLockSourceColors({
        areSourceColorsLocked: target.checked,
      })

      if (this.props.service === 'EDIT')
        parent.postMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              id: this.props.id,
              items: [
                {
                  key: 'base.areSourceColorsLocked',
                  value: target.checked,
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'LOCK_SOURCE_COLORS',
        }
      )
    }

    const updateColorSpace = () => {
      const target = e.target as HTMLLIElement
      this.palette.setKey(
        'colorSpace',
        target.dataset.value as ColorSpaceConfiguration
      )

      this.props.onChangeSettings({
        colorSpace: target.dataset.value as ColorSpaceConfiguration,
      })

      if (this.props.service === 'EDIT')
        parent.postMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              id: this.props.id,
              items: [
                {
                  key: 'base.colorSpace',
                  value: target.dataset.value,
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_COLOR_SPACE',
        }
      )
    }

    const updateColorBlindMode = () => {
      const target = e.target as HTMLLIElement

      this.palette.setKey(
        'visionSimulationMode',
        target.dataset.value as VisionSimulationModeConfiguration
      )

      this.props.onChangeSettings({
        visionSimulationMode: target.dataset
          .value as VisionSimulationModeConfiguration,
      })

      if (this.props.service === 'EDIT' && this.props.themes !== undefined)
        parent.postMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              id: this.props.id,
              items: [
                {
                  key: 'themes',
                  value: this.props.themes.map((theme) => {
                    if (theme.isEnabled)
                      theme.visionSimulationMode = target.dataset
                        .value as VisionSimulationModeConfiguration
                    return theme
                  }),
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId === ''
          ? this.props.userIdentity.id === ''
            ? ''
            : this.props.userIdentity.id
          : this.props.userSession.userId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_VISION_SIMULATION_MODE',
        }
      )
    }

    const actions: {
      [action: string]: () => void
    } = {
      LOCK_SOURCE_COLORS: () => lockSourceColors(),
      UPDATE_COLOR_SPACE: () => updateColorSpace(),
      UPDATE_COLOR_BLIND_MODE: () => updateColorBlindMode(),
      DEFAULT: () => null,
    }

    actions[(e.target as HTMLElement).dataset.feature ?? 'DEFAULT']()
  }

  // Direct Actions
  setColor = (
    color: ColorConfiguration | SourceColorConfiguration,
    scale: number
  ): HexModel => {
    if ('alpha' in color && color.alpha.isEnabled) {
      const foregroundColorData = new Color({
        sourceColor: [color.rgb.r * 255, color.rgb.g * 255, color.rgb.b * 255],
        alpha: parseFloat((scale / 100).toFixed(2)),
        hueShifting: this.props.service === 'CREATE' ? 0 : color.hue?.shift,
        chromaShifting:
          this.props.service === 'CREATE'
            ? this.props.shift.chroma
            : color.chroma?.shift,
        algorithmVersion: this.props.algorithmVersion,
        visionSimulationMode: this.props.visionSimulationMode,
      })

      const backgroundColorData = new Color({
        sourceColor: chroma(color.alpha.backgroundColor).rgb(),
        algorithmVersion: this.props.algorithmVersion,
        visionSimulationMode: this.props.visionSimulationMode,
      })

      switch (this.props.colorSpace) {
        case 'LCH':
          return this.props.areSourceColorsLocked
            ? foregroundColorData.mixColorsHex(
                foregroundColorData.setColorWithAlpha() as HexModel,
                backgroundColorData.setColorWithAlpha() as HexModel
              )
            : foregroundColorData.mixColorsHex(
                foregroundColorData.lcha() as HexModel,
                backgroundColorData.lcha() as HexModel
              )
        case 'OKLCH':
          return this.props.areSourceColorsLocked
            ? foregroundColorData.mixColorsHex(
                foregroundColorData.setColorWithAlpha() as HexModel,
                backgroundColorData.setColorWithAlpha() as HexModel
              )
            : foregroundColorData.mixColorsHex(
                foregroundColorData.oklcha() as HexModel,
                backgroundColorData.oklcha() as HexModel
              )
        case 'LAB':
          return this.props.areSourceColorsLocked
            ? foregroundColorData.mixColorsHex(
                foregroundColorData.setColorWithAlpha() as HexModel,
                backgroundColorData.setColorWithAlpha() as HexModel
              )
            : foregroundColorData.mixColorsHex(
                foregroundColorData.laba() as HexModel,
                backgroundColorData.laba() as HexModel
              )
        case 'OKLAB':
          return this.props.areSourceColorsLocked
            ? foregroundColorData.mixColorsHex(
                foregroundColorData.setColorWithAlpha() as HexModel,
                backgroundColorData.setColorWithAlpha() as HexModel
              )
            : foregroundColorData.mixColorsHex(
                foregroundColorData.oklaba() as HexModel,
                backgroundColorData.oklaba() as HexModel
              )
        case 'HSL':
          return this.props.areSourceColorsLocked
            ? foregroundColorData.mixColorsHex(
                foregroundColorData.setColorWithAlpha() as HexModel,
                backgroundColorData.setColorWithAlpha() as HexModel
              )
            : foregroundColorData.mixColorsHex(
                foregroundColorData.hsla() as HexModel,
                backgroundColorData.hsla() as HexModel
              )
        case 'HSLUV':
          return this.props.areSourceColorsLocked
            ? foregroundColorData.mixColorsHex(
                foregroundColorData.setColorWithAlpha() as HexModel,
                backgroundColorData.setColorWithAlpha() as HexModel
              )
            : foregroundColorData.mixColorsHex(
                foregroundColorData.hsluva() as HexModel,
                backgroundColorData.hsluva() as HexModel
              )
        default:
          return '#000000'
      }
    } else {
      const colorData = new Color({
        sourceColor: [color.rgb.r * 255, color.rgb.g * 255, color.rgb.b * 255],
        lightness: scale,
        hueShifting: this.props.service === 'CREATE' ? 0 : color.hue?.shift,
        chromaShifting:
          this.props.service === 'CREATE'
            ? this.props.shift.chroma
            : color.chroma?.shift,
        algorithmVersion: this.props.algorithmVersion,
        visionSimulationMode: this.props.visionSimulationMode,
        alpha:
          'alpha' in color && color.alpha.isEnabled
            ? parseFloat((scale / 100).toFixed(2))
            : undefined,
      })

      switch (this.props.colorSpace) {
        case 'LCH':
          return colorData.lch() as HexModel
        case 'OKLCH':
          return colorData.oklch() as HexModel
        case 'LAB':
          return colorData.lab() as HexModel
        case 'OKLAB':
          return colorData.oklab() as HexModel
        case 'HSL':
          return colorData.hsl() as HexModel
        case 'HSLUV':
          return colorData.hsluv() as HexModel
        default:
          return '#000000'
      }
    }
  }

  // Templates
  stopTag = ({ stop }: { stop: string }) => (
    <Chip state="ON_BACKGROUND">{stop}</Chip>
  )

  // Render
  render() {
    return (
      <Drawer
        id="preview"
        direction="VERTICAL"
        pin="BOTTOM"
        defaultSize={{
          unit: 'AUTO',
        }}
        maxSize={
          this.state.drawerMaxHeight
            ? {
                value: this.state.drawerMaxHeight,
                unit: 'PIXEL',
              }
            : {
                value: 100,
                unit: 'PERCENT',
              }
        }
        minSize={{
          value: 40,
          unit: 'PIXEL',
        }}
        border={['TOP']}
        onCollapse={() => this.setState({ isDrawerCollapsed: true })}
        onExpand={() => this.setState({ isDrawerCollapsed: false })}
        ref={this.drawerRef}
      >
        <Bar
          leftPartSlot={
            <div className={layouts['snackbar--medium']}>
              <Button
                type="icon"
                icon={
                  this.state.isDrawerCollapsed
                    ? 'toggle-sidebar-top'
                    : 'toggle-sidebar-bottom'
                }
                helper={{
                  label: this.state.isDrawerCollapsed
                    ? this.props.locales.preview.actions.expandPreview
                    : this.props.locales.preview.actions.collapsePreview,
                }}
                action={() => {
                  if (!this.state.isDrawerCollapsed)
                    this.drawerRef.current?.collapseDrawer()
                  else this.drawerRef.current?.expandDrawer()
                }}
              />
              <Menu
                id="score-display"
                type="ICON"
                icon="visible"
                options={[
                  {
                    label: this.props.locales.preview.score.wcag,
                    value: 'ENABLE_WCAG_SCORE',
                    type: 'OPTION',
                    isActive: Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PREVIEW_SCORES_WCAG.isActive(),
                    isBlocked: Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PREVIEW_SCORES_WCAG.isBlocked(),
                    isNew: Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PREVIEW_SCORES_WCAG.isNew(),
                    action: () => {
                      $isWCAGDisplayed.set(!this.state.isWCAGDisplayed)
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'SET_ITEMS',
                            items: [
                              {
                                key: 'is_wcag_displayed',
                                value: !this.state.isWCAGDisplayed,
                              },
                            ],
                          },
                        },
                        '*'
                      )
                    },
                  },
                  {
                    label: this.props.locales.preview.score.apca,
                    value: 'ENABLE_APCA_SCORE',
                    type: 'OPTION',
                    isActive: Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PREVIEW_SCORES_APCA.isActive(),
                    isBlocked: Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PREVIEW_SCORES_APCA.isBlocked(),
                    isNew: Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PREVIEW_SCORES_APCA.isNew(),
                    action: () => {
                      $isAPCADisplayed.set(!this.state.isAPCADisplayed)
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'SET_ITEMS',
                            items: [
                              {
                                key: 'is_apca_displayed',
                                value: !this.state.isAPCADisplayed,
                              },
                            ],
                          },
                        },
                        '*'
                      )
                    },
                  },
                ]}
                selected={this.displayHandler()}
                alignment="TOP_LEFT"
                helper={{
                  label: this.props.locales.preview.actions.displayScores,
                }}
                isBlocked={Preview.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).PREVIEW_SCORES.isBlocked()}
                isNew={Preview.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).PREVIEW_SCORES.isNew()}
              />
            </div>
          }
          rightPartSlot={
            <div
              className={layouts['snackbar--medium']}
              style={{
                justifyContent: 'end',
              }}
            >
              <Feature
                isActive={Preview.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).PREVIEW_LOCK_SOURCE_COLORS.isActive()}
              >
                <Select
                  id="lock-source-colors"
                  label={this.props.locales.preview.lock.label}
                  type="SWITCH_BUTTON"
                  preview={{
                    image: lsc,
                    text: this.props.locales.preview.lock.preview,
                    pin: 'TOP',
                  }}
                  warning={
                    this.props.service === 'CREATE' &&
                    this.props.areSourceColorsLocked &&
                    Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      'EDIT',
                      this.props.editor
                    ).PREVIEW_LOCK_SOURCE_COLORS.isBlocked()
                      ? {
                          label: this.props.locales.preview.lock.warning,
                          pin: 'BOTTOM',
                          type: 'SINGLE_LINE',
                        }
                      : undefined
                  }
                  feature="LOCK_SOURCE_COLORS"
                  isChecked={this.props.areSourceColorsLocked}
                  isBlocked={
                    Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      this.props.service,
                      this.props.editor
                    ).PREVIEW_LOCK_SOURCE_COLORS.isBlocked() &&
                    !this.props.areSourceColorsLocked
                  }
                  isNew={Preview.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).PREVIEW_LOCK_SOURCE_COLORS.isNew()}
                  action={this.colorSettingsHandler}
                />
              </Feature>
              <Feature
                isActive={Preview.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_COLOR_SPACE.isActive()}
              >
                <Dropdown
                  id="update-color-space"
                  options={[
                    {
                      label: this.props.locales.settings.color.colorSpace.lch,
                      value: 'LCH',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_LCH.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_LCH.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_LCH.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label: this.props.locales.settings.color.colorSpace.oklch,
                      value: 'OKLCH',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_OKLCH.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_OKLCH.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_OKLCH.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label: this.props.locales.settings.color.colorSpace.lab,
                      value: 'LAB',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_LAB.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_LAB.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_LAB.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label: this.props.locales.settings.color.colorSpace.oklab,
                      value: 'OKLAB',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_OKLAB.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_OKLAB.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_OKLAB.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label: this.props.locales.settings.color.colorSpace.hsl,
                      value: 'HSL',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_HSL.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_HSL.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_HSL.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label: this.props.locales.settings.color.colorSpace.hsluv,
                      value: 'HSLUV',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_HSLUV.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_HSLUV.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_COLOR_SPACE_HSLUV.isNew(),
                      action: this.colorSettingsHandler,
                    },
                  ]}
                  selected={this.props.colorSpace}
                  alignment="RIGHT"
                  containerId="app"
                  isBlocked={Preview.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SETTINGS_COLOR_SPACE.isBlocked()}
                  isNew={Preview.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SETTINGS_COLOR_SPACE.isNew()}
                />
              </Feature>
              <Feature
                isActive={Preview.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).SETTINGS_VISION_SIMULATION_MODE.isActive()}
              >
                <Dropdown
                  id="update-color-blind-mode"
                  options={[
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .noneAlternative,
                      value: 'NONE',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .colorBlind,
                      type: 'TITLE',
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .protanomaly,
                      value: 'PROTANOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .protanopia,
                      value: 'PROTANOPIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .deuteranomaly,
                      value: 'DEUTERANOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .deuteranopia,
                      value: 'DEUTERANOPIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .tritanomaly,
                      value: 'TRITANOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .tritanopia,
                      value: 'TRITANOPIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .achromatomaly,
                      value: 'ACHROMATOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        this.props.locales.settings.color.visionSimulationMode
                          .achromatopsia,
                      value: 'ACHROMATOPSIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus,
                        this.props.config,
                        this.props.service,
                        this.props.editor
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                  ]}
                  selected={this.props.visionSimulationMode}
                  alignment="RIGHT"
                  containerId="app"
                  warning={
                    this.props.service === 'CREATE' &&
                    Preview.features(
                      this.props.planStatus,
                      this.props.config,
                      'EDIT',
                      this.props.editor
                    )[
                      `SETTINGS_VISION_SIMULATION_MODE_${this.props.visionSimulationMode}`
                    ].isBlocked()
                      ? {
                          label:
                            this.props.locales.settings.color
                              .visionSimulationMode.warning,
                          pin: 'BOTTOM',
                          type: 'SINGLE_LINE',
                        }
                      : undefined
                  }
                  isBlocked={Preview.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
                  isNew={Preview.features(
                    this.props.planStatus,
                    this.props.config,
                    this.props.service,
                    this.props.editor
                  ).SETTINGS_VISION_SIMULATION_MODE.isNew()}
                />
              </Feature>
              {this.props.onResetSourceColors && (
                <div className={layouts['snackbar--medium']}>
                  <span
                    className={doClassnames([
                      texts['type'],
                      texts['type--secondary'],
                    ])}
                  >
                    {this.props.locales.separator}
                  </span>
                  <Button
                    type="icon"
                    icon="trash"
                    action={this.props.onResetSourceColors}
                    isDisabled={
                      this.props.colors.some(
                        (color) =>
                          (color as SourceColorConfiguration).source ===
                            'COOLORS' ||
                          (color as SourceColorConfiguration).source ===
                            'REALTIME_COLORS' ||
                          (color as SourceColorConfiguration).source ===
                            'COLOUR_LOVERS'
                      )
                        ? false
                        : true
                    }
                    helper={{
                      label:
                        this.props.locales.preview.actions.resetImportedColors,
                    }}
                  />
                </div>
              )}
            </div>
          }
          isInverted
          shouldReflow
        />
        {!this.state.isDrawerCollapsed && (
          <div className="preview__palette">
            <div className="preview__header">
              <div className="preview__cell preview__cell--no-height">
                <this.stopTag stop={this.props.locales.preview.source.tag} />
              </div>
              {Object.keys(this.props.scale)
                .reverse()
                .map((scale, index) => {
                  return (
                    <div
                      className="preview__cell preview__cell--no-height"
                      key={index}
                    >
                      <this.stopTag stop={scale} />
                    </div>
                  )
                })}
            </div>
            <div className="preview__rows">
              {this.props.colors
                .sort((a, b) => {
                  if (this.props.service === 'EDIT') return 0
                  if (a.name.localeCompare(b.name) > 0) return 1
                  else if (a.name.localeCompare(b.name) < 0) return -1
                  else return 0
                })
                .map((color, index) => {
                  const scaledColors: Array<HexModel> = Object.values(
                    this.props.scale
                  )
                    .reverse()
                    .map((lightness) => this.setColor(color, lightness))

                  return (
                    <div
                      className="preview__row"
                      key={index}
                    >
                      <Source
                        {...this.props}
                        key="source"
                        name={color.name}
                        color={color.rgb}
                        isTransparent={
                          'alpha' in color ? color.alpha.isEnabled : false
                        }
                      />
                      {Object.values(scaledColors).map((scaledColor, index) => {
                        return (
                          <Shade
                            {...this.props}
                            key={index}
                            index={index}
                            color={scaledColor}
                            sourceColor={color}
                            scaledColors={scaledColors}
                            isWCAGDisplayed={this.state.isWCAGDisplayed}
                            isAPCADisplayed={this.state.isAPCADisplayed}
                          />
                        )
                      })}
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </Drawer>
    )
  }
}
