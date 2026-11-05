import {
  STRUCTURE_CHAT_MAX_MESSAGES,
  StructureChatHistory,
} from '../../types/structureChat'

const key = (id: string) => `palette_${id}_structure_chat`

export const readStructureChat = (id: string): StructureChatHistory => {
  const raw = window.localStorage.getItem(key(id))
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const writeStructureChat = (
  id: string,
  history: StructureChatHistory
): void => {
  if (history.length === 0) {
    window.localStorage.removeItem(key(id))
    return
  }

  window.localStorage.setItem(
    key(id),
    JSON.stringify(history.slice(-STRUCTURE_CHAT_MAX_MESSAGES))
  )
}

export const deleteStructureChat = (id: string): void =>
  window.localStorage.removeItem(key(id))
