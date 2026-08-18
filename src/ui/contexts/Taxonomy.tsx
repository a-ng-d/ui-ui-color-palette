import { PureComponent } from 'preact/compat'
import { SystemConfiguration } from '@yelbolt/engine-ui-color-palette'
import { Bar, Layout, SectionTitle } from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { BaseProps } from '../../types/app'

interface TaxonomyProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  system: SystemConfiguration
}

export default class Taxonomy extends PureComponent<TaxonomyProps> {
  // Render
  render() {
    return (
      <Layout
        id="taxonomy"
        column={[
          {
            node: (
              <Bar
                id="taxonomy-header"
                leftPartSlot={
                  <SectionTitle label={this.props.t('contexts.taxonomy')} />
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
