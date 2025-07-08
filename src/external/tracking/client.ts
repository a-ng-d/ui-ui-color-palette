// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mixpanelInstance: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initMixpanel = (instance: any) => {
  mixpanelInstance = instance
  return mixpanelInstance
}

export const getMixpanel = () => {
  if (!mixpanelInstance) throw new Error('Mixpanel client not initialized')
  return mixpanelInstance
}
