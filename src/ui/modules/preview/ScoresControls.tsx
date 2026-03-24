import React from 'react'
import { FeatureStatus } from '@unoff/utils'
import { layouts, Button, Menu } from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import {
  BaseProps,
  Editor,
  PlanStatus,
  ScoreFilterStatus,
  Service,
} from '../../../types/app'
import {
  $isAPCADisplayed,
  $isAPCAIntervalDisplayed,
  $isWCAGDisplayed,
  $isWCAGIntervalDisplayed,
} from '../../../stores/preferences'
import { trackPreviewManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ScoresControlsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  isDrawerCollapsed: boolean
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  isWCAGIntervalDisplayed: boolean
  isAPCAIntervalDisplayed: boolean
  scoreFilters: {
    lightWCAG: ScoreFilterStatus
    lightAPCA: ScoreFilterStatus
    darkWCAG: ScoreFilterStatus
    darkAPCA: ScoreFilterStatus
  }
  onToggleDrawer: () => void
  onUpdateScoreFilters: (filters: {
    lightWCAG?: ScoreFilterStatus
    lightAPCA?: ScoreFilterStatus
    darkWCAG?: ScoreFilterStatus
    darkAPCA?: ScoreFilterStatus
  }) => void
}

export default class ScoresControls extends React.PureComponent<ScoresControlsProps> {
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
    PREVIEW_FILTER_WCAG: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_FILTER_WCAG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    PREVIEW_FILTER_APCA: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_FILTER_APCA',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return ScoresControls.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Handlers
  displayHandler = (): string => {
    const options = []
    if (this.props.isWCAGDisplayed) options.push('ENABLE_WCAG_SCORE')
    if (this.props.isAPCADisplayed) options.push('ENABLE_APCA_SCORE')
    if (this.props.isWCAGIntervalDisplayed) options.push('ENABLE_WCAG_INTERVAL')
    if (this.props.isAPCAIntervalDisplayed) options.push('ENABLE_APCA_INTERVAL')
    return options.join(', ')
  }

  isFiltersEnabled = (): boolean => {
    return (
      this.props.scoreFilters.lightWCAG !== 'ALL' ||
      this.props.scoreFilters.lightAPCA !== 'ALL' ||
      this.props.scoreFilters.darkWCAG !== 'ALL' ||
      this.props.scoreFilters.darkAPCA !== 'ALL'
    )
  }

