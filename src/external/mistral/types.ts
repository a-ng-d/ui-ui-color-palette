export interface MistralColorPalette {
  primary: MistralColor
  text: MistralColor
  success: MistralColor
  warning: MistralColor
  alert: MistralColor
}

export interface MistralColor {
  name: string
  hex: string
  rgb: {
    r: number
    g: number
    b: number
  }
  description?: string
}

export interface MistralRequest {
  model: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  temperature?: number
  max_tokens?: number
  response_format?: {
    type: 'json_object'
  }
}

export interface MistralResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface MistralError {
  error: {
    message: string
    type: string
    code?: string
  }
}
