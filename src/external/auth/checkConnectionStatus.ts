import { PlanStatus } from '../../types/app'
import { getSupabase } from '.'

const PRODUCT_KEY = 'uicp'

const checkConnectionStatus = async (
  accessToken: string | undefined,
  refreshToken: string | undefined
): Promise<{ planStatus: PlanStatus } | undefined> => {
  if (accessToken && refreshToken) {
    const supabase = getSupabase()

    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('entitlements')
      .eq('id', data.user?.id)
      .single()

    const planStatus: PlanStatus =
      profile?.entitlements?.[PRODUCT_KEY] === 'PAID' ? 'PAID' : 'UNPAID'

    return { planStatus }
  }
}

export default checkConnectionStatus
