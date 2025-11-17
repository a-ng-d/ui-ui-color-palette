import { getSupabase } from '../auth'

const starPalette = async ({
  id,
  starredPalettesDbTableName,
  userId,
  mustBeStarred,
}: {
  id: string
  starredPalettesDbTableName: string
  userId: string
  mustBeStarred: boolean
}): Promise<void> => {
  const supabase = getSupabase()

  if (!supabase) throw new Error('Supabase client is not initialized')

  if (mustBeStarred) {
    const { error } = await supabase.from(starredPalettesDbTableName).insert([
      {
        palette_id: id,
        user_id: userId,
      },
    ])

    if (error) throw error
    else return
  }

  const { error } = await supabase
    .from(starredPalettesDbTableName)
    .delete()
    .match({ palette_id: id, user_id: userId })

  if (error) throw error
  else return
}

export default starPalette
