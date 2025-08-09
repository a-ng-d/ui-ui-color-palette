import type { DropdownOption } from '@a_ng_d/figmug-ui'
import {
  docco,
  atomOneDark,
} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import SyntaxHighlighter from 'react-syntax-highlighter'
import React from 'react'
import { PureComponent } from 'preact/compat'
import { ColorSpaceConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import {
  Button,
  Dropdown,
  Layout,
  layouts,
  Menu,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
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
    | 'TOKENS_NATIVE'
    | 'TOKENS_DTCG'
    | 'TOKENS_UNIVERSAL'
    | 'TOKENS_STYLE_DICTIONARY_V3'
    | 'STYLESHEET_CSS'
    | 'STYLESHEET_SCSS'
    | 'STYLESHEET_LESS'
    | 'TAILWIND_V3'
    | 'TAILWIND_V4'
    | 'APPLE_SWIFTUI'
    | 'APPLE_UIKIT'
    | 'ANDROID_COMPOSE'
    | 'ANDROID_XML'
    | 'CSV'
  colorSpace: {
    selected: ColorSpaceConfiguration
    options: Array<DropdownOption>
  }
}

export default class Export extends PureComponent<ExportProps, ExportStates> {
  private counter: number
  private theme: string | null
  private mode: string | null

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
    EXPORT_TOKENS_UNIVERSAL: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_UNIVERSAL',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS_STYLE_DICTIONARY_V3: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_STYLE_DICTIONARY_V3',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS_NATIVE: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_NATIVE',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TOKENS_DTCG: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TOKENS_DTCG',
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
    EXPORT_TAILWIND_V3: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TAILWIND_V3',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
    EXPORT_TAILWIND_V4: new FeatureStatus({
      features: config.features,
      featureName: 'EXPORT_TAILWIND_V4',
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
    this.theme = document.documentElement.getAttribute('data-theme')
    this.mode = document.documentElement.getAttribute('data-mode')
    this.state = {
      format: 'TOKENS_NATIVE',
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
      TOKENS_NATIVE: () => {
        this.setState({
          format: 'TOKENS_NATIVE',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_NATIVE',
            },
          },
          '*'
        )
      },
      TOKENS_DTCG: () => {
        this.setState({
          format: 'TOKENS_DTCG',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('TOKENS_DTCG', ['rgb', 'oklch']),
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
      TOKENS_DTCG_RGB: () => {
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
      TOKENS_DTCG_OKLCH: () => {
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
      TOKENS_STYLE_DICTIONARY_V3: () => {
        this.setState({
          format: 'TOKENS_STYLE_DICTIONARY_V3',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_STYLE_DICTIONARY_V3',
            },
          },
          '*'
        )
      },
      TOKENS_UNIVERSAL: () => {
        this.setState({
          format: 'TOKENS_UNIVERSAL',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_UNIVERSAL',
            },
          },
          '*'
        )
      },
      STYLESHEET_CSS: () => {
        this.setState({
          format: 'STYLESHEET_CSS',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('STYLESHEET_CSS', [
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
              export: 'STYLESHEET_CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      STYLESHEET_CSS_RGB: () => {
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
              export: 'STYLESHEET_CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      STYLESHEET_CSS_HEX: () => {
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
              export: 'STYLESHEET_CSS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      STYLESHEET_CSS_HSL: () => {
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
              export: 'STYLESHEET_CSS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      STYLESHEET_CSS_LCH: () => {
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
              export: 'STYLESHEET_CSS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      STYLESHEET_CSS_P3: () => {
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
              export: 'STYLESHEET_CSS',
              colorSpace: 'P3',
            },
          },
          '*'
        )
      },
      STYLESHEET_SCSS: () => {
        this.setState({
          format: 'STYLESHEET_SCSS',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('STYLESHEET_SCSS', [
              'rgb',
              'hex',
              'hsl',
              'lch',
              'oklch',
            ]),
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'STYLESHEET_SCSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      STYLESHEET_SCSS_RGB: () => {
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
              export: 'STYLESHEET_SCSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      STYLESHEET_SCSS_HEX: () => {
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
              export: 'STYLESHEET_SCSS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      STYLESHEET_SCSS_HSL: () => {
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
              export: 'STYLESHEET_SCSS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      STYLESHEET_SCSS_LCH: () => {
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
              export: 'STYLESHEET_SCSS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      STYLESHEET_SCSS_OKLCH: () => {
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
              export: 'STYLESHEET_SCSS',
              colorSpace: 'OKLCH',
            },
          },
          '*'
        )
      },
      STYLESHEET_LESS: () => {
        this.setState({
          format: 'STYLESHEET_LESS',
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('STYLESHEET_LESS', [
              'rgb',
              'hex',
              'hsl',
              'lch',
              'oklch',
            ]),
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'STYLESHEET_LESS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      STYLESHEET_LESS_RGB: () => {
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
              export: 'STYLESHEET_LESS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      STYLESHEET_LESS_HEX: () => {
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
              export: 'STYLESHEET_LESS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      STYLESHEET_LESS_HSL: () => {
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
              export: 'STYLESHEET_LESS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      STYLESHEET_LESS_LCH: () => {
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
              export: 'STYLESHEET_LESS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      STYLESHEET_LESS_OKLCH: () => {
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
              export: 'STYLESHEET_LESS',
              colorSpace: 'OKLCH',
            },
          },
          '*'
        )
      },
      TAILWIND_V3: () => {
        this.setState({
          format: 'TAILWIND_V3',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TAILWIND_V3',
            },
          },
          '*'
        )
      },
      TAILWIND_V4: () => {
        this.setState({
          format: 'TAILWIND_V4',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TAILWIND_V4',
            },
          },
          '*'
        )
      },
      APPLE_SWIFTUI: () => {
        this.setState({
          format: 'APPLE_SWIFTUI',
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
      APPLE_UIKIT: () => {
        this.setState({
          format: 'APPLE_UIKIT',
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
      ANDROID_COMPOSE: () => {
        this.setState({
          format: 'ANDROID_COMPOSE',
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
      ANDROID_XML: () => {
        this.setState({
          format: 'ANDROID_XML',
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
      CSV: () => {
        this.setState({
          format: 'CSV',
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
            export: this.state.format,
          },
        },
        '*'
      )
    this.counter = 1
  }

  copyCode = () => {
    if (!this.props.exportPreview) return

    navigator.clipboard
      .writeText(this.props.exportPreview)
      .then(() => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'POST_MESSAGE',
              data: {
                type: 'INFO',
                message: this.props.locales.info.copiedCode,
              },
            },
          },
          '*'
        )
      })
      .catch(() => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'POST_MESSAGE',
              data: {
                style: 'WARNING',
                message: this.props.locales.warning.uncopiedCode,
              },
            },
          },
          '*'
        )
      })
  }

  handleCodeSyntaxTheme = () => {
    const figmaMode = document.documentElement.getAttribute('class')

    if (figmaMode !== null)
      if (this.theme === 'figma-ui3' || this.theme === 'figma-ui2')
        return figmaMode?.includes('dark') ? atomOneDark : docco

    return this.mode?.includes('dark') ? atomOneDark : docco
  }

  getLanguageFromFormat = (format: string): string => {
    if (format.includes('STYLESHEET_CSS')) return 'css'
    if (format.includes('STYLESHEET_SCSS')) return 'scss'
    if (format.includes('STYLESHEET_LESS')) return 'less'
    if (format.includes('TOKENS_')) return 'json'
    if (format.includes('APPLE_SWIFTUI')) return 'swift'
    if (format.includes('APPLE_UIKIT')) return 'objectivec'
    if (format.includes('ANDROID_COMPOSE')) return 'kotlin'
    if (format.includes('ANDROID_XML')) return 'xml'
    if (format.includes('TAILWIND')) return 'javascript'
    if (format.includes('CSV')) return 'csv'
    return 'text'
  }

  // Render
  render() {
    let border
    let radius
    let selectionBackground
    let textColor

    switch (this.theme) {
      case 'figma-ui3':
        border = '1px solid var(--figma-color-border)'
        radius = 'var(--border-radius-medium)'
        selectionBackground = 'var(--figma-color-bg-selected)'
        textColor = 'var(--figma-color-text-disabled)'
        break
      case 'penpot':
        border = '1px solid var(--penpot-color-background-quaternary)'
        radius = 'var(--border-radius-xlarge)'
        selectionBackground = 'var(--penpot-color-accent-primary-muted)'
        textColor = 'var(--penpot-color-foreground-disabled)'
        break
      case 'sketch':
        border = '1px solid var(--sketch-color-border-primary)'
        radius = 'var(--border-radius-large)'
        selectionBackground = 'var(--sketch-color-accent-disabled)'
        textColor = 'var(--sketch-color-foreground-disabled)'
        break
      default:
        border = '1px solid var(--figma-color-border)'
        radius = 'var(--border-radius-large)'
        selectionBackground = 'var(--figma-color-bg-selected)'
        textColor = 'var(--figma-color-text-disabled)'
    }

    this.setFirstPreview()
    return (
      <Layout
        id="export"
        column={[
          {
            node: (
              <>
                <SimpleItem
                  id="export-palette"
                  leftPartSlot={
                    <SectionTitle
                      label={this.props.locales.export.format}
                      indicator="14"
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
                                value: 'TOKENS_NATIVE',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_NATIVE.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_NATIVE.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_NATIVE.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label:
                                  this.props.locales.export.tokens.dtcg.label,
                                value: 'TOKENS_DTCG',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_DTCG.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_DTCG.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_DTCG.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label:
                                  this.props.locales.export.tokens
                                    .styleDictionary,
                                value: 'TOKENS_STYLE_DICTIONARY_V3',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_STYLE_DICTIONARY_V3.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_STYLE_DICTIONARY_V3.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_STYLE_DICTIONARY_V3.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label: this.props.locales.export.tokens.global,
                                value: 'TOKENS_UNIVERSAL',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_UNIVERSAL.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_UNIVERSAL.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TOKENS_UNIVERSAL.isNew(),
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
                                value: 'STYLESHEET_CSS',
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
                                value: 'STYLESHEET_SCSS',
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
                                value: 'STYLESHEET_LESS',
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
                            label: this.props.locales.export.tailwind.label,
                            value: 'TAILWIND',
                            type: 'GROUP',
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
                            children: [
                              {
                                label: this.props.locales.export.tailwind.v3,
                                value: 'TAILWIND_V3',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TAILWIND_V3.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TAILWIND_V3.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TAILWIND_V3.isNew(),
                                action: this.exportHandler,
                              },
                              {
                                label: this.props.locales.export.tailwind.v4,
                                value: 'TAILWIND_V4',
                                type: 'OPTION',
                                isActive: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TAILWIND_V4.isActive(),
                                isBlocked: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TAILWIND_V4.isBlocked(),
                                isNew: Export.features(
                                  this.props.planStatus,
                                  this.props.config,
                                  this.props.service,
                                  this.props.editor
                                ).EXPORT_TAILWIND_V4.isNew(),
                                action: this.exportHandler,
                              },
                            ],
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
                                value: 'APPLE_SWIFTUI',
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
                                value: 'APPLE_UIKIT',
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
                                value: 'ANDROID_COMPOSE',
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
                                value: 'ANDROID_XML',
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
                            value: 'CSV',
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
                      {(this.state.format === 'STYLESHEET_CSS' ||
                        this.state.format === 'STYLESHEET_SCSS' ||
                        this.state.format === 'STYLESHEET_LESS' ||
                        this.state.format === 'TOKENS_DTCG') && (
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
                      <Button
                        type="icon"
                        icon="draft"
                        helper={{
                          label: this.props.locales.export.actions.copyCode,
                        }}
                        action={this.copyCode}
                      />
                    </div>
                  }
                  alignment="CENTER"
                  isListItem={false}
                />
                {this.state.format === 'TOKENS_DTCG' && (
                  <div
                    style={{
                      padding:
                        '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
                    }}
                  >
                    <SemanticMessage
                      type="INFO"
                      message={this.props.locales.export.tokens.dtcg.message}
                    />
                  </div>
                )}
                {this.state.format === 'TOKENS_NATIVE' && (
                  <div
                    style={{
                      padding:
                        '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
                    }}
                  >
                    <SemanticMessage
                      type="INFO"
                      message={
                        this.props.locales.export.tokens.nativeTokens.message
                      }
                    />
                  </div>
                )}
                <div className="export-palette__preview">
                  <style>
                    {`
                      .export-palette__preview pre ::selection {
                        background-color: ${selectionBackground};
                      }
                    `}
                  </style>
                  <SyntaxHighlighter
                    language={this.getLanguageFromFormat(this.state.format)}
                    style={this.handleCodeSyntaxTheme()}
                    showLineNumbers={true}
                    lineNumberStyle={{
                      minWidth: 'var(--size-pos-small)',
                      paddingRight: 'var(--size-pos-xsmall)',
                      color: textColor,
                      borderRight: border,
                      marginRight: 'var(--size-pos-xxsmall)',
                    }}
                    customStyle={{
                      borderRadius: radius,
                      fontSize: 'var(--font-size-small)',
                      margin: 0,
                      overflow: 'auto',
                      height: '100%',
                      backgroundColor: 'transparent',
                      border: border,
                      userSelect: 'text',
                    }}
                    wrapLongLines={true}
                  >
                    {this.props.exportPreview}
                  </SyntaxHighlighter>
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
