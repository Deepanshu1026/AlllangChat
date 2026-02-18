import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const languages = [
    { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', englishName: 'Hindi', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', englishName: 'Bengali', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', englishName: 'Marathi', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', flag: '🇮🇳' }
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    const currentLang = languages.find(l => i18n.language?.startsWith(l.code)) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2f2f2f] hover:bg-[#3a3a3a] text-white text-sm transition-colors border border-white/10"
            >
                <Globe size={16} />
                <span className="hidden sm:inline">{currentLang.name}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-80 overflow-y-auto py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-left ${i18n.language?.startsWith(lang.code)
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-300 hover:bg-[#3a3a3a]'
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="flex-1 text-sm font-medium">{lang.name}</span>
                                {i18n.language?.startsWith(lang.code) && (
                                    <Check size={16} className="text-white" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
