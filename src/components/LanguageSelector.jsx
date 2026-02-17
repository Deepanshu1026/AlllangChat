import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

export const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    // Safe check for current language
    const currentLang = languages.find(l => i18n.language?.startsWith(l.code)) || languages[0];

    return (
        <div className="lang-dropdown">
            <button className="lang-toggle" onClick={() => setIsOpen(!isOpen)}>
                <Globe size={16} />
                <span>{currentLang.name}</span>
            </button>

            {isOpen && (
                <div className="lang-menu">
                    {languages.map((lang) => (
                        <div
                            key={lang.code}
                            className={`lang-item ${i18n.language?.startsWith(lang.code) ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {i18n.language?.startsWith(lang.code) && <Check size={14} style={{ marginLeft: 'auto' }} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
