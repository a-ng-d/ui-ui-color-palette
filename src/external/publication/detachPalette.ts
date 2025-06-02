import { MetaConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { uid } from 'uid'
import type { AppStates } from '../../ui/App'

const detachPalette = async ({
  rawData,
  locals,
}: {
  rawData: Partial<AppStates>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locals: any
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

  parent.postMessage(
    {
      pluginMessage: {
        type: 'POST_MESSAGE',
        data: {
          type: 'INFO',
          message: locals.success.detachment,
        },
      },
    },
    '*'
  )
  parent.postMessage(
    {
      pluginMessage: {
        type: 'UPDATE_PALETTE',
        id: meta.id,
        items: [
          {
            key: 'meta.dates.createdAt',
            value: meta.dates.createdAt,
          },
          {
            key: 'meta.dates.updatedAt',
            value: meta.dates.updatedAt,
          },
          {
            key: 'meta.dates.publishedAt',
            value: meta.dates.publishedAt,
          },
          {
            key: 'meta.publicationStatus.isPublished',
            value: meta.publicationStatus.isPublished,
          },
          {
            key: 'meta.publicationStatus.isShared',
            value: meta.publicationStatus.isShared,
          },
          {
            key: 'meta.creatorIdentity.creatorFullName',
            value: meta.creatorIdentity.creatorFullName,
          },
          {
            key: 'meta.creatorIdentity.creatorAvatar',
            value: meta.creatorIdentity.creatorAvatar,
          },
          {
            key: 'meta.creatorIdentity.creatorId',
            value: meta.creatorIdentity.creatorId,
          },
        ],
        isAlreadyUpdated: true,
      },
    },
    '*'
  )

  return meta
}

export default detachPalette
