import { PureComponent,
  MouseEventHandler,
} from 'preact/compat'
import chroma from 'chroma-js'
import { FeatureStatus } from '@unoff/utils'
import { Button, Chip } from '@unoff/ui'
import { RgbModel } from '@a_ng_d/utils-ui-color-palette'
import { BaseProps, Editor, Mode, PlanStatus, Service } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import { WithTranslationProps } from './WithTranslation'
import { WithConfigProps } from './WithConfig'
import Feature from './Feature'

interface SourceProps extends BaseProps, WithConfigProps, WithTranslationProps {
  mode: Mode
  id: string
  name: string
  color: RgbModel
  isTransparent: boolean
  onJumpToColor: MouseEventHandler<HTMLDivElement>
}

interface SourceState {
  isMouseEnter: boolean
}

export default class Source extends PureComponent<SourceProps, SourceState> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    PREVIEW_SOURCE_JUMP: new FeatureStatus({
      features: config.features,
      featureName: 'PREVIEW_SOURCE_JUMP',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Source.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  static defaultProps: Partial<SourceProps> = {
    isTransparent: false,
  }

  constructor(props: SourceProps) {
    super(props)
    this.state = {
      isMouseEnter: false,
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
        onMouseEnter={() => this.setState({ isMouseEnter: true })}
        onMouseLeave={() => this.setState({ isMouseEnter: false })}
        onMouseDown={this.props.onJumpToColor}
      >
        <Chip state="ON_BACKGROUND">{this.props.name}</Chip>
        {this.props.isTransparent && (
          <Chip state="ON_BACKGROUND">
            {this.props.t('paletteProperties.transparent')}
          </Chip>
        )}
        {(this.state.isMouseEnter || this.props.isTransparent) && (
          <div className="preview__cell__actions">
            <Feature
              isActive={
                this.features.PREVIEW_SOURCE_JUMP.isActive() &&
                this.props.mode === 'EDIT'
              }
            >
              <Button
                type="icon"
                icon="adjust"
                size="small"
                helper={{
                  label: this.props.t('preview.actions.jumpToColor'),
                  pin: 'TOP',
                }}
                action={this.props.onJumpToColor}
              />
            </Feature>
          </div>
        )}
      </div>
    )
  }
}
