import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('pocketwise_lang') || 'en'
  );

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Reflect the chosen language on <html> so Tailwind's built-in `rtl:`/`ltr:`
  // variants (which target `[dir]` on an ancestor) work everywhere for free.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    localStorage.setItem('pocketwise_lang', language);
  }, [language, dir]);

  const setLanguage = (lang) => setLanguageState(lang);
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));

  /**
   * Dot-path translator: t('dashboard.balance') or t('piggyBank.ofGoal', { amount: 500 }).
   * Falls back to English, then to the raw key, so a missing translation never
   * crashes the UI — it just surfaces as an obviously-untranslated string during dev.
   */
  const t = (key, vars = {}) => {
    const dict = translations[language] || translations.en;
    const fallbackDict = translations.en;
    const path = key.split('.');

    let value = path.reduce((acc, part) => (acc ? acc[part] : undefined), dict);
    if (value === undefined) {
      value = path.reduce((acc, part) => (acc ? acc[part] : undefined), fallbackDict);
    }
    if (typeof value !== 'string') return key;

    return Object.keys(vars).reduce(
      (str, v) => str.replace(`{{${v}}}`, vars[v]),
      value
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
