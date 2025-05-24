import {
  FormItem,
  Input,
  Section,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ConfigContextType } from '../../config/ConfigContext'
import { BaseProps, PlanStatus } from '../../types/app'
import Feature from '../components/Feature'
import { WithConfigProps } from '../components/WithConfig'

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
  static features = (planStatus: PlanStatus, config: ConfigContextType) => ({
    SETTINGS_NAME: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
    }),
    SETTINGS_DESCRIPTION: new FeatureStatus({
      features: config.features,
      featureName: 'SETTINGS_DESCRIPTION',
      planStatus: planStatus,
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
          this.props.config
        ).SETTINGS_NAME.isActive()}
      >
        <FormItem
          label={this.props.locals.settings.global.name.label}
          id="update-palette-name"
          isBlocked={GlobalSettings.features(
            this.props.planStatus,
            this.props.config
          ).SETTINGS_NAME.isBlocked()}
        >
          <Input
            id="update-palette-name"
            type="TEXT"
            placeholder={this.props.locals.name}
            value={this.props.name !== '' ? this.props.name : ''}
            charactersLimit={64}
            isBlocked={GlobalSettings.features(
              this.props.planStatus,
              this.props.config
            ).SETTINGS_NAME.isBlocked()}
            isNew={GlobalSettings.features(
              this.props.planStatus,
              this.props.config
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
          this.props.config
        ).SETTINGS_DESCRIPTION.isActive()}
      >
        <FormItem
          label={this.props.locals.settings.global.description.label}
          id="update-palette-description"
          isBlocked={GlobalSettings.features(
            this.props.planStatus,
            this.props.config
          ).SETTINGS_DESCRIPTION.isBlocked()}
        >
          <Input
            id="update-palette-description"
            type="LONG_TEXT"
            placeholder={this.props.locals.global.description.placeholder}
            value={this.props.description}
            isBlocked={GlobalSettings.features(
              this.props.planStatus,
              this.props.config
            ).SETTINGS_DESCRIPTION.isBlocked()}
            isNew={GlobalSettings.features(
              this.props.planStatus,
              this.props.config
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
              <SectionTitle label={this.props.locals.settings.global.title} />
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
