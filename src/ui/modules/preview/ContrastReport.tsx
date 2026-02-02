import React, { createPortal } from 'react'
import chroma from 'chroma-js'
import {
  ColorConfiguration,
  Contrast,
  HexModel,
  SourceColorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Button,
  Chip,
  Dialog,
  FormItem,
  Input,
  layouts,
  Section,
  SectionTitle,
  SimpleItem,
  SimpleSlider,
  Tabs,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import { BaseProps } from '../../../types/app'

interface ContrastReportProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
  isOpen: boolean
  color: HexModel
  sourceColor: SourceColorConfiguration | ColorConfiguration
  index: number
  scaleName: string
  actualBackground: HexModel
  lightForeground: HexModel
  darkForeground: HexModel
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
}

interface ContrastReportState {
  previewText: string
  textThemeColor: 'LIGHT_TEXT' | 'DARK_TEXT'
  fontWeight: number
}

export default class ContrastReport extends React.PureComponent<
  ContrastReportProps,
  ContrastReportState
> {
  state: ContrastReportState = {
    previewText: this.props.t('contrast.playground.previewText.placeholder'),
    textThemeColor: 'LIGHT_TEXT',
    fontWeight: 400,
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      textThemeColor: (e.currentTarget as HTMLElement).dataset.feature as
        | 'LIGHT_TEXT'
        | 'DARK_TEXT',
    })

  handlePrevious = () => {
    if (this.props.onPrevious) this.props.onPrevious()
  }

  handleNext = () => {
    if (this.props.onNext) this.props.onNext()
  }

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
  getWCAGColorClass = (score: number): string => {
    if (score < 4.5) return texts['type--alert']
    if (score >= 4.5 && score < 7) return texts['type--warning']
    return texts['type--success']
  }

  getAPCAColorClass = (score: number): string => {
    const absScore = Math.abs(score)
    if (absScore < 30) return texts['type--alert']
    if (absScore >= 30 && absScore < 70) return texts['type--warning']
    return texts['type--success']
  }

  getReadabilityScore = (apcaScore: number, fontWeight: number): number => {
    const absScore = Math.abs(apcaScore)
    const maxAPCA = 108

    const baseScore = (absScore / maxAPCA) * 100

    const weightFactor = fontWeight < 400 ? 0.85 : fontWeight > 500 ? 1.15 : 1.0

    const finalScore = Math.min(100, baseScore * weightFactor)
    return Math.round(finalScore)
  }

  // Templates
  ContrastGrid = (
    textColor: HexModel,
    contrast: Contrast,
    wcagScore: number,
    apcaScore: number,
    wcagFriendlyScore: string,
    recommendedUsage:
      | 'UNKNOWN'
      | 'AVOID'
      | 'NON_TEXT'
      | 'SPOT_TEXT'
      | 'HEADLINES'
      | 'BODY_TEXT'
      | 'CONTENT_TEXT'
      | 'FLUENT_TEXT'
  ) => {
    const minFontSizes = contrast.getMinFontSizes()
    const fontWeightIndex = this.state.fontWeight / 100
    const minSize = minFontSizes[fontWeightIndex]
    const readabilityScore = this.getReadabilityScore(
      apcaScore,
      this.state.fontWeight
    )

    return (
      <div className="contrast">
        <div
          className="contrast__preview card"
          style={{
            backgroundColor: this.props.actualBackground,
            gridRow: '1 / span 1',
            gridColumn: '1 / span 2',
          }}
        >
          <div
            className={doClassnames([
              texts['type'],
              texts['type--bold'],
              texts['type--large'],
            ])}
            style={{
              color: textColor,
            }}
          >
            {this.state.previewText}
          </div>
          <svg
            width="70"
            height="20"
            viewBox="0 0 70 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              y="1"
              width="18"
              height="18"
              rx="3"
              fill={textColor}
            />
            <circle
              cx="34"
              cy="10"
              r="10"
              fill={textColor}
            />
            <path
              d="M56.3864 1.52295C57.554 -0.507652 60.446 -0.507649 61.6136 1.52295L69.5833 15.3836C70.7599 17.43 69.3049 20 66.9697 20H51.0303C48.6951 20 47.2401 17.43 48.4167 15.3836L56.3864 1.52295Z"
              fill={textColor}
            />
          </svg>
        </div>
        <div
          className="contrast__score card"
          style={{
            gridRow: '2 / span 1',
            gridColumn: '1 / span 1',
          }}
        >
          <div className={doClassnames([texts['type'], texts['type--small']])}>
            {this.props.t('contrast.score.wcag.title')}
          </div>
          <div
            className={doClassnames([
              texts['type'],
              texts['type--xlarge'],
              texts['type--bold'],
              this.getWCAGColorClass(wcagScore),
            ])}
          >
            {wcagScore.toFixed(2)}
          </div>
          <div
            className={doClassnames([texts['type']])}
            style={{
              display: 'flex',
              gap: 'var(--size-pos-xxxsmall)',
              alignItems: 'center',
            }}
          >
            <span>{wcagFriendlyScore}</span>
            <Chip state={wcagScore >= 4.5 ? 'ACTIVE' : 'INACTIVE'}>
              {wcagScore >= 4.5
                ? this.props.t('contrast.pass')
                : this.props.t('contrast.fail')}
            </Chip>
          </div>
        </div>
        <div
          className="contrast__score card"
          style={{
            gridRow: '2 / span 1',
            gridColumn: '2 / span 1',
          }}
        >
          <div className={doClassnames([texts['type'], texts['type--small']])}>
            {this.props.t('contrast.score.apca.title')}
          </div>
          <div
            className={doClassnames([
              texts['type'],
              texts['type--xlarge'],
              texts['type--bold'],
              this.getAPCAColorClass(apcaScore),
            ])}
          >
            Lc {apcaScore.toFixed(1)}
          </div>
          <div
            className={doClassnames([texts['type']])}
            style={{
              display: 'flex',
              gap: 'var(--size-pos-xxxsmall)',
              alignItems: 'center',
            }}
          >
            <span>{this.recommendationHandler(recommendedUsage)}</span>
            <Chip state={Math.abs(apcaScore) >= 45 ? 'ACTIVE' : 'INACTIVE'}>
              {Math.abs(apcaScore) >= 45
                ? this.props.t('contrast.pass')
                : this.props.t('contrast.fail')}
            </Chip>
          </div>
        </div>
        <div
          className="contrast__score card"
          style={{
            gridRow: '3 / span 1',
            gridColumn: '1 / span 2',
          }}
        >
          <div className={doClassnames([texts['type'], texts['type--small']])}>
            {this.props.t('contrast.score.readability.title')}
          </div>
          <div
            className={doClassnames([
              texts['type'],
              texts['type--xlarge'],
              texts['type--bold'],
              this.getAPCAColorClass(apcaScore),
            ])}
          >
            {`${readabilityScore}%`}
          </div>
        </div>
        <div
          className="contrast__score card"
          style={{
            gridRow: '4 / span 1',
            gridColumn: '1 / span 2',
          }}
        >
          <div className={doClassnames([texts['type'], texts['type--small']])}>
            {this.props.t('contrast.minSizeFont.title')}
          </div>
          <div className={doClassnames([texts['type'], texts['type--xlarge']])}>
            {`${minSize}pt (${this.state.fontWeight})`}
          </div>
          <div
            className="contrast__preview card"
            style={{
              backgroundColor: this.props.actualBackground,
            }}
          >
            <span
              className={doClassnames([texts['type']])}
              style={{
                fontSize: `${minSize}px`,
                fontWeight: this.state.fontWeight,
                color: textColor,
                lineHeight: 1.2,
              }}
            >
              {this.state.previewText}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Render
  render() {
    if (!this.props.isOpen) return null

    const lightForegroundContrast = new Contrast({
      backgroundColor: chroma(this.props.actualBackground).rgb(false),
      textColor: this.props.lightForeground,
    })
    const darkForegroundContrast = new Contrast({
      backgroundColor: chroma(this.props.actualBackground).rgb(false),
      textColor: this.props.darkForeground,
    })

    const lightWCAGScore = lightForegroundContrast.getWCAGContrast()
    const darkWCAGScore = darkForegroundContrast.getWCAGContrast()
    const lightAPCAScore = lightForegroundContrast.getAPCAContrast()
    const darkAPCAScore = darkForegroundContrast.getAPCAContrast()
    const lightWCAGFriendlyScore = lightForegroundContrast.getWCAGScore()
    const darkWCAGFriendlyScore = darkForegroundContrast.getWCAGScore()
    const lightRecommendedUsage = lightForegroundContrast.getRecommendedUsage()
    const darkRecommendedUsage = darkForegroundContrast.getRecommendedUsage()

    return (
      document.getElementById('modal') &&
      createPortal(
        <Dialog
          title={this.props.t('contrast.title')}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              maxWidth: '100%',
            }}
          >
            <Bar
              leftPartSlot={
                <SectionTitle
                  label={`${this.props.sourceColor.name} ${this.props.scaleName}`}
                />
              }
              rightPartSlot={
                <div className={layouts['snackbar--medium']}>
                  <Button
                    type="icon"
                    icon="back"
                    helper={{
                      label: this.props.t('contrast.actions.previous'),
                    }}
                    isDisabled={!this.props.onPrevious}
                    action={this.handlePrevious}
                  />
                  <Button
                    type="icon"
                    icon="forward"
                    helper={{
                      label: this.props.t('contrast.actions.next'),
                    }}
                    isDisabled={!this.props.onNext}
                    action={this.handleNext}
                  />
                </div>
              }
              clip={['LEFT']}
              border={['BOTTOM']}
            />
            <Section
              id="contrast-playground"
              title={
                <SimpleItem
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.t('contrast.playground.title')}
                    />
                  }
                  isListItem={false}
                  alignment="CENTER"
                />
              }
              body={[
                {
                  node: (
                    <FormItem
                      id="contrast-preview-text"
                      label={this.props.t(
                        'contrast.playground.previewText.label'
                      )}
                    >
                      <Input
                        id="contrast-preview-text"
                        type="LONG_TEXT"
                        value={this.state.previewText}
                        placeholder={this.props.t(
                          'contrast.playground.previewText.placeholder'
                        )}
                        isGrowing
                        onChange={(e) => {
                          this.setState({
                            previewText: (e.target as HTMLInputElement).value,
                          })
                        }}
                      />
                    </FormItem>
                  ),
                },
                {
                  node: (
                    <FormItem
                      id="contrast-preview-text"
                      label={this.props.t(
                        'contrast.playground.fontWeight.label'
                      )}
                    >
                      <SimpleSlider
                        id="update-font-weight"
                        label={this.props.t(
                          'contrast.playground.fontWeight.slider'
                        )}
                        value={this.state.fontWeight}
                        min={100}
                        max={900}
                        step={100}
                        colors={{
                          min: 'hsl(187, 0%, 75%)',
                          max: 'hsl(187, 0%, 75%)',
                        }}
                        onChange={(_: string, __: string, value: number) =>
                          this.setState({ fontWeight: value })
                        }
                      />
                    </FormItem>
                  ),
                },
              ]}
              border={['BOTTOM']}
            />
            <Section
              id="contrast-report"
              title={
                <SimpleItem
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.t('contrast.details.title')}
                    />
                  }
                  isListItem={false}
                  alignment="CENTER"
                />
              }
              body={[
                {
                  node: (
                    <Tabs
                      tabs={[
                        {
                          label: this.props.t(
                            'contrast.foregroundColors.light'
                          ),
                          id: 'LIGHT_TEXT',
                          isUpdated: false,
                          isNew: false,
                        },
                        {
                          label: this.props.t('contrast.foregroundColors.dark'),
                          id: 'DARK_TEXT',
                          isUpdated: false,
                          isNew: false,
                        },
                      ]}
                      active={this.state.textThemeColor}
                      isFlex
                      action={this.navHandler}
                    />
                  ),
                },
                {
                  node: (
                    <>
                      {this.state.textThemeColor === 'LIGHT_TEXT' &&
                        this.ContrastGrid(
                          this.props.lightForeground,
                          lightForegroundContrast,
                          lightWCAGScore,
                          lightAPCAScore,
                          lightWCAGFriendlyScore,
                          lightRecommendedUsage
                        )}
                      {this.state.textThemeColor === 'DARK_TEXT' &&
                        this.ContrastGrid(
                          this.props.darkForeground,
                          darkForegroundContrast,
                          darkWCAGScore,
                          darkAPCAScore,
                          darkWCAGFriendlyScore,
                          darkRecommendedUsage
                        )}
                    </>
                  ),
                },
              ]}
            />
          </div>
        </Dialog>,
        document.getElementById('modal') ?? document.createElement('app')
      )
    )
  }
}
