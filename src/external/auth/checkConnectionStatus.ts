import { getSupabase } from '.'

const checkConnectionStatus = async (
  accessToken: string | undefined,
  refreshToken: string | undefined
) => {
  if (accessToken !== undefined && refreshToken !== undefined) {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    try {
      // Use refreshSession to create a new session instead of restoring old one
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Session refresh failed:', error)
      throw error
    }
  }
}

export default checkConnectionStatus
