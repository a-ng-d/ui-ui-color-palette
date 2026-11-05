import { Mistral } from '@mistralai/mistralai'
import { MistralColorPalette, MistralUsage } from './types'

class MistralClient {
  private mistral: Mistral
  private agentId: string

  constructor(apiKey: string) {
    this.mistral = new Mistral({
      apiKey: apiKey,
    })
    this.agentId = 'ag_019a9254590972e1af106aecc7a13cfe'
  }

  private async callAgent(
    message: string
  ): Promise<{ content: string; usage: MistralUsage }> {
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

  // Characters of the instruction wrapped around the user prompt, for estimates
  getPromptOverhead(): number {
    return this.createColorPalettePrompt('').length
  }

  private extractJsonFromMarkdown(content: string): string {
    const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
    if (jsonMatch && jsonMatch[1]) return jsonMatch[1].trim()
    return content.trim()
  }

  async generateColorPalette(
    userPrompt: string
  ): Promise<{ palette: MistralColorPalette; usage: MistralUsage }> {
    try {
      const prompt = this.createColorPalettePrompt(userPrompt)
      const { content, usage } = await this.callAgent(prompt)

      if (!content)
        throw new Error('No response received from Mistral AI agent')

      const cleanedContent = this.extractJsonFromMarkdown(content)
      const palette: MistralColorPalette = JSON.parse(cleanedContent)

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

      return { palette, usage }
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

export const initMistral = (apiKey: string) => {
  if (!mistralInstance) mistralInstance = new MistralClient(apiKey)
  return mistralInstance
}

export const getMistral = () => {
  return mistralInstance
}

export default MistralClient
