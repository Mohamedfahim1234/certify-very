import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const currentLang = LANGUAGES.find((l) => l.code === language);

    return (
        <div className="relative" ref={ref}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!open)}
                className="rounded-full"
                title="Change Language"
            >
                <Globe className="h-5 w-5" />
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-popover text-popover-foreground shadow-lg z-[100] overflow-hidden"
                    >
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-accent/50 transition-colors ${language === lang.code ? 'bg-accent/30 font-semibold' : ''
                                    }`}
                            >
                                <span>{lang.nativeLabel}</span>
                                {language === lang.code && (
                                    <span className="text-primary text-xs">✓</span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
