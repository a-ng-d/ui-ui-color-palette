import { TaxonomySchema } from '@yelbolt/engine-ui-color-palette'
import {
  StructureIssue,
  StructurePatch,
  StructureQuestion,
} from '../../types/structureChat'

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

export interface StructureAgentContext {
  palette: {
    name: string
    description: string
    stops: Array<string>
    themes: Array<{ id: string; name: string }>
    colors: Array<{
      id: string
      name: string
      description?: string
      shades: Record<string, Record<string, string>>
    }>
  }
  schema: TaxonomySchema
  tokens: Array<{
    path: Array<string>
    pathNames: Array<string>
    ref?: string
    isExcluded: boolean
    description?: string
  }>
}

export interface MistralUsage {
  promptTokens: number
  completionTokens: number
}

export interface MistralBindingSuggestion {
  bindings: Array<{
    path: Array<string>
    ref: string
    description?: string
  }>
}

export interface MistralBindingResult extends MistralBindingSuggestion {
  usage: MistralUsage
}

export interface MistralStructureReply {
  reply: string
  patch: StructurePatch | null
  questions: Array<StructureQuestion>
  issues: Array<StructureIssue>
  usage: MistralUsage
}
