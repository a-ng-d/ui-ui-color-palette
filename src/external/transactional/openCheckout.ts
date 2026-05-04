import { getSupabase } from '../auth'
import { getPolar } from '.'

const buildCheckoutUrl = async (
  productId: string,
  locale?: string,
  isDev?: boolean
): Promise<string | null> => {
  const polar = getPolar()
  const supabase = getSupabase()
  if (!polar || !supabase) return null

  const { data } = await supabase.auth.getUser()
  if (!data.user) return null

  const u = new URL(`${polar.functionsUrl}/create-checkout`)
  u.searchParams.set('products', productId)
  u.searchParams.set('customerExternalId', data.user.id)
  if (data.user.email) u.searchParams.set('customerEmail', data.user.email)
  if (locale) u.searchParams.set('locale', locale)
  u.searchParams.set('env', isDev ? 'sandbox' : 'production')

  return u.toString()
}

export default buildCheckoutUrl
