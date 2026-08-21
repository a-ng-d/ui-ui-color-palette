import { PureComponent } from 'preact/compat'
import chroma from 'chroma-js'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  CreatorConfiguration,
  DatesConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  PublicationConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import {
  Bar,
  ColorItem,
  FormItem,
  Layout,
  List,
  Section,
  SectionTitle,
  SimpleItem,
  texts,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import { BaseProps } from '../../types/app'
import { getTolgee } from '../../external/translation'

interface PropertiesProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  colorSpace: ColorSpaceConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  dates: DatesConfiguration
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
}

export default class Properties extends PureComponent<PropertiesProps> {
  private formatDate = (dateInput: string | Date): string => {
    if (!dateInput || dateInput === '') return this.props.t('empty')

    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
      return date.toLocaleDateString(getTolgee().getLanguage(), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return typeof dateInput === 'string' ? dateInput : dateInput.toString()
    }
  }

  // Templates
  Settings = () => {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={this.props.t('see.properties.settings.title')}
              />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={[
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.settings.name')}
                isBaseline
              >
                <span className={texts.type}>{this.props.name}</span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.settings.description')}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.description === ''
                    ? this.props.t('empty')
                    : this.props.description}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.settings.preset')}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.preset?.name ?? this.props.t('empty')}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.settings.colorSpace')}
                isBaseline
              >
                <span className={texts.type}>
                  {(() => {
                    if (!this.props.colorSpace) return this.props.t('empty')
                    const colorSpaceKey = this.props.colorSpace.toLowerCase()
                    return (
                      this.props.t(
                        `settings.color.colorSpace.${colorSpaceKey}`
                      ) || this.props.colorSpace
                    )
                  })()}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.settings.algorithmVersion')}
                isBaseline
              >
                <span className={texts.type}>
                  {(() => {
                    const algorithmKey = this.props.algorithmVersion
                    return (
                      this.props.t(
                        `settings.color.algorithmVersion.${algorithmKey}`
                      ) || this.props.algorithmVersion
                    )
                  })()}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t(
                  'see.properties.settings.lockedSourceColors'
                )}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.areSourceColorsLocked
                    ? this.props.t('pass')
                    : this.props.t('fail')}
                </span>
              </FormItem>
            ),
          },
        ]}
        border={['BOTTOM']}
      />
    )
  }

  Colors = () => {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={this.props.t('see.properties.colors.title')}
              />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={this.props.colors.flatMap((color, index) => {
          return [
            {
              node: (
                <ColorItem
                  id={color.id}
                  name={color.name}
                  hex={chroma([
                    (color.rgb?.r ?? 0) * 255,
                    (color.rgb?.g ?? 0) * 255,
                    (color.rgb?.b ?? 0) * 255,
                  ]).hex()}
                />
              ),
              spacingModifier: 'NONE',
            },
            {
              node: (
                <FormItem
                  key={`chroma-${index}`}
                  label={this.props.t('see.properties.colors.chromaShifting')}
                  isBaseline
                >
                  <ul className={texts.type}>
                    <li>
                      {(() => {
                        if (!color.chroma?.shift?.curve)
                          return this.props.t('empty')
                        const chromaCurveKey =
                          color.chroma.shift.curve.toLowerCase()
                        return (
                          this.props.t(`scale.shift.curve.${chromaCurveKey}`) ||
                          color.chroma.shift.curve
                        )
                      })()}
                    </li>
                    <li>{(color.chroma?.shift?.value ?? 0) + '%'}</li>
                    <li>{'L ' + (color.chroma?.shift?.min ?? 0) + '%'}</li>
                    <li>{'R ' + (color.chroma?.shift?.max ?? 0) + '%'}</li>
                  </ul>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <FormItem
                  key={`hue-${index}`}
                  label={this.props.t('see.properties.colors.hueShifting')}
                  isBaseline
                >
                  <ul className={texts.type}>
                    <li>
                      {(() => {
                        if (!color.hue?.shift?.curve)
                          return this.props.t('empty')
                        const hueCurveKey = color.hue.shift.curve.toLowerCase()
                        return (
                          this.props.t(`scale.shift.curve.${hueCurveKey}`) ||
                          color.hue.shift.curve
                        )
                      })()}
                    </li>
                    <li>{(color.hue?.shift?.value ?? 0) + '°'}</li>
                    <li>{'L ' + (color.hue?.shift?.min ?? 0) + '°'}</li>
                    <li>{'R ' + (color.hue?.shift?.max ?? 0) + '°'}</li>
                  </ul>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <FormItem
                  key={`alpha-${index}`}
                  label={this.props.t('see.properties.colors.alpha')}
                  isBaseline
                >
                  <span className={texts.type}>
                    {color.alpha.isEnabled
                      ? this.props.t('pass')
                      : this.props.t('fail')}
                  </span>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <FormItem
                  key={`description-${index}`}
                  label={this.props.t('see.properties.colors.description')}
                  isBaseline
                >
                  <span className={texts.type}>
                    {color.description === ''
                      ? this.props.t('empty')
                      : color.description}
                  </span>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
          ]
        })}
        border={['BOTTOM']}
      />
    )
  }

  Themes = () => {
    const customThemes = this.props.themes.filter(
      (theme) => theme.type === 'custom theme'
    )
    const defaultThemes = this.props.themes.filter(
      (theme) => theme.type === 'default theme'
    )

    const themesToDisplay =
      customThemes.length > 0 ? customThemes : defaultThemes

    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={this.props.t('see.properties.themes.title')}
              />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={themesToDisplay.flatMap((theme, index) => {
          return [
            {
              node: (
                <ColorItem
                  name={
                    theme.id === '00000000000'
                      ? this.props.t('see.properties.default')
                      : theme.name
                  }
                  hex={theme.paletteBackground}
                />
              ),
              spacingModifier: 'NONE',
            },
            {
              node: (
                <FormItem
                  label={this.props.t('see.properties.lightnessScale')}
                  isBaseline
                >
                  <ul className={texts.type}>
                    {Object.entries(theme.scale || {}).map(
                      ([scaleIndex, value]) => (
                        <li key={`scale-${index}-${scaleIndex}`}>
                          {`${scaleIndex}: ${value.toFixed(1) + '%'}`}
                        </li>
                      )
                    )}
                  </ul>
                </FormItem>
              ),
              spacingModifier: 'LARGE' as const,
            },
            {
              node: (
                <FormItem
                  key={`vision-${index}`}
                  label={this.props.t('see.properties.themes.visionSimulation')}
                  isBaseline
                >
                  <span className={texts.type}>
                    {(() => {
                      if (!theme.visionSimulationMode)
                        return this.props.t('empty')
                      const visionModeKey =
                        theme.visionSimulationMode.toLowerCase()
                      return (
                        this.props.t(
                          `settings.color.visionSimulationMode.${visionModeKey}`
                        ) || theme.visionSimulationMode
                      )
                    })()}
                  </span>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <ColorItem
                  id={`text-light-color-${index}`}
                  name={this.props.t('see.properties.themes.textLightColor')}
                  hex={theme.textColorsTheme?.lightColor ?? ''}
                />
              ),
              spacingModifier: 'TIGHT',
            },
            {
              node: (
                <ColorItem
                  id={`text-dark-color-${index}`}
                  name={this.props.t('see.properties.themes.textDarkColor')}
                  hex={theme.textColorsTheme?.darkColor ?? ''}
                />
              ),
              spacingModifier: 'TIGHT',
            },
            {
              node: (
                <FormItem
                  key={`description-${index}`}
                  label={this.props.t('see.properties.themes.description')}
                  isBaseline
                >
                  <span className={texts.type}>
                    {theme.description === ''
                      ? this.props.t('empty')
                      : theme.description}
                  </span>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
          ]
        })}
        border={['BOTTOM']}
      />
    )
  }

  Information = () => {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={this.props.t('see.properties.information.title')}
              />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={[
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.information.createdAt')}
                isBaseline
              >
                <span className={texts.type}>
                  {this.formatDate(this.props.dates.createdAt)}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.information.updatedAt')}
                isBaseline
              >
                <span className={texts.type}>
                  {this.formatDate(this.props.dates.updatedAt)}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.information.publishedAt')}
                isBaseline
              >
                <span className={texts.type}>
                  {this.formatDate(this.props.dates.publishedAt)}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.information.createdBy')}
                isBaseline
              >
                <span className={texts.type}>
                  {!this.props.creatorIdentity?.creatorFullName
                    ? this.props.t('empty')
                    : this.props.creatorIdentity.creatorFullName}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.information.published')}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.publicationStatus.isPublished
                    ? this.props.t('pass')
                    : this.props.t('fail')}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.t('see.properties.information.shared')}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.publicationStatus.isShared
                    ? this.props.t('pass')
                    : this.props.t('fail')}
                </span>
              </FormItem>
            ),
          },
        ]}
      />
    )
  }

  // Render
  render() {
    return (
      <>
        <Layout
          id="properties"
          column={[
            {
              node: (
                <>
                  <Bar
                    id="properties-header"
                    leftPartSlot={
                      <SectionTitle
                        label={this.props.t('contexts.properties')}
                      />
                    }
                    clip={['LEFT']}
                    border={['BOTTOM']}
                  />
                  <List
                    isFullHeight
                    isFullWidth
                  >
                    <this.Settings />
                    <this.Colors />
                    <this.Themes />
                    <this.Information />
                  </List>
                </>
              ),
              typeModifier: 'BLANK',
            },
          ]}
          isFullHeight
        />
      </>
    )
  }
}
