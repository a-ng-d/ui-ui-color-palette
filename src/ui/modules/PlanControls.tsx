import React, { PureComponent } from 'react'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import { Button, Chip, IconChip, layouts, texts } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $creditsCount } from '../../stores/credits'
import { getTolgee } from '../../external/translation'
import { ConfigContextType } from '../../config/ConfigContext'

interface PlanControlsState {
  creditsCount: number
}

interface PlanControlsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  trialRemainingTime: number
  creditsRenewalDate: number
}

export default class PlanControls extends PureComponent<
  PlanControlsProps,
  PlanControlsState
> {
  private subscribeCredits: (() => void) | null = null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    INVOLVE_FEEDBACK: new FeatureStatus({
      features: config.features,
      featureName: 'INVOLVE_FEEDBACK',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_COOLORS: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_COOLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    IMPORTS_REALTIME_COLORS: new FeatureStatus({
      features: config.features,
      featureName: 'IMPORTS_REALTIME_COLORS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPLORE: new FeatureStatus({
      features: config.features,
      featureName: 'EXPLORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXTRACT: new FeatureStatus({
      features: config.features,
      featureName: 'EXTRACT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    GEN: new FeatureStatus({
      features: config.features,
      featureName: 'GEN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SYNC_LOCAL_STYLES: new FeatureStatus({
      features: config.features,
      featureName: 'SYNC_LOCAL_STYLES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    SYNC_LOCAL_VARIABLES: new FeatureStatus({
      features: config.features,
      featureName: 'SYNC_LOCAL_VARIABLES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_PALETTE_PROPERTIES: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PALETTE_PROPERTIES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_SHEET: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_SHEET',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    DOCUMENT_PUSH_UPDATES: new FeatureStatus({
      features: config.features,
      featureName: 'DOCUMENT_PUSH_UPDATES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VIEWS_PALETTE: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_PALETTE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VIEWS_PALETTE_WITH_PROPERTIES: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_PALETTE_WITH_PROPERTIES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    VIEWS_SHEET: new FeatureStatus({
      features: config.features,
      featureName: 'VIEWS_SHEET',
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
  })

  private get features() {
    return PlanControls.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: PlanControlsProps) {
    super(props)
    this.state = {
      creditsCount: $creditsCount.value,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribeCredits = $creditsCount.subscribe((value) => {
      let adjustedValue = value
      if (adjustedValue < 0) adjustedValue = 0
      this.setState({ creditsCount: adjustedValue })
    })
  }

  componentWillUnmount = () => {
    if (this.subscribeCredits) this.subscribeCredits()
  }

  // Templates
  Fees = (): React.ReactNode => {
    return (
      <ul className="list-item">
        {this.features.IMPORTS_COOLORS.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.importCoolors', {
              fee: this.props.config.fees.coolorsImport,
            })}
          </li>
        )}
        {this.features.IMPORTS_REALTIME_COLORS.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.importRealtimeColors', {
              fee: this.props.config.fees.realtimeColorsImport,
            })}
          </li>
        )}
        {this.features.EXPLORE.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.importColourLovers', {
              fee: this.props.config.fees.colourLoversImport,
            })}
          </li>
        )}
        {this.features.GEN.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.generateAiColors', {
              fee: this.props.config.fees.aiColorsGenerate,
            })}
          </li>
        )}
        {this.features.EXTRACT.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.extractImageColors', {
              fee: this.props.config.fees.imageColorsExtract,
            })}
          </li>
        )}
        {this.features.WHEEL.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.createColorHarmony', {
              fee: this.props.config.fees.harmonyCreate,
            })}
          </li>
        )}
        {this.features.CREATE_PALETTE.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.createPalette', {
              fee: this.props.config.fees.paletteCreate,
            })}
          </li>
        )}
        {this.features.DOCUMENT_PALETTE.isActive() &&
          this.features.VIEWS_PALETTE.isActive() && (
            <li>
              {this.props.t('plan.credits.fees.generateSimplePalette', {
                fee: this.props.config.fees.paletteGenerate,
              })}
            </li>
          )}
        {this.features.DOCUMENT_PALETTE_PROPERTIES.isActive() &&
          this.features.VIEWS_PALETTE_WITH_PROPERTIES.isActive() && (
            <li>
              {this.props.t('plan.credits.fees.generateDetailedPalette', {
                fee: this.props.config.fees.paletteWithPropsGenerate,
              })}
            </li>
          )}
        {this.features.DOCUMENT_SHEET.isActive() &&
          this.features.VIEWS_SHEET.isActive() && (
            <li>
              {this.props.t('plan.credits.fees.generateColorSheet', {
                fee: this.props.config.fees.sheetGenerate,
              })}
            </li>
          )}
        {this.features.DOCUMENT_PUSH_UPDATES.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.updatePalette', {
              fee: this.props.config.fees.paletteUpdates,
            })}
          </li>
        )}
        {this.features.SYNC_LOCAL_STYLES.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.syncLocalStyles', {
              fee: this.props.config.fees.localStylesSync,
            })}
          </li>
        )}
        {this.features.SYNC_LOCAL_VARIABLES.isActive() && (
          <li>
            {this.props.t('plan.credits.fees.syncLocalVariables', {
              fee: this.props.config.fees.localVariablesSync,
            })}
          </li>
        )}
      </ul>
    )
  }

  RemainingTime = () => (
    <div
      className={doClassnames([
        texts.type,
        texts['type--secondary'],
        texts['type--truncated'],
        layouts['snackbar--tight'],
      ])}
    >
      <span>{this.props.t('separator')}</span>
      {Math.ceil(this.props.trialRemainingTime) > 72 && (
        <span>
          {this.props.t('plan.trialTimeDays', {
            count:
              Math.ceil(this.props.trialRemainingTime) > 72
                ? Math.ceil(this.props.trialRemainingTime / 24).toString()
                : Math.ceil(this.props.trialRemainingTime).toString(),
          })}
        </span>
      )}
      {Math.ceil(this.props.trialRemainingTime) <= 72 &&
        Math.ceil(this.props.trialRemainingTime) >= 0 && (
          <span>
            {this.props.t('plan.trialTimeHours', {
              count: Math.ceil(this.props.trialRemainingTime).toString(),
            })}
          </span>
        )}
    </div>
  )

  RemainingCredits = () => {
    return (
      <Feature isActive={this.props.config.plan.isCreditsEnabled}>
        <div
          className={doClassnames([
            texts.type,
            texts['type--secondary'],
            layouts['snackbar--tight'],
          ])}
        >
          <span>{this.props.t('separator')}</span>
          <span>
            {this.props.t('plan.credits.amount', {
              count: Math.ceil(this.state.creditsCount).toString(),
            })}
          </span>
          <IconChip
            iconType="PICTO"
            iconName="info"
            text={this.Fees()}
            pin="TOP"
            type="MULTI_LINE"
          />
          {this.state.creditsCount === 0 && (
            <IconChip
              iconType="PICTO"
              iconName="warning"
              text={this.props.t('plan.credits.renew', {
                date: new Date(this.props.creditsRenewalDate).toLocaleString(
                  getTolgee().getLanguage(),
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                ),
              })}
              pin="TOP"
              type="MULTI_LINE"
            />
          )}
        </div>
      </Feature>
    )
  }

  EndedTrial = () => (
    <div
      className={doClassnames([
        texts.type,
        texts['type--secondary'],
        layouts['snackbar--tight'],
      ])}
    >
      <span>{this.props.t('separator')}</span>
      <div className={doClassnames([texts['type--truncated']])}>
        <span>{this.props.t('plan.trialEnded')}</span>
      </div>
    </div>
  )

  trialFeedback = () => (
    <Feature isActive={this.features.INVOLVE_FEEDBACK.isActive()}>
      <div
        className={doClassnames([
          texts.type,
          texts['type--secondary'],
          layouts['snackbar--tight'],
        ])}
      >
        <span>{this.props.t('separator')}</span>
        <Button
          type="tertiary"
          label={this.props.t('plan.trialFeedback')}
          isBlocked={this.features.INVOLVE_FEEDBACK.isBlocked()}
          isNew={this.features.INVOLVE_FEEDBACK.isNew()}
          action={() =>
            sendPluginMessage(
              {
                pluginMessage: {
                  type: 'OPEN_IN_BROWSER',
                  data: {
                    url: this.props.config.urls.trialFeedbackUrl,
                  },
                },
              },
              '*'
            )
          }
        />
      </div>
    </Feature>
  )

  FreePlan = () => (
    <div
      className={doClassnames([
        layouts['snackbar--tight'],
        layouts['snackbar--left'],
        layouts['snackbar--wrap'],
      ])}
    >
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.t('plan.getPro')}
        action={() =>
          sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
        }
      />
      <Chip>{this.props.t('pricing.operation')}</Chip>
      <this.RemainingCredits />
    </div>
  )

  TrialPlan = () => (
    <div
      className={doClassnames([
        layouts['snackbar--tight'],
        layouts['snackbar--left'],
        layouts['snackbar--wrap'],
      ])}
    >
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.t('plan.tryPro')}
        action={() => {
          this.props.config.plan.isTrialEnabled
            ? sendPluginMessage({ pluginMessage: { type: 'GET_TRIAL' } }, '*')
            : sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
        }}
      />
      <this.RemainingCredits />
    </div>
  )

  PendingTrial = () => (
    <div
      className={doClassnames([
        layouts['snackbar--tight'],
        layouts['snackbar--left'],
        layouts['snackbar--wrap'],
      ])}
    >
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.t('plan.getPro')}
        action={() =>
          sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
        }
      />
      <this.RemainingTime />
    </div>
  )

  ExpiredTrial = () => (
    <div
      className={doClassnames([
        layouts['snackbar--tight'],
        layouts['snackbar--left'],
        layouts['snackbar--wrap'],
      ])}
    >
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={this.props.t('plan.getPro')}
        action={() =>
          sendPluginMessage({ pluginMessage: { type: 'GET_PRO' } }, '*')
        }
      />
      <this.RemainingCredits />
      <this.EndedTrial />
      <this.trialFeedback />
    </div>
  )

  // Render
  render() {
    if (this.props.config.plan.isTrialEnabled)
      return (
        <div className={doClassnames(['pro-zone', layouts['snackbar--tight']])}>
          {this.props.trialStatus === 'UNUSED' &&
            this.props.planStatus === 'UNPAID' && <this.TrialPlan />}
          {this.props.trialStatus === 'PENDING' &&
            this.props.planStatus === 'PAID' && <this.PendingTrial />}
          {this.props.trialStatus === 'EXPIRED' &&
            this.props.planStatus === 'UNPAID' && <this.ExpiredTrial />}
        </div>
      )
    else if (this.props.config.plan.isProEnabled)
      return (
        <div className={doClassnames(['pro-zone', layouts['snackbar--tight']])}>
          {this.props.planStatus === 'UNPAID' &&
            this.props.trialStatus === 'UNUSED' && <this.FreePlan />}
        </div>
      )
    else return null
  }
}
