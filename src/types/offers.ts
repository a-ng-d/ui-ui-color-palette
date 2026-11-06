export interface Offer {
  productId: string
  eventName: string
  discountId: string
  discountCode: string | null
  percentOff: number
  startsAt: string | null
  endsAt: string | null
}
