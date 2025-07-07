import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, texts } from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import cp from '../../../content/images/choose_plan.webp'
import { ConfigContextType } from '../../../config/ConfigContext'

interface TryProProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class TryPro extends PureComponent<TryProProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'PRO_PLAN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  // Render
  render() {
    return (
      <Feature
        isActive={TryPro.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locales.proPlan.trial.title.replace(
            '{$1}',
            this.props.config.plan.trialTime.toString()
          )}
          actions={{
            primary: {
              label: this.props.locales.proPlan.trial.cta.replace(
                '{$1}',
                this.props.config.plan.trialTime.toString()
              ),
              action: () =>
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'ENABLE_TRIAL',
                      data: {
                        trialTime: this.props.config.plan.trialTime,
                        trialVersion: this.props.config.versions.trialVersion,
                      },
                    },
                  },
                  '*'
                ),
            },
            secondary: {
              label: this.props.locales.proPlan.trial.option,
              action: () =>
                parent.postMessage(
                  { pluginMessage: { type: 'GET_PRO_PLAN' } },
                  '*'
                ),
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={cp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locales.proPlan.trial.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
