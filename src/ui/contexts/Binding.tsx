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
  Input,
  Layout,
  List,
  Message,
  SemanticMessage,
  SimpleItem,
  texts,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import BindingRow from '../components/BindingRow'
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
  }

  componentWillUnmount = () => {
    this.observer?.disconnect()
  }

  // Derived Data
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

  private get defaultRef(): string {
    return `${this.props.colors[0]?.id ?? ''}:${this.props.preset.stops[0] ?? ''}`
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
            { path, ref: this.defaultRef, ...patch } as TaxonomyBinding,
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

  // Render
  render() {
    const { systemData } = this.getComputed()
    const query = this.state.searchQuery.trim().toLowerCase()
    const filteredTokens =
      query === ''
        ? systemData.tokens
        : systemData.tokens.filter((token) =>
            token.pathNames.join(' / ').toLowerCase().includes(query)
          )

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
                  {[...groups.entries()].map(([groupLabel, tokens]) => {
                    const segments =
                      groupLabel === '' ? [] : groupLabel.split(' / ')
                    const lastSegment = segments[segments.length - 1]
                    const leadingSegments = segments.slice(0, -1)

                    return (
                      <Fragment key={groupLabel}>
                        {groupLabel !== '' && (
                          <SimpleItem
                            isListItem
                            isInteractive={false}
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
                            alignment="CENTER"
                          />
                        )}
                        {tokens.map((token) => (
                          <BindingRow
                            key={token.path.join('|')}
                            token={token}
                            binding={this.findBinding(token.path)}
                            colors={this.props.colors}
                            stops={stops}
                            themes={this.props.themes}
                            defaultRef={this.defaultRef}
                            resolveHex={this.resolveHex}
                            onChangeRef={this.onChangeRef}
                            onChangeDescription={this.onChangeDescription}
                            onToggleExcluded={this.onToggleExcluded}
                            t={this.props.t}
                          />
                        ))}
                      </Fragment>
                    )
                  })}
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
