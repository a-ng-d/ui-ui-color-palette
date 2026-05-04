import { getSupabase } from '../auth'
import { getPolar } from '.'

const checkSubscription = async (): Promise<boolean> => {
  const polar = getPolar()
  const supabase = getSupabase()
  if (!polar || !supabase) return false

  const { data } = await supabase.auth.getUser()
  if (!data.user) return false

  const state = await polar.polar.customers.getStateExternal({
    externalId: data.user.id,
  })

  return state.activeSubscriptions.length > 0
}

export default checkSubscription
