import { PureComponent } from 'preact/compat'
import { SystemConfiguration } from '@yelbolt/engine-ui-color-palette'
import { Bar, Layout, SectionTitle } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { BaseProps } from '../../types/app'

interface BindingProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  system: SystemConfiguration
}

export default class Binding extends PureComponent<BindingProps> {
  // Render
  render() {
    return (
      <Layout
        id="binding"
        column={[
          {
            node: (
              <Bar
                id="binding-header"
                leftPartSlot={
                  <SectionTitle label={this.props.t('contexts.binding')} />
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
