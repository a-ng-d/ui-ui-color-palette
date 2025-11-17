import { Mistral } from '@mistralai/mistralai'
import { MistralColorPalette } from './types'

class MistralClient {
  private mistral: Mistral
  private agentId: string
  private conversationAgentId: string

  constructor(apiKey: string) {
    this.mistral = new Mistral({
      apiKey: apiKey,
    })
    this.agentId = 'ag_019a9254590972e1af106aecc7a13cfe'
    this.conversationAgentId = 'ag_019a928d864073e99da661b51f0ee174'
  }

  private async callAgent(message: string): Promise<string> {
    try {
      const result = await this.mistral.agents.complete({
        messages: [
          {
            content: message,
            role: 'user',
          },
        ],
        agentId: this.agentId,
      })

      const content = result.choices[0]?.message?.content
      if (!content)
        throw new Error('No response received from Mistral AI agent')

      // Handle both string and ContentChunk[] types
      if (typeof content === 'string') return content

      if (Array.isArray(content))
        // If content is an array of chunks, concatenate text content
        return content
          .map((chunk) => ('text' in chunk ? chunk.text : ''))
          .join('')

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
    // Extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
    if (jsonMatch && jsonMatch[1]) return jsonMatch[1].trim()
    // If no markdown blocks found, return content as is
    return content.trim()
  }

  async generateColorPalette(userPrompt: string): Promise<MistralColorPalette> {
    try {
      const prompt = this.createColorPalettePrompt(userPrompt)
      const content = await this.callAgent(prompt)

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

  async chatWithAI(message: string): Promise<string> {
    try {
      const result = await this.mistral.agents.complete({
        messages: [
          {
            content: message,
            role: 'user',
          },
        ],
        agentId: this.conversationAgentId,
      })

      const content = result.choices[0]?.message?.content
      if (!content)
        throw new Error(
          'No response received from Mistral AI conversation agent'
        )

      // Handle both string and ContentChunk[] types
      if (typeof content === 'string') return content

      if (Array.isArray(content))
        // If content is an array of chunks, concatenate text content
        return content
          .map((chunk) => ('text' in chunk ? chunk.text : ''))
          .join('')

      throw new Error(
        'Unexpected content type from Mistral AI conversation agent'
      )
    } catch (error) {
      if (error instanceof Error)
        throw new Error(
          `Failed to communicate with Mistral AI conversation agent: ${error.message}`
        )
      throw new Error(
        'Unknown error occurred while communicating with Mistral AI conversation agent'
      )
    }
  }
}

let mistralInstance: MistralClient | null = null

export const initMistral = (apiKey: string) => {
  if (!mistralInstance) mistralInstance = new MistralClient(apiKey)
  return mistralInstance
}

export const getMistral = () => {
  return mistralInstance
}

export default MistralClient
