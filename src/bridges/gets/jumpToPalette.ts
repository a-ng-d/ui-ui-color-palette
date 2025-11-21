interface Msg {
  data: {
    id: string
    locales: { [key: string]: string }
  }
}

const jumpToPalette = async (msg: Msg) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const rawPalette = window.localStorage.getItem(`palette_${msg.data.id}`)

  if (!rawPalette) throw new Error(msg.data.locales.errorMessage)

  const palette = JSON.parse(rawPalette)
  palette.meta.dates.openedAt = new Date().toISOString()
  window.localStorage.setItem(`palette_${msg.data.id}`, JSON.stringify(palette))

  return iframe?.contentWindow?.postMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })
}

export default jumpToPalette
