import { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../locales/index.js';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // LocalStorage'dan dil tercihini al, yoksa varsayılan Türkçe
    return localStorage.getItem('gameLanguage') || 'tr';
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('gameLanguage', newLanguage);
  };

  const t = (key) => {
    return getTranslation(language, key);
  };

  useEffect(() => {
    // Dil değiştiğinde localStorage'a kaydet
    localStorage.setItem('gameLanguage', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 