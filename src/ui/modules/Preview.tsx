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
import { FeatureStatus } from '@unoff/utils'
import { Bar, Chip, ColorChip, Drawer } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Source from '../components/Source'
import Shade from '../components/Shade'
import Feature from '../components/Feature'
import { AppState } from '../App'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  PlanStatus,
  ScoreFilterStatus,
  Service,
} from '../../types/app'
import {
  $isAPCADisplayed,
  $isAPCAIntervalDisplayed,
  $isWCAGDisplayed,
  $isWCAGIntervalDisplayed,
} from '../../stores/preferences'
import { $palette } from '../../stores/palette'
import {
  $contrastScores,
  clearContrastScores,
  getContrastRangesByColumn,
} from '../../stores/contrasts'
import { trackPreviewManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../..'
import SettingsControls from './preview/SettingsControls'
import ScoresControls from './preview/ScoresControls'

interface PreviewProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
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
  onLockSourceColors?: React.Dispatch<Partial<AppState>>
  onResetSourceColors?: () => void
  onChangeSettings?: React.Dispatch<Partial<AppState>>
  onInteractWithSourceColor?: (colorId: string) => void
}

interface PreviewState {
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  isWCAGIntervalDisplayed: boolean
  isAPCAIntervalDisplayed: boolean
  isDrawerCollapsed: boolean
  drawerMaxHeight?: number
  scoreFilters: {
    lightWCAG: ScoreFilterStatus
    lightAPCA: ScoreFilterStatus
    darkWCAG: ScoreFilterStatus
    darkAPCA: ScoreFilterStatus
  }
  openDialogKey: string | null
  contrastScoresVersion: number
}

export default class Preview extends PureComponent<PreviewProps, PreviewState> {
  private subscribeWCAG: (() => void) | undefined
  private subscribeAPCA: (() => void) | undefined
  private subscribeWCAGInterval: (() => void) | undefined
  private subscribeAPCAInterval: (() => void) | undefined
  private subscribeContrastScores: (() => void) | undefined
  private palette: typeof $palette
  private drawerRef: React.RefObject<Drawer>
  private paletteContainerRef: React.RefObject<HTMLDivElement>
  private resizeObserver: ResizeObserver | null
  private theme: string | null

