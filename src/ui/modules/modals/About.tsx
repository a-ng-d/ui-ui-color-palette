import { Dialog, Layout, layouts, texts } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../../config/ConfigContext'
import { BaseProps, PlanStatus, TrialStatus } from '../../../types/app'
import Feature from '../../components/Feature'
import { WithConfigProps } from '../../components/WithConfig'
import Icon from '../Icon'
import package_json from './../../../../package.json'

interface AboutProps extends BaseProps, WithConfigProps {
  trialStatus: TrialStatus
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class About extends PureComponent<AboutProps> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    PRO_PLAN: new FeatureStatus({
      features: config.features,
      featureName: 'PRO_PLAN',
      planStatus: planStatus,
    }),
  })

  // Render
  render() {
    return (
      <Feature
        isActive={About.features(
          this.props.planStatus,
          this.props.config
        ).PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locals.about.title}
          onClose={this.props.onClose}
        >
          <Layout
            id="about"
            column={[
              {
                node: (
                  <div className={layouts['stackbar--medium']}>
                    <div className={layouts['snackbar--large']}>
                      <Icon size={32} />
                      <div>
                        <span
                          className={doClassnames([
                            texts.type,
                            texts['type--xlarge'],
                          ])}
                        >
                          {this.props.locals.name}
                        </span>
                        <div className={layouts.snackbar}>
                          <span
                            className={texts.type}
                          >{`Version ${package_json.version}`}</span>
                          <Feature
                            isActive={
                              About.features(
                                this.props.planStatus,
                                this.props.config
                              ).PRO_PLAN.isActive() &&
                              this.props.config.plan.isProEnabled
                            }
                          >
                            <span className={texts.type}>
                              {this.props.locals.separator}
                            </span>
                            {this.props.config.env.isDev ? (
                              <span className={texts.type}>
                                {this.props.locals.plan.dev}
                              </span>
                            ) : (
                              <span className={texts.type}>
                                {this.props.planStatus === 'UNPAID'
                                  ? this.props.locals.plan.free
                                  : this.props.planStatus === 'PAID' &&
                                      this.props.trialStatus === 'PENDING'
                                    ? this.props.locals.plan.trial
                                    : this.props.locals.plan.pro}
                              </span>
                            )}
                          </Feature>
                        </div>
                      </div>
                    </div>
                    <div className={layouts.stackbar}>
                      <span className={texts.type}>
                        {this.props.locals.about.createdBy}
                        <a
                          href={this.props.config.urls.authorUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {this.props.locals.about.author}
                        </a>
                      </span>
                      <span className={texts.type}>
                        <a
                          href={this.props.config.urls.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {this.props.locals.about.sourceCode}
                        </a>
                        {this.props.locals.about.isLicensed}
                        <a
                          href={this.props.config.urls.licenseUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {this.props.locals.about.license}
                        </a>
                      </span>
                    </div>
                  </div>
                ),
                typeModifier: 'CENTERED',
              },
            ]}
            isFullWidth
          />
        </Dialog>
      </Feature>
    )
  }
}
