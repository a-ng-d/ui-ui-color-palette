import React from 'react'
import { PureComponent } from 'preact/compat'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Layout } from '@a_ng_d/figmug-ui'
import PagePalettes from '../modules/palettes/PagePalettes'
import { WithConfigProps } from '../components/WithConfig'
import { setContexts } from '../../utils/setContexts'
import {
  BaseProps,
  Context,
  ContextItem,
  Editor,
  PlanStatus,
  Service,
} from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface LocalPalettesProps extends BaseProps, WithConfigProps {
  localPalettesListStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  localPalettesList: Array<FullConfiguration>
  onCreatePalette: () => void
}

interface LocalPalettesStates {
  context: Context | ''
}

export default class LocalPalettes extends PureComponent<
  LocalPalettesProps,
  LocalPalettesStates
> {
  private contexts: Array<ContextItem>

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    LOCAL_PALETTES_PAGE: new FeatureStatus({
      features: config.features,
      featureName: 'LOCAL_PALETTES_PAGE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: LocalPalettesProps) {
    super(props)
    this.contexts = setContexts(
      ['LOCAL_PALETTES_PAGE'],
      props.planStatus,
      props.config.features,
      props.editor,
      props.service
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
    }
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'LOCAL_PALETTES_PAGE': {
        fragment = <PagePalettes {...this.props} />
        break
      }
    }

    return (
      <Layout
        id="local-palettes"
        column={[
          {
            node: fragment,
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
        isFullWidth
      />
    )
  }
}
