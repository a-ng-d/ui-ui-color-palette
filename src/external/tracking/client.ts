// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mixpanelInstance: any | null = null
let mixpanelEnv: 'Dev' | 'Prod' = 'Dev'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initMixpanel = (instance: any) => {
  mixpanelInstance = instance
  return mixpanelInstance
}

export const getMixpanel = () => {
  return mixpanelInstance
}

export const setMixpanelEnv = (env: 'development' | 'production') => {
  mixpanelEnv = env === 'development' ? 'Dev' : 'Prod'
  return mixpanelEnv
}

export const getMixpanelEnv = () => {
  if (!mixpanelEnv) throw new Error('Mixpanel environment not set')
  return mixpanelEnv
}
