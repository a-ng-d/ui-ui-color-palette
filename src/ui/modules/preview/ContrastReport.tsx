import React, { createPortal } from 'react'
import chroma from 'chroma-js'
import {
  ColorConfiguration,
  Contrast,
  HexModel,
  SourceColorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
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
  SemanticMessage,
  SimpleItem,
  SimpleSlider,
  Tabs,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../..'

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
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW_SHADE_REPORT: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SHADE_REPORT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return ContrastReport.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: ContrastReportProps) {
    super(props)
    this.state = {
      previewText: this.props.t('contrast.playground.previewText.placeholder'),
      textThemeColor: 'LIGHT_TEXT',
      fontWeight: 400,
    }
    this.theme = document.documentElement.getAttribute('data-theme')
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
      | 'FLUENT_TEXT',
    actualBackground: HexModel
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
            backgroundColor: actualBackground,
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
              d="M57.0052 2.4468C58.1197 0.517731 60.8803 0.517734 61.9948 2.4468L69.6022 15.6144C70.7254 17.5585 69.3365 20 67.1074 20H51.8926C49.6635 20 48.2746 17.5585 49.3978 15.6144L57.0052 2.4468Z"
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
              backgroundColor: actualBackground,
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

    let padding
    let background

    switch (this.theme) {
      case 'figma':
        padding = 'var(--size-null) var(--size-null)'
        background = 'var(--figma-color-bg)'
        break
      case 'penpot':
        padding = 'var(--size-null) var(--size-pos-xsmall)'
        background = 'var(--penpot-color-background-primary)'
        break
      case 'sketch':
        padding = 'var(--size-null) var(--size-pos-xsmall)'
        background = 'var(--sketch-color-background-primary)'
        break
      case 'framer':
        padding = 'var(--size-null) var(--size-pos-xxxsmall)'
        background = 'var(--framer-color-bg)'
        break
      default:
        padding = 'var(--size-null) var(--size-null)'
        background = 'var(--figma-color-bg)'
    }

    const isBlocked = this.features.PREVIEW_SHADE_REPORT.isBlocked()

    const templateBackground: HexModel = '#88ebf9'
    const templateLightForeground: HexModel = '#ffffff'
    const templateDarkForeground: HexModel = '#000000'

    const actualBackground = isBlocked
      ? templateBackground
      : this.props.actualBackground
    const lightForeground = isBlocked
      ? templateLightForeground
      : this.props.lightForeground
    const darkForeground = isBlocked
      ? templateDarkForeground
      : this.props.darkForeground

    const lightForegroundContrast = new Contrast({
      backgroundColor: chroma(actualBackground).rgb(false),
      textColor: lightForeground,
    })
    const darkForegroundContrast = new Contrast({
      backgroundColor: chroma(actualBackground).rgb(false),
      textColor: darkForeground,
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
        <Feature isActive={this.features.PREVIEW_SHADE_REPORT.isActive()}>
          <Dialog
            title={this.props.t('contrast.title')}
            pin="RIGHT"
            onClose={this.props.onClose}
          >
            <Feature isActive={isBlocked}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'end',
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(0deg, ${background} 20%, rgba(255, 255, 255, 0))`,
                  zIndex: 2,
                }}
              >
                <SemanticMessage
                  type="NEUTRAL"
                  message={this.props.t('contrast.callout.message')}
                  orientation="VERTICAL"
                  actionsSlot={
                    <Button
                      type="secondary"
                      label={this.props.t('plan.getPro')}
                      action={() =>
                        sendPluginMessage(
                          {
                            pluginMessage: {
                              type: 'GET_PRO',
                            },
                          },
                          '*'
                        )
                      }
                    />
                  }
                />
              </div>
            </Feature>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                maxWidth: '100%',
                padding: padding,
                boxSizing: 'border-box',
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
                      icon="upward"
                      helper={{
                        label: this.props.t('contrast.actions.previous'),
                      }}
                      isDisabled={!this.props.onPrevious}
                      action={this.handlePrevious}
                    />
                    <Button
                      type="icon"
                      icon="downward"
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
              <Feature isActive={!isBlocked}>
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
                                previewText: (e.target as HTMLInputElement)
                                  .value,
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
                              min: 'hsl(187, 0%, 75%, 0)',
                              max: 'hsl(187, 0%, 75%, 0)',
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
              </Feature>
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
                            label: this.props.t(
                              'contrast.foregroundColors.dark'
                            ),
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
                            lightForeground,
                            lightForegroundContrast,
                            lightWCAGScore,
                            lightAPCAScore,
                            lightWCAGFriendlyScore,
                            lightRecommendedUsage,
                            actualBackground
                          )}
                        {this.state.textThemeColor === 'DARK_TEXT' &&
                          this.ContrastGrid(
                            darkForeground,
                            darkForegroundContrast,
                            darkWCAGScore,
                            darkAPCAScore,
                            darkWCAGFriendlyScore,
                            darkRecommendedUsage,
                            actualBackground
                          )}
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </Dialog>
        </Feature>,
        document.getElementById('modal') ?? document.createElement('app')
      )
    )
  }
}
