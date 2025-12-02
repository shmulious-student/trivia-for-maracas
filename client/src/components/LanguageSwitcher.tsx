import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface LanguageSwitcherProps {
    className?: string;
    showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className, showLabel = true }) => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'he' ? 'en' : 'he');
    };

    return (
        <button
            onClick={toggleLanguage}
            className={cn(
                "flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-white/10 text-text-primary",
                className
            )}
            title={language === 'he' ? 'Switch to English' : 'החלף לעברית'}
        >
            <div className="relative">
                <Globe size={20} />
                <motion.div
                    key={language}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-accent-primary border border-bg-primary flex items-center justify-center text-[8px] font-bold"
                >
                    {language.toUpperCase()}
                </motion.div>
            </div>
            {showLabel && (
                <span className="font-medium text-sm">
                    {language === 'he' ? 'עברית' : 'English'}
                </span>
            )}
        </button>
    );
};
