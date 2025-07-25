import { uid } from 'uid'
import { MetaConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getSupabase } from '../auth/client'
import type { AppStates } from '../../ui/App'

const unpublishPalette = async ({
  rawData,
  palettesDbTableName,
  isRemote = false,
}: {
  rawData: Partial<AppStates>
  palettesDbTableName: string
  isRemote?: boolean
}): Promise<Partial<AppStates>> => {
  const id = rawData.id ?? uid()
  const now = new Date().toISOString()

  const supabase = getSupabase()

  if (!supabase) throw new Error('Supabase client is not initialized')

  const { error } = await supabase
    .from(palettesDbTableName)
    .delete()
    .match({ palette_id: id })

  if (!error) {
    const meta: MetaConfiguration = {
      id: id,
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
          type: 'UPDATE_PALETTE',
          id: meta.id,
          items: [
            {
              key: 'meta.id',
              value: meta.id,
            },
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
          shouldLoadPalette: !isRemote,
        },
      },
      '*'
    )
    parent.postMessage({ pluginMessage: { type: 'GET_PALETTES' } }, '*')

    return meta
  } else throw error
}

export default unpublishPalette
