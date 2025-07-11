import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  Dialog,
  FormItem,
  Input,
  Message,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, Editor, PlanStatus, Service } from '../../../types/app'
import validateUserLicenseKey from '../../../external/license/validateUserLicenseKey '
import desactivateUserLicenseKey from '../../../external/license/desactivateUserLicenseKey'
import activateUserLicenseKey from '../../../external/license/activateUserLicenseKey'
import { ConfigContextType } from '../../../config/ConfigContext'

interface LicenseProps extends BaseProps, WithConfigProps {
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface LicenseStates {
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  hasLicense: boolean
  licenseStatus: 'READY' | 'ERROR' | 'VALID'
  checkingButtonStatus: 'DEFAULT' | 'VALID' | 'UNVALID'
  userLicenseKey: string
  userInstanceId: string
  userInstanceName: string
}

export default class License extends PureComponent<LicenseProps, LicenseStates> {
  private theme: string | null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    USER_LICENSE: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LICENSE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: LicenseProps) {
    super(props)
    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
      hasLicense: false,
      licenseStatus: 'READY',
      checkingButtonStatus: 'DEFAULT',
      userLicenseKey: '',
      userInstanceId: '',
      userInstanceName: '',
    }
    this.theme = document.documentElement.getAttribute('data-theme')
  }

  // Lifecycle
  componentDidMount = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_ITEMS',
          items: [
            'user_license_key',
            'user_license_instance_id',
            'user_license_instance_name',
          ],
        },
      },
      '*'
    )
    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const path = e.data.type === undefined ? e.data.pluginMessage : e.data

    const actions: {
      [action: string]: () => void
    } = {
      GET_ITEM_USER_LICENSE_KEY: () => {
        if (
          path.value !== null &&
          path.value !== undefined &&
          path.value !== ''
        )
          this.setState({ userLicenseKey: path.value, hasLicense: true })
        else this.setState({ userLicenseKey: '', hasLicense: false })
      },
      GET_ITEM_USER_LICENSE_INSTANCE_ID: () => {
        if (
          path.value !== null &&
          path.value !== undefined &&
          path.value !== '' &&
          this.state.userLicenseKey !== ''
        )
          this.setState({ userInstanceId: path.value, hasLicense: true })
        else this.setState({ userInstanceId: '', hasLicense: false })
      },
      GET_ITEM_USER_LICENSE_INSTANCE_NAME: () => {
        if (
          path.value !== null &&
          path.value !== undefined &&
          path.value !== ''
        )
          this.setState({ userInstanceName: path.value })
      },
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  onActivateLicense = () => {
    if (!this.state.hasLicense)
      return {
        label: this.props.locales.user.license.cta.activate,
        state:
          !this.isValidLicenseKeyFormat(this.state.userLicenseKey) ||
          this.state.userLicenseKey === '' ||
          this.state.userInstanceName === ''
            ? ('DISABLED' as const)
            : this.state.isPrimaryActionLoading
              ? ('LOADING' as const)
              : ('DEFAULT' as const),
        action: () => {
          this.setState({ isPrimaryActionLoading: true })
          activateUserLicenseKey({
            storeApiUrl: this.props.config.urls.storeApiUrl,
            licenseKey: this.state.userLicenseKey,
            instanceName: this.state.userInstanceName,
            platform: this.props.config.env.platform,
          })
            .then((data) => {
              this.setState({
                userLicenseKey: data.license_key,
                userInstanceId: data.instance_id,
                userInstanceName: data.instance_name,
                licenseStatus: 'VALID',
              })
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'WELCOME_TO_PRO',
                  },
                },
                '*'
              )
            })
            .finally(() => {
              this.setState({ isPrimaryActionLoading: false })
            })
            .catch(() => {
              this.setState({
                licenseStatus: 'ERROR',
              })
            })
        },
      }

    return undefined
  }

  onDesactivateLicense = () => {
    if (this.state.licenseStatus === 'ERROR' && this.state.hasLicense)
      return {
        label: this.props.locales.user.license.cta.unlinkLocally,
        action: () => {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'DELETE_DATA',
                items: ['user_license_key', 'user_license_instance_id'],
              },
            },
            '*'
          )
          this.setState({
            userLicenseKey: '',
            userInstanceId: '',
            hasLicense: false,
            licenseStatus: 'READY',
          })
        },
      }
    else if (this.state.licenseStatus !== 'ERROR' && this.state.hasLicense)
      return {
        label: this.props.locales.user.license.cta.unlink,
        state: this.state.isPrimaryActionLoading
          ? ('LOADING' as const)
          : ('DEFAULT' as const),
        action: () => {
          this.setState({ isPrimaryActionLoading: true })
          desactivateUserLicenseKey({
            storeApiUrl: this.props.config.urls.storeApiUrl,
            licenseKey: this.state.userLicenseKey,
            instanceId: this.state.userInstanceId,
          })
            .then(() => {
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'POST_MESSAGE',
                    data: {
                      type: 'SUCCESS',
                      message:
                        this.props.locales.success.unlinkedLicense.replace(
                          '{licenseKey}',
                          this.state.userInstanceName
                        ),
                    },
                  },
                },
                '*'
              )
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'LEAVE_PRO_PLAN',
                  },
                },
                '*'
              )
              this.setState({
                userLicenseKey: '',
                userInstanceId: '',
                hasLicense: false,
              })
            })
            .finally(() => {
              this.setState({
                isSecondaryActionLoading: false,
              })
            })
            .catch(() => {
              this.setState({
                licenseStatus: 'ERROR',
              })
            })
        },
      }

    return undefined
  }

  isValidLicenseKeyFormat = (key: string): boolean => {
    const licenseKeyRegex =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    return licenseKeyRegex.test(key)
  }

  // Render
  render() {
    let padding

    switch (this.theme) {
      case 'penpot':
        padding = '0 var(--size-xsmall)'
        break
      case 'figma-ui3':
        padding = '0'
        break
      default:
        padding = '0'
    }

    return (
      <Feature
        isActive={License.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        ).USER_LICENSE.isActive()}
      >
        <Dialog
          title={this.props.locales.user.manageLicense}
          actions={{
            primary: this.onActivateLicense(),
            destructive: this.onDesactivateLicense(),
            secondary: (() => {
              if (this.state.hasLicense)
                return {
                  label: this.props.locales.user.license.cta.manage,
                  action: () => {
                    window
                      .open('https://app.lemonsqueezy.com/my-orders', '_blank')
                      ?.focus()
                  },
                }
              return undefined
            })(),
          }}
          onClose={this.props.onClose}
        >
          {!this.state.hasLicense && (
            <div className="dialog__form">
              {this.state.licenseStatus === 'READY' && (
                <SemanticMessage
                  type="INFO"
                  message={this.props.locales.user.license.messages.activate}
                />
              )}
              {this.state.licenseStatus === 'ERROR' && (
                <SemanticMessage
                  type="ERROR"
                  message={this.props.locales.error.activatedLicense}
                />
              )}
              <FormItem
                label={this.props.locales.user.license.key.label}
                id="type-license-key"
                shouldFill
              >
                <Input
                  type="TEXT"
                  id="type-license-key"
                  value={this.state.userLicenseKey}
                  placeholder={this.props.locales.user.license.key.placeholder}
                  onChange={(e) =>
                    this.setState({
                      userLicenseKey: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
              <FormItem
                label={this.props.locales.user.license.name.label}
                id="type-instance-name"
                helper={{
                  type: 'INFO',
                  message: this.props.locales.user.license.name.helper,
                }}
                shouldFill
              >
                <Input
                  type="TEXT"
                  id="type-instance-name"
                  value={this.state.userInstanceName}
                  placeholder={this.props.locales.user.license.name.placeholder}
                  onChange={(e) =>
                    this.setState({
                      userInstanceName: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
            </div>
          )}
          {this.state.hasLicense && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: padding,
              }}
            >
              {this.state.licenseStatus === 'ERROR' && (
                <div className="dialog__form">
                  <SemanticMessage
                    type="ERROR"
                    message={this.props.locales.error.unlinkedLicense.replace(
                      '{licenseKey}',
                      this.state.userInstanceName
                    )}
                  />
                </div>
              )}
              <SimpleItem
                leftPartSlot={
                  <Message
                    icon="key"
                    messages={[
                      `${this.state.userLicenseKey} ${this.state.userInstanceName !== '' ? `(${this.state.userInstanceName})` : ''}`,
                    ]}
                  />
                }
                rightPartSlot={
                  <Button
                    type="secondary"
                    icon={
                      this.state.checkingButtonStatus === 'VALID'
                        ? 'check'
                        : this.state.checkingButtonStatus === 'UNVALID'
                          ? 'close'
                          : 'refresh'
                    }
                    label={
                      this.state.checkingButtonStatus === 'VALID'
                        ? this.props.locales.user.license.messages.active
                        : this.state.checkingButtonStatus === 'UNVALID'
                          ? this.props.locales.user.license.messages.unactive
                          : this.props.locales.user.license.cta.validate
                    }
                    isLoading={this.state.isSecondaryActionLoading}
                    action={() => {
                      this.setState({ isSecondaryActionLoading: true })
                      validateUserLicenseKey({
                        storeApiUrl: this.props.config.urls.storeApiUrl,
                        licenseKey: this.state.userLicenseKey,
                        instanceId: this.state.userInstanceId,
                      })
                        .then(() => {
                          this.setState({
                            licenseStatus: 'VALID',
                            checkingButtonStatus: 'VALID',
                          })
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'ENABLE_PRO_PLAN',
                              },
                            },
                            '*'
                          )
                        })
                        .finally(() => {
                          this.setState({
                            isSecondaryActionLoading: false,
                          })
                          setTimeout(() => {
                            this.setState({
                              checkingButtonStatus: 'DEFAULT',
                            })
                          }, 2000)
                        })
                        .catch(() => {
                          this.setState({
                            licenseStatus: 'ERROR',
                            checkingButtonStatus: 'UNVALID',
                          })
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'LEAVE_PRO_PLAN',
                              },
                            },
                            '*'
                          )
                        })
                    }}
                  />
                }
                isListItem={false}
                alignment="CENTER"
              />
            </div>
          )}
        </Dialog>
      </Feature>
    )
  }
}
