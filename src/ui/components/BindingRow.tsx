import { Fragment, PureComponent } from 'preact/compat'
import { createRef } from 'preact'
import {
  ColorConfiguration,
  SystemDataToken,
  TaxonomyBinding,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames } from '@unoff/utils'
import {
  Button,
  Chip,
  ColorChip,
  ColorItem,
  DraggableWindow,
  Dropdown,
  FormItem,
  Input,
  List,
  Select,
  SimpleItem,
  layouts,
  texts,
} from '@unoff/ui'
import { WithTranslationProps } from './WithTranslation'

export interface BindingRowProps extends WithTranslationProps {
  token: SystemDataToken
  binding: TaxonomyBinding | undefined
  colors: Array<ColorConfiguration>
  stops: Array<string>
  themes: Array<ThemeConfiguration>
  defaultRef: string
  resolveHex: (
    themeId: string,
    colorId: string,
    shadeName: string
  ) => string | undefined
  onChangeRef: (path: Array<string>, ref: string) => void
  onChangeDescription: (path: Array<string>, description: string) => void
  onToggleExcluded: (path: Array<string>, isExcluded: boolean) => void
}

interface BindingRowState {
  isDetailsOpen: boolean
}

export default class BindingRow extends PureComponent<
  BindingRowProps,
  BindingRowState
