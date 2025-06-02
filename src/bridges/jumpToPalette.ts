const jumpToPalette = async (id: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${id}`)

  if (!rawPalette) throw new Error()

  const palette = JSON.parse(rawPalette)
  palette.meta.dates.openedAt = new Date().toISOString()
  window.localStorage.setItem(`palette_${id}`, JSON.stringify(palette))

  return iframe?.contentWindow?.postMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })
}

export default jumpToPalette
