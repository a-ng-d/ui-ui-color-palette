import { DevTools, Tolgee, TolgeeInstance } from '@tolgee/react'
import { FormatIcu } from '@tolgee/format-icu'

let tolgeeInstance: TolgeeInstance

export const initTolgee = (
  url: string,
  apiKey: string,
  defaultLang: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staticData: Record<string, any>
) => {
  tolgeeInstance = Tolgee().use(DevTools()).use(FormatIcu()).init({
    language: defaultLang,
    apiUrl: url,
    apiKey: apiKey,
    fallbackLanguage: defaultLang,
    staticData: staticData,
  })

  return tolgeeInstance
}

export const getTolgee = () => {
  return tolgeeInstance
}
