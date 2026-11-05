import { Mistral } from '@mistralai/mistralai'
import {
  sanitizeStructureIssues,
  sanitizeStructureQuestions,
} from '../../utils/sanitizeStructureFeedback'
import { sanitizeStructurePatch } from '../../utils/applyStructurePatch'
import {
  STRUCTURE_CHAT_WINDOW,
  StructureChatHistory,
} from '../../types/structureChat'
import {
  MistralBindingResult,
  MistralBindingSuggestion,
  MistralColorPalette,
  MistralStructureReply,
  MistralUsage,
  StructureAgentContext,
} from './types'

type AgentMessage = { role: 'user' | 'assistant'; content: string }

export interface MistralAgentIds {
  colors: string
  bindings: string
  structure: string
}

const DEFAULT_COLORS_AGENT_ID = 'ag_019a9254590972e1af106aecc7a13cfe'

class MistralClient {
  private mistral: Mistral
  private agents: MistralAgentIds

  constructor(apiKey: string, agents?: Partial<MistralAgentIds>) {
    this.mistral = new Mistral({
      apiKey: apiKey,
    })
    this.agents = {
      colors: agents?.colors || DEFAULT_COLORS_AGENT_ID,
      bindings: agents?.bindings || '',
      structure: agents?.structure || '',
    }
  }

  private async callAgent(
    agentId: string,
    messages: Array<AgentMessage>,
    isJsonMode = false
  ): Promise<{ content: string; usage: MistralUsage }> {
    try {
      if (!agentId) throw new Error('Mistral AI agent id is not configured')

      const result = await this.mistral.agents.complete({
        messages: messages,
        agentId: agentId,
        ...(isJsonMode ? { responseFormat: { type: 'json_object' } } : {}),
      })

      const content = result.choices[0]?.message?.content
      if (!content)
        throw new Error('No response received from Mistral AI agent')

      const usage: MistralUsage = {
        promptTokens: result.usage?.promptTokens ?? 0,
        completionTokens: result.usage?.completionTokens ?? 0,
      }

      if (typeof content === 'string') return { content, usage }

      if (Array.isArray(content))
        return {
          content: content
            .map((chunk) => ('text' in chunk ? chunk.text : ''))
            .join(''),
          usage,
        }

      throw new Error('Unexpected content type from Mistral AI agent')
    } catch (error) {
      if (error instanceof Error)
        throw new Error(
          `Failed to communicate with Mistral AI agent: ${error.message}`
        )
      throw new Error(
        'Unknown error occurred while communicating with Mistral AI agent'
      )
    }
  }

  private createColorPalettePrompt(userPrompt: string): string {
    return `You are an expert in design and color theory. Generate a 5-color palette for "${userPrompt}".`
  }

  private extractJsonFromMarkdown(content: string): string {
    const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
    if (jsonMatch && jsonMatch[1]) return jsonMatch[1].trim()

    return content.trim()
  }

  private parseJson<T>(content: string): T {
    try {
      return JSON.parse(this.extractJsonFromMarkdown(content)) as T
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new Error(
          'Malformed response from Mistral AI agent (invalid JSON)'
        )
      throw error
    }
  }

  private mergeConsecutiveRoles(
    messages: Array<AgentMessage>
  ): Array<AgentMessage> {
    return messages.reduce<Array<AgentMessage>>((acc, message) => {
      const last = acc[acc.length - 1]
      if (last && last.role === message.role)
        last.content = `${last.content}\n\n${message.content}`
      else acc.push({ ...message })
      return acc
    }, [])
  }

  hasAgent(kind: 'bindings' | 'structure'): boolean {
    return this.agents[kind] !== ''
  }

  async suggestBindings(
    ctx: StructureAgentContext
  ): Promise<MistralBindingResult> {
    const { content, usage } = await this.callAgent(
      this.agents.bindings,
      [{ role: 'user', content: JSON.stringify(ctx) }],
      true
    )
    const suggestion = this.parseJson<MistralBindingSuggestion>(content)

    if (!suggestion || !Array.isArray(suggestion.bindings))
      throw new Error(
        'Invalid response from Mistral AI agent - bindings must be an array'
      )

    return { bindings: suggestion.bindings, usage }
  }

  async chatStructure(
    ctx: StructureAgentContext,
    history: StructureChatHistory,
    userMessage: string
  ): Promise<MistralStructureReply> {
    const windowed: Array<AgentMessage> = history
      .slice(-STRUCTURE_CHAT_WINDOW)
      .map((message) => ({
        role: message.role,
        content:
          message.role === 'assistant'
            ? JSON.stringify({
                reply: message.content,
                patch: message.patch ?? null,
                questions: message.questions ?? [],
                issues: message.issues ?? [],
              })
            : message.content,
      }))

    const messages = this.mergeConsecutiveRoles([
      { role: 'user', content: 'CONTEXT:\n' + JSON.stringify(ctx) },
      ...windowed,
      { role: 'user', content: userMessage },
    ])

    const { content, usage } = await this.callAgent(
      this.agents.structure,
      messages,
      true
    )
    const result = this.parseJson<Partial<MistralStructureReply>>(content)

    if (!result || typeof result.reply !== 'string')
      throw new Error(
        'Invalid response from Mistral AI agent - reply must be a string'
      )

    return {
      reply: result.reply,
      patch: sanitizeStructurePatch(result.patch),
      questions: sanitizeStructureQuestions(result.questions),
      issues: sanitizeStructureIssues(result.issues),
      usage,
    }
  }

  async generateColorPalette(userPrompt: string): Promise<MistralColorPalette> {
    try {
      const prompt = this.createColorPalettePrompt(userPrompt)
      const { content } = await this.callAgent(this.agents.colors, [
        { role: 'user', content: prompt },
      ])

      if (!content)
        throw new Error('No response received from Mistral AI agent')

      // Extract JSON from potential markdown wrapper
      const cleanedContent = this.extractJsonFromMarkdown(content)
      const palette: MistralColorPalette = JSON.parse(cleanedContent)

      // Basic structure validation
      if (
        !palette.primary ||
        !palette.text ||
        !palette.success ||
        !palette.warning ||
        !palette.alert
      )
        throw new Error(
          'Incomplete response from Mistral AI agent - missing colors'
        )

      return palette
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new Error(
          'Malformed response from Mistral AI agent (invalid JSON)'
        )
      throw error
    }
  }
}

let mistralInstance: MistralClient | null = null

export const initMistral = (
  apiKey: string,
  agents?: Partial<MistralAgentIds>
) => {
  if (!mistralInstance) mistralInstance = new MistralClient(apiKey, agents)
  return mistralInstance
}

export const getMistral = () => {
  return mistralInstance
}

export default MistralClient
