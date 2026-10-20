import { readSystem, writeSystem } from '../utils/systemStorage'
import { SystemSchemaMessage } from '../../types/messages'

const updateSystemSchema = async (msg: SystemSchemaMessage) => {
  const system = readSystem(msg.id)

  system.schema = msg.data

  return writeSystem(msg.id, system)
}

export default updateSystemSchema
