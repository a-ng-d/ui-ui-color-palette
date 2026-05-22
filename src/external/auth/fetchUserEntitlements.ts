import { PlanStatus } from '../../types/app'
import { getSupabase } from '.'

const PRODUCT_KEY = 'uicp'

const fetchUserEntitlements = async (
  userId: string
): Promise<{ planStatus: PlanStatus } | undefined> => {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase client is not initialized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('entitlements')
    .eq('id', userId)
    .single()

  const planStatus: PlanStatus =
    profile?.entitlements?.[PRODUCT_KEY] === 'PAID' ? 'PAID' : 'UNPAID'

  return { planStatus }
}

export default fetchUserEntitlements
