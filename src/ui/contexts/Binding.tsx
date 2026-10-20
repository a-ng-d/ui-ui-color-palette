import { Fragment, PureComponent } from 'preact/compat'
import { createRef } from 'preact'
import {
  AlgorithmVersionConfiguration,
  BaseConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  Data,
  LockedSourceColorsConfiguration,
  PaletteData,
  PresetConfiguration,
  ShiftConfiguration,
  System,
  SystemConfiguration,
  SystemData,
  SystemDataToken,
  TaxonomyBinding,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames } from '@unoff/utils'
import {
  Bar,
  Button,
  Input,
  Layout,
  layouts,
  List,
  Message,
  SemanticMessage,
  texts,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import BindingRow, { EMPTY_REF_VALUE } from '../components/BindingRow'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { SystemBindingsMessage } from '../../types/messages'
import { BaseProps } from '../../types/app'
import { $system } from '../../stores/palette'

const RENDER_PAGE_SIZE = 100

interface BindingProps
  extends BaseProps, WithConfigProps, WithTranslationProps {
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  themes: Array<ThemeConfiguration>
  system: SystemConfiguration
}

interface BindingState {
  searchQuery: string
  renderLimit: number
  selectedPaths: Set<string>
  lastSelectedPath: string | null
}

interface ComputedSystem {
  paletteData: PaletteData
  systemData: SystemData
}

export default class Binding extends PureComponent<BindingProps, BindingState> {
  private bindingsMessage: SystemBindingsMessage
  private system: typeof $system
  private sentinelRef = createRef<HTMLDivElement>()
  private observer: IntersectionObserver | null = null
  private isShiftPressed = false
  private memoInputs: {
    system: SystemConfiguration
    colors: Array<ColorConfiguration>
    themes: Array<ThemeConfiguration>
    preset: PresetConfiguration
  } | null = null
  private memoComputed: ComputedSystem | null = null

  constructor(props: BindingProps) {
    super(props)
    this.system = $system
    this.bindingsMessage = {
      type: 'UPDATE_SYSTEM_BINDINGS',
      id: this.props.id,
      data: this.props.system.bindings ?? [],
    }
    this.state = {
      searchQuery: '',
      renderLimit: RENDER_PAGE_SIZE,
      selectedPaths: new Set(),
      lastSelectedPath: null,
    }
  }

  componentDidMount = () => {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) this.onLoadMore()
      },
      { rootMargin: '200px' }
    )
    if (this.sentinelRef.current)
      this.observer.observe(this.sentinelRef.current)

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount = () => {
    this.observer?.disconnect()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') this.isShiftPressed = true
  }

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') this.isShiftPressed = false
  }

  // Derived Data
  private getFilteredTokens = (): Array<SystemDataToken> => {
    const { systemData } = this.getComputed()
    const query = this.state.searchQuery.trim().toLowerCase()

    return query === ''
      ? systemData.tokens
      : systemData.tokens.filter((token) =>
          token.pathNames.join(' / ').toLowerCase().includes(query)
        )
  }

  private getComputed = (): ComputedSystem => {
    const { system, colors, themes, preset } = this.props

    if (
      this.memoInputs === null ||
      this.memoComputed === null ||
      this.memoInputs.system !== system ||
      this.memoInputs.colors !== colors ||
      this.memoInputs.themes !== themes ||
      this.memoInputs.preset !== preset
    ) {
      const paletteData = new Data({
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
      }).makePaletteData()

      const systemData = new System({
        paletteData,
        system: this.props.system,
      }).makeSystemData()

      this.memoInputs = { system, colors, themes, preset }
      this.memoComputed = { paletteData, systemData }
    }

    return this.memoComputed
  }

  private pathsEqual = (a: Array<string>, b: Array<string>): boolean =>
    a.length === b.length && a.every((segment, i) => segment === b[i])

  private findBinding = (path: Array<string>): TaxonomyBinding | undefined =>
    (this.props.system.bindings ?? []).find((binding) =>
      this.pathsEqual(binding.path, path)
    )

  private resolveHex = (
    themeId: string,
    colorId: string,
    shadeName: string
  ): string | undefined => {
    const { paletteData } = this.getComputed()

    return paletteData.themes
      .find((theme) => theme.id === themeId)
      ?.colors.find((color) => color.id === colorId)
      ?.shades.find((shade) => shade.name === shadeName)?.hex
  }

  // Handlers
  private upsertBinding = (
    path: Array<string>,
    patch: Partial<Pick<TaxonomyBinding, 'ref' | 'description' | 'isExcluded'>>
  ) => {
    const bindings = this.props.system.bindings ?? []
    const index = bindings.findIndex((binding) =>
      this.pathsEqual(binding.path, path)
    )

    const nextBindings =
      index === -1
        ? [
            ...bindings,
            { path, ref: EMPTY_REF_VALUE, ...patch } as TaxonomyBinding,
          ]
        : bindings.map((binding, i) =>
            i === index ? { ...binding, ...patch } : binding
          )

    this.bindingsMessage.data = nextBindings
    this.system.setKey('bindings', nextBindings)
    sendPluginMessage({ pluginMessage: this.bindingsMessage }, '*')
  }

  private onChangeRef = (path: Array<string>, ref: string) =>
    this.upsertBinding(path, { ref })

  private onClearRef = (path: Array<string>) => {
    const bindings = this.props.system.bindings ?? []
    const existing = bindings.find((binding) =>
      this.pathsEqual(binding.path, path)
    )
    const hasOtherData =
      existing !== undefined &&
      (existing.isExcluded === true || Boolean(existing.description))

    if (hasOtherData) {
      this.upsertBinding(path, { ref: EMPTY_REF_VALUE })
      return
    }

    const nextBindings = bindings.filter(
      (binding) => !this.pathsEqual(binding.path, path)
    )

    this.bindingsMessage.data = nextBindings
    this.system.setKey('bindings', nextBindings)
    sendPluginMessage({ pluginMessage: this.bindingsMessage }, '*')
  }

  private onChangeDescription = (path: Array<string>, description: string) =>
    this.upsertBinding(path, { description })

  private onToggleExcluded = (path: Array<string>, isExcluded: boolean) =>
    this.upsertBinding(path, { isExcluded })

  private onSearch = (query: string) =>
    this.setState({ searchQuery: query, renderLimit: RENDER_PAGE_SIZE })

  private onLoadMore = () =>
    this.setState((state) => ({
      renderLimit: state.renderLimit + RENDER_PAGE_SIZE,
    }))

  private onToggleSelect = (path: Array<string>) => {
    const key = path.join('|')

    if (this.isShiftPressed && this.state.lastSelectedPath !== null) {
      const orderedKeys = this.getFilteredTokens().map((token) =>
        token.path.join('|')
      )
      const anchorIndex = orderedKeys.indexOf(this.state.lastSelectedPath)
      const targetIndex = orderedKeys.indexOf(key)

      if (anchorIndex !== -1 && targetIndex !== -1) {
        const [start, end] =
          anchorIndex <= targetIndex
            ? [anchorIndex, targetIndex]
            : [targetIndex, anchorIndex]

        this.setState((state) => {
          const nextSelectedPaths = new Set(state.selectedPaths)
          orderedKeys
            .slice(start, end + 1)
            .forEach((rangeKey) => nextSelectedPaths.add(rangeKey))
          return { selectedPaths: nextSelectedPaths, lastSelectedPath: key }
        })
        return
      }
    }

    this.setState((state) => {
      const nextSelectedPaths = new Set(state.selectedPaths)
      if (nextSelectedPaths.has(key)) nextSelectedPaths.delete(key)
      else nextSelectedPaths.add(key)
      return { selectedPaths: nextSelectedPaths, lastSelectedPath: key }
    })
  }

  private onClearSelection = () =>
    this.setState({ selectedPaths: new Set(), lastSelectedPath: null })

  private setExcludedForSelected = (isExcluded: boolean) => {
    const bindings = this.props.system.bindings ?? []
    const selectedKeys = this.state.selectedPaths
    const existingKeys = new Set(
      bindings.map((binding) => binding.path.join('|'))
    )

    const updatedBindings = bindings.map((binding) =>
      selectedKeys.has(binding.path.join('|'))
        ? { ...binding, isExcluded }
        : binding
    )

    const newBindings = isExcluded
      ? this.getComputed()
          .systemData.tokens.filter(
            (token) =>
              selectedKeys.has(token.path.join('|')) &&
              !existingKeys.has(token.path.join('|'))
          )
          .map(
            (token) =>
              ({
                path: token.path,
                ref: EMPTY_REF_VALUE,
                isExcluded: true,
              }) as TaxonomyBinding
          )
      : []

    const nextBindings = [...updatedBindings, ...newBindings]

    this.bindingsMessage.data = nextBindings
    this.system.setKey('bindings', nextBindings)
    sendPluginMessage({ pluginMessage: this.bindingsMessage }, '*')
    this.setState({ selectedPaths: new Set(), lastSelectedPath: null })
  }

  private onExcludeSelected = () => this.setExcludedForSelected(true)

  private onIncludeSelected = () => this.setExcludedForSelected(false)

  // Render
  render() {
    const query = this.state.searchQuery.trim().toLowerCase()
    const filteredTokens = this.getFilteredTokens()

    const pagedTokens = filteredTokens.slice(0, this.state.renderLimit)
    const hasMore = this.state.renderLimit < filteredTokens.length

    const groups = new Map<string, Array<SystemDataToken>>()
    pagedTokens.forEach((token) => {
      const groupLabel = token.pathNames.slice(0, -1).join(' / ')
      groups.set(groupLabel, [...(groups.get(groupLabel) ?? []), token])
    })

    const stops = this.props.preset.stops.map((stop) => stop.toString())

    return (
      <Layout
        id="binding"
        column={[
          {
            node: (
              <>
                <Bar
                  id="binding-header"
                  leftPartSlot={
                    <Input
                      id="binding-search"
                      type="TEXT"
                      icon={{ type: 'PICTO', value: 'search' }}
                      placeholder={this.props.t('structure.binding.search')}
                      value={this.state.searchQuery}
                      isFlex
                      isClearable
                      isFramed={false}
                      onChange={(e) => this.onSearch(e.currentTarget.value)}
                      onClear={() => this.onSearch('')}
                    />
                  }
                  clip={['LEFT']}
                  border={['BOTTOM']}
                />
                {this.state.selectedPaths.size > 0 && (
                  <Bar
                    id="binding-bulk-actions"
                    leftPartSlot={
                      <div className={layouts['snackbar--tight']}>
                        <span className={texts.type}>
                          {this.props.t('structure.binding.selectedCount', {
                            count: this.state.selectedPaths.size,
                          })}
                        </span>
                        <Button
                          type="secondary"
                          label={this.props.t('structure.binding.deselectAll')}
                          action={this.onClearSelection}
                        />
                      </div>
                    }
                    rightPartSlot={
                      <div className={layouts['snackbar--tight']}>
                        <Button
                          type="secondary"
                          label={this.props.t(
                            'structure.binding.includeSelected'
                          )}
                          action={this.onIncludeSelected}
                        />
                        <Button
                          type="primary"
                          label={this.props.t(
                            'structure.binding.excludeSelected'
                          )}
                          action={this.onExcludeSelected}
                        />
                      </div>
                    }
                    clip={['LEFT']}
                    border={['BOTTOM']}
                  />
                )}
                <List
                  isFullWidth
                  isFullHeight
                  isMessage={filteredTokens.length === 0}
                >
                  {filteredTokens.length === 0 && (
                    <SemanticMessage
                      type="NEUTRAL"
                      message={
                        query === ''
                          ? this.props.t('structure.binding.noTokens')
                          : this.props.t('structure.binding.noTokensMatch')
                      }
                    />
                  )}
                  {[...groups.entries()].map(
                    ([groupLabel, tokens], groupIndex) => {
                      const segments =
                        groupLabel === '' ? [] : groupLabel.split(' / ')
                      const lastSegment = segments[segments.length - 1]
                      const leadingSegments = segments.slice(0, -1)

                      return (
                        <Fragment key={groupLabel}>
                          {groupLabel !== '' && (
                            <Bar
                              leftPartSlot={
                                <span>
                                  {leadingSegments.map((segment, index) => (
                                    <span
                                      key={index}
                                      className={doClassnames([
                                        texts.type,
                                        texts['type--secondary'],
                                      ])}
                                    >
                                      {segment}
                                      <span
                                        className={doClassnames([
                                          texts.type,
                                          texts['type--secondary'],
                                        ])}
                                      >
                                        {' / '}
                                      </span>
                                    </span>
                                  ))}
                                  <span className={texts.type}>
                                    {lastSegment}
                                  </span>
                                </span>
                              }
                              border={groupIndex > 0 ? ['TOP'] : undefined}
                            />
                          )}
                          {tokens.map((token, tokenIndex) => (
                            <BindingRow
                              key={token.path.join('|')}
                              token={token}
                              binding={this.findBinding(token.path)}
                              colors={this.props.colors}
                              stops={stops}
                              themes={this.props.themes}
                              hasRowAbove={tokenIndex > 0}
                              previousRef={
                                tokenIndex > 0
                                  ? this.findBinding(
                                      tokens[tokenIndex - 1].path
                                    )?.ref
                                  : undefined
                              }
                              isSelected={this.state.selectedPaths.has(
                                token.path.join('|')
                              )}
                              resolveHex={this.resolveHex}
                              onChangeRef={this.onChangeRef}
                              onClearRef={this.onClearRef}
                              onChangeDescription={this.onChangeDescription}
                              onToggleExcluded={this.onToggleExcluded}
                              onToggleSelect={this.onToggleSelect}
                              t={this.props.t}
                            />
                          ))}
                        </Fragment>
                      )
                    }
                  )}
                  <div ref={this.sentinelRef} />
                </List>
                {!hasMore && filteredTokens.length > 0 && (
                  <Bar
                    soloPartSlot={
                      <Message
                        icon="check"
                        messages={[
                          this.props.t('structure.binding.allTokensShown'),
                        ]}
                      />
                    }
                    isCentered
                    padding="var(--size-pos-xxsmall) var(--size-pos-xsmall)"
                    border={['TOP']}
                  />
                )}
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }
}
