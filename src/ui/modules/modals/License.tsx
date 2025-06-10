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
import { BaseProps, PlanStatus } from '../../../types/app'
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
  licenseStatus: 'READY' | 'ERROR' | 'OK'
  userLicenseKey: string
  userInstanceId: string
  userInstanceName: string
}

export default class License extends PureComponent<
  LicenseProps,
  LicenseStates
> {
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    USER_LICENSE: new FeatureStatus({
      features: config.features,
      featureName: 'USER_LICENSE',
      planStatus: planStatus,
    }),
  })

  constructor(props: LicenseProps) {
    super(props)
    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
      hasLicense: false,
      licenseStatus: 'READY',
      userLicenseKey: '',
      userInstanceId: '',
      userInstanceName: '',
    }
  }

  // Lifecycle
  componentDidMount = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_DATA',
          items: ['user_license_key', 'user_license_instance_id'],
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
    const path = e.data

    const actions: {
      [action: string]: () => void
    } = {
      GET_DATA_USER_LICENSE_KEY: () => {
        if (
          path.value !== null &&
          path.value !== undefined &&
          path.value !== ''
        )
          this.setState({ userLicenseKey: path.value, hasLicense: true })
        else this.setState({ userLicenseKey: '', hasLicense: false })
      },
      GET_DATA_USER_LICENSE_INSTANCE_ID: () => {
        if (
          path.value !== null &&
          path.value !== undefined &&
          path.value !== ''
        )
          this.setState({ userInstanceId: path.value, hasLicense: true })
        else this.setState({ userInstanceId: '', hasLicense: false })
      },
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  licenseHandler = () => {
    if (!this.state.hasLicense) 
      return {
        label: this.props.locals.user.license.cta.activate,
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
          })
            .then((data) => {
              this.setState({
                userLicenseKey: data.license_key,
                userInstanceId: data.instance_id,
                licenseStatus: 'OK',
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
    
    return {
      label: this.props.locals.user.license.cta.manage,
      action: () => {
        window.open('https://app.lemonsqueezy.com/my-orders', '_blank')?.focus()
      },
    }
  }

  isValidLicenseKeyFormat = (key: string): boolean => {
    const licenseKeyRegex =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    return licenseKeyRegex.test(key)
  }

  // Render
  render() {
    const theme = document.documentElement.getAttribute('data-theme')
    let padding

    switch (theme) {
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
        isActive={License.features(
          this.props.planStatus,
          this.props.config
        ).USER_LICENSE.isActive()}
      >
        <Dialog
          title={this.props.locals.user.manageLicense}
          pin="RIGHT"
          actions={{
            primary: this.licenseHandler(),
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__form">
            {!this.state.hasLicense ? (
              <>
                {this.state.licenseStatus === 'READY' && (
                  <SemanticMessage
                    type="INFO"
                    message={this.props.locals.user.license.messages.activate}
                  />
                )}
                {this.state.licenseStatus === 'ERROR' && (
                  <SemanticMessage
                    type="ERROR"
                    message={this.props.locals.error.activatedLicense}
                  />
                )}
                <FormItem
                  label={this.props.locals.user.license.key.label}
                  id="type-license-key"
                  shouldFill
                >
                  <Input
                    type="TEXT"
                    id="type-license-key"
                    value={this.state.userLicenseKey}
                    placeholder={this.props.locals.user.license.key.placeholder}
                    onChange={(e) =>
                      this.setState({
                        userLicenseKey: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </FormItem>
                <FormItem
                  label={this.props.locals.user.license.name.label}
                  id="type-instance-name"
                  helper={{
                    type: 'INFO',
                    message: this.props.locals.user.license.name.helper,
                  }}
                  shouldFill
                >
                  <Input
                    type="TEXT"
                    id="type-instance-name"
                    value={this.state.userInstanceName}
                    placeholder={
                      this.props.locals.user.license.name.placeholder
                    }
                    onChange={(e) =>
                      this.setState({
                        userInstanceName: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </FormItem>
              </>
            ) : (
              <>
                {this.state.licenseStatus === 'ERROR' && (
                  <SemanticMessage
                    type="ERROR"
                    message={this.props.locals.error.unlinkedLicense}
                  />
                )}
                <SimpleItem
                  leftPartSlot={
                    <Message
                      icon="key"
                      messages={[this.state.userLicenseKey]}
                    />
                  }
                  rightPartSlot={
                    this.state.licenseStatus !== 'ERROR' ? (
                      <Button
                        type="destructive"
                        label={this.props.locals.user.license.cta.unlink}
                        isLoading={this.state.isPrimaryActionLoading}
                        action={() => {
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
                                        this.props.locals.success
                                          .unlinkedLicense,
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
                              this.setState({ isSecondaryActionLoading: false })
                            })
                            .catch(() => {
                              this.setState({
                                licenseStatus: 'ERROR',
                              })
                            })
                        }}
                      />
                    ) : (
                      <Button
                        type="secondary"
                        label={this.props.locals.user.license.cta.unlinkLocally}
                        action={() => {
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'DELETE_DATA',
                                items: [
                                  'user_license_key',
                                  'user_license_instance_id',
                                ],
                              },
                            },
                            '*'
                          )
                          this.setState({
                            userLicenseKey: '',
                            userInstanceId: '',
                            hasLicense: false,
                          })
                        }}
                      />
                    )
                  }
                />
              </>
            )}
          </div>
        </Dialog>
      </Feature>
    )
  }
}
