import { uid } from 'uid'
import { PureComponent } from 'preact/compat'
import { createRef } from 'preact'
import {
  AlgorithmVersionConfiguration,
  BaseConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  Data,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  ShiftConfiguration,
  System,
  SystemConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { doClassnames, FeatureStatus } from '@unoff/utils'
import {
  Bar,
  Button,
  Chip,
  Input,
  SectionTitle,
  SemanticMessage,
  texts,
} from '@unoff/ui'
import { WithTranslationProps } from '../components/WithTranslation'
import { WithConfigProps } from '../components/WithConfig'
import Feature from '../components/Feature'
import {
  sanitizeStructureIssues,
  sanitizeStructureQuestions,
} from '../../utils/sanitizeStructureFeedback'
import { sendPluginMessage } from '../../utils/pluginMessage'
import makeStructureContext from '../../utils/makeStructureContext'
import {
  computeAiCost,
  estimateAiCost,
  EXPECTED_CHAT_REPLY_TOKENS,
} from '../../utils/computeAiCost'
import applyStructurePatch, {
  sanitizeStructurePatch,
  summarizeStructurePatch,
} from '../../utils/applyStructurePatch'
import {
  STRUCTURE_CHAT_MAX_MESSAGES,
  STRUCTURE_CHAT_WINDOW,
  StructureChatHistory,
  StructureChatMessage,
  StructureIssue,
  StructurePatchStatus,
} from '../../types/structureChat'
import {
  PluginMessageData,
  StructureChatGetMessage,
  StructureChatUpdateMessage,
  SystemBindingsMessage,
  SystemSchemaMessage,
} from '../../types/messages'
import { BaseProps, Editor, PlanStatus, Service } from '../../types/app'
import { $structureChat } from '../../stores/structureChat'
import { $system } from '../../stores/palette'
import { $creditsCount } from '../../stores/credits'
import { trackActionEvent } from '../../external/tracking/eventsTracker'
import { getMistral } from '../../external/mistral'
import { ConfigContextType } from '../../config/ConfigContext'

interface StructureAssistantProps
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

interface StructureAssistantState {
  history: StructureChatHistory
  prompt: string
  isRequestProcessing: boolean
  error: string | null
  notice: { type: 'SUCCESS' | 'WARNING'; message: string } | null
  isHydrated: boolean
  draftAnswers: Record<string, Record<string, string>>
}

const PROMPT_KEYS = [
  'review',
  'addState',
  'bindDanger',
  'checkContrast',
] as const

export default class StructureAssistant extends PureComponent<
  StructureAssistantProps,
  StructureAssistantState
> {
  private system = $system
  private listRef = createRef<HTMLDivElement>()
  private unsubscribeHistory: (() => void) | null = null
  private isMounted = false
  private memoContext: { deps: Array<unknown>; chars: number } | null = null
  private memoHistory: { history: StructureChatHistory; chars: number } | null =
    null

  static features = (
    planStatus: PlanStatus,
    config: ConfigContextType,
    service: Service,
    editor: Editor
  ) => ({
    STRUCTURE_ASSISTANT: new FeatureStatus({
      features: config.features,
      featureName: 'STRUCTURE_ASSISTANT',
      planStatus: planStatus,
      currentService: service,
      currentEditor: editor,
    }),
  })

  private get features() {
    return StructureAssistant.features(
      this.props.planStatus,
      this.props.config,
      this.props.service,
      this.props.editor
    )
  }

  constructor(props: StructureAssistantProps) {
    super(props)
    this.state = {
      history: [],
      isHydrated: false,
      prompt: '',
      isRequestProcessing: false,
      error: null,
      notice: null,
      draftAnswers: {},
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.isMounted = true
    $structureChat.set([])
    this.unsubscribeHistory = $structureChat.subscribe((history) =>
      this.setState({ history: [...history] })
    )
    window.addEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )

    const message: StructureChatGetMessage = {
      type: 'GET_STRUCTURE_CHAT',
      id: this.props.id,
    }
    sendPluginMessage({ pluginMessage: message }, '*')
  }

  componentDidUpdate = (
    _: Readonly<StructureAssistantProps>,
    previousState: Readonly<StructureAssistantState>
  ) => {
    if (
      previousState.history.length !== this.state.history.length ||
      previousState.isRequestProcessing !== this.state.isRequestProcessing
    ) {
      const list = this.listRef.current
      if (list) list.scrollTop = list.scrollHeight
    }
  }

  componentWillUnmount = () => {
    this.isMounted = false
    this.unsubscribeHistory?.()
    window.removeEventListener(
      'platformMessage',
      this.handleMessage as EventListener
    )
  }

  // Handlers
  handleMessage = (e: CustomEvent<PluginMessageData>) => {
    const path = e.detail

    if (path.type === 'GET_STRUCTURE_CHAT' && path.data?.id === this.props.id) {
      $structureChat.set(this.hydrate(path.data.history))
      this.setState({ isHydrated: true })
    }
  }

  private hydrate = (raw: unknown): StructureChatHistory => {
    if (!Array.isArray(raw)) return []

    return raw
      .filter(
        (message): message is StructureChatMessage =>
          typeof message === 'object' &&
          message !== null &&
          typeof message.id === 'string' &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string'
      )
      .map((message) => {
        const rest: StructureChatMessage = { ...message }

        if (rest.patch !== undefined && rest.patch !== null) {
          const patch = sanitizeStructurePatch(rest.patch)
          if (patch !== null) rest.patch = patch
          else {
            delete rest.patch
            delete rest.patchStatus
          }
        }

        const questions = sanitizeStructureQuestions(rest.questions)
        if (questions.length > 0) {
          rest.questions = questions
          if (
            rest.questionsStatus !== 'PENDING' &&
            rest.questionsStatus !== 'ANSWERED'
          )
            delete rest.questionsStatus
          if (typeof rest.answers === 'object' && rest.answers !== null)
            rest.answers = Object.fromEntries(
              Object.entries(rest.answers).filter(
                ([, value]) => typeof value === 'string'
              )
            )
          else delete rest.answers
        } else {
          delete rest.questions
          delete rest.questionsStatus
          delete rest.answers
        }

        const issues = sanitizeStructureIssues(rest.issues)
        if (issues.length > 0) rest.issues = issues
        else delete rest.issues

        if (typeof rest.cost !== 'number') delete rest.cost

        return rest
      })
  }

  private safeSetState = (state: Partial<StructureAssistantState>) => {
    if (this.isMounted) this.setState(state as StructureAssistantState)
  }

  private persist = (
    history: StructureChatHistory,
    chatId: string = this.props.id
  ) => {
    const trimmed = history.slice(-STRUCTURE_CHAT_MAX_MESSAGES)
    const message: StructureChatUpdateMessage = {
      type: 'UPDATE_STRUCTURE_CHAT',
      id: chatId,
      data: trimmed,
    }

    if (this.isMounted && chatId === this.props.id) $structureChat.set(trimmed)
    sendPluginMessage({ pluginMessage: message }, '*')
  }

  private isCharged = () =>
    this.props.config.plan.isProEnabled &&
    this.props.config.plan.isCreditsEnabled

  private getContextChars = (): number => {
    const deps = [
      this.props.name,
      this.props.description,
      this.props.preset,
      this.props.shift,
      this.props.areSourceColorsLocked,
      this.props.colors,
      this.props.colorSpace,
      this.props.algorithmVersion,
      this.props.themes,
      this.props.system,
    ]

    if (
      this.memoContext === null ||
      this.memoContext.deps.some((dep, index) => dep !== deps[index])
    )
      this.memoContext = {
        deps,
        chars: JSON.stringify(this.makeContext()).length,
      }

    return this.memoContext.chars
  }

  private getHistoryChars = (): number => {
    const history = this.state.history

    if (this.memoHistory === null || this.memoHistory.history !== history)
      this.memoHistory = {
        history,
        chars: history.slice(-STRUCTURE_CHAT_WINDOW).reduce(
          (total, message) =>
            total +
            (message.role === 'assistant'
              ? JSON.stringify({
                  reply: message.content,
                  patch: message.patch ?? null,
                  questions: message.questions ?? [],
                  issues: message.issues ?? [],
                }).length
              : message.content.length),
          0
        ),
      }

    return this.memoHistory.chars
  }

  private getEstimate = (promptChars: number = this.state.prompt.length) =>
    estimateAiCost(
      this.getContextChars() + this.getHistoryChars() + promptChars,
      EXPECTED_CHAT_REPLY_TOKENS,
      this.props.config.plan.aiCredits,
      'structureChat'
    )

  private isCreditsReached = (promptChars?: number) =>
    this.features.STRUCTURE_ASSISTANT.isReached(
      (this.props.creditsCount - this.getEstimate(promptChars)) * -1 - 1
    )

  private getLatestAssistant = () =>
    [...this.state.history].reverse().find((item) => item.role === 'assistant')

  private hasPendingQuestions = () => {
    const latest = this.getLatestAssistant()

    return (
      latest !== undefined &&
      (latest.questions?.length ?? 0) > 0 &&
      latest.questionsStatus === 'PENDING'
    )
  }

  private onBlock = () => {
    const isTrial =
      this.props.config.plan.isTrialEnabled &&
      this.props.trialStatus !== 'EXPIRED'
    sendPluginMessage(
      {
        pluginMessage: isTrial
          ? { type: 'GET_TRIAL' }
          : { type: 'GET_PRO', data: { origin: 'STRUCTURE_ASSISTANT' } },
      },
      '*'
    )
  }

  private onChangePrompt = (e: Event) =>
    this.setState({ prompt: (e.target as HTMLInputElement).value })

  private makeContext = () => {
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

    return makeStructureContext({
      paletteData,
      systemData,
      system: this.props.system,
      stops: this.props.preset.stops.map((stop) => stop.toString()),
    })
  }

  private onSend = async (
    overrideContent?: string,
    answers: Record<string, string> = {}
  ) => {
    const mistralClient = getMistral()
    const content = (overrideContent ?? this.state.prompt).trim()

    if (
      content === '' ||
      this.state.isRequestProcessing ||
      // Writing before the stored history is loaded would overwrite it
      !this.state.isHydrated
    )
      return

    if (this.isCreditsReached(content.length)) return

    if (!mistralClient || !mistralClient.hasAgent('structure')) {
      this.setState({ error: this.props.t('error.unavailableAi') })
      return
    }

    const chatId = this.props.id
    const previousHistory = $structureChat
      .get()
      .map((item, index, all) =>
        item.role === 'assistant' &&
        item.questionsStatus === 'PENDING' &&
        all.slice(index + 1).every((later) => later.role !== 'assistant')
          ? { ...item, questionsStatus: 'ANSWERED' as const, answers }
          : item
      )
    const userMessage: StructureChatMessage = {
      id: uid(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    this.persist([...previousHistory, userMessage])
    this.setState({
      prompt: '',
      error: null,
      notice: null,
      isRequestProcessing: true,
    })

    const baseSchema = JSON.stringify(this.props.system.schema)

    try {
      const reply = await mistralClient.chatStructure(
        this.makeContext(),
        previousHistory,
        content
      )
      const patch = sanitizeStructurePatch(reply.patch)
      const hasPatch = patch !== null
      const cost = computeAiCost(
        reply.usage,
        this.props.config.plan.aiCredits,
        'structureChat'
      )
      const assistantMessage: StructureChatMessage = {
        id: uid(),
        role: 'assistant',
        content: reply.reply,
        createdAt: new Date().toISOString(),
        cost,
        ...(hasPatch
          ? { patch, patchStatus: 'PENDING' as const, baseSchema }
          : {}),
        ...(reply.questions.length > 0
          ? {
              questions: reply.questions,
              questionsStatus: 'PENDING' as const,
            }
          : {}),
        ...(reply.issues.length > 0 ? { issues: reply.issues } : {}),
      }

      const isSameChat = this.isMounted && this.props.id === chatId
      this.persist(
        [
          ...(isSameChat
            ? $structureChat.get()
            : [...previousHistory, userMessage]),
          assistantMessage,
        ],
        chatId
      )
      this.safeSetState({ isRequestProcessing: false })

      if (this.isCharged()) $creditsCount.set($creditsCount.get() - cost)

      trackActionEvent(
        this.props.config.env.isMixpanelEnabled,
        this.props.userSession.userId,
        this.props.userIdentity.id,
        this.props.planStatus,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'AI_STRUCTURE_CHAT',
          colors: this.props.colors.length,
          stops: this.props.preset.stops.length,
        }
      )
    } catch (error) {
      console.error(error)
      this.safeSetState({
        error: this.props.t('error.unavailableAi'),
        isRequestProcessing: false,
      })
    }
  }

  private onSelectAnswer = (
    messageId: string,
    questionId: string,
    option: string
  ) =>
    this.setState({
      draftAnswers: {
        ...this.state.draftAnswers,
        [messageId]: {
          ...this.state.draftAnswers[messageId],
          [questionId]: option,
        },
      },
    })

  private onAnswer = (message: StructureChatMessage) => {
    const draft = this.state.draftAnswers[message.id] ?? {}
    const answers: Record<string, string> = {}
    const lines: Array<string> = []

    message.questions?.forEach((question) => {
      const answer = draft[question.id]
      if (answer === undefined) return
      answers[question.id] = answer
      lines.push(`- ${question.text} → ${answer}`)
    })
    if (lines.length === 0) return

    this.onSend(
      [
        this.props.t('structure.assistant.questions.answerPrefix'),
        ...lines,
      ].join('\n'),
      answers
    )
  }

  private setPatchStatus = (messageId: string, status: StructurePatchStatus) =>
    this.persist(
      $structureChat
        .get()
        .map((message) =>
          message.id === messageId
            ? { ...message, patchStatus: status }
            : message
        )
    )

  private onApplyPatch = (message: StructureChatMessage) => {
    const patch = sanitizeStructurePatch(message.patch)
    if (patch === null) return

    const result = applyStructurePatch(this.props.system, patch, {
      colors: this.props.colors,
      stops: this.props.preset.stops,
    })

    if (result.schemaChanged) {
      const schemaMessage: SystemSchemaMessage = {
        type: 'UPDATE_SYSTEM_SCHEMA',
        id: this.props.id,
        data: result.system.schema,
      }
      this.system.setKey('schema', result.system.schema)
      sendPluginMessage({ pluginMessage: schemaMessage }, '*')
    }

    const bindingsMessage: SystemBindingsMessage = {
      type: 'UPDATE_SYSTEM_BINDINGS',
      id: this.props.id,
      data: result.system.bindings ?? [],
    }
    this.system.setKey('bindings', result.system.bindings ?? [])
    sendPluginMessage({ pluginMessage: bindingsMessage }, '*')

    this.setPatchStatus(message.id, 'APPLIED')
    this.setState({
      notice: {
        type: result.skipped > 0 ? 'WARNING' : 'SUCCESS',
        message: this.props.t('structure.assistant.applyResult', {
          applied: result.applied,
          skipped: result.skipped,
          pruned: result.pruned,
        }),
      },
    })
  }

  private onDiscardPatch = (message: StructureChatMessage) =>
    this.setPatchStatus(message.id, 'DISCARDED')

  private onClear = () => {
    if (!this.state.isHydrated) return
    this.persist([])
    this.setState({ error: null, notice: null })
  }

  // Templates
  private PatchSummary = ({ message }: { message: StructureChatMessage }) => {
    const patch = sanitizeStructurePatch(message.patch)
    if (patch === null) return null

    const summary = summarizeStructurePatch(this.props.system, patch)
    const isLatest =
      this.state.history.filter((item) => item.role === 'assistant').pop()
        ?.id === message.id

    const isStale =
      !isLatest ||
      (message.baseSchema !== undefined &&
        message.baseSchema !== JSON.stringify(this.props.system.schema))

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--scale-pos-xxsmall)',
          paddingTop: 'var(--scale-pos-xxsmall)',
        }}
      >
        <span className={texts.type}>
          {this.props.t('structure.assistant.patchSummary', {
            groups: summary.groupsAdded,
            removedGroups: summary.groupsRemoved,
            members: summary.membersAdded,
            changed: summary.membersChanged,
            upserts: summary.bindingsUpserted,
            removes: summary.bindingsRemoved,
            pruned: summary.bindingsPruned,
          })}
        </span>
        {message.patchStatus === 'PENDING' && (
          <>
            {isStale && (
              <SemanticMessage
                type="WARNING"
                message={this.props.t('structure.assistant.stale')}
              />
            )}
            <div style={{ display: 'flex', gap: 'var(--scale-pos-xxsmall)' }}>
              {!isStale && (
                <Button
                  type="primary"
                  label={this.props.t('structure.assistant.apply')}
                  action={() => this.onApplyPatch(message)}
                />
              )}
              <Button
                type="secondary"
                label={this.props.t('structure.assistant.discard')}
                action={() => this.onDiscardPatch(message)}
              />
            </div>
          </>
        )}
        {message.patchStatus === 'APPLIED' && (
          <div>
            <Chip>{this.props.t('structure.assistant.applied')}</Chip>
          </div>
        )}
        {message.patchStatus === 'DISCARDED' && (
          <div>
            <Chip state="INACTIVE">
              {this.props.t('structure.assistant.discarded')}
            </Chip>
          </div>
        )}
      </div>
    )
  }

  private IssueList = ({ issues }: { issues: Array<StructureIssue> }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--scale-pos-xxsmall)',
        paddingTop: 'var(--scale-pos-xxsmall)',
      }}
    >
      {issues.map((issue, index) => (
        <SemanticMessage
          key={`${index}-${issue.message}`}
          type={issue.severity}
          message={issue.message}
        />
      ))}
    </div>
  )

  private Questions = ({ message }: { message: StructureChatMessage }) => {
    const questions = message.questions ?? []
    const isLatest = this.getLatestAssistant()?.id === message.id
    const isActionable = message.questionsStatus === 'PENDING' && isLatest
    const draft = this.state.draftAnswers[message.id] ?? {}
    const choosable = questions.filter(
      (question) => (question.options?.length ?? 0) > 0
    )
    const secondary = doClassnames([texts.type, texts['type--secondary']])

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--scale-pos-xsmall)',
          paddingTop: 'var(--scale-pos-xxsmall)',
        }}
      >
        {questions.map((question) => (
          <div
            key={question.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--scale-pos-xxsmall)',
            }}
          >
            <span className={texts.type}>{question.text}</span>
            {isActionable && (question.options?.length ?? 0) > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--scale-pos-xxsmall)',
                }}
              >
                {question.options?.map((option) => (
                  <Button
                    key={option}
                    type="secondary"
                    label={option}
                    state={
                      draft[question.id] === option ? 'selected' : 'default'
                    }
                    isDisabled={this.state.isRequestProcessing}
                    action={() =>
                      this.onSelectAnswer(message.id, question.id, option)
                    }
                  />
                ))}
              </div>
            )}
            {isActionable && (question.options?.length ?? 0) === 0 && (
              <span className={secondary}>
                {this.props.t('structure.assistant.questions.freeHint')}
              </span>
            )}
            {message.questionsStatus === 'ANSWERED' &&
              message.answers?.[question.id] !== undefined && (
                <span className={secondary}>
                  {`→ ${message.answers[question.id]}`}
                </span>
              )}
          </div>
        ))}
        {isActionable && choosable.length > 0 && (
          <div>
            <Button
              type="primary"
              label={this.props.t('structure.assistant.questions.answer')}
              isDisabled={
                this.state.isRequestProcessing ||
                !choosable.every((question) => draft[question.id] !== undefined)
              }
              action={() => this.onAnswer(message)}
            />
          </div>
        )}
        {message.questionsStatus === 'PENDING' && !isLatest && (
          <span className={secondary}>
            {this.props.t('structure.assistant.questions.noAnswer')}
          </span>
        )}
        {message.questionsStatus === 'ANSWERED' &&
          Object.keys(message.answers ?? {}).length === 0 && (
            <span className={secondary}>
              {this.props.t('structure.assistant.questions.freeReply')}
            </span>
          )}
      </div>
    )
  }

  private Messages = () => (
    <div
      ref={this.listRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--scale-pos-xxsmall)',
        padding: 'var(--scale-pos-xsmall)',
      }}
    >
      {this.state.history.length === 0 && (
        <>
          <SemanticMessage
            type="NEUTRAL"
            message={this.props.t('structure.assistant.empty')}
          />
          <div>
            <Button
              type="secondary"
              label={this.props.t('structure.assistant.presets.labels.review')}
              isDisabled={
                !this.state.isHydrated ||
                !getMistral()?.hasAgent('structure') ||
                this.state.isRequestProcessing
              }
              isBlocked={this.isCreditsReached(
                this.props.t('structure.assistant.presets.prompts.review')
                  .length
              )}
              onBlock={this.onBlock}
              action={() =>
                this.onSend(
                  this.props.t('structure.assistant.presets.prompts.review')
                )
              }
            />
          </div>
        </>
      )}
      {this.state.history.map((message) => (
        <div
          key={message.id}
          style={{
            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 'var(--scale-pos-xxxsmall)',
          }}
        >
          <div
            style={{
              padding: 'var(--scale-pos-xxsmall) var(--scale-pos-xsmall)',
              borderRadius: 'var(--border-radius-large)',
              background:
                message.role === 'user'
                  ? 'var(--color-background-selected-default)'
                  : 'var(--color-background-secondary-default)',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            <span className={texts.type}>{message.content}</span>
            {message.role === 'assistant' &&
              (message.issues?.length ?? 0) > 0 && (
                <this.IssueList issues={message.issues ?? []} />
              )}
            {message.role === 'assistant' &&
              (message.questions?.length ?? 0) > 0 && (
                <this.Questions message={message} />
              )}
            {message.role === 'assistant' && message.patch && (
              <this.PatchSummary message={message} />
            )}
          </div>
          {message.role === 'assistant' &&
            this.isCharged() &&
            message.cost !== undefined && (
              <span
                className={doClassnames([texts.type, texts['type--secondary']])}
              >
                {this.props.t('structure.assistant.cost', {
                  cost: message.cost,
                })}
              </span>
            )}
        </div>
      ))}
      {this.state.isRequestProcessing && (
        <SemanticMessage
          type="NEUTRAL"
          message={this.props.t('structure.assistant.loading')}
        />
      )}
    </div>
  )

  // Render
  render() {
    const mistralClient = getMistral()
    const isAvailable = !!mistralClient?.hasAgent('structure')

    return (
      <Feature isActive={this.features.STRUCTURE_ASSISTANT.isActive()}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Bar
            id="structure-assistant-header"
            leftPartSlot={
              <SectionTitle label={this.props.t('structure.assistant.title')} />
            }
            rightPartSlot={
              <Button
                type="icon"
                icon="trash"
                helper={{ label: this.props.t('structure.assistant.clear') }}
                isDisabled={
                  this.state.history.length === 0 ||
                  !this.state.isHydrated ||
                  this.state.isRequestProcessing
                }
                action={this.onClear}
              />
            }
            border={['BOTTOM']}
          />
          <this.Messages />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--scale-pos-xxsmall)',
              padding: 'var(--scale-pos-xsmall)',
              borderTop: '1px solid var(--color-border-primary-default)',
            }}
          >
            {(this.state.error || !isAvailable) && (
              <SemanticMessage
                type="ERROR"
                message={
                  this.state.error ?? this.props.t('error.unavailableAi')
                }
              />
            )}
            {this.state.notice && (
              <SemanticMessage
                type={this.state.notice.type}
                message={this.state.notice.message}
              />
            )}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--scale-pos-xxsmall)',
              }}
            >
              {PROMPT_KEYS.map((key) => (
                <Button
                  key={key}
                  type="secondary"
                  label={this.props.t(
                    `structure.assistant.presets.labels.${key}`
                  )}
                  action={() =>
                    this.setState({
                      prompt: this.props.t(
                        `structure.assistant.presets.prompts.${key}`
                      ),
                    })
                  }
                />
              ))}
            </div>
            <Input
              id="structure-assistant-prompt"
              type="LONG_TEXT"
              placeholder={this.props.t(
                this.hasPendingQuestions()
                  ? 'structure.assistant.questions.placeholder'
                  : 'structure.assistant.placeholder'
              )}
              value={this.state.prompt}
              isGrowing
              onChange={this.onChangePrompt}
              onValid={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) this.onSend()
              }}
            />
            <Button
              type="primary"
              label={this.props.t('structure.assistant.send')}
              isLoading={this.state.isRequestProcessing}
              isDisabled={
                !this.state.prompt.trim() ||
                !isAvailable ||
                !this.state.isHydrated
              }
              helper={
                this.isCharged()
                  ? {
                      label: this.props.t('structure.assistant.sendWithCost', {
                        cost: this.getEstimate(),
                      }),
                    }
                  : undefined
              }
              isBlocked={this.isCreditsReached()}
              onBlock={this.onBlock}
              action={() => this.onSend()}
            />
          </div>
        </div>
      </Feature>
    )
  }
}
