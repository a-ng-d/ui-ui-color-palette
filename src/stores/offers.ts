import { atom } from 'nanostores'
import { Offer } from '../types/offers'

export const $offers = atom<Offer[]>([])

const startOf = (offer: Offer) =>
  offer.startsAt ? Date.parse(offer.startsAt) : -Infinity

export const getActiveOffer = (
  offers: Offer[],
  productId: string,
  now: number = Date.now()
): Offer | undefined =>
  offers
    .filter(
      (offer) =>
        offer.productId === productId &&
        startOf(offer) <= now &&
        (!offer.endsAt || now < Date.parse(offer.endsAt))
    )
    .reduce<
      Offer | undefined
    >((latest, offer) => (!latest || startOf(offer) > startOf(latest) ? offer : latest), undefined)

export const getFeaturedOffer = (
  offers: Offer[],
  productIds: string[],
  now: number = Date.now()
): Offer | undefined =>
  productIds
    .map((productId) => getActiveOffer(offers, productId, now))
    .reduce<Offer | undefined>((best, offer) => {
      if (!offer) return best
      if (!best || offer.percentOff > best.percentOff) return offer
      if (
        offer.percentOff === best.percentOff &&
        startOf(offer) > startOf(best)
      )
        return offer
      return best
    }, undefined)
