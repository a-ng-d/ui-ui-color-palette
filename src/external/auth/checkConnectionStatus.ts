import { getSupabase } from '.'

const checkConnectionStatus = async (
  accessToken: string | undefined,
  refreshToken: string | undefined
) => {
  if (accessToken !== undefined && refreshToken !== undefined) {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    // Use refreshSession instead of setSession to avoid session_not_found errors
    // This creates a new session instead of trying to restore an old one
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      })

    if (!refreshError && refreshData.session) return refreshData
    else throw new Error('Session expired and could not be refreshed')
  }
}

export default checkConnectionStatus
