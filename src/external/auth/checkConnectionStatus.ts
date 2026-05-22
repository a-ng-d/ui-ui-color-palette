import { getSupabase } from '.'

const checkConnectionStatus = async (
  accessToken: string | undefined,
  refreshToken: string | undefined
): Promise<void> => {
  if (accessToken && refreshToken) {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) throw error
  }
}

export default checkConnectionStatus
