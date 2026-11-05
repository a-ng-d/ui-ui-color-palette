import { readStructureChat } from '../utils/structureChatStorage'
import {
  StructureChatGetMessage,
  StructureChatResponseMessage,
} from '../../types/messages'

const getStructureChat = async (msg: StructureChatGetMessage) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null

  const response: StructureChatResponseMessage = {
    type: 'GET_STRUCTURE_CHAT',
    data: {
      id: msg.id,
      history: readStructureChat(msg.id),
    },
  }

  iframe?.contentWindow?.postMessage(response)
}

export default getStructureChat
