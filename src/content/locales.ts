import { Translations } from '../types/translations'
import { Language } from '../types/app'
import en_US from './translations/en-US.json'

export const translations = {
  'en-US': en_US,
} as Record<Language, Translations>

let currentLocale = translations['en-US']

export const locales = {
  get: () => currentLocale,
  set: (lang: Language) => {
    currentLocale = translations[lang]
    return translations[lang]
  },
}
