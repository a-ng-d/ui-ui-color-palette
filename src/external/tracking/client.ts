import { OverridedMixpanel } from 'mixpanel-browser'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mixpanelInstance: OverridedMixpanel | null = null
let mixpanelEnv: 'development' | 'production' = 'development'
let editor: 'figma' | 'figjam' | 'dev' | 'penpot' | 'sketch'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initMixpanel = (instance: any) => {
  mixpanelInstance = instance
  return mixpanelInstance
}

export const getMixpanel = () => {
  return mixpanelInstance
}

export const setMixpanelEnv = (env: 'development' | 'production') => {
  mixpanelEnv = env
  return mixpanelEnv
}

export const getMixpanelEnv = () => {
  if (!mixpanelEnv) throw new Error('Mixpanel environment not set')
  return mixpanelEnv
}

export const setEditor = (
  editorType: 'figma' | 'figjam' | 'dev' | 'penpot' | 'sketch'
) => {
  editor = editorType
  return editor
}

export const getEditor = () => {
  if (!editor) throw new Error('Editor not set')
  return editor
}
