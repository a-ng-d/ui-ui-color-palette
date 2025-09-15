import { uid } from 'uid'
import { MetaConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { sendPluginMessage } from '../../utils/pluginMessage'
import type { AppStates } from '../../ui/App'

const detachPalette = async ({
  rawData,
  locales,
}: {
  rawData: Partial<AppStates>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locales: any
}): Promise<Partial<AppStates>> => {
  const now = new Date().toISOString()

  const meta: MetaConfiguration = {
    id: rawData.id ?? uid(),
    dates: {
      createdAt: rawData.dates?.createdAt ?? now,
      updatedAt: rawData.dates?.updatedAt ?? now,
      publishedAt: '',
      openedAt: rawData.dates?.openedAt ?? now,
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
          message: locales.success.detachment,
        },
      },
    },
    '*'
  )
  sendPluginMessage(
    {
      pluginMessage: {
        type: 'DUPLICATE_PALETTE',
        id: meta.id,
      },
    },
    '*'
  )
  sendPluginMessage(
    {
      pluginMessage: {
        type: 'DELETE_PALETTE',
        id: meta.id,
      },
    },
    '*'
  )

  return meta
}

export default detachPalette