  // Render
  render() {
    return (
      <div className={layouts['snackbar--medium']}>
        <Button
          type="icon"
          icon={
            this.props.isDrawerCollapsed
              ? 'toggle-sidebar-top'
              : 'toggle-sidebar-bottom'
          }
          helper={{
            label: this.props.isDrawerCollapsed
              ? this.props.t('preview.actions.expandPreview')
              : this.props.t('preview.actions.collapsePreview'),
          }}
          action={this.props.onToggleDrawer}
        />
        <Feature
          isActive={
            this.features.PREVIEW_SCORES.isActive() &&
            !this.props.isDrawerCollapsed
          }
        >
          <Menu
            id="score-display"
            type="ICON"
            icon="visible"
            options={[
              {
                label: this.props.t('preview.score.wcag'),
                value: 'ENABLE_WCAG_SCORE',
                type: 'OPTION',
                isActive: this.features.PREVIEW_SCORES_WCAG_SCORE.isActive(),
                isBlocked:
                  this.features.PREVIEW_SCORES_WCAG_SCORE.isBlocked() &&
                  !this.displayHandler().includes('ENABLE_WCAG_SCORE'),
                isNew: this.features.PREVIEW_SCORES_WCAG_SCORE.isNew(),
                action: () => {
                  $isWCAGDisplayed.set(!this.props.isWCAGDisplayed)
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'SET_ITEMS',
                        items: [
                          {
                            key: 'is_wcag_displayed',
                            value: !this.props.isWCAGDisplayed,
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
                    this.props.userConsent.find(
                      (consent) => consent.id === 'mixpanel'
                    )?.isConsented ?? false,
                    {
                      feature: 'DISPLAY_WCAG_SCORES',
                    }
                  )
                },
              },
              {
                label: this.props.t('preview.score.apca'),
                value: 'ENABLE_APCA_SCORE',
                type: 'OPTION',
                isActive: this.features.PREVIEW_SCORES_APCA_SCORE.isActive(),
                isBlocked:
                  this.features.PREVIEW_SCORES_APCA_SCORE.isBlocked() &&
                  !this.displayHandler().includes('ENABLE_APCA_SCORE'),
                isNew: this.features.PREVIEW_SCORES_APCA_SCORE.isNew(),
                action: () => {
                  $isAPCADisplayed.set(!this.props.isAPCADisplayed)
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'SET_ITEMS',
                        items: [
                          {
                            key: 'is_apca_displayed',
                            value: !this.props.isAPCADisplayed,
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
                    this.props.userConsent.find(
                      (consent) => consent.id === 'mixpanel'
                    )?.isConsented ?? false,
                    {
                      feature: 'DISPLAY_APCA_SCORES',
                    }
                  )
                },
              },
              {
                type: 'SEPARATOR',
                isActive:
                  this.features.PREVIEW_SCORES_WCAG_INTERVAL.isActive() ||
                  this.features.PREVIEW_SCORES_APCA_INTERVAL.isActive(),
              },
              {
                label: this.props.t('preview.score.wcagInterval'),
                value: 'ENABLE_WCAG_INTERVAL',
                type: 'OPTION',
                isActive: this.features.PREVIEW_SCORES_WCAG_INTERVAL.isActive(),
                isBlocked:
                  this.features.PREVIEW_SCORES_WCAG_INTERVAL.isBlocked() &&
                  !this.displayHandler().includes('ENABLE_WCAG_INTERVAL'),
                isNew: this.features.PREVIEW_SCORES_WCAG_INTERVAL.isNew(),
                action: () => {
                  $isWCAGIntervalDisplayed.set(
                    !this.props.isWCAGIntervalDisplayed
                  )
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'SET_ITEMS',
                        items: [
                          {
                            key: 'is_wcag_interval_displayed',
                            value: !this.props.isWCAGIntervalDisplayed,
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
                    this.props.userConsent.find(
                      (consent) => consent.id === 'mixpanel'
                    )?.isConsented ?? false,
                    {
                      feature: 'DISPLAY_WCAG_INTERVAL',
                    }
                  )
                },
              },
              {
                label: this.props.t('preview.score.apcaInterval'),
                value: 'ENABLE_APCA_INTERVAL',
                type: 'OPTION',
                isActive: this.features.PREVIEW_SCORES_APCA_INTERVAL.isActive(),
                isBlocked:
                  this.features.PREVIEW_SCORES_APCA_INTERVAL.isBlocked() &&
                  !this.displayHandler().includes('ENABLE_APCA_INTERVAL'),
                isNew: this.features.PREVIEW_SCORES_APCA_INTERVAL.isNew(),
                action: () => {
                  $isAPCAIntervalDisplayed.set(
                    !this.props.isAPCAIntervalDisplayed
                  )
                  sendPluginMessage(
                    {
                      pluginMessage: {
                        type: 'SET_ITEMS',
                        items: [
                          {
                            key: 'is_apca_interval_displayed',
                            value: !this.props.isAPCAIntervalDisplayed,
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
                    this.props.userConsent.find(
                      (consent) => consent.id === 'mixpanel'
                    )?.isConsented ?? false,
                    {
                      feature: 'DISPLAY_APCA_INTERVAL',
                    }
                  )
                },
              },
            ]}
            selected={this.displayHandler()}
            alignment="TOP_LEFT"
            helper={{
              label: this.props.t('preview.actions.displayScores'),
            }}
            isBlocked={this.features.PREVIEW_SCORES.isBlocked()}
            isNew={this.features.PREVIEW_SCORES.isNew()}
          />
        </Feature>
        <Feature
          isActive={
            this.features.PREVIEW_SCORES.isActive() &&
            !this.props.isDrawerCollapsed
          }
        >
          <Menu
            id="score-filter"
            type="ICON"
            icon="filter"
            options={[
              {
                label: this.props.t('preview.filter.wcag'),
                type: 'TITLE',
              },
              {
                label: this.props.t('preview.filter.lightForeground'),
                value: 'LIGHT_WCAG_HEADER',
                type: 'GROUP',
                isActive: this.features.PREVIEW_FILTER_WCAG.isActive(),
                isBlocked: this.features.PREVIEW_FILTER_WCAG.isBlocked(),
                isNew: this.features.PREVIEW_FILTER_WCAG.isNew(),
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'LIGHT_WCAG_ALL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightWCAG: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'LIGHT_WCAG_PASS',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightWCAG: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'LIGHT_WCAG_FAIL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightWCAG: 'FAIL' })
                    },
                  },
                ],
              },
              {
                label: this.props.t('preview.filter.darkForeground'),
                value: 'DARK_WCAG_HEADER',
                type: 'GROUP',
                isActive: this.features.PREVIEW_FILTER_WCAG.isActive(),
                isBlocked: this.features.PREVIEW_FILTER_WCAG.isBlocked(),
                isNew: this.features.PREVIEW_FILTER_WCAG.isNew(),
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'DARK_WCAG_ALL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkWCAG: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'DARK_WCAG_PASS',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkWCAG: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'DARK_WCAG_FAIL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkWCAG: 'FAIL' })
                    },
                  },
                ],
              },
              {
                type: 'SEPARATOR',
              },
              {
                label: this.props.t('preview.filter.apca'),
                type: 'TITLE',
              },
              {
                label: this.props.t('preview.filter.lightForeground'),
                value: 'LIGHT_APCA_HEADER',
                type: 'GROUP',
                isActive: this.features.PREVIEW_FILTER_APCA.isActive(),
                isBlocked: this.features.PREVIEW_FILTER_APCA.isBlocked(),
                isNew: this.features.PREVIEW_FILTER_APCA.isNew(),
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'LIGHT_APCA_ALL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightAPCA: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'LIGHT_APCA_PASS',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightAPCA: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'LIGHT_APCA_FAIL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightAPCA: 'FAIL' })
                    },
                  },
                ],
              },
              {
                label: this.props.t('preview.filter.darkForeground'),
                value: 'DARK_APCA_HEADER',
                type: 'GROUP',
                isActive: this.features.PREVIEW_FILTER_APCA.isActive(),
                isBlocked: this.features.PREVIEW_FILTER_APCA.isBlocked(),
                isNew: this.features.PREVIEW_FILTER_APCA.isNew(),
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'DARK_APCA_ALL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkAPCA: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'DARK_APCA_PASS',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkAPCA: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'DARK_APCA_FAIL',
                    type: 'OPTION',
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkAPCA: 'FAIL' })
                    },
                  },
                ],
              },
              {
                type: 'SEPARATOR',
                isActive: this.isFiltersEnabled(),
              },
              {
                label: this.props.t('preview.filter.reset'),
                value: 'RESET_FILTERS',
                type: 'OPTION',
                isActive: this.isFiltersEnabled(),
                action: () => {
                  this.props.onUpdateScoreFilters({
                    lightWCAG: 'ALL',
                    lightAPCA: 'ALL',
                    darkWCAG: 'ALL',
                    darkAPCA: 'ALL',
                  })
                },
              },
            ]}
            selected={`LIGHT_WCAG_${this.props.scoreFilters.lightWCAG}, LIGHT_APCA_${this.props.scoreFilters.lightAPCA}, DARK_WCAG_${this.props.scoreFilters.darkWCAG}, DARK_APCA_${this.props.scoreFilters.darkAPCA}`}
            alignment="TOP_LEFT"
            helper={{
              label: this.props.t('preview.actions.filterScores'),
            }}
            isBlocked={this.features.PREVIEW_SCORES.isBlocked()}
            isNew={this.isFiltersEnabled()}
          />
        </Feature>
      </div>
    )
  }
}
