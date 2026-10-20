import { PureComponent, ChangeEventHandler } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import { Dialog, List } from '@unoff/ui'
import ThemePreferences from '../preferences/ThemePreferences'
import SyncPreferences from '../preferences/SyncPreferences'
import LangPreferences from '../preferences/LangPreferences'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface PreferencesProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  onClose: ChangeEventHandler<HTMLInputElement> & (() => void)
}

export default class Preferences extends PureComponent<PreferencesProps> {
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

  private get features() {
    return Preferences.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  // Render
  render() {
    return (
      <Feature isActive={this.features.USER_PREFERENCES.isActive()}>
        <Dialog
          title={this.props.t('user.updatePreferences')}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <div className="dialog__blank">
            <List
              isFullWidth
              isFullHeight
            >
              <SyncPreferences {...this.props} />
              <ThemePreferences {...this.props} />
              <LangPreferences
                {...this.props}
                isLast={true}
              />
            </List>
          </div>
        </Dialog>
      </Feature>
    )
  }
}
