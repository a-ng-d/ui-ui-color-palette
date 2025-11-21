import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import { RgbModel } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Chip, Icon } from '@a_ng_d/figmug-ui'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import { WithTranslationProps } from './WithTranslation'
import { WithConfigProps } from './WithConfig'
import Feature from './Feature'

interface SourceProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  name: string
  color: RgbModel
  isTransparent: boolean
  action: React.MouseEventHandler<HTMLDivElement>
}

interface SourceStates {
  isHelperRevealer: boolean
}

export default class Source extends PureComponent<SourceProps, SourceStates> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW_SOURCE_HELPER: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SOURCE_HELPER',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  static defaultProps: Partial<SourceProps> = {
    isTransparent: false,
  }

  constructor(props: SourceProps) {
    super(props)
    this.state = {
      isHelperRevealer: false,
    }
  }

  // Render
  render() {
    return (
      <div
        className="preview__cell preview__cell--frozen"
        style={{
          backgroundColor: chroma([
            this.props.color.r * 255,
            this.props.color.g * 255,
            this.props.color.b * 255,
          ]).hex(),
        }}
        data-color-id={this.props.id}
        onMouseEnter={() => this.setState({ isHelperRevealer: true })}
        onMouseLeave={() => this.setState({ isHelperRevealer: false })}
        onMouseDown={this.props.action}
      >
        <Chip state="ON_BACKGROUND">{this.props.name}</Chip>
        {(this.state.isHelperRevealer || this.props.isTransparent) && (
          <div className="preview__cell__stack">
            {this.props.isTransparent && (
              <Chip state="ON_BACKGROUND">
                {this.props.t('paletteProperties.transparent')}
              </Chip>
            )}
            <Feature
              isActive={
                Source.features(
                  this.props.planStatus,
                  this.props.config,
                  this.props.service,
                  this.props.editor
                ).PREVIEW_SOURCE_HELPER.isActive() &&
                this.state.isHelperRevealer
              }
            >
              <Chip
                state="ON_BACKGROUND"
                leftSlot={
                  <div
                    style={{
                      width: 'var(--size-pos-xxsmall)',
                      height: 'var(--size-pos-xxsmall)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      '--icon-picto-color': 'black',
                      '--icon-width': 'var(--size-pos-xsmall)',
                      '--icon-height': 'var(--size-pos-xsmall)',
                    }}
                  >
                    <Icon
                      type="PICTO"
                      iconName="target"
                    />
                  </div>
                }
              />
            </Feature>
          </div>
        )}
      </div>
    )
  }
}
