'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaGlobe } from 'react-icons/fa';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 hover:bg-white border border-gray-200 shadow-sm transition-all duration-200 text-gray-700 hover:text-gray-900"
        title={t('language')}
      >
        <FaGlobe className="text-sm" />
        <span className="text-sm font-medium">
          {language === 'en' ? 'العربية' : 'English'}
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;
