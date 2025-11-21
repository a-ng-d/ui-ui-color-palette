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
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface AboutProps extends BaseProps, WithConfigProps, WithTranslationProps {
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
  // Aucune fonction de template nécessaire, Tolgee gère les paramètres

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
                      {this.props.t('name')}
                    </span>
                    <div className={layouts.snackbar}>
                      <span className={texts.type}>
                        {this.props.t('about.information.version', {
                          version: this.props.config.versions.pluginVersion,
                        })}
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
                          {this.props.t('separator')}
                        </span>
                        {this.props.config.env.isDev ? (
                          <span className={texts.type}>
                            {this.props.t('plan.dev')}
                          </span>
                        ) : (
                          <span className={texts.type}>
                            {this.props.planStatus === 'UNPAID'
                              ? this.props.t('plan.free')
                              : this.props.planStatus === 'PAID' &&
                                  this.props.trialStatus === 'PENDING'
                                ? this.props.t('plan.trial')
                                : this.props.t('plan.pro')}
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
                      __html: this.props.t(
                        'about.information.creator.sentence',
                        {
                          author: `<a href='${this.props.config.urls.authorUrl}' target='_blank' rel='noreferrer'>${this.props.t('about.information.creator.author')}</a>`,
                        }
                      ),
                    }}
                  />
                  <span className={texts.type}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: this.props.t(
                          'about.information.sourceCode.sentence',
                          {
                            code: this.props.t('name'),
                            license: `<a href='${this.props.config.urls.licenseUrl}' target='_blank' rel='noreferrer'>${this.props.t('about.information.sourceCode.license')}</a>`,
                          }
                        ),
                      }}
                    />
                  </span>
                  <span className={texts.type}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: this.props.t(
                          'about.information.contribution.sentence',
                          {
                            code: this.props.t('name'),
                            repository: `<a href='${this.props.config.urls.repositoryUrl}' target='_blank' rel='noreferrer'>${this.props.t('about.information.contribution.repository')}</a>`,
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
    const attributions = [
      {
        key: 'chroma',
        template: 'about.attributions.chroma.sentence',
        values: {
          chroma: `<a href='https://github.com/gka/chroma.js' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.chroma.chroma')}</a>`,
          author: `<a href='https://github.com/gka' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.chroma.author')}</a>`,
        },
      },
      {
        key: 'apca',
        template: 'about.attributions.apca.sentence',
        values: {
          apca: `<a href='https://github.com/Myndex/apca-w3' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.apca.apca')}</a>`,
          author: `<a href='https://github.com/Myndex' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.apca.author')}</a>`,
        },
      },
      {
        key: 'colorName',
        template: 'about.attributions.colorName.sentence',
        values: {
          colorName: `<a href='https://github.com/meodai/color-names' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.colorName.colorName')}</a>`,
          author: `<a href='https://github.com/meodai' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.colorName.author')}</a>`,
        },
      },
      {
        key: 'preact',
        template: 'about.attributions.preact.sentence',
        values: {
          preact: `<a href='https://preactjs.com/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.preact.preact')}</a>`,
        },
      },
      {
        key: 'supabase',
        template: 'about.attributions.supabase.sentence',
        values: {
          supabase: `<a href='https://supabase.com/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.supabase.supabase')}</a>`,
        },
      },
      {
        key: 'uid',
        template: 'about.attributions.uid.sentence',
        values: {
          uid: `<a href='https://github.com/lukeed/uid' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.uid.uid')}</a>`,
          author: `<a href='https://github.com/lukeed' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.uid.author')}</a>`,
        },
      },
      {
        key: 'figmug',
        template: 'about.attributions.figmug.sentence',
        values: {
          figmug: `<a href='https://github.com/a-ng-d/figmug' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.figmug.figmug')}</a>`,
          author: `<a href='https://github.com/a-ng-d' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.figmug.author')}</a>`,
        },
      },
      {
        key: 'vite',
        template: 'about.attributions.vite.sentence',
        values: {
          vite: `<a href='https://vitejs.dev/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.vite.vite')}</a>`,
        },
      },
      {
        key: 'presets',
        template: 'about.attributions.presets.sentence',
        values: {
          antDesign: `<a href='https://ant.design/docs/spec/colors' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.antDesign')}</a>`,
          bootstrap: `<a href='https://getbootstrap.com/docs/5.3/customize/color/#all-colors' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.bootstrap')}</a>`,
          tailwind: `<a href='https://tailwindcss.com/docs/colors' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.tailwind')}</a>`,
          material: `<a href='https://m3.material.io/styles/color/static/baseline' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.material')}</a>`,
          untitledUI: `<a href='https://untitledui.com/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.untitledUI')}</a>`,
          openColor: `<a href='https://yeun.github.io/open-color/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.openColor')}</a>`,
          radix: `<a href='https://www.radix-ui.com/colors' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.radix')}</a>`,
          atlassian: `<a href='https://atlassian.design/foundations/color-new/color-palette-new' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.atlassian')}</a>`,
          shopify: `<a href='https://polaris-react.shopify.com/design/colors/palettes-and-roles' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.shopify')}</a>`,
          uber: `<a href='https://base.uber.com/6d2425e9f/p/797362-color-beta' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.uber')}</a>`,
          microsoft: `<a href='https://fluent2.microsoft.design/color/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.microsoft')}</a>`,
          ibm: `<a href='https://carbondesignsystem.com/elements/color/overview/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.ibm')}</a>`,
          adobe: `<a href='https://spectrum.adobe.com/page/color-palette/' target='_blank' rel='noreferrer'>${this.props.t('about.attributions.presets.adobe')}</a>`,
        },
      },
    ]

    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle label={this.props.t('about.attributions.title')} />
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
                __html: this.props.t(
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
          title={this.props.t('about.title')}
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
