import { deleteStructureChat } from '../utils/structureChatStorage'

const deletePalette = async (id: string) => {
  window.localStorage.removeItem(`palette_${id}`)
  window.localStorage.removeItem(`palette_${id}_system`)
  deleteStructureChat(id)
}

export default deletePalette
