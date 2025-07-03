import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { doScale } from '@a_ng_d/figmug-utils'
import { ScaleMessage } from '../../types/messages'

const updateScale = async (msg: ScaleMessage) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    window.localStorage.getItem(`palette_${msg.data.id}`) ?? '{}'
  )

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) theme.scale = msg.data.scale

  if (msg.feature === 'ADD_STOP' || msg.feature === 'DELETE_STOP')
    palette.themes
      .filter((theme) => !theme.isEnabled)
      .forEach((theme) => {
        theme.scale = doScale(
          Object.keys(msg.data.scale).map((stop) => {
            return parseFloat(stop)
          }),
          Math.min(...Object.values(theme.scale)),
          Math.max(...Object.values(theme.scale)),
        )
      })

  palette.base.preset = msg.data.preset
  palette.base.shift = msg.data.shift
  palette.base.preset = msg.data.preset

  palette.meta.dates.updatedAt = now
  iframe?.contentWindow?.postMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  iframe?.contentWindow?.postMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })

  return window.localStorage.setItem(
    `palette_${msg.data.id}`,
    JSON.stringify(palette)
  )
}

export default updateScale
