import { getSupabase } from './client'

const checkConnectionStatus = async (
  accessToken: string | undefined,
  refreshToken: string | undefined
) => {
  if (accessToken !== undefined && refreshToken !== undefined) {
    const { data, error } = await getSupabase().auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (!error) return data
    else throw error
  }
}

export default checkConnectionStatus
