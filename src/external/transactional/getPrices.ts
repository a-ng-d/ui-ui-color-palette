import { getPolar } from '.'

const inferCurrency = (locale: string): string => {
  try {
    const region =
      new Intl.Locale(locale).maximize().region?.toUpperCase() ?? ''
    const eurRegions = new Set([
      'AT',
      'BE',
      'CY',
      'DE',
      'EE',
      'ES',
      'FI',
      'FR',
      'GR',
      'IE',
      'IT',
      'LT',
      'LU',
      'LV',
      'MT',
      'NL',
      'PT',
      'SI',
      'SK',
    ])
    if (eurRegions.has(region)) return 'eur'
    if (region === 'GB') return 'gbp'
    if (region === 'CH') return 'chf'
    if (region === 'BR') return 'brl'
    if (region === 'IN') return 'inr'
    if (region === 'SG') return 'sgd'
    if (region === 'CN') return 'cny'
    if (region === 'TW') return 'twd'
    if (region === 'KR') return 'krw'
    if (region === 'TR') return 'try'
    return 'usd'
  } catch {
    return 'usd'
  }
}

export interface ProductPrice {
  productId: string
  amount: number
  currency: string
  formatted: string
}

const getPrices = async (
  productIds: string[],
  locale = navigator.languages?.[0] ?? navigator.language ?? 'en-US'
): Promise<Record<string, ProductPrice>> => {
  const config = getPolar()
  if (!config || !productIds.length) return {}

  const { polar } = config
  const preferredCurrency = inferCurrency(locale)

  const results = await Promise.allSettled(
    productIds.map((id) => polar.products.get({ id }))
  )

  return Object.fromEntries(
    results.flatMap((result, i) => {
      if (result.status !== 'fulfilled') return []

      const fixedPrices = result.value.prices.filter(
        (p) => p.amountType === 'fixed' && !p.isArchived
      )
      const price =
        fixedPrices.find((p) => p.priceCurrency === preferredCurrency) ??
        fixedPrices[0]
      if (!price || price.amountType !== 'fixed') return []

      return [
        [
          productIds[i],
          {
            productId: productIds[i],
            amount: price.priceAmount,
            currency: price.priceCurrency,
            formatted: new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: price.priceCurrency,
              minimumFractionDigits: 0,
            }).format(price.priceAmount / 100),
          },
        ],
      ]
    })
  )
}

export default getPrices
