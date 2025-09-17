import React from 'react'
import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import { RgbModel } from '@a_ng_d/utils-ui-color-palette'
import { Chip, Icon } from '@a_ng_d/figmug-ui'
import { BaseProps } from '../../types/app'

interface SourceProps extends BaseProps {
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
                {this.props.locales.paletteProperties.transparent}
              </Chip>
            )}
            {this.state.isHelperRevealer && (
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
            )}
          </div>
        )}
      </div>
    )
  }
}
