import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { Chip, ColorChip, Icon } from '@a_ng_d/figmug-ui'
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
import { BaseProps } from '../../types/app'

interface ShadeProps extends BaseProps {
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
}

export default class Shade extends PureComponent<ShadeProps, ShadeStates> {
  private theme: string | null

  constructor(props: ShadeProps) {
    super(props)
    this.state = {
      isCompact: false,
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
      AVOID: () => this.props.locals.paletteProperties.avoid,
      NON_TEXT: () => this.props.locals.paletteProperties.nonText,
      SPOT_TEXT: () => this.props.locals.paletteProperties.spotText,
      HEADLINES: () => this.props.locals.paletteProperties.headlines,
      BODY_TEXT: () => this.props.locals.paletteProperties.bodyText,
      CONTENT_TEXT: () => this.props.locals.paletteProperties.contentText,
      FLUENT_TEXT: () => this.props.locals.paletteProperties.fluentText,
    }

    return (
      actions[recommendation]?.() ?? this.props.locals.paletteProperties.unknown
    )
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
          width="var(--size-xxsmall)"
          height="var(--size-xxsmall)"
          isRounded
        />
      }
      rightSlot={
        <span
          style={{
            fontSize: '10px',
          }}
        >
          {score <= 4.5 ? '✘' : '✔'}
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
          width="var(--size-xxsmall)"
          height="var(--size-xxsmall)"
          isRounded
        />
      }
      rightSlot={
        <span
          style={{
            fontSize: '10px',
          }}
        >
          {score <= 45 ? '✘' : '✔'}
        </span>
      }
    >
      {!isCompact ? `Lc ${score.toFixed(1)}` : friendlyScore}
    </Chip>
  )

  lockColorTag = () => (
    <Chip
      state="ON_BACKGROUND"
      leftSlot={
        <div
          style={{
            width: 'var(--size-xxsmall)',
            height: 'var(--size-xxsmall)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '--icon-picto-color': 'black',
            '--icon-width': 'var(--size-xmsmall)',
            '--icon-height': 'var(--size-xmsmall)',
          }}
        >
          <Icon
            type="PICTO"
            iconName="lock-on"
          />
        </div>
      }
    >
      {this.props.locals.preview.lock.tag}
    </Chip>
  )

  closestColorTag = () => (
    <Chip
      state="ON_BACKGROUND"
      leftSlot={
        <div
          style={{
            width: 'var(--size-xxsmall)',
            height: 'var(--size-xxsmall)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '--icon-picto-color': 'black',
            '--icon-width': 'var(--size-xmsmall)',
            '--icon-height': 'var(--size-xmsmall)',
          }}
        >
          <Icon
            type="PICTO"
            iconName="resize-to-fit"
          />
        </div>
      }
    >
      {this.props.locals.preview.closest.tag}
    </Chip>
  )

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
        className="preview__cell"
        style={{
          backgroundColor: background,
        }}
        onMouseEnter={() => this.setState({ isCompact: true })}
        onMouseLeave={() => this.setState({ isCompact: false })}
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
      </div>
    )
  }
}
