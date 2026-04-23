import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import en from '../locales/en.json'
import ru from '../locales/ru.json'

const locales = Localization.getLocales()
const deviceLang = locales?.[0]?.languageCode ?? 'en'
const lng = deviceLang === 'ru' ? 'ru' : 'en'

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: { en: { translation: en }, ru: { translation: ru } },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initImmediate: false,
  })

export default i18n
