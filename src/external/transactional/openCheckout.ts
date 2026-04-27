import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'
import { getSupabase } from '../auth'
import { getPolar } from '.'

const openCheckout = async (
  productId: string,
  onSuccess: () => void,
  onClose: () => void
): Promise<InstanceType<typeof PolarEmbedCheckout> | null> => {
  const polar = getPolar()
  const supabase = getSupabase()
  if (!polar || !supabase) return null

  const { data } = await supabase.auth.getUser()
  if (!data.user) return null

  const u = new URL(`${polar.functionsUrl}/create-checkout`)
  u.searchParams.set('products', productId)
  u.searchParams.set('customerExternalId', data.user.id)
  if (data.user.email) u.searchParams.set('customerEmail', data.user.email)

  const checkout = await PolarEmbedCheckout.create(u.toString())

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '✕'
  Object.assign(closeBtn.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    zIndex: '2147483648',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
  })

  const removeBtn = () => {
    if (document.body.contains(closeBtn)) document.body.removeChild(closeBtn)
  }

  closeBtn.onclick = () => {
    checkout.close()
    removeBtn()
    onClose()
  }

  document.body.appendChild(closeBtn)

  checkout.addEventListener('success', () => {
    removeBtn()
    onSuccess()
  })

  checkout.addEventListener('close', () => {
    removeBtn()
    onClose()
  })

  return checkout
}

export default openCheckout
