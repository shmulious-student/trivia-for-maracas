import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ISubject } from '@trivia/shared';
import { useLanguage } from '../contexts/LanguageContext';

interface SubjectCardProps {
    subject: ISubject;
    isSelected: boolean;
    onSelect: () => void;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
    index?: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
    subject,
    isSelected,
    onSelect,
    isFavorite,
    onToggleFavorite,
    index = 0
}) => {
    const { t, language } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={onSelect}
            className={cn(
                "group relative h-40 w-full rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer",
                isSelected
                    ? "bg-accent-primary/10 border-accent-primary shadow-glow"
                    : "glass-panel hover:border-white/20 hover:bg-bg-secondary/80"
            )}
        >
            <div className="relative z-10 flex flex-col justify-between h-full p-5">
                <div className="flex justify-between items-start gap-2">
                    <h3 className={cn(
                        "text-xl font-bold transition-colors line-clamp-2 leading-tight",
                        isSelected ? "text-accent-primary" : "text-text-primary group-hover:text-white"
                    )}>
                        {subject.name[language]}
                    </h3>

                    <button
                        onClick={onToggleFavorite}
                        className={cn(
                            "p-2 rounded-full transition-all duration-200 hover:bg-white/10 z-20 shrink-0",
                            isFavorite ? "text-red-500" : "text-text-muted hover:text-red-400"
                        )}
                    >
                        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    {subject.questionCount !== undefined && (
                        <span className="text-sm text-text-muted flex items-center gap-1">
                            <Star size={14} />
                            {subject.questionCount} {t('common.questions')}
                        </span>
                    )}

                    {isSelected && (
                        <motion.div
                            layoutId="selected-indicator"
                            className="bg-accent-primary text-white p-1.5 rounded-full"
                        >
                            <Trophy size={16} />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
