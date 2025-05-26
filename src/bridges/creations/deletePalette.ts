const deletePalette = async (id: string) => {
  return window.localStorage.removeItem(`palette_${id}`)
}

export default deletePalette
