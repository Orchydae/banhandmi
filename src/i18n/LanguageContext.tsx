import { createContext, useContext, useState } from 'react'
import type { Lang, TranslationKey } from './translations'
import { translations } from './translations'

interface LanguageContextValue {
    lang: Lang
    setLang: (l: Lang) => void
    t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>(() => {
        const stored = localStorage.getItem('lang') as Lang | null
        if (stored === 'fr' || stored === 'en') return stored
        return navigator.language.startsWith('fr') ? 'fr' : 'en'
    })

    const setLang = (l: Lang) => {
        setLangState(l)
        localStorage.setItem('lang', l)
    }

    const t = (key: TranslationKey): string => translations[lang][key]

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}
