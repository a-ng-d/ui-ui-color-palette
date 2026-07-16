import { uid } from 'uid'
import { MetaConfiguration } from '@yelbolt/engine-ui-color-palette'
import { getSupabase } from '../auth'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { ManagePaletteState } from '../../ui/services/ManagePalette'
import type { AppState } from '../../ui/App'

const unpublishPalette = async ({
  paletteData,
  palettesDbTableName,
  isRemote = false,
}: {
  paletteData: Partial<ManagePaletteState>
  appData: Partial<AppState>
  palettesDbTableName: string
  isRemote?: boolean
}): Promise<Partial<ManagePaletteState>> => {
  const id = paletteData.id ?? uid()
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
    sendPluginMessage({ pluginMessage: { type: 'GET_PALETTES' } }, '*')

    return meta
  } else throw error
}

export default unpublishPalette
