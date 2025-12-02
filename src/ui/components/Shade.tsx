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
import { Chip, ColorChip, Icon } from '@a_ng_d/figmug-ui'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { trackPreviewManagementEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'
import { WithTranslationProps } from './WithTranslation'
import { WithConfigProps } from './WithConfig'
import Feature from './Feature'

interface ShadeProps extends BaseProps, WithConfigProps, WithTranslationProps {
  index: number
  color: HexModel
  sourceColor: SourceColorConfiguration | ColorConfiguration
  scaledColors: HexModel[]
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  areSourceColorsLocked: LockedSourceColorsConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeConfiguration<'HEX'>
}

interface ShadeStates {
  isCompact: boolean
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
  })

  constructor(props: ShadeProps) {
    super(props)
    this.state = {
      isCompact: false,
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

      sendPluginMessage(
        {
          pluginMessage: {
            type: 'POST_MESSAGE',
            data: {
              type: 'INFO',
              message: this.props.t('info.copiedCode'),
            },
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
    isCompact,
  }: {
    color: HexModel
    score: number
    friendlyScore: string
    isCompact: boolean
  }) => (
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
      {!isCompact ? `${score.toFixed(2)} : 1` : friendlyScore}
    </Chip>
  )

  apcaScoreTag = ({
    color,
    score,
    friendlyScore,
    isCompact,
  }: {
    color: HexModel
    score: number
    friendlyScore: string
    isCompact: boolean
  }) => (
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
      {!isCompact ? `Lc ${score.toFixed(1)}` : friendlyScore}
    </Chip>
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

  copiedColorTag = () => {
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
              iconName="draft"
            />
          </div>
        }
      ></Chip>
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

    const darkText = new Color({
      sourceColor: chroma(this.props.textColorsTheme.darkColor).rgb(),
      visionSimulationMode: this.props.visionSimulationMode,
    }).setColor() as HexModel
    const lightText = new Color({
      sourceColor: chroma(this.props.textColorsTheme.lightColor).rgb(),
      visionSimulationMode: this.props.visionSimulationMode,
    }).setColor() as HexModel

    const lightTextContrast = new Contrast({
      backgroundColor: chroma(background).rgb(false),
      textColor: lightText,
    })
    const darkTextContrast = new Contrast({
      backgroundColor: chroma(background).rgb(false),
      textColor: darkText,
    })

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
        onMouseEnter={() => this.setState({ isCompact: true })}
        onMouseLeave={() => this.setState({ isCompact: false })}
        onMouseDown={() => {
          if (
            Shade.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).PREVIEW_SHADE_HEX.isActive()
          )
            return this.onCopyHex()
        }}
      >
        {this.props.isWCAGDisplayed && (
          <this.wcagScoreTag
            color={lightText}
            score={lightTextContrast.getWCAGContrast()}
            friendlyScore={lightTextContrast.getWCAGScore()}
            isCompact={this.state.isCompact}
          />
        )}
        {this.props.isAPCADisplayed && (
          <this.apcaScoreTag
            color={lightText}
            score={lightTextContrast.getAPCAContrast()}
            friendlyScore={this.recommendationHandler(
              lightTextContrast.getRecommendedUsage()
            )}
            isCompact={this.state.isCompact}
          />
        )}
        {this.props.isWCAGDisplayed && (
          <this.wcagScoreTag
            color={darkText}
            score={darkTextContrast.getWCAGContrast()}
            friendlyScore={darkTextContrast.getWCAGScore()}
            isCompact={this.state.isCompact}
          />
        )}
        {this.props.isAPCADisplayed && (
          <this.apcaScoreTag
            color={darkText}
            score={darkTextContrast.getAPCAContrast()}
            friendlyScore={this.recommendationHandler(
              darkTextContrast.getRecommendedUsage()
            )}
            isCompact={this.state.isCompact}
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
        <Feature
          isActive={
            Shade.features(
              this.props.planStatus,
              this.props.config,
              this.props.service,
              this.props.editor
            ).PREVIEW_SHADE_HEX.isActive() && this.state.isCompact
          }
        >
          <this.copiedColorTag />
        </Feature>
      </div>
    )
  }
}
