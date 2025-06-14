import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { SettingsMessage } from '../../types/messages'

const updateSettings = async (msg: SettingsMessage) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    window.localStorage.getItem(`palette_${msg.id}`) ?? '{}'
  )

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) {
    theme.visionSimulationMode = msg.data.visionSimulationMode
    theme.textColorsTheme = msg.data.textColorsTheme
  }

  palette.base.name = msg.data.name
  palette.base.description = msg.data.description
  palette.base.colorSpace = msg.data.colorSpace
  palette.base.algorithmVersion = msg.data.algorithmVersion

  palette.meta.dates.updatedAt = now
  iframe?.contentWindow?.postMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  return window.localStorage.setItem(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )
}

export default updateSettings
