import { uid } from 'uid'
import { MetaConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { ManagePaletteState } from '../../ui/services/ManagePalette'
import type { AppState } from '../../ui/App'

const detachPalette = async ({
  paletteData,
  locales,
}: {
  paletteData: Partial<ManagePaletteState>
  appData: Partial<AppState>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locales: (key: string, params?: Record<string, any> | undefined) => string
}): Promise<Partial<ManagePaletteState & AppState>> => {
  const now = new Date().toISOString()

  const meta: MetaConfiguration = {
    id: paletteData.id ?? uid(),
    dates: {
      createdAt: paletteData.dates?.createdAt ?? now,
      updatedAt: paletteData.dates?.updatedAt ?? now,
      publishedAt: '',
      openedAt: paletteData.dates?.openedAt ?? now,
    },
    publicationStatus: {
      isPublished: false,
      isShared: false,
    },
    creatorIdentity: {
      creatorId: '',
      creatorFullName: '',
      creatorAvatar: '',
    },
  }

  sendPluginMessage(
    {
      pluginMessage: {
        type: 'POST_MESSAGE',
        data: {
          type: 'INFO',
          message: locales('success.detachment'),
        },
      },
    },
    '*'
  )
  sendPluginMessage(
    {
      pluginMessage: {
        type: 'DUPLICATE_PALETTE',
        id: paletteData.id,
      },
    },
    '*'
  )
  sendPluginMessage(
    {
      pluginMessage: {
        type: 'DELETE_PALETTE',
        id: paletteData.id,
      },
    },
    '*'
  )

  return meta
}

export default detachPalette
