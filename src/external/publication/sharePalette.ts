import { supabase } from '../../index'

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

  if (!error) return
  else throw error
}

export default sharePalette
