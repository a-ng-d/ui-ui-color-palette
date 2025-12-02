import type { DropdownOption } from '@a_ng_d/figmug-ui'
import {
  docco,
  atomOneDark,
} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import SyntaxHighlighter from 'react-syntax-highlighter'
import React from 'react'
import { PureComponent } from 'preact/compat'
import {
  AlgorithmVersionConfiguration,
  BaseConfiguration,
  Code,
  ColorConfiguration,
  ColorSpaceConfiguration,
  Data,
  ExportConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
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
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { ExportEvent } from '../../types/events'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { trackExportEvent } from '../../external/tracking/eventsTracker'
import { ConfigContextType } from '../../config/ConfigContext'

interface ExportProps extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  themes: Array<ThemeConfiguration>
  algorithmVersion: AlgorithmVersionConfiguration
  context: ExportConfiguration['context']
  code: ExportConfiguration['data']
  onChangeExport: (args: { export: ExportConfiguration }) => void
  onCopyCode: () => void
}

interface ExportStates {
  colorSpace: {
    selected: ColorSpaceConfiguration
    options: Array<DropdownOption>
  }
}

export default class Export extends PureComponent<ExportProps, ExportStates> {
  private theme: string | null
  private mode: string | null

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
    this.theme = document.documentElement.getAttribute('data-theme')
    this.mode = document.documentElement.getAttribute('data-mode')
    this.state = {
      colorSpace: {
        selected: 'RGB',
        options: [],
      },
    }
  }

  // Lifecycle
  componentDidMount() {
    this.props.onChangeExport({
      export: {
        format: 'JSON',
        context: 'TOKENS_NATIVE',
        mimeType: 'application/json',
        data: this.getCodeFromProps().makeNativeTokens(),
      },
    })
  }

  // Handlers
  exportHandler = (e: Event) => {
    const actions: {
      [key: string]: () => void
    } = {
      TOKENS_NATIVE: () => {
        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'TOKENS_NATIVE',
            mimeType: 'application/json',
            data: this.getCodeFromProps().makeNativeTokens(),
          },
        })
      },
      TOKENS_DTCG: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('TOKENS_DTCG', ['rgb', 'oklch']),
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'TOKENS_DTCG',
            mimeType: 'application/json',
            data: this.getCodeFromProps().makeDtcgTokens('RGB'),
          },
        })
      },
      TOKENS_DTCG_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'TOKENS_DTCG',
            mimeType: 'application/json',
            data: this.getCodeFromProps().makeDtcgTokens('RGB'),
          },
        })
      },
      TOKENS_DTCG_OKLCH: () => {
        this.setState({
          colorSpace: {
            selected: 'OKLCH',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'TOKENS_DTCG',
            mimeType: 'application/json',
            data: this.getCodeFromProps().makeDtcgTokens('OKLCH'),
          },
        })
      },
      TOKENS_STYLE_DICTIONARY_V3: () => {
        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'TOKENS_STYLE_DICTIONARY_V3',
            mimeType: 'application/json',
            data: this.getCodeFromProps().makeStyleDictionaryV3Tokens(),
          },
        })
      },
      TOKENS_UNIVERSAL: () => {
        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'TOKENS_UNIVERSAL',
            mimeType: 'application/json',
            data: this.getCodeFromProps().makeUniversalJson(),
          },
        })
      },
      STYLESHEET_CSS: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.colorSpaceHandler('STYLESHEET_CSS', [
              'rgb',
              'hex',
              'hsl',
              'lch',
              'oklch',
              'p3',
            ]),
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'CSS',
            context: 'STYLESHEET_CSS',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeCssCustomProps('RGB'),
          },
        })
      },
      STYLESHEET_CSS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'STYLESHEET_CSS',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeCssCustomProps('RGB'),
          },
        })
      },
      STYLESHEET_CSS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'JSON',
            context: 'STYLESHEET_CSS',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeCssCustomProps('HEX'),
          },
        })
      },
      STYLESHEET_CSS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'CSS',
            context: 'STYLESHEET_CSS',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeCssCustomProps('HSL'),
          },
        })
      },
      STYLESHEET_CSS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'CSS',
            context: 'STYLESHEET_CSS',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeCssCustomProps('LCH'),
          },
        })
      },
      STYLESHEET_CSS_OKLCH: () => {
        this.setState({
          colorSpace: {
            selected: 'OKLCH',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'CSS',
            context: 'STYLESHEET_CSS',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeCssCustomProps('OKLCH'),
          },
        })
      },
      STYLESHEET_CSS_P3: () => {
        this.setState({
          colorSpace: {
            selected: 'P3',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'CSS',
            context: 'STYLESHEET_CSS',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeCssCustomProps('P3'),
          },
        })
      },
      STYLESHEET_SCSS: () => {
        this.setState({
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

        this.props.onChangeExport({
          export: {
            format: 'SCSS',
            context: 'STYLESHEET_SCSS',
            mimeType: 'text/x-scss',
            data: this.getCodeFromProps().makeScssVariables('RGB'),
          },
        })
      },
      STYLESHEET_SCSS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'SCSS',
            context: 'STYLESHEET_SCSS',
            mimeType: 'text/x-scss',
            data: this.getCodeFromProps().makeScssVariables('RGB'),
          },
        })
      },
      STYLESHEET_SCSS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'SCSS',
            context: 'STYLESHEET_SCSS',
            mimeType: 'text/x-scss',
            data: this.getCodeFromProps().makeScssVariables('HEX'),
          },
        })
      },
      STYLESHEET_SCSS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'SCSS',
            context: 'STYLESHEET_SCSS',
            mimeType: 'text/x-scss',
            data: this.getCodeFromProps().makeScssVariables('HSL'),
          },
        })
      },
      STYLESHEET_SCSS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'SCSS',
            context: 'STYLESHEET_SCSS',
            mimeType: 'text/x-scss',
            data: this.getCodeFromProps().makeScssVariables('LCH'),
          },
        })
      },
      STYLESHEET_SCSS_OKLCH: () => {
        this.setState({
          colorSpace: {
            selected: 'OKLCH',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'SCSS',
            context: 'STYLESHEET_SCSS',
            mimeType: 'text/x-scss',
            data: this.getCodeFromProps().makeScssVariables('OKLCH'),
          },
        })
      },
      STYLESHEET_LESS: () => {
        this.setState({
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
        this.props.onChangeExport({
          export: {
            format: 'LESS',
            context: 'STYLESHEET_LESS',
            mimeType: 'text/x-less',
            data: this.getCodeFromProps().makeLessVariables('RGB'),
          },
        })
      },
      STYLESHEET_LESS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'LESS',
            context: 'STYLESHEET_LESS',
            mimeType: 'text/x-less',
            data: this.getCodeFromProps().makeLessVariables('RGB'),
          },
        })
      },
      STYLESHEET_LESS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'LESS',
            context: 'STYLESHEET_LESS',
            mimeType: 'text/x-less',
            data: this.getCodeFromProps().makeLessVariables('HEX'),
          },
        })
      },
      STYLESHEET_LESS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'LESS',
            context: 'STYLESHEET_LESS',
            mimeType: 'text/x-less',
            data: this.getCodeFromProps().makeLessVariables('HSL'),
          },
        })
      },
      STYLESHEET_LESS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'LESS',
            context: 'STYLESHEET_LESS',
            mimeType: 'text/x-less',
            data: this.getCodeFromProps().makeLessVariables('LCH'),
          },
        })
      },
      STYLESHEET_LESS_OKLCH: () => {
        this.setState({
          colorSpace: {
            selected: 'OKLCH',
            options: this.state.colorSpace.options,
          },
        })

        this.props.onChangeExport({
          export: {
            format: 'LESS',
            context: 'STYLESHEET_LESS',
            mimeType: 'text/x-less',
            data: this.getCodeFromProps().makeLessVariables('OKLCH'),
          },
        })
      },
      TAILWIND_V3: () => {
        this.props.onChangeExport({
          export: {
            format: 'JS',
            context: 'TAILWIND_V3',
            mimeType: 'text/javascript',
            data: this.getCodeFromProps().makeTailwindV3Config(),
          },
        })
      },
      TAILWIND_V4: () => {
        this.props.onChangeExport({
          export: {
            format: 'CSS',
            context: 'TAILWIND_V4',
            mimeType: 'text/css',
            data: this.getCodeFromProps().makeTailwindV4Config(),
          },
        })
      },
      APPLE_SWIFTUI: () => {
        this.props.onChangeExport({
          export: {
            format: 'SWIFT',
            context: 'APPLE_SWIFTUI',
            mimeType: 'text/swift',
            data: this.getCodeFromProps().makeSwiftUI(),
          },
        })
      },
      APPLE_UIKIT: () => {
        this.props.onChangeExport({
          export: {
            format: 'SWIFT',
            context: 'APPLE_UIKIT',
            mimeType: 'text/swift',
            data: this.getCodeFromProps().makeUIKit(),
          },
        })
      },
      ANDROID_COMPOSE: () => {
        this.props.onChangeExport({
          export: {
            format: 'KT',
            context: 'ANDROID_COMPOSE',
            mimeType: 'text/x-kotlin',
            data: this.getCodeFromProps().makeCompose(),
          },
        })
      },
      ANDROID_XML: () => {
        this.props.onChangeExport({
          export: {
            format: 'XML',
            context: 'ANDROID_XML',
            mimeType: 'text/xml',
            data: this.getCodeFromProps().makeResources(),
          },
        })
      },
      CSV: () => {
        this.props.onChangeExport({
          export: {
            format: 'CSV',
            context: 'CSV',
            mimeType: 'text/csv',
            data: this.getCodeFromProps().makeCsv(),
          },
        })
      },
      DEFAULT: () => null,
    }

    trackExportEvent(
      this.props.config.env.isMixpanelEnabled,
      this.props.userSession.userId,
      this.props.userIdentity.id,
      this.props.planStatus,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: (e.target as HTMLElement).dataset
          .value as ExportEvent['feature'],
      }
    )

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
        label: this.props.t('export.colorSpace.label'),
        type: 'TITLE',
      },
      ...(spaces.includes('rgb')
        ? [
            model(
              this.props.t('export.colorSpace.rgb'),
              `${exportType}_RGB`,
              'EXPORT_COLOR_SPACE_RGB'
            ),
          ]
        : []),
      ...(spaces.includes('hex')
        ? [
            model(
              this.props.t('export.colorSpace.hex'),
              `${exportType}_HEX`,
              'EXPORT_COLOR_SPACE_HEX'
            ),
          ]
        : []),
      ...(spaces.includes('hsl')
        ? [
            model(
              this.props.t('export.colorSpace.hsl'),
              `${exportType}_HSL`,
              'EXPORT_COLOR_SPACE_HSL'
            ),
          ]
        : []),
      ...(spaces.includes('lch')
        ? [
            model(
              this.props.t('export.colorSpace.lch'),
              `${exportType}_LCH`,
              'EXPORT_COLOR_SPACE_LCH'
            ),
          ]
        : []),
      ...(spaces.includes('oklch')
        ? [
            model(
              this.props.t('export.colorSpace.oklch'),
              `${exportType}_OKLCH`,
              'EXPORT_COLOR_SPACE_OKLCH'
            ),
          ]
        : []),
      ...(spaces.includes('p3')
        ? [
            model(
              this.props.t('export.colorSpace.p3'),
              `${exportType}_P3`,
              'EXPORT_COLOR_SPACE_P3'
            ),
          ]
        : []),
    ]
  }

  handleCodeSyntaxTheme = () => {
    const figmaMode = document.documentElement.getAttribute('class')

    if (figmaMode !== null)
      if (this.theme === 'figma')
        return figmaMode?.includes('dark') ? atomOneDark : docco

    return this.mode?.includes('dark') ? atomOneDark : docco
  }

  // Direct Actions
  getLanguageFromFormat = (format: string): string => {
    if (format.includes('STYLESHEET_CSS')) return 'css'
    if (format.includes('STYLESHEET_SCSS')) return 'scss'
    if (format.includes('STYLESHEET_LESS')) return 'less'
    if (format.includes('TOKENS_')) return 'json'
    if (format.includes('APPLE_SWIFTUI')) return 'swift'
    if (format.includes('APPLE_UIKIT')) return 'swift'
    if (format.includes('ANDROID_COMPOSE')) return 'kotlin'
    if (format.includes('ANDROID_XML')) return 'xml'
    if (format.includes('TAILWIND')) return 'javascript'
    if (format.includes('CSV')) return 'csv'
    return 'text'
  }

  getCodeFromProps = (): Code => {
    const args = {
      base: {
        name: this.props.name,
        description: this.props.description,
        preset: this.props.preset,
        shift: this.props.shift,
        areSourceColorsLocked: this.props.areSourceColorsLocked,
        colors: this.props.colors,
        colorSpace: this.props.colorSpace,
        algorithmVersion: this.props.algorithmVersion,
      } as BaseConfiguration,
      themes: this.props.themes,
    }

    const data = new Data(args).makePaletteData()

    return new Code(data)
  }

  // Render
  render() {
    let border
    let radius
    let selectionBackground
    let textColor

    switch (this.theme) {
      case 'figma':
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
      case 'framer':
        border = '1px solid var(--framer-color-divider)'
        radius = 'var(--border-radius-xlarge)'
        selectionBackground = 'var(--framer-color-tint-dimmed)'
        textColor = 'var(--framer-color-text-tertiary)'
        break
      default:
        border = '1px solid var(--figma-color-border)'
        radius = 'var(--border-radius-large)'
        selectionBackground = 'var(--figma-color-bg-selected)'
        textColor = 'var(--figma-color-text-disabled)'
    }

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
                      label={this.props.t('export.format')}
                      indicator="14"
                    />
                  }
                  rightPartSlot={
                    <div className={layouts['snackbar--medium']}>
                      <Dropdown
                        id="select-format"
                        options={[
                          {
                            label: this.props.t('export.tokens.label'),
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
                                label: this.props.t(
                                  'export.tokens.nativeTokens.label'
                                ),
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
                                label: this.props.t('export.tokens.dtcg.label'),
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
                                label: this.props.t(
                                  'export.tokens.styleDictionary'
                                ),
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
                                label: this.props.t('export.tokens.global'),
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
                            label: this.props.t('export.stylesheet.label'),
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
                                label: this.props.t(
                                  'export.stylesheet.customProperties'
                                ),
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
                                label: this.props.t('export.stylesheet.scss'),
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
                                label: this.props.t('export.stylesheet.less'),
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
                            label: this.props.t('export.tailwind.label'),
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
                                label: this.props.t('export.tailwind.v3'),
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
                                label: this.props.t('export.tailwind.v4'),
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
                            label: this.props.t('export.apple.label'),
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
                                label: this.props.t('export.apple.swiftui'),
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
                                label: this.props.t('export.apple.uikit'),
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
                            label: this.props.t('export.android.label'),
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
                                label: this.props.t('export.android.compose'),
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
                                label: this.props.t('export.android.resources'),
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
                            label: this.props.t('export.csv.spreadsheet'),
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
                        selected={this.props.context ?? ''}
                        alignment="RIGHT"
                        pin="TOP"
                      />
                      {(this.props.context === 'STYLESHEET_CSS' ||
                        this.props.context === 'STYLESHEET_SCSS' ||
                        this.props.context === 'STYLESHEET_LESS' ||
                        this.props.context === 'TOKENS_DTCG') && (
                        <Menu
                          icon="adjust"
                          id="color-space"
                          options={this.state.colorSpace.options}
                          selected={`${this.props.context}_${this.state.colorSpace.selected}`}
                          alignment="BOTTOM_RIGHT"
                          helper={{
                            label: this.props.t(
                              'export.actions.selectColorSpace'
                            ),
                          }}
                        />
                      )}
                      {this.props.context !== 'CSV' && (
                        <Button
                          type="icon"
                          icon="draft"
                          helper={{
                            label: this.props.t('export.actions.copyCode'),
                          }}
                          action={this.props.onCopyCode}
                        />
                      )}
                    </div>
                  }
                  alignment="CENTER"
                  isListItem={false}
                />
                {this.props.context === 'TOKENS_DTCG' && (
                  <div
                    style={{
                      padding:
                        '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
                    }}
                  >
                    <SemanticMessage
                      type="INFO"
                      message={this.props.t('export.tokens.dtcg.message')}
                    />
                  </div>
                )}
                {this.props.context === 'TOKENS_NATIVE' && (
                  <div
                    style={{
                      padding:
                        '0 var(--size-pos-xsmall) var(--size-pos-xxsmall)',
                    }}
                  >
                    <SemanticMessage
                      type="INFO"
                      message={this.props.t(
                        'export.tokens.nativeTokens.message'
                      )}
                    />
                  </div>
                )}
                <div className="export-palette__preview">
                  <style>
                    {`
                      .export-palette__preview pre,
                      .export-palette__preview pre code,
                      .export-palette__preview pre span {
                        -webkit-user-select: text !important;
                        -moz-user-select: text !important;
                        -ms-user-select: text !important;
                        user-select: text !important;
                      }
                      
                      .export-palette__preview pre span.react-syntax-highlighter-line-number {
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        user-select: none !important;
                      }
                      
                      .export-palette__preview pre *::selection {
                        background-color: ${selectionBackground} !important;
                      }
                      
                      .export-palette__preview pre *::-webkit-selection {
                        background-color: ${selectionBackground} !important;
                      }
                      
                      .export-palette__preview pre *::-moz-selection {
                        background-color: ${selectionBackground} !important;
                      }
                      
                      @media screen and (-webkit-min-device-pixel-ratio:0) {
                        .export-palette__preview pre *::selection {
                          background-color: ${selectionBackground} !important;
                        }
                      }
                    `}
                  </style>
                  <SyntaxHighlighter
                    language={this.getLanguageFromFormat(this.props.context)}
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
                      WebkitUserSelect: 'text',
                      MozUserSelect: 'text',
                      msUserSelect: 'text',
                    }}
                    wrapLongLines={true}
                  >
                    {this.props.context === 'CSV'
                      ? (this.props.code[0].colors[0].csv ??
                        this.props.t('warning.emptySourceColors'))
                      : this.props.code}
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