  static defaultProps = {
    sourceColors: [],
    scale: {},
  }

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW_SCORES_WCAG_INTERVAL: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SCORES_WCAG_INTERVAL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_SCORES_APCA_INTERVAL: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SCORES_APCA_INTERVAL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Preview.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: PreviewProps) {
    super(props)
    this.palette = $palette
    this.theme = document.documentElement.getAttribute('data-theme')
    this.state = {
      isWCAGDisplayed: true,
      isAPCADisplayed: true,
      isWCAGIntervalDisplayed: false,
      isAPCAIntervalDisplayed: false,
      isDrawerCollapsed: false,
      scoreFilters: {
        lightWCAG: 'ALL',
        lightAPCA: 'ALL',
        darkWCAG: 'ALL',
        darkAPCA: 'ALL',
      },
      openDialogKey: null,
      contrastScoresVersion: 0,
    }
    this.drawerRef = React.createRef() as React.RefObject<Drawer>
    this.paletteContainerRef =
      React.createRef() as React.RefObject<HTMLDivElement>
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
    this.subscribeWCAGInterval = $isWCAGIntervalDisplayed.subscribe((value) => {
      this.setState({ isWCAGIntervalDisplayed: value })
    })
    this.subscribeAPCAInterval = $isAPCAIntervalDisplayed.subscribe((value) => {
      this.setState({ isAPCAIntervalDisplayed: value })
    })
    this.subscribeContrastScores = $contrastScores.subscribe(() => {
      this.setState((prev) => ({
        contrastScoresVersion: prev.contrastScoresVersion + 1,
      }))
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

  componentDidUpdate = (
    prevProps: PreviewProps,
    prevState: PreviewState
  ): void => {
    this.updateDrawerMaxHeight()

    const propsChanged =
      prevProps.colorSpace !== this.props.colorSpace ||
      prevProps.visionSimulationMode !== this.props.visionSimulationMode ||
      prevProps.textColorsTheme !== this.props.textColorsTheme ||
      prevProps.colors !== this.props.colors ||
      prevProps.scale !== this.props.scale

    const intervalToggled =
      prevState.isWCAGIntervalDisplayed !==
        this.state.isWCAGIntervalDisplayed ||
      prevState.isAPCAIntervalDisplayed !== this.state.isAPCAIntervalDisplayed

    if (propsChanged || intervalToggled) clearContrastScores()
  }

  componentWillUnmount = (): void => {
    if (this.subscribeWCAG) this.subscribeWCAG()
    if (this.subscribeAPCA) this.subscribeAPCA()
    if (this.subscribeWCAGInterval) this.subscribeWCAGInterval()
    if (this.subscribeAPCAInterval) this.subscribeAPCAInterval()
    if (this.subscribeContrastScores) this.subscribeContrastScores()
    if (
      this.resizeObserver &&
      this.drawerRef.current &&
      (this.drawerRef.current.base as unknown as HTMLElement).parentElement
    ) {
      const parent = (this.drawerRef.current as unknown as HTMLElement)
        .parentElement
      if (parent) this.resizeObserver.unobserve(parent)
    }

    if (this.paletteContainerRef.current)
      this.paletteContainerRef.current.removeEventListener(
        'wheel',
        this.handleHorizontalScroll
      )

    clearContrastScores()
  }

  // Handlers
  handleHorizontalScroll = (e: WheelEvent) => {
    const container = this.paletteContainerRef.current
    if (!container) return

    if (e.deltaX !== 0) return

    const hasHorizontalScroll = container.scrollWidth > container.clientWidth
    const hasVerticalScroll = container.scrollHeight > container.clientHeight

    if (hasHorizontalScroll && (!hasVerticalScroll || e.shiftKey)) {
      e.preventDefault()
      container.scrollLeft += e.deltaY
    }
  }

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

    drawerEl.style.maxHeight = `${maxHeight - 28}px`
    this.setState({ drawerMaxHeight: maxHeight })
  }

  updateScoreFilters = (filters: {
    lightWCAG?: ScoreFilterStatus
    lightAPCA?: ScoreFilterStatus
    darkWCAG?: ScoreFilterStatus
    darkAPCA?: ScoreFilterStatus
  }) => {
    this.setState({
      scoreFilters: {
        ...this.state.scoreFilters,
        ...filters,
      },
    })
  }

  toggleDrawer = () => {
    if (!this.state.isDrawerCollapsed) this.drawerRef.current?.collapseDrawer()
    else this.drawerRef.current?.expandDrawer()
  }

  colorSettingsHandler = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLLIElement>
  ) => {
    const lockSourceColors = () => {
      this.palette.setKey('areSourceColorsLocked', true)

      this.props.onLockSourceColors?.({
        areSourceColorsLocked: true,
      })

      if (this.props.service === 'EDIT')
        sendPluginMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              id: this.props.id,
              items: [
                {
                  key: 'base.areSourceColorsLocked',
                  value: true,
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'LOCK_SOURCE_COLORS',
        }
      )
    }

    const unlockSourceColors = () => {
      this.palette.setKey('areSourceColorsLocked', false)

      this.props.onLockSourceColors?.({
        areSourceColorsLocked: false,
      })

      if (this.props.service === 'EDIT')
        sendPluginMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              id: this.props.id,
              items: [
                {
                  key: 'base.areSourceColorsLocked',
                  value: false,
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
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

      this.props.onChangeSettings?.({
        colorSpace: target.dataset.value as ColorSpaceConfiguration,
      })

      if (this.props.service === 'EDIT')
        sendPluginMessage(
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
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
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

      this.props.onChangeSettings?.({
        visionSimulationMode: target.dataset
          .value as VisionSimulationModeConfiguration,
      })

      if (this.props.service === 'EDIT' && this.props.themes !== undefined)
        sendPluginMessage(
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
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
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
      LOCK_SOURCE_COLORS_ON: () => lockSourceColors(),
      LOCK_SOURCE_COLORS_OFF: () => unlockSourceColors(),
      UPDATE_COLOR_SPACE: () => updateColorSpace(),
      UPDATE_COLOR_BLIND_MODE: () => updateColorBlindMode(),
      DEFAULT: () => null,
    }

    actions[(e.target as HTMLElement).dataset.feature ?? 'DEFAULT']()
  }

  // Direct Actions
  forceCollapseDrawer = () => {
    if (this.drawerRef.current) this.drawerRef.current.collapseDrawer()
  }

  openDialog = (colorIndex: number, shadeIndex: number) => {
    const key = `${colorIndex}-${shadeIndex}`
    this.setState({ openDialogKey: key })
  }

  closeDialog = () => {
    this.setState({ openDialogKey: null })
  }

  navigateShade = (
    direction: 'previous' | 'next',
    colorIndex: number,
    shadeIndex: number
  ) => {
    const colors = this.props.colors.filter((color) => {
      if (this.props.colors.length > 1) {
        if ('source' in color) return color.source !== 'DEFAULT'
        return true
      }
      return true
    })

    const totalColors = colors.length
    const scaleKeys = Object.keys(this.props.scale)
    const totalShades = scaleKeys.length

    let nextColorIndex = colorIndex
    let nextShadeIndex = shadeIndex

    if (totalColors === 1)
      if (direction === 'next')
        nextShadeIndex = shadeIndex < totalShades - 1 ? shadeIndex + 1 : 0
      else nextShadeIndex = shadeIndex > 0 ? shadeIndex - 1 : totalShades - 1
    else if (direction === 'next')
      if (colorIndex < totalColors - 1) nextColorIndex = colorIndex + 1
      else {
        nextColorIndex = 0
        nextShadeIndex = shadeIndex < totalShades - 1 ? shadeIndex + 1 : 0
      }
    else if (colorIndex > 0) nextColorIndex = colorIndex - 1
    else {
      nextColorIndex = totalColors - 1
      nextShadeIndex = shadeIndex > 0 ? shadeIndex - 1 : totalShades - 1
    }

    this.openDialog(nextColorIndex, nextShadeIndex)
  }

  setColor = (
    color: ColorConfiguration | SourceColorConfiguration,
    scale: number
  ): HexModel => {
    if ('alpha' in color && color.alpha.isEnabled) {
      const foregroundColorData = new Color({
        sourceColor: [color.rgb.r * 255, color.rgb.g * 255, color.rgb.b * 255],
        alpha: parseFloat((scale / 100).toFixed(2)),
        hueShifting:
          this.props.service === 'CREATE'
            ? this.props.shift.hue
            : color.hue?.shift,
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
        hueShifting:
          this.props.service === 'CREATE'
            ? this.props.shift.hue
            : color.hue?.shift,
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
  StopTag = ({ stop }: { stop: string }) => (
    <Chip state="ON_BACKGROUND">{stop}</Chip>
  )

  IntervalTag = ({
    interval,
    lightForeground,
  }: {
    interval: string | React.ReactNode
    lightForeground: HexModel
  }) => (
    <Chip
      state="ON_BACKGROUND"
      leftSlot={
        <ColorChip
          color={lightForeground}
          width="var(--size-pos-xxsmall)"
          height="var(--size-pos-xxsmall)"
          isRounded
        />
      }
    >
      {interval}
    </Chip>
  )

  // Render
  render() {
    let minHeight: string | number = 40

    switch (this.theme) {
      case 'figma':
        minHeight = 40
        break
      case 'penpot':
        minHeight = 40
        break
      case 'sketch':
        minHeight = 40
        break
      case 'framer':
        minHeight = 48
        break
      default:
        minHeight = 40
    }

    const lightForeground = new Color({
      sourceColor: chroma(this.props.textColorsTheme.lightColor).rgb(),
      visionSimulationMode: this.props.visionSimulationMode,
    }).setColor() as HexModel

    const darkForeground = new Color({
      sourceColor: chroma(this.props.textColorsTheme.darkColor).rgb(),
      visionSimulationMode: this.props.visionSimulationMode,
    }).setColor() as HexModel

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
          value: minHeight,
          unit: 'PIXEL',
        }}
        border={['TOP']}
        onCollapse={() => this.setState({ isDrawerCollapsed: true })}
        onExpand={() => this.setState({ isDrawerCollapsed: false })}
        ref={this.drawerRef}
      >
        <Bar
          leftPartSlot={
            <ScoresControls
              {...this.props}
              isDrawerCollapsed={this.state.isDrawerCollapsed}
              isWCAGDisplayed={this.state.isWCAGDisplayed}
              isAPCADisplayed={this.state.isAPCADisplayed}
              isWCAGIntervalDisplayed={this.state.isWCAGIntervalDisplayed}
              isAPCAIntervalDisplayed={this.state.isAPCAIntervalDisplayed}
              scoreFilters={this.state.scoreFilters}
              onToggleDrawer={this.toggleDrawer}
              onUpdateScoreFilters={this.updateScoreFilters}
            />
          }
          rightPartSlot={
            <SettingsControls
              {...this.props}
              isDrawerCollapsed={this.state.isDrawerCollapsed}
              areSourceColorsLocked={this.props.areSourceColorsLocked}
              colorSpace={this.props.colorSpace}
              visionSimulationMode={this.props.visionSimulationMode}
              canResetColors={this.props.colors.some(
                (color) =>
                  (color as SourceColorConfiguration).source === 'COOLORS' ||
                  (color as SourceColorConfiguration).source ===
                    'REALTIME_COLORS' ||
                  (color as SourceColorConfiguration).source === 'COLOUR_LOVERS'
              )}
              onColorSettingsHandler={this.colorSettingsHandler}
              onResetSourceColors={this.props.onResetSourceColors}
            />
          }
          isInverted
          shouldReflow
        />
        {!this.state.isDrawerCollapsed && (
          <div
            className="preview__palette"
            ref={this.paletteContainerRef}
          >
            <div className="preview__header">
              <div className="preview__cell preview__cell--no-height preview__cell--frozen">
                <this.StopTag stop={this.props.t('preview.source.tag')} />
              </div>
              {Object.keys(this.props.scale)
                .reverse()
                .map((scale, index) => {
                  return (
                    <div
                      className="preview__cell preview__cell--no-height"
                      key={index}
                    >
                      <this.StopTag stop={scale} />
                    </div>
                  )
                })}
            </div>
            <div className="preview__rows">
              {this.props.colors
                .filter((color) => {
                  if (this.props.colors.length > 1) {
                    if ('source' in color) return color.source !== 'DEFAULT'
                    return true
                  }
                  return true
                })
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

                  const scaleNames = Object.keys(this.props.scale).reverse()

                  return (
                    <div
                      className="preview__row"
                      key={index}
                    >
                      <Source
                        {...this.props}
                        key="source"
                        id={color.id}
                        name={color.name}
                        color={color.rgb}
                        isTransparent={
                          'alpha' in color ? color.alpha.isEnabled : false
                        }
                        onJumpToColor={(event) => {
                          event.stopPropagation()
                          this.props.onInteractWithSourceColor?.(color.id)
                        }}
                      />
                      {Object.values(scaledColors).map(
                        (scaledColor, shadeIndex) => {
                          const dialogKey = `${index}-${shadeIndex}`
                          const scaleName =
                            scaleNames[shadeIndex] || String(shadeIndex)
                          return (
                            <Shade
                              {...this.props}
                              key={shadeIndex}
                              index={shadeIndex}
                              color={scaledColor}
                              scaleName={scaleName}
                              sourceColor={color}
                              scaledColors={scaledColors}
                              isWCAGDisplayed={this.state.isWCAGDisplayed}
                              isAPCADisplayed={this.state.isAPCADisplayed}
                              isWCAGIntervalDisplayed={
                                this.state.isWCAGIntervalDisplayed
                              }
                              isAPCAIntervalDisplayed={
                                this.state.isAPCAIntervalDisplayed
                              }
                              scoreFilters={this.state.scoreFilters}
                              colorIndex={index}
                              totalColors={
                                this.props.colors.filter((c) => {
                                  if (this.props.colors.length > 1) {
                                    if ('source' in c)
                                      return c.source !== 'DEFAULT'
                                    return true
                                  }
                                  return true
                                }).length
                              }
                              isDialogOpen={
                                this.state.openDialogKey === dialogKey
                              }
                              onOpenDialog={() =>
                                this.openDialog(index, shadeIndex)
                              }
                              onCloseDialog={this.closeDialog}
                              onNavigatePrevious={() =>
                                this.navigateShade(
                                  'previous',
                                  index,
                                  shadeIndex
                                )
                              }
                              onNavigateNext={() =>
                                this.navigateShade('next', index, shadeIndex)
                              }
                            />
                          )
                        }
                      )}
                    </div>
                  )
                })}
            </div>
            {(this.state.isWCAGIntervalDisplayed ||
              this.state.isAPCAIntervalDisplayed) &&
              this.props.colors.length > 1 && (
                <>
                  <Feature
                    isActive={
                      this.features.PREVIEW_SCORES_WCAG_INTERVAL.isActive() &&
                      this.state.isWCAGIntervalDisplayed
                    }
                  >
                    <div className="preview__footer">
                      <div className="preview__cell preview__cell--no-height preview__cell--frozen">
                        <Chip state="ON_BACKGROUND">
                          {this.props.t('preview.score.tags.wcagInterval')}
                        </Chip>
                      </div>
                      {(() => {
                        const contrastRanges = getContrastRangesByColumn({
                          calculateWCAG: true,
                          calculateAPCA: false,
                        })
                        return Object.keys(this.props.scale)
                          .reverse()
                          .map((scaleName, index) => {
                            const rangeData = contrastRanges.get(scaleName)
                            if (!rangeData) return null

                            return (
                              <div
                                className="preview__cell preview__cell--no-height"
                                key={index}
                              >
                                <this.IntervalTag
                                  interval={rangeData.lightWCAG.range.toFixed(
                                    2
                                  )}
                                  lightForeground={lightForeground}
                                />
                                <this.IntervalTag
                                  interval={rangeData.darkWCAG.range.toFixed(2)}
                                  lightForeground={darkForeground}
                                />
                              </div>
                            )
                          })
                      })()}
                    </div>
                  </Feature>
                  <Feature
                    isActive={
                      this.features.PREVIEW_SCORES_APCA_INTERVAL.isActive() &&
                      this.state.isAPCAIntervalDisplayed
                    }
                  >
                    <div className="preview__footer">
                      <div className="preview__cell preview__cell--no-height preview__cell--frozen">
                        <Chip state="ON_BACKGROUND">
                          {this.props.t('preview.score.tags.apcaInterval')}
                        </Chip>
                      </div>
                      {(() => {
                        const contrastRanges = getContrastRangesByColumn({
                          calculateWCAG: false,
                          calculateAPCA: true,
                        })
                        return Object.keys(this.props.scale)
                          .reverse()
                          .map((scaleName, index) => {
                            const rangeData = contrastRanges.get(scaleName)
                            if (!rangeData) return null

                            return (
                              <div
                                className="preview__cell preview__cell--no-height"
                                key={index}
                              >
                                <this.IntervalTag
                                  interval={rangeData.lightAPCA.range.toFixed(
                                    2
                                  )}
                                  lightForeground={lightForeground}
                                />
                                <this.IntervalTag
                                  interval={rangeData.darkAPCA.range.toFixed(2)}
                                  lightForeground={darkForeground}
                                />
                              </div>
                            )
                          })
                      })()}
                    </div>
                  </Feature>
                </>
              )}
          </div>
        )}
      </Drawer>
    )
  }
}
