import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('aquitem_lang');
      if (saved === 'pt' || saved === 'en') return saved;
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang && browserLang.toLowerCase().startsWith('en')) {
        return 'en';
      }
    } catch (e) {
      // fallback
    }
    return 'pt';
  });

  useEffect(() => {
    try {
      localStorage.setItem('aquitem_lang', lang);
    } catch (e) {
      // ignore
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'pt' ? 'en' : 'pt'));
  };

  const t = (key) => {
    const langDict = translations[lang] || translations.pt;
    return langDict[key] || translations.pt[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
