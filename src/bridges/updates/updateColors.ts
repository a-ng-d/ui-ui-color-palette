import { Data } from '@a_ng_d/utils-ui-color-palette'
import { FullConfiguration } from '../../types/configurations'
import { ColorsMessage } from '../../types/messages'

const updateColors = async (msg: ColorsMessage) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    window.localStorage.getItem(`palette_${msg.id}`) ?? '{}'
  )

  palette.base.colors = msg.data

  palette.meta.dates.updatedAt = now
  iframe?.contentWindow?.postMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  palette.data = new Data(palette).makePaletteData(palette.data)

  window.localStorage.setItem(`palette_${msg.id}`, JSON.stringify(palette))
}

export default updateColors
