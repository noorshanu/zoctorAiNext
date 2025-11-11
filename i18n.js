import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';
import translationUR from './locales/ur/translation.json';
import translationHI from './locales/hi/translation.json';

const resources = {
  en: { translation: translationEN },
  ar: { translation: translationAR },
  ur: { translation: translationUR },
  hi: { translation: translationHI }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });

export default i18n;
