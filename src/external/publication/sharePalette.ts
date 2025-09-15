import { getSupabase } from '../auth/client'
import { sendPluginMessage } from '../../utils/pluginMessage'

const sharePalette = async ({
  id,
  palettesDbTableName,
  isShared,
}: {
  id: string
  palettesDbTableName: string
  isShared: boolean
}): Promise<void> => {
  const now = new Date().toISOString()

  const supabase = getSupabase()

  if (!supabase) throw new Error('Supabase client is not initialized')

  const { error } = await supabase
    .from(palettesDbTableName)
    .update([
      {
        is_shared: isShared,
        published_at: now,
        updated_at: now,
      },
    ])
    .match({ palette_id: id })

  if (!error)
    sendPluginMessage(
      {
        pluginMessage: {
          type: 'UPDATE_PALETTE',
          id: id,
          items: [
            {
              key: 'meta.dates.updatedAt',
              value: now,
            },
            {
              key: 'meta.dates.publishedAt',
              value: now,
            },
            {
              key: 'meta.publicationStatus.isShared',
              value: isShared,
            },
          ],
          isAlreadyUpdated: true,
          shouldLoadPalette: false,
        },
      },
      '*'
    )
  else throw error
}

export default sharePalette
