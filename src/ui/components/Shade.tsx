import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  Color,
  ColorConfiguration,
  Contrast,
  HexModel,
  LockedSourceColorsConfiguration,
  SourceColorConfiguration,
  TextColorsThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Button, Chip, ColorChip, Icon, layouts } from '@a_ng_d/figmug-ui'
import ContrastReport from '../modules/preview/ContrastReport'
import { sendPluginMessage } from '../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  PlanStatus,
  ScoreFilterStatus,
  Service,
} from '../../types/app'
import { setContrastScore } from '../../stores/contrasts'
import { trackPreviewManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import { WithTranslationProps } from './WithTranslation'
import { WithConfigProps } from './WithConfig'
import Feature from './Feature'

interface ShadeProps extends BaseProps, WithConfigProps, WithTranslationProps {
  index: number
  color: HexModel
  scaleName: string
  sourceColor: SourceColorConfiguration | ColorConfiguration
  scaledColors: HexModel[]
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  isWCAGIntervalDisplayed: boolean
  isAPCAIntervalDisplayed: boolean
  areSourceColorsLocked: LockedSourceColorsConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  scoreFilters: {
    lightWCAG: ScoreFilterStatus
    lightAPCA: ScoreFilterStatus
    darkWCAG: ScoreFilterStatus
    darkAPCA: ScoreFilterStatus
  }
  totalColors?: number
  colorIndex?: number
  allColors?: Array<{
    sourceColor: SourceColorConfiguration | ColorConfiguration
    scaledColors: HexModel[]
  }>
  isDialogOpen?: boolean
  onOpenDialog?: () => void
  onCloseDialog?: () => void
  onNavigatePrevious?: () => void
  onNavigateNext?: () => void
}

interface ShadeStates {
  isMouseEnter: boolean
  isCopied: boolean
}

export default class Shade extends PureComponent<ShadeProps, ShadeStates> {
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW_SHADE_HEX: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SHADE_HEX',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_SHADE_REPORT: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SHADE_REPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_SCORES_WCAG_SCORE: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SCORES_WCAG_SCORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_SCORES_APCA_SCORE: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SCORES_APCA_SCORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Shade.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ShadeProps) {
    super(props)
    this.state = {
      isMouseEnter: false,
      isCopied: false,
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Handlers
  recommendationHandler = (
    recommendation:
      | 'UNKNOWN'
      | 'AVOID'
      | 'NON_TEXT'
      | 'SPOT_TEXT'
      | 'HEADLINES'
      | 'BODY_TEXT'
      | 'CONTENT_TEXT'
      | 'FLUENT_TEXT'
  ): string => {
    const actions: { [key: string]: () => string } = {
      AVOID: () => this.props.t('paletteProperties.avoid'),
      NON_TEXT: () => this.props.t('paletteProperties.nonText'),
      SPOT_TEXT: () => this.props.t('paletteProperties.spotText'),
      HEADLINES: () => this.props.t('paletteProperties.headlines'),
      BODY_TEXT: () => this.props.t('paletteProperties.bodyText'),
      CONTENT_TEXT: () => this.props.t('paletteProperties.contentText'),
      FLUENT_TEXT: () => this.props.t('paletteProperties.fluentText'),
    }

    return (
      actions[recommendation]?.() ?? this.props.t('paletteProperties.unknown')
    )
  }

  // Direct Actions
  onCopyHex = () => {
    if (!this.props.color) return

    try {
      const textarea = document.createElement('textarea')
      textarea.value = this.props.color

      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      textarea.style.top = '0'
      textarea.setAttribute('readonly', '')

      document.body.appendChild(textarea)

      textarea.select()

      document.execCommand('copy')
      document.body.removeChild(textarea)

      this.setState({ isCopied: true })
      setTimeout(() => {
        this.setState({ isCopied: false })
      }, 2000)

      trackPreviewManagementEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'COPY_COLOR_HEX',
        }
      )
    } catch (error) {
      console.error(error)
      sendPluginMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              style: 'WARNING',
              message: this.props.t('warning.uncopiedCode'),
            },
          },
        },
        '*'
      )
    }
  }

  // Templates
  wcagScoreTag = ({
    color,
    score,
    friendlyScore,
    isMouseEnter,
  }: {
    color: HexModel
    score: number
    friendlyScore: string
    isMouseEnter: boolean
  }) => (
    <Feature
      isActive={Shade.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).PREVIEW_SCORES_WCAG_SCORE.isActive()}
    >
      <Chip
        state="ON_BACKGROUND"
        leftSlot={
          <ColorChip
            color={color}
            width="var(--size-pos-xxsmall)"
            height="var(--size-pos-xxsmall)"
            isRounded
          />
        }
        rightSlot={
          <span
            style={{
              fontSize: '10px',
            }}
          >
            {score <= 4.5 ? this.props.t('fail') : this.props.t('pass')}
          </span>
        }
      >
        {!isMouseEnter ? `${score.toFixed(2)} : 1` : friendlyScore}
      </Chip>
    </Feature>
  )

  apcaScoreTag = ({
    color,
    score,
    friendlyScore,
    isMouseEnter,
  }: {
    color: HexModel
    score: number
    friendlyScore: string
    isMouseEnter: boolean
  }) => (
    <Feature
      isActive={Shade.features(
        this.props.planStatus,
        this.props.config,
        this.props.service,
        this.props.editor
      ).PREVIEW_SCORES_APCA_SCORE.isActive()}
    >
      <Chip
        state="ON_BACKGROUND"
        leftSlot={
          <ColorChip
            color={color}
            width="var(--size-pos-xxsmall)"
            height="var(--size-pos-xxsmall)"
            isRounded
          />
        }
        rightSlot={
          <span
            style={{
              fontSize: '10px',
            }}
          >
            {score <= 45 ? this.props.t('fail') : this.props.t('pass')}
          </span>
        }
      >
        {!isMouseEnter ? `Lc ${score.toFixed(1)}` : friendlyScore}
      </Chip>
    </Feature>
  )

  lockColorTag = () => {
    return (
      <Chip
        state="ON_BACKGROUND"
        leftSlot={
          <div
            style={{
              width: 'var(--size-pos-xxsmall)',
              height: 'var(--size-pos-xxsmall)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '--icon-picto-color': 'black',
              '--icon-width': 'var(--size-pos-xsmall)',
              '--icon-height': 'var(--size-pos-xsmall)',
            }}
          >
            <Icon
              type="PICTO"
              iconName="lock-on"
            />
          </div>
        }
      >
        {this.props.t('preview.lock.tag')}
      </Chip>
    )
  }

  closestColorTag = () => {
    return (
      <Chip
        state="ON_BACKGROUND"
        leftSlot={
          <div
            style={{
              width: 'var(--size-pos-xxsmall)',
              height: 'var(--size-pos-xxsmall)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '--icon-picto-color': 'black',
              '--icon-width': 'var(--size-pos-xsmall)',
              '--icon-height': 'var(--size-pos-xsmall)',
            }}
          >
            <Icon
              type="PICTO"
              iconName="resize-to-fit"
            />
          </div>
        }
      >
        {this.props.t('preview.closest.tag')}
      </Chip>
    )
  }

  // Render
  render() {
    const sourceColor = chroma([
      this.props.sourceColor.rgb.r * 255,
      this.props.sourceColor.rgb.g * 255,
      this.props.sourceColor.rgb.b * 255,
    ]).hex()
    const distances = this.props.scaledColors.map((scaledColor) =>
      chroma.distance(sourceColor, scaledColor, 'rgb')
    )
    const minDistanceIndex = distances.indexOf(Math.min(...distances))
    const distance: number = chroma.distance(
      chroma([
        this.props.sourceColor.rgb.r * 255,
        this.props.sourceColor.rgb.g * 255,
        this.props.sourceColor.rgb.b * 255,
      ]).hex(),
      this.props.color,
      'rgb'
    )

    const background: HexModel =
      this.props.index === minDistanceIndex &&
      this.props.areSourceColorsLocked &&
      !(
        'alpha' in this.props.sourceColor &&
        this.props.sourceColor.alpha.isEnabled
      )
        ? (new Color({
            sourceColor: chroma(sourceColor).rgb(),
            visionSimulationMode: this.props.visionSimulationMode,
          }).setColor() as HexModel)
        : this.props.color

    const darkForeground = new Color({
      sourceColor: chroma(this.props.textColorsTheme.darkColor).rgb(),
      visionSimulationMode: this.props.visionSimulationMode,
    }).setColor() as HexModel
    const lightForeground = new Color({
      sourceColor: chroma(this.props.textColorsTheme.lightColor).rgb(),
      visionSimulationMode: this.props.visionSimulationMode,
    }).setColor() as HexModel

    const lightForegroundContrast = new Contrast({
      backgroundColor: chroma(background).rgb(false),
      textColor: lightForeground,
    })
    const darkForegroundContrast = new Contrast({
      backgroundColor: chroma(background).rgb(false),
      textColor: darkForeground,
    })

    const filters = this.props.scoreFilters
    const isWCAGFilterActive =
      filters.lightWCAG !== 'ALL' || filters.darkWCAG !== 'ALL'
    const isAPCAFilterActive =
      filters.lightAPCA !== 'ALL' || filters.darkAPCA !== 'ALL'

    const shouldCalculateWCAG =
      this.props.isWCAGDisplayed ||
      this.props.isWCAGIntervalDisplayed ||
      isWCAGFilterActive
    const shouldCalculateAPCA =
      this.props.isAPCADisplayed ||
      this.props.isAPCAIntervalDisplayed ||
      isAPCAFilterActive

    let lightWCAGScore = 0
    let darkWCAGScore = 0
    let lightAPCAScore = 0
    let darkAPCAScore = 0
    let lightWCAGFriendlyScore = ''
    let darkWCAGFriendlyScore = ''
    let lightRecommendedUsage: ReturnType<
      typeof lightForegroundContrast.getRecommendedUsage
    > = 'UNKNOWN'
    let darkRecommendedUsage: ReturnType<
      typeof darkForegroundContrast.getRecommendedUsage
    > = 'UNKNOWN'

    if (shouldCalculateWCAG) {
      lightWCAGScore = lightForegroundContrast.getWCAGContrast()
      darkWCAGScore = darkForegroundContrast.getWCAGContrast()
      lightWCAGFriendlyScore = lightForegroundContrast.getWCAGScore()
      darkWCAGFriendlyScore = darkForegroundContrast.getWCAGScore()
    }

    if (shouldCalculateAPCA) {
      lightAPCAScore = lightForegroundContrast.getAPCAContrast()
      darkAPCAScore = darkForegroundContrast.getAPCAContrast()
      lightRecommendedUsage = lightForegroundContrast.getRecommendedUsage()
      darkRecommendedUsage = darkForegroundContrast.getRecommendedUsage()
    }

    if (shouldCalculateWCAG || shouldCalculateAPCA)
      setContrastScore({
        colorId: this.props.sourceColor.id,
        colorName: this.props.sourceColor.name,
        scaleName: this.props.scaleName,
        shadeIndex: this.props.index,
        lightWCAG: lightWCAGScore,
        darkWCAG: darkWCAGScore,
        lightAPCA: lightAPCAScore,
        darkAPCA: darkAPCAScore,
        lightWCAGFriendly: lightWCAGFriendlyScore,
        darkWCAGFriendly: darkWCAGFriendlyScore,
      })

    let isOutOfResults = false
    if (isWCAGFilterActive || isAPCAFilterActive) {
      const lightWCAGPass = lightWCAGScore > 4.5
      const darkWCAGPass = darkWCAGScore > 4.5
      const lightAPCAPass = lightAPCAScore > 45
      const darkAPCAPass = darkAPCAScore > 45

      const activeMatches: boolean[] = []

      if (filters.lightWCAG !== 'ALL') {
        const match =
          (filters.lightWCAG === 'PASS' && lightWCAGPass) ||
          (filters.lightWCAG === 'FAIL' && !lightWCAGPass)
        activeMatches.push(match)
      }

      if (filters.lightAPCA !== 'ALL') {
        const match =
          (filters.lightAPCA === 'PASS' && lightAPCAPass) ||
          (filters.lightAPCA === 'FAIL' && !lightAPCAPass)
        activeMatches.push(match)
      }

      if (filters.darkWCAG !== 'ALL') {
        const match =
          (filters.darkWCAG === 'PASS' && darkWCAGPass) ||
          (filters.darkWCAG === 'FAIL' && !darkWCAGPass)
        activeMatches.push(match)
      }

      if (filters.darkAPCA !== 'ALL') {
        const match =
          (filters.darkAPCA === 'PASS' && darkAPCAPass) ||
          (filters.darkAPCA === 'FAIL' && !darkAPCAPass)
        activeMatches.push(match)
      }

      isOutOfResults = activeMatches.length > 0 && !activeMatches.some((m) => m)
    }

    return (
      <div
        className={doClassnames([
          'preview__cell',
          (this.props.isAPCADisplayed || this.props.isWCAGDisplayed) &&
            'preview__cell--medium',
          this.props.isAPCADisplayed &&
            this.props.isWCAGDisplayed &&
            'preview__cell--large',
        ])}
        style={{
          backgroundColor: background,
        }}
        onMouseEnter={() => this.setState({ isMouseEnter: true })}
        onMouseLeave={() => this.setState({ isMouseEnter: false })}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#CCC',
            opacity: 0.8,
            pointerEvents: 'none',
            visibility: isOutOfResults ? 'visible' : 'hidden',
            zIndex: 2,
          }}
        />
        {this.props.isWCAGDisplayed && (
          <this.wcagScoreTag
            color={lightForeground}
            score={lightWCAGScore}
            friendlyScore={lightWCAGFriendlyScore}
            isMouseEnter={this.state.isMouseEnter}
          />
        )}
        {this.props.isAPCADisplayed && (
          <this.apcaScoreTag
            color={lightForeground}
            score={lightAPCAScore}
            friendlyScore={this.recommendationHandler(lightRecommendedUsage)}
            isMouseEnter={this.state.isMouseEnter}
          />
        )}
        {this.props.isWCAGDisplayed && (
          <this.wcagScoreTag
            color={darkForeground}
            score={darkWCAGScore}
            friendlyScore={darkWCAGFriendlyScore}
            isMouseEnter={this.state.isMouseEnter}
          />
        )}
        {this.props.isAPCADisplayed && (
          <this.apcaScoreTag
            color={darkForeground}
            score={darkAPCAScore}
            friendlyScore={this.recommendationHandler(darkRecommendedUsage)}
            isMouseEnter={this.state.isMouseEnter}
          />
        )}
        {this.props.index === minDistanceIndex &&
          this.props.areSourceColorsLocked &&
          !(
            'alpha' in this.props.sourceColor &&
            this.props.sourceColor.alpha.isEnabled
          ) && <this.lockColorTag />}
        {distance < 4 && !this.props.areSourceColorsLocked && (
          <this.closestColorTag />
        )}
        {this.state.isMouseEnter && (
          <div
            className={doClassnames([
              'preview__cell__actions',
              layouts['snackbar--medium'],
            ])}
          >
            <Feature isActive={this.features.PREVIEW_SHADE_HEX.isActive()}>
              <Button
                type="icon"
                icon={this.state.isCopied ? 'check' : 'draft'}
                size="small"
                helper={{
                  label: this.props.t('preview.actions.copyHex'),
                  pin: 'TOP',
                }}
                action={this.onCopyHex}
              />
            </Feature>
            <Feature isActive={this.features.PREVIEW_SHADE_REPORT.isActive()}>
              <Button
                type="icon"
                icon="info"
                size="small"
                helper={{
                  label: this.props.t('preview.actions.showDetails'),
                  pin: 'TOP',
                }}
                action={() => this.props.onOpenDialog?.()}
              />
            </Feature>
          </div>
        )}
        <ContrastReport
          {...this.props}
          isOpen={this.props.isDialogOpen ?? false}
          color={this.props.color}
          sourceColor={this.props.sourceColor}
          index={this.props.index}
          scaleName={this.props.scaleName}
          actualBackground={background}
          lightForeground={lightForeground}
          darkForeground={darkForeground}
          onClose={() => this.props.onCloseDialog?.()}
          onPrevious={this.props.onNavigatePrevious}
          onNext={this.props.onNavigateNext}
        />
      </div>
    )
  }
}
