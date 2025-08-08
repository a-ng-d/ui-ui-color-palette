import type { DropdownOption } from '@a_ng_d/figmug-ui'
import React from 'react'
import { PureComponent } from 'preact/compat'
import { ColorSpaceConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Bar,
  Dropdown,
  Input,
  Layout,
  layouts,
  Menu,
  SectionTitle,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { ConfigContextType } from '../../config/ConfigContext'

interface ExportProps extends BaseProps, WithConfigProps {
  id: string
  exportPreview: string
  exportType: string
}

interface ExportStates {
  format:
    | 'EXPORT_TOKENS_DTCG'
    | 'EXPORT_TOKENS_GLOBAL'
    | 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY'
    | 'EXPORT_TOKENS_TOKENS_STUDIO'
    | 'EXPORT_STYLESHEET_CSS'
    | 'EXPORT_STYLESHEET_SCSS'
    | 'EXPORT_STYLESHEET_LESS'
    | 'EXPORT_TAILWIND'
    | 'EXPORT_APPLE_SWIFTUI'
    | 'EXPORT_APPLE_UIKIT'
    | 'EXPORT_ANDROID_COMPOSE'
    | 'EXPORT_ANDROID_XML'
    | 'EXPORT_CSV'
  colorSpace: {
    selected: ColorSpaceConfiguration
    options: Array<DropdownOption>
  }
}

export default class Export extends PureComponent<ExportProps, ExportStates> {
  private counter: number

  static defaultProps = {
    exportPreview: '',
  }

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    EXPORT_COLOR_SPACE: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_COLOR_SPACE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_COLOR_SPACE_RGB: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_COLOR_SPACE_RGB',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_COLOR_SPACE_HEX: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_COLOR_SPACE_HEX',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_COLOR_SPACE_HSL: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_COLOR_SPACE_HSL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_COLOR_SPACE_LCH: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_COLOR_SPACE_LCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_COLOR_SPACE_OKLCH: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_COLOR_SPACE_LCH',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_COLOR_SPACE_P3: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_COLOR_SPACE_P3',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS_JSON: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_JSON',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS_JSON_TOKENS_STUDIO: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_JSON_TOKENS_STUDIO',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS_JSON_DTCG: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_JSON_DTCG',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_STYLESHEET: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_STYLESHEET',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_STYLESHEET_CSS: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_STYLESHEET_CSS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_STYLESHEET_SCSS: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_STYLESHEET_SCSS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_STYLESHEET_LESS: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_STYLESHEET_LESS',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TAILWIND: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TAILWIND',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_APPLE: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_APPLE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_APPLE_SWIFTUI: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_APPLE_SWIFTUI',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_APPLE_UIKIT: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_APPLE_UIKIT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_ANDROID: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_ANDROID',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_ANDROID_COMPOSE: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_ANDROID_COMPOSE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_ANDROID_XML: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_ANDROID_XML',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_CSV: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_CSV',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  constructor(props: ExportProps) {
    super(props)
    this.counter = 0
    this.state = {
      format: 'EXPORT_TOKENS_TOKENS_STUDIO',
      colorSpace: {
        selected: 'RGB',
        options: [],
      },
    }
  }

  // Handlers
  exportHandler = (e: Event) => {
    const actions: {
      [key: string]: () => void
    } = {
      EXPORT_TOKENS_TOKENS_STUDIO: () => {
        this.setState({
          format: 'EXPORT_TOKENS_TOKENS_STUDIO',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_TOKENS_STUDIO',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_DTCG: () => {
        this.setState({
          format: 'EXPORT_TOKENS_DTCG',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('EXPORT_TOKENS_DTCG', [
              'rgb',
              'oklch',
            ]),
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_DTCG',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_DTCG_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_DTCG',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_DTCG_OKLCH: () => {
        this.setState({
          colorSpace: {
            selected: 'OKLCH',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_DTCG',
              colorSpace: 'OKLCH',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_AMZN_STYLE_DICTIONARY: () => {
        this.setState({
          format: 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_AMZN_STYLE_DICTIONARY',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_GLOBAL: () => {
        this.setState({
          format: 'EXPORT_TOKENS_GLOBAL',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_GLOBAL',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_CSS: () => {
        this.setState({
          format: 'EXPORT_STYLESHEET_CSS',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('EXPORT_STYLESHEET_CSS', [
              'rgb',
              'hex',
              'hsl',
              'lch',
              'p3',
            ]),
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_CSS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_CSS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_CSS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_CSS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_CSS_P3: () => {
        this.setState({
          colorSpace: {
            selected: 'P3',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'P3',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_SCSS: () => {
        this.setState({
          format: 'EXPORT_STYLESHEET_SCSS',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('EXPORT_STYLESHEET_SCSS', [
              'rgb',
              'hex',
              'hsl',
              'lch',
              'p3',
            ]),
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'SCSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_SCSS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'SCSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_SCSS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'SCSS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_SCSS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'SCSS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_SCSS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'SCSS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_SCSS_P3: () => {
        this.setState({
          colorSpace: {
            selected: 'P3',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'SCSS',
              colorSpace: 'P3',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_LESS: () => {
        this.setState({
          format: 'EXPORT_STYLESHEET_LESS',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('EXPORT_STYLESHEET_LESS', [
              'rgb',
              'hex',
              'hsl',
              'lch',
              'p3',
            ]),
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'LESS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_LESS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'LESS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_LESS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'LESS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_LESS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'LESS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_LESS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'LESS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      EXPORT_STYLESHEET_LESS_P3: () => {
        this.setState({
          colorSpace: {
            selected: 'P3',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'LESS',
              colorSpace: 'P3',
            },
          },
          '*'
        )
      },
      EXPORT_TAILWIND: () => {
        this.setState({
          format: 'EXPORT_TAILWIND',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TAILWIND',
            },
          },
          '*'
        )
      },
      EXPORT_APPLE_SWIFTUI: () => {
        this.setState({
          format: 'EXPORT_APPLE_SWIFTUI',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'APPLE_SWIFTUI',
            },
          },
          '*'
        )
      },
      EXPORT_APPLE_UIKIT: () => {
        this.setState({
          format: 'EXPORT_APPLE_UIKIT',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'APPLE_UIKIT',
            },
          },
          '*'
        )
      },
      EXPORT_ANDROID_COMPOSE: () => {
        this.setState({
          format: 'EXPORT_ANDROID_COMPOSE',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'ANDROID_COMPOSE',
            },
          },
          '*'
        )
      },
      EXPORT_ANDROID_XML: () => {
        this.setState({
          format: 'EXPORT_ANDROID_XML',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'ANDROID_XML',
            },
          },
          '*'
        )
      },
      EXPORT_CSV: () => {
        this.setState({
          format: 'EXPORT_CSV',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSV',
            },
          },
          '*'
        )
      },
      DEFAULT: () => null,
    }

    return actions[(e.target as HTMLElement).dataset.value ?? 'DEFAULT']?.()
  }

  colorSpaceHandler = (
    exportType: string,
    spaces: Array<'rgb' | 'hex' | 'hsl' | 'lch' | 'oklch' | 'p3'>
  ): Array<DropdownOption> => {
    const model = (
      label: string,
      value: string,
      feature: string
    ): DropdownOption => {
      return {
        label: label,
        value: value,
        feature: 'SELECT_COLOR_SPACE',
        type: 'OPTION',
        isActive: Export.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        )[feature as keyof ReturnType<typeof Export.features>].isActive(),
        isBlocked: Export.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        )[feature as keyof ReturnType<typeof Export.features>].isBlocked(),
        isNew: Export.features(
          this.props.planStatus,
          this.props.config,
          this.props.service,
          this.props.editor
        )[feature as keyof ReturnType<typeof Export.features>].isNew(),
        action: this.exportHandler,
      }
    }

    return [
      {
        label: this.props.locales.export.colorSpace.label,
        type: 'TITLE',
      },
      ...(spaces.includes('rgb')
        ? [
            model(
              this.props.locales.export.colorSpace.rgb,
              `${exportType}_RGB`,
              'EXPORT_COLOR_SPACE_RGB'
            ),
          ]
        : []),
      ...(spaces.includes('hex')
        ? [
            model(
              this.props.locales.export.colorSpace.hex,
              `${exportType}_HEX`,
              'EXPORT_COLOR_SPACE_HEX'
            ),
          ]
        : []),
      ...(spaces.includes('hsl')
        ? [
            model(
              this.props.locales.export.colorSpace.hsl,
              `${exportType}_HSL`,
              'EXPORT_COLOR_SPACE_HSL'
            ),
          ]
        : []),
      ...(spaces.includes('lch')
        ? [
            model(
              this.props.locales.export.colorSpace.lch,
              `${exportType}_LCH`,
              'EXPORT_COLOR_SPACE_LCH'
            ),
          ]
        : []),
      ...(spaces.includes('oklch')
        ? [
            model(
              this.props.locales.export.colorSpace.oklch,
              `${exportType}_OKLCH`,
              'EXPORT_COLOR_SPACE_OKLCH'
            ),
          ]
        : []),
      ...(spaces.includes('p3')
        ? [
            model(
              this.props.locales.export.colorSpace.p3,
              `${exportType}_P3`,
              'EXPORT_COLOR_SPACE_P3'
            ),
          ]
        : []),
    ]
  }

  // Direct Actions
  setFirstPreview = () => {
    this.counter === 0 &&
      parent.postMessage(
        {
          pluginMessage: {
            type: 'EXPORT_PALETTE',
            id: this.props.id,
            export: this.state.format.replace('EXPORT_', ''),
          },
        },
        '*'
      )
    this.counter = 1
  }

  selectPreview = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => (e.target as HTMLInputElement).select()

  deSelectPreview = () => window.getSelection()?.removeAllRanges()

  // Render
  render() {
    this.setFirstPreview()
    return (
      <Layout
        id="export"
        column={[
          {
            node: (
              <>
                <Bar
                  id="export-palette"
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.locales.export.format}
                      indicator="13"
                    />
                  }
                  rightPartSlot={
                    <div className={layouts['snackbar--medium']}>
                      <Dropdown
                        id="select-format"
                        options={[
                          {
                            label: this.props.locales.export.tokens.label,
                            value: 'TOKENS_GROUP',
                            feature: 'SELECT_EXPORT_FILE',
                            type: 'GROUP',
                            isActive: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_TOKENS.isActive(),
                            isBlocked: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_TOKENS.isBlocked(),
                            isNew: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_TOKENS.isNew(),
                            children: [
                              {
                                label:
                                  this.props.locales.export.tokens.nativeTokens
                                    .label,
                                value: 'EXPORT_TOKENS_TOKENS_STUDIO',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_TOKENS_STUDIO.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_TOKENS_STUDIO.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_TOKENS_STUDIO.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label:
                                  this.props.locales.export.tokens.dtcg.label,
                                value: 'EXPORT_TOKENS_DTCG',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_DTCG.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_DTCG.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_DTCG.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label:
                                  this.props.locales.export.tokens
                                    .amznStyleDictionary,
                                value: 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label: this.props.locales.export.tokens.global,
                                value: 'EXPORT_TOKENS_GLOBAL',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_JSON.isNew(),
                                action: this.exportHandler,
                              },
                            ],
                          },
                          {
                            label: this.props.locales.export.stylesheet.label,
                            value: 'STYLESHEET_GROUP',
                            type: 'GROUP',
                            isActive: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_STYLESHEET.isActive(),
                            isBlocked: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_STYLESHEET.isBlocked(),
                            isNew: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_STYLESHEET.isNew(),
                            children: [
                              {
                                label:
                                  this.props.locales.export.stylesheet
                                    .customProperties,
                                value: 'EXPORT_STYLESHEET_CSS',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_CSS.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_CSS.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_CSS.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label:
                                  this.props.locales.export.stylesheet.scss,
                                value: 'EXPORT_STYLESHEET_SCSS',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_SCSS.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_SCSS.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_SCSS.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label:
                                  this.props.locales.export.stylesheet.less,
                                value: 'EXPORT_STYLESHEET_LESS',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_LESS.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_LESS.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_STYLESHEET_LESS.isNew(),
                                action: this.exportHandler,
                              },
                            ],
                          },
                          {
                            label: this.props.locales.export.tailwind.config,
                            value: 'EXPORT_TAILWIND',
                            type: 'OPTION',
                            isActive: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_TAILWIND.isActive(),
                            isBlocked: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_TAILWIND.isBlocked(),
                            isNew: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_TAILWIND.isNew(),
                            action: this.exportHandler,
                          },
                          {
                            label: this.props.locales.export.apple.label,
                            value: 'APPLE_GROUP',
                            type: 'GROUP',
                            isActive: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_APPLE.isActive(),
                            isBlocked: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_APPLE.isBlocked(),
                            isNew: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_APPLE.isNew(),
                            children: [
                              {
                                label: this.props.locales.export.apple.swiftui,
                                value: 'EXPORT_APPLE_SWIFTUI',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_APPLE_SWIFTUI.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_APPLE_SWIFTUI.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_APPLE_SWIFTUI.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label: this.props.locales.export.apple.uikit,
                                value: 'EXPORT_APPLE_UIKIT',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_APPLE_UIKIT.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_APPLE_UIKIT.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_APPLE_UIKIT.isNew(),
                                action: this.exportHandler,
                              },
                            ],
                            action: this.exportHandler,
                          },
                          {
                            label: this.props.locales.export.android.label,
                            value: 'ANDROID_GROUP',
                            type: 'GROUP',
                            isActive: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_ANDROID.isActive(),
                            isBlocked: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_ANDROID.isBlocked(),
                            isNew: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_ANDROID.isNew(),
                            children: [
                              {
                                label:
                                  this.props.locales.export.android.compose,
                                value: 'EXPORT_ANDROID_COMPOSE',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_ANDROID_COMPOSE.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_ANDROID_COMPOSE.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_ANDROID_COMPOSE.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label:
                                  this.props.locales.export.android.resources,
                                value: 'EXPORT_ANDROID_XML',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_ANDROID_XML.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_ANDROID_XML.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_ANDROID_XML.isNew(),
                                action: this.exportHandler,
                              },
                            ],
                            action: this.exportHandler,
                          },
                          {
                            label: this.props.locales.export.csv.spreadsheet,
                            value: 'EXPORT_CSV',
                            type: 'OPTION',
                            isActive: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_CSV.isActive(),
                            isBlocked: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_CSV.isBlocked(),
                            isNew: Export.features(
                              this.props.planStatus,
                              this.props.config,
                              this.props.service,
                              this.props.editor
                            ).EXPORT_CSV.isNew(),
                            action: this.exportHandler,
                          },
                        ]}
                        selected={this.state.format ?? ''}
                        alignment="RIGHT"
                        pin="TOP"
                      />
                      {(this.state.format === 'EXPORT_STYLESHEET_CSS' ||
                        this.state.format === 'EXPORT_STYLESHEET_SCSS' ||
                        this.state.format === 'EXPORT_STYLESHEET_LESS') && (
                        <Menu
                          icon="adjust"
                          id="color-space"
                          options={this.state.colorSpace.options}
                          selected={`${this.state.format}_${this.state.colorSpace.selected}`}
                          alignment="BOTTOM_RIGHT"
                          helper={{
                            label:
                              this.props.locales.export.actions
                                .selectColorSpace,
                          }}
                        />
                      )}
                      {this.state.format === 'EXPORT_TOKENS_DTCG' && (
                        <Menu
                          icon="adjust"
                          id="color-space"
                          options={this.state.colorSpace.options}
                          selected={`${this.state.format}_${this.state.colorSpace.selected}`}
                          alignment="BOTTOM_RIGHT"
                          helper={{
                            label:
                              this.props.locales.export.actions
                                .selectColorSpace,
                          }}
                        />
                      )}
                    </div>
                  }
                />
                {this.state.format === 'EXPORT_TOKENS_DTCG' && (
                  <div className="export-palette__info">
                    <SemanticMessage
                      type="INFO"
                      message={this.props.locales.export.tokens.dtcg.message}
                    />
                  </div>
                )}
                {this.state.format === 'EXPORT_TOKENS_TOKENS_STUDIO' && (
                  <div className="export-palette__info">
                    <SemanticMessage
                      type="INFO"
                      message={
                        this.props.locales.export.tokens.nativeTokens.message
                      }
                    />
                  </div>
                )}
                <div className="export-palette__preview">
                  <Input
                    id="code-snippet-dragging"
                    type="CODE"
                    value={this.props.exportPreview}
                  />
                </div>
              </>
            ),
          },
        ]}
        isFullHeight
      />
    )
  }
}
