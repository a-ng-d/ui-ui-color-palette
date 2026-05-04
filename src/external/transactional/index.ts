import { Polar } from '@polar-sh/sdk'

interface PolarConfig {
  polar: Polar
  functionsUrl: string
}

let polarInstance: PolarConfig | null = null

export const initPolar = (
  accessToken: string,
  functionsUrl: string,
  server: 'sandbox' | 'production'
) => {
  if (!polarInstance)
    polarInstance = { polar: new Polar({ accessToken, server }), functionsUrl }
  return polarInstance
}

export const getPolar = () => polarInstance