> {
  state: BindingRowState = {
    isDetailsOpen: false,
  }

  private triggerRef = createRef<Button>()

  componentWillUnmount = () => {
    window.removeEventListener('keydown', this.onKeyDown)
  }

  // Handlers
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeDetails()
  }

  private openDetails = () => {
    this.setState({ isDetailsOpen: true })
    window.addEventListener('keydown', this.onKeyDown)
  }

  private closeDetails = () => {
    this.setState({ isDetailsOpen: false })
    window.removeEventListener('keydown', this.onKeyDown)
  }

  private toggleDetails = () => {
    if (this.state.isDetailsOpen) this.closeDetails()
    else this.openDetails()
  }

  // Render
  render() {
    const { token, binding, colors, stops, themes, defaultRef, t } = this.props
    const rowId = token.path.join('-')
    const selectedRef = binding?.ref ?? defaultRef
    const isBroken =
      binding !== undefined &&
      !token.isExcluded &&
      token.refs.some((ref) => ref.shadeId === null)

    const themeLabel = (themeToLabel: ThemeConfiguration): string =>
      themeToLabel.id === '00000000000'
        ? t('see.properties.default')
        : themeToLabel.name

    const currentTheme = themes.find((theme) => theme.isEnabled) ?? themes[0]

    const [selectedColorId, selectedStop] = selectedRef.split(':')
    const selectedOptionLabel = `${
      colors.find((color) => color.id === selectedColorId)?.name ??
      selectedColorId
    } / ${selectedStop}`
    const tokenLabel = token.pathNames.join(' / ')

    const hasCustomThemes = themes.some((theme) => theme.id !== '00000000000')

    const valueEntries: Array<{ key: string; name: string; hex: string }> =
      binding === undefined
        ? (() => {
            const [defaultColorId, defaultStopName] = defaultRef.split(':')
            return themes
              .filter((theme) => !hasCustomThemes || theme.id !== '00000000000')
              .flatMap((theme) => {
                const hex = this.props.resolveHex(
                  theme.id,
                  defaultColorId,
                  defaultStopName
                )
                if (hex === undefined) return []
                return [{ key: theme.id, name: themeLabel(theme), hex }]
              })
          })()
        : token.refs.flatMap((ref) => {
            if (ref.shadeId === null) return []
            if (hasCustomThemes && ref.themeId === '00000000000') return []

            const [themeIdSegment, colorIdSegment, shadeName] =
              ref.shadeId.split(':')
            const hex = this.props.resolveHex(
              themeIdSegment,
              colorIdSegment,
              shadeName
            )
            if (hex === undefined) return []

            const matchedTheme = themes.find(
              (theme) => theme.id === ref.themeId
            )
            const themeName =
              matchedTheme !== undefined
                ? themeLabel(matchedTheme)
                : ref.themeId

            return [
              { key: `${ref.themeId}-${shadeName}`, name: themeName, hex },
            ]
          })

    return (
      <Fragment>
        <SimpleItem
          isListItem
          leftPartSlot={
            <div className={layouts['snackbar--tight']}>
              <span
                className={
                  doClassnames([
                    texts.type,
                    token.isExcluded ? texts['type--secondary'] : texts.type,
                  ]) as string
                }
              >
                {token.pathNames[token.pathNames.length - 1]}
              </span>
              {token.isExcluded && (
                <Chip state="INACTIVE">{t('structure.binding.excluded')}</Chip>
              )}
            </div>
          }
          rightPartSlot={
            <div className={layouts['snackbar--tight']}>
              <Dropdown
                id={`binding-ref-${rowId}`}
                options={colors.flatMap((color) =>
                  stops.map((stop) => {
                    const hex =
                      currentTheme !== undefined
                        ? this.props.resolveHex(currentTheme.id, color.id, stop)
                        : undefined

                    return {
                      type: 'OPTION' as const,
                      label: `${color.name} / ${stop}`,
                      value: `${color.id}:${stop}`,
                      startSlot:
                        hex !== undefined ? (
                          <ColorChip color={hex} />
                        ) : undefined,
                      action: () =>
                        this.props.onChangeRef(
                          token.path,
                          `${color.id}:${stop}`
                        ),
                    }
                  })
                )}
                selected={selectedRef}
                alignment="RIGHT"
                pin="TOP"
                canBeSearched
                searchLabel={t('structure.binding.searchRef')}
                noResultsLabel={t('structure.binding.noResults')}
                warning={
                  isBroken
                    ? {
                        label: t('structure.binding.brokenRef'),
                      }
                    : undefined
                }
              />
              <Button
                ref={this.triggerRef}
                type="icon"
                icon="ellipses"
                state={this.state.isDetailsOpen ? 'selected' : undefined}
                helper={{
                  label: t('structure.binding.details'),
                }}
                action={this.toggleDetails}
              />
            </div>
          }
          alignment="CENTER"
        />
        {this.state.isDetailsOpen && (
          <DraggableWindow
            title={t('structure.binding.detailsTitle', {
              token: tokenLabel,
              option: selectedOptionLabel,
            })}
            triggerRef={this.triggerRef}
            onClose={this.closeDetails}
          >
            <FormItem
              id={`binding-description-${rowId}`}
              label={t('global.description.label')}
              isMultiLine
              shouldFill
            >
              <Input
                id={`binding-description-${rowId}`}
                type="LONG_TEXT"
                value={binding?.description ?? ''}
                placeholder={t('global.description.placeholder')}
                isGrowing
                onBlur={(e) =>
                  this.props.onChangeDescription(
                    token.path,
                    e.currentTarget.value
                  )
                }
                onValid={(e) =>
                  this.props.onChangeDescription(
                    token.path,
                    e.currentTarget.value
                  )
                }
              />
            </FormItem>
            <FormItem
              id={`binding-excluded-${rowId}`}
              label={t('structure.binding.excluded')}
              shouldFill
            >
              <Select
                id={`binding-excluded-${rowId}`}
                type="CHECK_BOX"
                isChecked={token.isExcluded}
                action={(e) =>
                  this.props.onToggleExcluded(
                    token.path,
                    e.currentTarget.checked
                  )
                }
              />
            </FormItem>
            {!token.isExcluded && (
              <div className={layouts['stackbar--tight']}>
                <span
                  className={doClassnames([
                    texts.type,
                    texts.label,
                    texts['type--secondary'],
                  ])}
                >
                  {t('structure.binding.values')}
                </span>
                <List isFullWidth>
                  {valueEntries.map((entry) => (
                    <ColorItem
                      key={entry.key}
                      name={entry.name}
                      hex={entry.hex}
                    />
                  ))}
                </List>
              </div>
            )}
          </DraggableWindow>
        )}
      </Fragment>
    )
  }
}
