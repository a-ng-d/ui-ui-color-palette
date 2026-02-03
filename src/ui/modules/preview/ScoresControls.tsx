import React from 'react'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { layouts, Button, Menu } from '@a_ng_d/figmug-ui'
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
import { $isAPCADisplayed, $isWCAGDisplayed } from '../../../stores/preferences'
import { trackPreviewManagementEvent } from '../../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ScoresControlsProps
  extends BaseProps,
    WithConfigProps,
    WithTranslationProps {
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
  onToggleWCAGInterval: () => void
  onToggleAPCAInterval: () => void
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
  })

  // Handlers
  displayHandler = (): string => {
    const options = []
    if (this.props.isWCAGDisplayed) options.push('ENABLE_WCAG_SCORE')
    if (this.props.isAPCADisplayed) options.push('ENABLE_APCA_SCORE')
    if (this.props.isWCAGIntervalDisplayed) options.push('ENABLE_WCAG_INTERVAL')
    if (this.props.isAPCAIntervalDisplayed) options.push('ENABLE_APCA_INTERVAL')
    return options.join(', ')
  }

  // Render
  render() {
    const features = ScoresControls.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )

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
            features.PREVIEW_SCORES.isActive() && !this.props.isDrawerCollapsed
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
                isActive: features.PREVIEW_SCORES_WCAG.isActive(),
                isBlocked: features.PREVIEW_SCORES_WCAG.isBlocked(),
                isNew: features.PREVIEW_SCORES_WCAG.isNew(),
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
                isActive: features.PREVIEW_SCORES_APCA.isActive(),
                isBlocked: features.PREVIEW_SCORES_APCA.isBlocked(),
                isNew: features.PREVIEW_SCORES_APCA.isNew(),
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
              },
              {
                label: this.props.t('preview.score.wcagInterval'),
                value: 'ENABLE_WCAG_INTERVAL',
                type: 'OPTION',
                isActive: features.PREVIEW_SCORES_WCAG.isActive(),
                isBlocked: features.PREVIEW_SCORES_WCAG.isBlocked(),
                isNew: features.PREVIEW_SCORES_WCAG.isNew(),
                action: () => {
                  this.props.onToggleWCAGInterval()

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
                isActive: features.PREVIEW_SCORES_APCA.isActive(),
                isBlocked: features.PREVIEW_SCORES_APCA.isBlocked(),
                isNew: features.PREVIEW_SCORES_APCA.isNew(),
                action: () => {
                  this.props.onToggleAPCAInterval()

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
            isBlocked={features.PREVIEW_SCORES.isBlocked()}
            isNew={features.PREVIEW_SCORES.isNew()}
          />
        </Feature>
        <Feature
          isActive={
            features.PREVIEW_SCORES.isActive() && !this.props.isDrawerCollapsed
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
                isActive: true,
              },
              {
                label: this.props.t('preview.filter.lightForeground'),
                value: 'LIGHT_WCAG_HEADER',
                type: 'GROUP',
                isActive: true,
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'LIGHT_WCAG_ALL',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightWCAG: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'LIGHT_WCAG_PASS',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightWCAG: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'LIGHT_WCAG_FAIL',
                    type: 'OPTION',
                    isActive: true,
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
                isActive: true,
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'DARK_WCAG_ALL',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkWCAG: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'DARK_WCAG_PASS',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkWCAG: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'DARK_WCAG_FAIL',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkWCAG: 'FAIL' })
                    },
                  },
                ],
              },
              {
                type: 'SEPARATOR',
                isActive: true,
              },
              {
                label: this.props.t('preview.filter.apca'),
                type: 'TITLE',
                isActive: true,
              },
              {
                label: this.props.t('preview.filter.lightForeground'),
                value: 'LIGHT_APCA_HEADER',
                type: 'GROUP',
                isActive: true,
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'LIGHT_APCA_ALL',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightAPCA: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'LIGHT_APCA_PASS',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ lightAPCA: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'LIGHT_APCA_FAIL',
                    type: 'OPTION',
                    isActive: true,
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
                isActive: true,
                children: [
                  {
                    label: this.props.t('preview.filter.all'),
                    value: 'DARK_APCA_ALL',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkAPCA: 'ALL' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.pass'),
                    value: 'DARK_APCA_PASS',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkAPCA: 'PASS' })
                    },
                  },
                  {
                    label: this.props.t('preview.filter.fail'),
                    value: 'DARK_APCA_FAIL',
                    type: 'OPTION',
                    isActive: true,
                    action: () => {
                      this.props.onUpdateScoreFilters({ darkAPCA: 'FAIL' })
                    },
                  },
                ],
              },
              {
                type: 'SEPARATOR',
                isActive: true,
              },
              {
                label: this.props.t('preview.filter.reset'),
                value: 'RESET_FILTERS',
                type: 'OPTION',
                isActive: true,
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
            isBlocked={features.PREVIEW_SCORES.isBlocked()}
            isNew={
              this.props.scoreFilters.lightWCAG !== 'ALL' ||
              this.props.scoreFilters.lightAPCA !== 'ALL' ||
              this.props.scoreFilters.darkWCAG !== 'ALL' ||
              this.props.scoreFilters.darkAPCA !== 'ALL'
            }
          />
        </Feature>
      </div>
    )
  }
}
