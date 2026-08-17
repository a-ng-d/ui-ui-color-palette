import { PureComponent } from 'preact/compat'
import { ComponentChildren } from 'preact'
import { HexModel, ScaleConfiguration } from '@yelbolt/engine-ui-color-palette'
import { FeatureStatus } from '@unoff/utils'
import { Chip, ColorChip } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { ContrastColumnRanges } from '../../../utils/contrastRanges'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ContrastIntervalFooterProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  scale: ScaleConfiguration
  isWCAGIntervalDisplayed: boolean
  isAPCAIntervalDisplayed: boolean
  lightForeground: HexModel
  darkForeground: HexModel
  contrastRanges: Map<string, ContrastColumnRanges>
}

export default class ContrastIntervalFooter extends PureComponent<ContrastIntervalFooterProps> {
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
    return ContrastIntervalFooter.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Templates
  IntervalTag = ({
    interval,
    lightForeground,
  }: {
    interval: string | ComponentChildren
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
    const { contrastRanges } = this.props

    return (
      <>
        <Feature
          isActive={
            this.features.PREVIEW_SCORES_WCAG_INTERVAL.isActive() &&
            this.props.isWCAGIntervalDisplayed
          }
        >
          <div className="preview__footer">
            <div className="preview__cell preview__cell--no-height preview__cell--frozen">
              <Chip state="ON_BACKGROUND">
                {this.props.t('preview.score.tags.wcagInterval')}
              </Chip>
            </div>
            {Object.keys(this.props.scale)
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
                      interval={rangeData.lightWCAG.range.toFixed(2)}
                      lightForeground={this.props.lightForeground}
                    />
                    <this.IntervalTag
                      interval={rangeData.darkWCAG.range.toFixed(2)}
                      lightForeground={this.props.darkForeground}
                    />
                  </div>
                )
              })}
          </div>
        </Feature>
        <Feature
          isActive={
            this.features.PREVIEW_SCORES_APCA_INTERVAL.isActive() &&
            this.props.isAPCAIntervalDisplayed
          }
        >
          <div className="preview__footer">
            <div className="preview__cell preview__cell--no-height preview__cell--frozen">
              <Chip state="ON_BACKGROUND">
                {this.props.t('preview.score.tags.apcaInterval')}
              </Chip>
            </div>
            {Object.keys(this.props.scale)
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
                      interval={rangeData.lightAPCA.range.toFixed(2)}
                      lightForeground={this.props.lightForeground}
                    />
                    <this.IntervalTag
                      interval={rangeData.darkAPCA.range.toFixed(2)}
                      lightForeground={this.props.darkForeground}
                    />
                  </div>
                )
              })}
          </div>
        </Feature>
      </>
    )
  }
}
