import { readSystem, writeSystem } from '../utils/systemStorage'
import { SystemBindingsMessage } from '../../types/messages'

const updateSystemBindings = async (msg: SystemBindingsMessage) => {
  const system = readSystem(msg.id)

  system.bindings = msg.data

  return writeSystem(msg.id, system)
}

export default updateSystemBindings
