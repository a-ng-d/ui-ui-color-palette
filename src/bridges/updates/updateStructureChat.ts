import { writeStructureChat } from '../utils/structureChatStorage'
import { StructureChatUpdateMessage } from '../../types/messages'

const updateStructureChat = async (msg: StructureChatUpdateMessage) =>
  writeStructureChat(msg.id, msg.data)

export default updateStructureChat
