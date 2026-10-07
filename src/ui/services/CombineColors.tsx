import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import { Bar, Tabs } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import { AppState } from '../App'
import { resolveContext, setContexts } from '../../utils/setContexts'
import {
  BaseProps,
  Context,
  ContextItem,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'
import ImagePalette from './ImagePalette'
import GenAI from './GenAI'
import Explore from './Explore'
import ColorWheel from './ColorWheel'
import type { Dispatch } from 'preact/hooks'

interface CombineColorsProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  creditsCount: number
  localPalettesCount: number
  context?: Context
  onChangeService: Dispatch<Partial<AppState>>
  onChangeContext?: (context: Context) => void
}

interface CombineColorsState {
  context: Context | ''
}

export const COMBINE_COLORS_CONTEXTS: Array<Context> = [
  'GEN',
  'EXTRACT',
  'WHEEL',
  'EXPLORE',
]

export default class CombineColors extends PureComponent<
  CombineColorsProps,
  CombineColorsState
> {
  private contexts: Array<ContextItem>

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    GEN: new FeatureStatus({
      features: config.features,
      featureName: 'GEN',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXTRACT: new FeatureStatus({
      features: config.features,
      featureName: 'EXTRACT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    WHEEL: new FeatureStatus({
      features: config.features,
      featureName: 'WHEEL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPLORE: new FeatureStatus({
      features: config.features,
      featureName: 'EXPLORE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return CombineColors.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  private getContexts = () =>
    setContexts(
      COMBINE_COLORS_CONTEXTS,
      this.props.planStatus,
      this.props.config.features,
      this.props.editor,
      this.props.service,
      this.props.t
    )

  constructor(props: CombineColorsProps) {
    super(props)
    this.contexts = this.getContexts()
    this.state = {
      context: resolveContext(this.contexts, props.context),
    }
  }

  // Lifecycle
  componentDidMount(): void {
    if (
      this.props.context !== undefined &&
      this.props.context !== this.state.context
    )
      this.props.onChangeContext?.(this.state.context as Context)
  }

  componentDidUpdate(previousProps: Readonly<CombineColorsProps>): void {
    if (previousProps.t !== this.props.t) {
      this.contexts = this.getContexts()
      this.forceUpdate()
    }

    if (
      this.props.context !== undefined &&
      this.props.context !== previousProps.context
    )
      this.setState({
        context: resolveContext(this.contexts, this.props.context),
      })
  }

  // Handlers
  navHandler = (e: Event) => {
    const context = (e.currentTarget as HTMLElement).dataset.feature as Context

    this.setState({ context })
    this.props.onChangeContext?.(context)
  }

  // Render
  render() {
    const features = this.features

    return (
      <>
        <Bar
          leftPartSlot={
            this.contexts.length > 1 ? (
              <Tabs
                tabs={this.contexts}
                active={this.state.context ?? ''}
                action={this.navHandler}
              />
            ) : undefined
          }
          border={['BOTTOM']}
        />
        <section className="context">
          <Feature
            isActive={this.state.context === 'GEN' && features.GEN.isActive()}
          >
            <GenAI {...this.props} />
          </Feature>
          <Feature
            isActive={
              this.state.context === 'EXTRACT' && features.EXTRACT.isActive()
            }
          >
            <ImagePalette {...this.props} />
          </Feature>
          <Feature
            isActive={
              this.state.context === 'WHEEL' && features.WHEEL.isActive()
            }
          >
            <ColorWheel {...this.props} />
          </Feature>
          <Feature
            isActive={
              this.state.context === 'EXPLORE' && features.EXPLORE.isActive()
            }
          >
            <Explore {...this.props} />
          </Feature>
        </section>
      </>
    )
  }
}
