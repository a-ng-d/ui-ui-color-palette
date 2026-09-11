import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@unoff/utils'
import {
  Dropdown,
  FormItem,
  Section,
  SectionTitle,
  SimpleItem,
} from '@unoff/ui'
import { WithTranslationProps } from '../../components/WithTranslation'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { sendPluginMessage } from '../../../utils/pluginMessage'
import { BaseProps, Editor, PlanStatus, Service, UserTheme } from '../../../types/app'
import { $userTheme } from '../../../stores/preferences'
import { ConfigContextType } from '../../../config/ConfigContext'

interface ThemePreferencesProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  isLast?: boolean
}

interface ThemePreferencesState {
  userTheme: UserTheme
}

export default class ThemePreferences extends PureComponent<
  ThemePreferencesProps,
  ThemePreferencesState
> {
  private subscribeTheme: (() => void) | undefined
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    USER_THEME: new FeatureStatus({
      features: config.features,
      featureName: 'USER_THEME',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return ThemePreferences.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  static defaultProps = {
    isLast: false,
  }

  constructor(props: ThemePreferencesProps) {
    super(props)
    this.state = {
      userTheme: $userTheme.get(),
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.subscribeTheme = $userTheme.subscribe((value) => {
      this.setState({ userTheme: value })
    })
  }

  componentWillUnmount = () => {
    if (this.subscribeTheme) this.subscribeTheme()
  }

  // Handlers
  changeUserThemeHandler = (theme: UserTheme) => {
    $userTheme.set(theme)

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'SET_ITEMS',
          items: [
            {
              key: 'user_theme',
              value: theme,
            },
          ],
        },
      },
      '*'
    )
  }

  // Render
  render() {
    return (
      <Feature isActive={this.features.USER_THEME.isActive()}>
        <Section
          title={
            <SimpleItem
              leftPartSlot={
                <SectionTitle label={this.props.t('user.theme.title')} />
              }
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <FormItem
                  id="user-theme"
                  label={this.props.t('user.theme.label')}
                  shouldFill
                  isBlocked={this.features.USER_THEME.isBlocked()}
                >
                  <Dropdown
                    id="user-theme"
                    options={[
                      {
                        label: this.props.t('user.theme.light'),
                        value: 'light',
                        type: 'OPTION' as const,
                        isActive: true,
                        action: () => this.changeUserThemeHandler('light'),
                      },
                      {
                        label: this.props.t('user.theme.dark'),
                        value: 'dark',
                        type: 'OPTION' as const,
                        isActive: true,
                        action: () => this.changeUserThemeHandler('dark'),
                      },
                      {
                        label: this.props.t('user.theme.system'),
                        value: 'system',
                        type: 'OPTION' as const,
                        isActive: true,
                        action: () => this.changeUserThemeHandler('system'),
                      },
                    ]}
                    selected={this.state.userTheme}
                    isBlocked={this.features.USER_THEME.isBlocked()}
                    isNew={this.features.USER_THEME.isNew()}
                    isFill
                  />
                </FormItem>
              ),
            },
          ]}
          border={!this.props.isLast ? ['BOTTOM'] : undefined}
        />
      </Feature>
    )
  }
}
