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
import { doClassnames, FeatureStatus } from '@unoff/utils'
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
import Feature from '../components/Feature'
import BindingRow, { EMPTY_REF_VALUE } from '../components/BindingRow'
import { sendPluginMessage } from '../../utils/pluginMessage'
import mergeBindings, {
  arePathsEqual,
  BindingPatch,
  isRefValid,
  makePathKey,
} from '../../utils/mergeBindings'
import makeStructureContext from '../../utils/makeStructureContext'
import {
  computeAiCost,
  estimateAiCost,
  EXPECTED_TOKENS_PER_BINDING,
  sumUsage,
} from '../../utils/computeAiCost'
import { SystemBindingsMessage } from '../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $system } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import { trackActionEvent } from '../../external/tracking/eventsTracker'
import { MistralUsage } from '../../external/mistral/types'
import { getMistral } from '../../external/mistral'
import { ConfigContextType } from '../../config/ConfigContext'

const RENDER_PAGE_SIZE = 100
const AI_CHUNK_SIZE = 150
const AI_FEEDBACK_DURATION = 8000

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
  isAiLoading: boolean
  aiFeedback: {
    type: 'SUCCESS' | 'ERROR' | 'NEUTRAL'
    message: string
  } | null
}

interface ComputedSystem {
  paletteData: PaletteData
  systemData: SystemData
}

