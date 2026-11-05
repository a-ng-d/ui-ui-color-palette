import { atom } from 'nanostores'
import { StructureChatHistory } from '../types/structureChat'

export const $structureChat = atom<StructureChatHistory>([])
