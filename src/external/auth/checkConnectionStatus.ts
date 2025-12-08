import { getSupabase } from '.'

const checkConnectionStatus = async (
  accessToken: string | undefined,
  refreshToken: string | undefined
) => {
  if (accessToken !== undefined && refreshToken !== undefined) {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    try {
      // Try setSession first (works with fresh tokens from auth)
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        // If session is invalid, try to refresh
        if (
          error.message?.includes('session_not_found') ||
          error.message?.includes('Auth session missing')
        ) {
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession({
              refresh_token: refreshToken,
            })

          if (refreshError) {
            // If refresh fails, clear invalid tokens
            if (
              refreshError.message?.includes('Invalid Refresh Token') ||
              refreshError.message?.includes('Refresh Token Not Found')
            ) {
              if (typeof window !== 'undefined') {
                window.localStorage.removeItem('supabase_access_token')
                window.localStorage.removeItem('supabase_refresh_token')
              }
            }
            throw refreshError
          }
          return refreshData
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Session check failed:', error)
      throw error
    }
  }
}

export default checkConnectionStatus
