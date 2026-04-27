import { getSupabase } from '../auth'
import { getPolar } from '.'

const openCustomerPortal = async (): Promise<string | null> => {
  const polar = getPolar()
  const supabase = getSupabase()
  if (!polar || !supabase) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  return `${polar.functionsUrl}/customer-portal?token=${session.access_token}`
}

export default openCustomerPortal
