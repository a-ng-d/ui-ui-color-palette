import { PureComponent } from 'preact/compat'
import { SystemConfiguration } from '@yelbolt/engine-ui-color-palette'
import { Bar, Layout, SectionTitle } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { BaseProps } from '../../types/app'

interface VisualizeProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  system: SystemConfiguration
}

export default class Visualize extends PureComponent<VisualizeProps> {
  // Render
  render() {
    return (
      <Layout
        id="visualize"
        column={[
          {
            node: (
              <Bar
                id="visualize-header"
                leftPartSlot={
                  <SectionTitle label={this.props.t('contexts.visualize')} />
                }
                clip={['LEFT']}
                border={['BOTTOM']}
              />
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }
}
