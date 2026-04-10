import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import en from '@/i18n/en.json';
import ta from '@/i18n/ta.json';
import ml from '@/i18n/ml.json';
import te from '@/i18n/te.json';

type Translations = Record<string, string>;

const translationMap: Record<string, Translations> = { en, ta, ml, te };

export const LANGUAGES = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
    { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
    { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<string>(
        () => localStorage.getItem('appLanguage') || 'en'
    );

    const setLanguage = useCallback((lang: string) => {
        setLanguageState(lang);
        localStorage.setItem('appLanguage', lang);
    }, []);

    const t = useCallback(
        (key: string): string => {
            const strings = translationMap[language] || translationMap['en'];
            return strings[key] || translationMap['en'][key] || key;
        },
        [language]
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}