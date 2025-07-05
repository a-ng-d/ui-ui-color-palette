import React from 'react'
import { PureComponent } from 'preact/compat'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  FormItem,
  Input,
  Section,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../../components/WithConfig'
import Feature from '../../components/Feature'
import { BaseProps, PlanStatus, Service } from '../../../types/app'
import { ConfigContextType } from '../../../config/ConfigContext'

interface GlobalSettingsProps extends BaseProps, WithConfigProps {
  name: string
  description: string
  isLast?: boolean
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

export default class GlobalSettings extends PureComponent<GlobalSettingsProps> {
  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service
  ) => ({
    SETTINGS_NAME: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
      currentService: service,
    }),
    SETTINGS_DESCRIPTION: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_DESCRIPTION',
      planStatus: planStatus,
      currentService: service,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  // Templates
  Name = () => {
    return (
      <Feature
        isActive={GlobalSettings.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).SETTINGS_NAME.isActive()}
      >
        <FormItem
          label={this.props.locales.settings.global.name.label}
          id="update-palette-name"
          isBlocked={GlobalSettings.features(
            this.props.planStatus,
            this.props.config,
            this.props.service
          ).SETTINGS_NAME.isBlocked()}
        >
          <Input
            id="update-palette-name"
            type="TEXT"
            placeholder={this.props.locales.name}
            value={this.props.name !== '' ? this.props.name : ''}
            charactersLimit={64}
            isBlocked={GlobalSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service
            ).SETTINGS_NAME.isBlocked()}
            isNew={GlobalSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service
            ).SETTINGS_NAME.isNew()}
            feature="RENAME_PALETTE"
            onChange={this.props.onChangeSettings}
            onFocus={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
          />
        </FormItem>
      </Feature>
    )
  }

  Description = () => {
    return (
      <Feature
        isActive={GlobalSettings.features(
          this.props.planStatus,
          this.props.config,
          this.props.service
        ).SETTINGS_DESCRIPTION.isActive()}
      >
        <FormItem
          label={this.props.locales.settings.global.description.label}
          id="update-palette-description"
          isBlocked={GlobalSettings.features(
            this.props.planStatus,
            this.props.config,
            this.props.service
          ).SETTINGS_DESCRIPTION.isBlocked()}
        >
          <Input
            id="update-palette-description"
            type="LONG_TEXT"
            placeholder={this.props.locales.global.description.placeholder}
            value={this.props.description}
            isBlocked={GlobalSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service
            ).SETTINGS_DESCRIPTION.isBlocked()}
            isNew={GlobalSettings.features(
              this.props.planStatus,
              this.props.config,
              this.props.service
            ).SETTINGS_DESCRIPTION.isNew()}
            feature="UPDATE_DESCRIPTION"
            isGrowing
            onFocus={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
          />
        </FormItem>
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle label={this.props.locales.settings.global.title} />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={[
          {
            node: <this.Name />,
          },
          {
            node: <this.Description />,
          },
        ]}
        border={!this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
