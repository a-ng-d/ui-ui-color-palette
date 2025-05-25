const deletePalette = async (id: string) => {
  window.localStorage.removeItem(`palette_${id}`)

  return true
}

export default deletePalette
