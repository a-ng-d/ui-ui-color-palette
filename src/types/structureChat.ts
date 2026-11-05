import { TaxonomySchema } from '@yelbolt/engine-ui-color-palette'

export interface StructureBindingPatchEntry {
  path: Array<string>
  ref?: string
  description?: string
  isExcluded?: boolean
}

export interface StructurePatch {
  schema?: TaxonomySchema
  bindings?: {
    upsert?: Array<StructureBindingPatchEntry>
    remove?: Array<Array<string>>
  }
}

export type StructurePatchStatus = 'PENDING' | 'APPLIED' | 'DISCARDED'

export interface StructureQuestion {
  id: string
  text: string
  options?: Array<string>
}

export type StructureQuestionsStatus = 'PENDING' | 'ANSWERED'

export interface StructureIssue {
  severity: 'INFO' | 'WARNING' | 'ERROR'
  message: string
  paths?: Array<Array<string>>
}

export interface StructureChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  patch?: StructurePatch | null
  patchStatus?: StructurePatchStatus
  baseSchema?: string
  questions?: Array<StructureQuestion>
  questionsStatus?: StructureQuestionsStatus
  answers?: Record<string, string>
  issues?: Array<StructureIssue>
  cost?: number
  createdAt: string
}

export type StructureChatHistory = Array<StructureChatMessage>

export const STRUCTURE_CHAT_MAX_MESSAGES = 50
export const STRUCTURE_CHAT_WINDOW = 20
export const STRUCTURE_MAX_QUESTIONS = 3
export const STRUCTURE_MAX_QUESTION_OPTIONS = 4
export const STRUCTURE_MAX_ISSUES = 8
