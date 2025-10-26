import React from 'react'
import { PureComponent } from 'preact/compat'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Dialog,
  Layout,
  layouts,
  Section,
  SectionTitle,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import Icon from '../Icon'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface AboutProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class About extends PureComponent<AboutProps> {
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

  // Handlers
  renderTemplateToHTML = (template: string, values: Record<string, string>) => {
    return template.replace(/\{(\w+)\}/g, (_match, key) => values[key] ?? '')
  }

  // Templates
  QuickInfo = () => {
    return (
      <Section
        body={[
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
                      <span className={texts.type}>
                        {this.props.locales.about.information.version.replace(
                          '{version}',
                          this.props.config.versions.pluginVersion
                        )}
                      </span>
                      <Feature
                        isActive={
                          About.features(
                            this.props.planStatus,
                            this.props.config,
                            this.props.service,
                            this.props.editor
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
                  <span
                    className={texts.type}
                    dangerouslySetInnerHTML={{
                      __html: this.renderTemplateToHTML(
                        this.props.locales.about.information.creator.sentence,
                        {
                          author: `<a href='${this.props.config.urls.authorUrl}' target='_blank' rel='noreferrer'>${this.props.locales.about.information.creator.author}</a>`,
                        }
                      ),
                    }}
                  />
                  <span className={texts.type}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: this.renderTemplateToHTML(
                          this.props.locales.about.information.sourceCode
                            .sentence,
                          {
                            code: this.props.locales.name,
                            license: `<a href='${this.props.config.urls.licenseUrl}' target='_blank' rel='noreferrer'>${this.props.locales.about.information.sourceCode.license}</a>`,
                          }
                        ),
                      }}
                    />
                  </span>
                  <span className={texts.type}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: this.renderTemplateToHTML(
                          this.props.locales.about.information.contribution
                            .sentence,
                          {
                            code: this.props.locales.name,
                            repository: `<a href='${this.props.config.urls.repositoryUrl}' target='_blank' rel='noreferrer'>${this.props.locales.about.information.contribution.repository}</a>`,
                          }
                        ),
                      }}
                    />
                  </span>
                </div>
              </div>
            ),
            spacingModifier: 'LARGE',
          },
        ]}
        border={['BOTTOM']}
      />
    )
  }

  Attributions = () => {
    const { locales } = this.props
    const attributions = [
      {
        key: 'chroma',
        template: locales.about.attributions.chroma.sentence,
        values: {
          chroma: `<a href='https://github.com/gka/chroma.js' target='_blank' rel='noreferrer'>${locales.about.attributions.chroma.chroma}</a>`,
          author: `<a href='https://github.com/gka' target='_blank' rel='noreferrer'>${locales.about.attributions.chroma.author}</a>`,
        },
      },
      {
        key: 'apca',
        template: locales.about.attributions.apca.sentence,
        values: {
          apca: `<a href='https://github.com/Myndex/apca-w3' target='_blank' rel='noreferrer'>${locales.about.attributions.apca.apca}</a>`,
          author: `<a href='https://github.com/Myndex' target='_blank' rel='noreferrer'>${locales.about.attributions.apca.author}</a>`,
        },
      },
      {
        key: 'colorName',
        template: locales.about.attributions.colorName.sentence,
        values: {
          colorName: `<a href='https://github.com/meodai/color-names' target='_blank' rel='noreferrer'>${locales.about.attributions.colorName.colorName}</a>`,
          author: `<a href='https://github.com/meodai' target='_blank' rel='noreferrer'>${locales.about.attributions.colorName.author}</a>`,
        },
      },
      {
        key: 'preact',
        template: locales.about.attributions.preact.sentence,
        values: {
          preact: `<a href='https://preactjs.com/' target='_blank' rel='noreferrer'>${locales.about.attributions.preact.preact}</a>`,
        },
      },
      {
        key: 'supabase',
        template: locales.about.attributions.supabase.sentence,
        values: {
          supabase: `<a href='https://supabase.com/' target='_blank' rel='noreferrer'>${locales.about.attributions.supabase.supabase}</a>`,
        },
      },
      {
        key: 'uid',
        template: locales.about.attributions.uid.sentence,
        values: {
          uid: `<a href='https://github.com/lukeed/uid' target='_blank' rel='noreferrer'>${locales.about.attributions.uid.uid}</a>`,
          author: `<a href='https://github.com/lukeed' target='_blank' rel='noreferrer'>${locales.about.attributions.uid.author}</a>`,
        },
      },
      {
        key: 'figmug',
        template: locales.about.attributions.figmug.sentence,
        values: {
          figmug: `<a href='https://github.com/a-ng-d/figmug' target='_blank' rel='noreferrer'>${locales.about.attributions.figmug.figmug}</a>`,
          author: `<a href='https://github.com/a-ng-d' target='_blank' rel='noreferrer'>${locales.about.attributions.figmug.author}</a>`,
        },
      },
      {
        key: 'vite',
        template: locales.about.attributions.vite.sentence,
        values: {
          vite: `<a href='https://vitejs.dev/' target='_blank' rel='noreferrer'>${locales.about.attributions.vite.vite}</a>`,
        },
      },
    ]

    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={this.props.locales.about.attributions.title}
              />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={attributions.map((attr) => ({
          node: (
            <span
              className={texts.type}
              dangerouslySetInnerHTML={{
                __html: this.renderTemplateToHTML(
                  attr.template,
                  attr.values as unknown as Record<string, string>
                ),
              }}
            />
          ),
          spacingModifier: 'LARGE',
        }))}
      />
    )
  }

  // Render
  render() {
    return (
      <Feature
        isActive={About.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locales.about.title}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <Layout
            id="about"
            column={[
              {
                node: (
                  <>
                    <this.QuickInfo />
                    <this.Attributions />
                  </>
                ),
              },
            ]}
            isFullWidth
          />
        </Dialog>
      </Feature>
    )
  }
}
