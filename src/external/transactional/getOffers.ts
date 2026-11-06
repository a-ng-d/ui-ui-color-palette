import { Offer } from '../../types/offers'
import { getPolar } from '.'

const TIMEOUT = 3000
const MAX_PAGES = 5

const getOffers = async (
  productIds: string[],
  now = Date.now()
): Promise<Offer[]> => {
  const config = getPolar()
  if (!config || !productIds.length) return []

  try {
    const discounts = []
    let pages = 0
    for await (const page of await config.polar.discounts.list(
      { limit: 100 },
      { timeoutMs: TIMEOUT }
    )) {
      discounts.push(...page.result.items)
      if (++pages >= MAX_PAGES) break
    }

    return discounts.flatMap((discount): Offer[] => {
      if (!('basisPoints' in discount)) return []
      if (!discount.startsAt || !discount.endsAt) return []
      if (String(discount.metadata?.campaign ?? '').toLowerCase() === 'private')
        return []
      if (discount.endsAt && discount.endsAt.getTime() <= now) return []
      if (
        discount.maxRedemptions !== null &&
        discount.redemptionsCount >= discount.maxRedemptions
      )
        return []

      const percentOff = discount.basisPoints / 100
      if (!(percentOff > 0 && percentOff < 100)) return []

      const restricted = discount.products.map((product) => product.id)
      const products = restricted.length
        ? productIds.filter((id) => restricted.includes(id))
        : productIds

      return products.map((productId) => ({
        productId,
        eventName: discount.name,
        discountId: discount.id,
        discountCode: discount.code,
        percentOff,
        startsAt: discount.startsAt?.toISOString() ?? null,
        endsAt: discount.endsAt?.toISOString() ?? null,
      }))
    })
  } catch {
    return []
  }
}

export default getOffers
