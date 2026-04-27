interface PolarConfig {
  functionsUrl: string
  server: 'sandbox' | 'production'
}

let polarInstance: PolarConfig | null = null

export const initPolar = (
  functionsUrl: string,
  server: 'sandbox' | 'production'
) => {
  if (!polarInstance) polarInstance = { functionsUrl, server }
  return polarInstance
}

export const getPolar = () => polarInstance
