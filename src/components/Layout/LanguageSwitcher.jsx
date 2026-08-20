import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="glass-panel flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
      aria-label="Toggle language / تبديل اللغة"
    >
      <Languages size={16} />
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
