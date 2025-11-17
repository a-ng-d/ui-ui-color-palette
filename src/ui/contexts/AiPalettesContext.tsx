import React from 'react'
import { PureComponent } from 'preact/compat'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import AiPalettes from '../subcontexts/AiPalettes'
import { WithConfigProps } from '../components/WithConfig'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { PluginMessageData } from '../../types/messages'
import {
  BaseProps,
  Context,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface AiPalettesContextProps extends BaseProps, WithConfigProps {
  localPalettesList: Array<FullConfiguration>
}

interface AiPalettesContextStates {
  context: Context
}

export default class AiPalettesContext extends PureComponent<
  AiPalettesContextProps,
  AiPalettesContextStates
> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    AI_PALETTES: new FeatureStatus({
      features: config.features,
      featureName: 'AI_PALETTES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: AiPalettesContextProps) {
    super(props)
    this.state = {
      context: 'AI_PALETTES',
    }
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  componentWillUnmount = () => {
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    const actions: {
      [action: string]: () => void
    } = {
      STOP_LOADER: () => {
        // Handle any loading state updates if needed
      },
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onSelectPalette = async (id: string) => {
    sendPluginMessage(
      {
        pluginMessage: {
          type: 'ADD_PALETTE_FROM_AI',
          id: id,
        },
      },
      '*'
    )
  }

  // Render
  render() {
    return (
      <AiPalettes
        {...this.props}
        context={this.state.context}
        onSelectPalette={this.onSelectPalette}
      />
    )
  }
}
