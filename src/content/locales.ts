import { Translations, Language } from '../types/translations'
import zh_CN from './translations/zh-CN.json'
import pt_BR from './translations/pt-BR.json'
import fr_FR from './translations/fr-FR.json'
import en_US from './translations/en-US.json'

export const translations = {
  'en-US': en_US,
  'fr-FR': fr_FR,
  'pt-BR': pt_BR,
  'zh-CN': zh_CN,
} as Record<Language, Translations>

let currentLocale = translations['en-US']

export const locales = {
  get: () => currentLocale,
  set: (lang: Language) => {
    currentLocale = translations[lang]
    return translations[lang]
  },
  lang: () => {
    return (Object.keys(translations) as Language[]).find(
      (key) => translations[key] === currentLocale
    )!
  }
}
