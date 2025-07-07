import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Dialog, List } from '@a_ng_d/figmug-ui'
import SyncPreferences from '../SyncPreferences'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PreferencesProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Preferences extends PureComponent<PreferencesProps> {
  private theme: string | null
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    USER_PREFERENCES: new FeatureStatus({
      features: config.features,
      featureName: 'USER_PREFERENCES',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: PreferencesProps) {
    super(props)
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Render
  render() {
    let padding

    switch (this.theme) {
      case 'penpot':
        padding = '0 var(--size-xxsmall)'
        break
      case 'figma-ui3':
        padding = '0'
        break
      default:
        padding = 'var(--size-xxsmall)'
    }

    return (
      <Feature
        isActive={Preferences.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).USER_PREFERENCES.isActive()}
      >
        <Dialog
          title={this.props.locales.user.updatePreferences}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List padding={padding}>
            <SyncPreferences {...this.props} />
          </List>
        </Dialog>
      </Feature>
    )
  }
}
