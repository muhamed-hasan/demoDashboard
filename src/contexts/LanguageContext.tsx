'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, getTranslation, TranslationKey, getLanguageDirection } from '@/utils/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_COOKIE = 'language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar'); // Default to Arabic
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved language preference in cookie
    const match = document.cookie.match(/language=(en|ar)/);
    if (match) {
      setLanguage(match[1] as Language);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Save language preference to cookie
    document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000`;
    
    // Update document direction and lang attribute
    const { direction } = getLanguageDirection(language);
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language === 'ar' ? 'ar' : 'en');
    
    // Add/remove RTL class for styling
    if (language === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [language, mounted]);

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  const { isRTL, direction } = getLanguageDirection(language);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
    direction,
  };

  // Avoid hydration mismatch by not providing context until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Fallback for SSR/build time
    return {
      language: 'ar',
      setLanguage: () => {},
      t: (key: TranslationKey) => getTranslation('ar', key),
      isRTL: true,
      direction: 'rtl',
    };
  }
  return context;
};
