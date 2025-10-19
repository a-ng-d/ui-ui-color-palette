import { getProxiedUrl } from '../../utils/url'
import {
  MistralRequest,
  MistralResponse,
  MistralError,
  MistralColorPalette,
} from './types'

class MistralClient {
  private apiKey: string
  private baseUrl: string

  constructor(baseUrl: string, apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  private async makeRequest(request: MistralRequest): Promise<MistralResponse> {
    try {
      const response = await fetch(
        getProxiedUrl(`${this.baseUrl}/chat/completions`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(request),
        }
      )

      if (!response.ok) {
        const errorData: MistralError = await response.json()
        throw new Error(`Mistral API Error: ${errorData.error.message}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error)
        throw new Error(
          `Failed to communicate with Mistral API: ${error.message}`
        )
      throw new Error(
        'Unknown error occurred while communicating with Mistral API'
      )
    }
  }

  private createColorPalettePrompt(userPrompt: string): string {
    return `You are an expert in design and color theory. Generate a 5-color palette for "${userPrompt}".

Respond ONLY with valid JSON in this exact format:
{
  "primary": {
    "name": "Descriptive name for the primary color",
    "hex": "#RRGGBB",
    "rgb": {"r": 0-255, "g": 0-255, "b": 0-255},
    "description": "Short description of this color's usage"
  },
  "text": {
    "name": "Descriptive name for the text color",
    "hex": "#RRGGBB", 
    "rgb": {"r": 0-255, "g": 0-255, "b": 0-255},
    "description": "Neutral color for main text"
  },
  "success": {
    "name": "Descriptive name for the success color",
    "hex": "#RRGGBB",
    "rgb": {"r": 0-255, "g": 0-255, "b": 0-255},
    "description": "Color to indicate success"
  },
  "warning": {
    "name": "Descriptive name for the warning color",
    "hex": "#RRGGBB",
    "rgb": {"r": 0-255, "g": 0-255, "b": 0-255},
    "description": "Color for warnings"
  },
  "alert": {
    "name": "Descriptive name for the error color",
    "hex": "#RRGGBB",
    "rgb": {"r": 0-255, "g": 0-255, "b": 0-255},
    "description": "Color for errors"
  }
}

Colors must:
- Be consistent with the "${userPrompt}" theme
- Have good contrast for accessibility
- Form a harmonious palette
- Have creative and descriptive names related to the theme`
  }

  async generateColorPalette(userPrompt: string): Promise<MistralColorPalette> {
    const request: MistralRequest = {
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert in design and color theory. You generate only valid JSON.',
        },
        {
          role: 'user',
          content: this.createColorPalettePrompt(userPrompt),
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: {
        type: 'json_object',
      },
    }

    try {
      const response = await this.makeRequest(request)
      const content = response.choices[0]?.message?.content

      if (!content) throw new Error('No response received from Mistral AI')

      const palette: MistralColorPalette = JSON.parse(content)

      // Basic structure validation
      if (
        !palette.primary ||
        !palette.text ||
        !palette.success ||
        !palette.warning ||
        !palette.alert
      )
        throw new Error('Incomplete response from Mistral AI - missing colors')

      return palette
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new Error('Malformed response from Mistral AI (invalid JSON)')
      throw error
    }
  }
}

let mistralInstance: MistralClient | null = null

export const initMistral = (baseUrl: string, apiKey: string) => {
  if (!mistralInstance || mistralInstance['apiKey'] !== apiKey)
    mistralInstance = new MistralClient(baseUrl, apiKey)
  return mistralInstance
}

export const getMistral = () => {
  return mistralInstance
}

export default MistralClient