const isString = (value: unknown): value is string => typeof value === 'string'

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
  private memoEstimate: {
    computed: ComputedSystem
    system: SystemConfiguration
    selectedPaths: Set<string>
    cost: number
  } | null = null
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    BINDING_AI: new FeatureStatus({
      features: config.features,
      featureName: 'BINDING_AI',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return Binding.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

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
      isAiLoading: false,
      aiFeedback: null,
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
    if (this.feedbackTimer !== null) clearTimeout(this.feedbackTimer)
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

  private getAiEstimate = (): number => {
    const computed = this.getComputed()
    const { selectedPaths } = this.state

    if (
      this.memoEstimate !== null &&
      this.memoEstimate.computed === computed &&
      this.memoEstimate.system === this.props.system &&
      this.memoEstimate.selectedPaths === selectedPaths
    )
      return this.memoEstimate.cost

    const targets = this.getAiTargets()
    let cost = 0

    if (targets.length > 0) {
      const stops = this.props.preset.stops.map((stop) => stop.toString())
      let inputChars = 0
      let chunkCount = 0

      for (let i = 0; i < targets.length; i += AI_CHUNK_SIZE) {
        inputChars += JSON.stringify(
          makeStructureContext({
            paletteData: computed.paletteData,
            systemData: computed.systemData,
            system: this.props.system,
            stops,
            tokens: targets.slice(i, i + AI_CHUNK_SIZE),
          })
        ).length
        chunkCount++
      }

      cost = estimateAiCost(
        inputChars,
        targets.length * EXPECTED_TOKENS_PER_BINDING,
        this.props.config.plan.aiCredits,
        'bindings',
        chunkCount
      )
    }

    this.memoEstimate = {
      computed,
      system: this.props.system,
      selectedPaths,
      cost,
    }

    return cost
  }

  private pathsEqual = arePathsEqual

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
    const nextBindings = mergeBindings(this.props.system.bindings ?? [], [
      { path, ...patch },
    ])

    this.bindingsMessage.data = nextBindings
    this.system.setKey('bindings', nextBindings)
    sendPluginMessage({ pluginMessage: this.bindingsMessage }, '*')
  }

  private setAiFeedback = (aiFeedback: BindingState['aiFeedback']) => {
    if (this.feedbackTimer !== null) clearTimeout(this.feedbackTimer)
    this.setState({ aiFeedback })
    if (aiFeedback !== null && aiFeedback.type !== 'ERROR')
      this.feedbackTimer = setTimeout(
        () => this.setState({ aiFeedback: null }),
        AI_FEEDBACK_DURATION
      )
  }

  private getAiTargets = (): Array<SystemDataToken> => {
    const { systemData } = this.getComputed()
    const { selectedPaths } = this.state

    return systemData.tokens.filter((token) => {
      if (token.isExcluded) return false
      if (selectedPaths.size > 0 && !selectedPaths.has(makePathKey(token.path)))
        return false

      const binding = this.findBinding(token.path)

      return (
        binding === undefined ||
        binding.ref === undefined ||
        binding.ref === EMPTY_REF_VALUE
      )
    })
  }

  private onSuggestBindings = async () => {
    const mistralClient = getMistral()

    if (!mistralClient || !mistralClient.hasAgent('bindings')) {
      this.setAiFeedback({
        type: 'ERROR',
        message: this.props.t('error.unavailableAi'),
      })
      return
    }

    const targets = this.getAiTargets()

    if (targets.length === 0) {
      this.setAiFeedback({
        type: 'NEUTRAL',
        message: this.props.t('structure.binding.ai.noTarget'),
      })
      return
    }

    this.setAiFeedback(null)
    this.setState({ isAiLoading: true })

    try {
      const { paletteData } = this.getComputed()
      const stops = this.props.preset.stops.map((stop) => stop.toString())
      const colorIds = new Set(this.props.colors.map((color) => color.id))
      const stopsSet = new Set(stops)
      const patches: Array<BindingPatch> = []
      let skipped = 0

      let succeededChunks = 0
      const usages: Array<MistralUsage> = []
      let hasChunkFailed = false

      for (let i = 0; i < targets.length; i += AI_CHUNK_SIZE) {
        const chunk = targets.slice(i, i + AI_CHUNK_SIZE)
        let suggestion
        try {
          suggestion = await mistralClient.suggestBindings(
            makeStructureContext({
              paletteData,
              systemData: this.getComputed().systemData,
              system: this.props.system,
              stops,
              tokens: chunk,
            })
          )
        } catch (error) {
          console.error(error)
          hasChunkFailed = true
          break
        }
        succeededChunks++
        usages.push(suggestion.usage)

        const chunkKeys = new Set(chunk.map((token) => makePathKey(token.path)))
        suggestion.bindings.forEach((entry) => {
          if (!Array.isArray(entry.path) || !entry.path.every(isString)) {
            skipped++
            return
          }
          const key = makePathKey(entry.path)
          if (
            !chunkKeys.has(key) ||
            typeof entry.ref !== 'string' ||
            !isRefValid(entry.ref, colorIds, stopsSet)
          ) {
            skipped++
            return
          }
          chunkKeys.delete(key)
          patches.push({
            path: entry.path,
            ref: entry.ref,
            description: entry.description,
          })
        })
        skipped += chunkKeys.size
      }

      const currentBindings = this.system.get().bindings ?? []
      const safePatches = patches.filter((patch) => {
        const current = currentBindings.find((binding) =>
          arePathsEqual(binding.path, patch.path)
        )
        const isTaken =
          current !== undefined &&
          (current.isExcluded === true ||
            (current.ref !== undefined && current.ref !== EMPTY_REF_VALUE))
        if (isTaken) skipped++
        return !isTaken
      })

      if (safePatches.length > 0) {
        const nextBindings = mergeBindings(currentBindings, safePatches, {
          descriptionMode: 'FILL_EMPTY',
        })

        this.bindingsMessage.data = nextBindings
        this.system.setKey('bindings', nextBindings)
        sendPluginMessage({ pluginMessage: this.bindingsMessage }, '*')
      }

      const isCharged =
        this.props.config.plan.isProEnabled &&
        this.props.config.plan.isCreditsEnabled
      const cost =
        succeededChunks > 0
          ? computeAiCost(
              sumUsage(usages),
              this.props.config.plan.aiCredits,
              'bindings'
            )
          : 0

      if (isCharged && succeededChunks > 0)
        $creditsCount.set($creditsCount.get() - cost)

      if (succeededChunks > 0 && safePatches.length > 0)
        trackActionEvent(
          this.props.config.env.isMixpanelEnabled,
          this.props.userSession.userId,
          this.props.userIdentity.id,
          this.props.planStatus,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'AI_BINDINGS',
            colors: this.props.colors.length,
            stops: stops.length,
          }
        )

      this.setState({ isAiLoading: false })
      const resultMessage = this.props.t(
        isCharged && succeededChunks > 0
          ? 'structure.binding.ai.successWithCost'
          : 'structure.binding.ai.success',
        { count: safePatches.length, skipped, cost }
      )
      this.setAiFeedback(
        hasChunkFailed
          ? {
              type: 'ERROR',
              message: `${this.props.t('error.unavailableAi')} ${resultMessage}`,
            }
          : { type: 'SUCCESS', message: resultMessage }
      )
    } catch (error) {
      console.error(error)
      this.setState({ isAiLoading: false })
      this.setAiFeedback({
        type: 'ERROR',
        message: this.props.t('error.unavailableAi'),
      })
    }
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
    const mistralClient = getMistral()

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
                  rightPartSlot={
                    <Feature
                      isActive={
                        this.features.BINDING_AI.isActive() &&
                        !!this.props.config.env.mistralAgents?.bindings
                      }
                    >
                      <Button
                        type="icon"
                        icon="ai"
                        helper={{
                          label: !mistralClient?.hasAgent('bindings')
                            ? this.props.t('error.unavailableAi')
                            : this.props.config.plan.isProEnabled &&
                                this.props.config.plan.isCreditsEnabled &&
                                this.getAiEstimate() > 0
                              ? this.props.t(
                                  'structure.binding.ai.suggestWithCost',
                                  { cost: this.getAiEstimate() }
                                )
                              : this.props.t('structure.binding.ai.suggest'),
                          type: 'MULTI_LINE',
                        }}
                        isLoading={this.state.isAiLoading}
                        isDisabled={!mistralClient?.hasAgent('bindings')}
                        isNew={this.features.BINDING_AI.isNew()}
                        isBlocked={this.features.BINDING_AI.isReached(
                          (this.props.creditsCount - this.getAiEstimate()) *
                            -1 -
                            1
                        )}
                        onBlock={() => {
                          const isTrial =
                            this.props.config.plan.isTrialEnabled &&
                            this.props.trialStatus !== 'EXPIRED'
                          sendPluginMessage(
                            {
                              pluginMessage: isTrial
                                ? { type: 'GET_TRIAL' }
                                : {
                                    type: 'GET_PRO',
                                    data: { origin: 'BINDING_AI' },
                                  },
                            },
                            '*'
                          )
                        }}
                        action={this.onSuggestBindings}
                      />
                    </Feature>
                  }
                  clip={['LEFT']}
                  border={['BOTTOM']}
                />
                {this.state.aiFeedback !== null && (
                  <Bar
                    id="binding-ai-feedback"
                    soloPartSlot={
                      <SemanticMessage
                        type={this.state.aiFeedback.type}
                        message={this.state.aiFeedback.message}
                      />
                    }
                    clip={['LEFT']}
                    border={['BOTTOM']}
                  />
                )}
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
