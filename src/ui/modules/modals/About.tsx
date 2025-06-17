import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, Layout, layouts, texts } from '@a_ng_d/figmug-ui'
import Icon from '../Icon'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'
import package_json from './../../../../package.json'

interface AboutProps extends BaseProps, WithConfigProps {
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
          title={this.props.locales.about.title}
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
                          {this.props.locales.name}
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
                              {this.props.locales.separator}
                            </span>
                            {this.props.config.env.isDev ? (
                              <span className={texts.type}>
                                {this.props.locales.plan.dev}
                              </span>
                            ) : (
                              <span className={texts.type}>
                                {this.props.planStatus === 'UNPAID'
                                  ? this.props.locales.plan.free
                                  : this.props.planStatus === 'PAID' &&
                                      this.props.trialStatus === 'PENDING'
                                    ? this.props.locales.plan.trial
                                    : this.props.locales.plan.pro}
                              </span>
                            )}
                          </Feature>
                        </div>
                      </div>
                    </div>
                    <div className={layouts.stackbar}>
                      <span className={texts.type}>
                        {this.props.locales.about.createdBy}
                        <a
                          href={this.props.config.urls.authorUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {this.props.locales.about.author}
                        </a>
                      </span>
                      <span className={texts.type}>
                        <a
                          href={this.props.config.urls.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {this.props.locales.about.sourceCode}
                        </a>
                        {this.props.locales.about.isLicensed}
                        <a
                          href={this.props.config.urls.licenseUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {this.props.locales.about.license}
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
