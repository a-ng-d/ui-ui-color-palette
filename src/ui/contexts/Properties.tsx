import React from 'react'
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
} from '@a_ng_d/utils-ui-color-palette'
import { doClassnames } from '@a_ng_d/figmug-utils'
import {
  ColorItem,
  FormItem,
  Layout,
  Section,
  SectionTitle,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import { WithConfigProps } from '../components/WithConfig'
import { BaseProps } from '../../types/app'

interface PropertiesProps extends BaseProps, WithConfigProps {
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
    if (!dateInput || dateInput === '') return this.props.locales.empty

    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
      return date.toLocaleDateString(this.props.lang, {
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
                label={this.props.locales.see.properties.settings.title}
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
                label={this.props.locales.see.properties.settings.name}
                isBaseline
              >
                <span className={texts.type}>{this.props.name}</span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.locales.see.properties.settings.description}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.description === ''
                    ? this.props.locales.empty
                    : this.props.description}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.locales.see.properties.settings.preset}
                isBaseline
              >
                <span className={texts.type}>{this.props.preset.name}</span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.locales.see.properties.settings.colorSpace}
                isBaseline
              >
                <span className={texts.type}>
                  {(() => {
                    const colorSpaceKey =
                      this.props.colorSpace.toLowerCase() as keyof typeof this.props.locales.settings.color.colorSpace
                    return (
                      this.props.locales.settings.color.colorSpace[
                        colorSpaceKey
                      ] || this.props.colorSpace
                    )
                  })()}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={
                  this.props.locales.see.properties.settings.algorithmVersion
                }
                isBaseline
              >
                <span className={texts.type}>
                  {(() => {
                    const algorithmKey = this.props
                      .algorithmVersion as keyof typeof this.props.locales.settings.color.algorithmVersion
                    return (
                      this.props.locales.settings.color.algorithmVersion[
                        algorithmKey
                      ] || this.props.algorithmVersion
                    )
                  })()}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={
                  this.props.locales.see.properties.settings.lockedSourceColors
                }
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.areSourceColorsLocked
                    ? this.props.locales.pass
                    : this.props.locales.fail}
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
                label={this.props.locales.see.properties.colors.title}
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
                    color.rgb.r * 255,
                    color.rgb.g * 255,
                    color.rgb.b * 255,
                  ]).hex()}
                />
              ),
              spacingModifier: 'NONE',
            },
            {
              node: (
                <FormItem
                  key={`chroma-${index}`}
                  label={
                    this.props.locales.see.properties.colors.chromaShifting
                  }
                  isBaseline
                >
                  <span className={texts.type}>{color.chroma.shift + '%'}</span>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <FormItem
                  key={`hue-${index}`}
                  label={this.props.locales.see.properties.colors.hueShifting}
                  isBaseline
                >
                  <span className={texts.type}>{color.hue.shift + '°'}</span>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <FormItem
                  key={`alpha-${index}`}
                  label={this.props.locales.see.properties.colors.alpha}
                  isBaseline
                >
                  <span className={texts.type}>
                    {color.alpha.isEnabled
                      ? this.props.locales.pass
                      : this.props.locales.fail}
                  </span>
                </FormItem>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <FormItem
                  key={`description-${index}`}
                  label={this.props.locales.see.properties.colors.description}
                  isBaseline
                >
                  <span className={texts.type}>
                    {color.description === ''
                      ? this.props.locales.empty
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
                label={this.props.locales.see.properties.themes.title}
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
                <span
                  className={doClassnames([texts.type, texts['type--bold']])}
                >
                  {theme.name === 'None'
                    ? this.props.locales.see.properties.default
                    : theme.name}
                </span>
              ),
              spacingModifier: 'LARGE',
            },
            {
              node: (
                <FormItem
                  label={this.props.locales.see.properties.lightnessScale}
                  isBaseline
                >
                  <ul className={texts.type}>
                    {Object.entries(theme.scale || {}).map(
                      ([scaleIndex, value]) => (
                        <li key={`scale-${index}-${scaleIndex}`}>
                          {`${scaleIndex}: ${value + '%'}`}
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
                  label={
                    this.props.locales.see.properties.themes.visionSimulation
                  }
                  isBaseline
                >
                  <span className={texts.type}>
                    {(() => {
                      const visionModeKey =
                        theme.visionSimulationMode.toLowerCase() as keyof typeof this.props.locales.settings.color.visionSimulationMode
                      return (
                        this.props.locales.settings.color.visionSimulationMode[
                          visionModeKey
                        ] || theme.visionSimulationMode
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
                  name={this.props.locales.see.properties.themes.textLightColor}
                  hex={theme.textColorsTheme.lightColor}
                />
              ),
              spacingModifier: 'TIGHT',
            },
            {
              node: (
                <ColorItem
                  id={`text-dark-color-${index}`}
                  name={this.props.locales.see.properties.themes.textDarkColor}
                  hex={theme.textColorsTheme.darkColor}
                />
              ),
              spacingModifier: 'TIGHT',
            },
            {
              node: (
                <FormItem
                  key={`description-${index}`}
                  label={this.props.locales.see.properties.themes.description}
                  isBaseline
                >
                  <span className={texts.type}>
                    {theme.description === ''
                      ? this.props.locales.empty
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
                label={this.props.locales.see.properties.information.title}
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
                label={this.props.locales.see.properties.information.createdAt}
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
                label={this.props.locales.see.properties.information.updatedAt}
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
                label={
                  this.props.locales.see.properties.information.publishedAt
                }
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
                label={this.props.locales.see.properties.information.createdBy}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.creatorIdentity.creatorFullName === ''
                    ? this.props.locales.empty
                    : this.props.creatorIdentity.creatorFullName}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.locales.see.properties.information.published}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.publicationStatus.isPublished
                    ? this.props.locales.pass
                    : this.props.locales.fail}
                </span>
              </FormItem>
            ),
          },
          {
            node: (
              <FormItem
                label={this.props.locales.see.properties.information.shared}
                isBaseline
              >
                <span className={texts.type}>
                  {this.props.publicationStatus.isShared
                    ? this.props.locales.pass
                    : this.props.locales.fail}
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
                  <this.Settings />
                  <this.Colors />
                  <this.Themes />
                  <this.Information />
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
