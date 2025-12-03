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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onSelect}
            className={cn(
                "group relative h-48 w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500",
                "hover:shadow-2xl hover:shadow-accent-primary/20",
                isSelected ? "ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-primary shadow-glow scale-[1.02]" : "hover:-translate-y-1"
            )}
        >
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                        backgroundImage: `url(${subject.coverImage || '/subjects/default-subject.png'})`,
                    }}
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/10 opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
                <div className={cn(
                    "absolute inset-0 bg-accent-primary/20 mix-blend-overlay transition-opacity duration-300",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between h-full p-6">
                <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                        <h3 className={cn(
                            "text-2xl font-bold text-white leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-all duration-300",
                            isSelected && "text-accent-primary"
                        )}>
                            {subject.name[language]}
                        </h3>
                        {subject.description && (
                            <p className="text-sm text-gray-200 line-clamp-2 font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                {subject.description[language]}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(e);
                        }}
                        className={cn(
                            "p-2 rounded-full backdrop-blur-md bg-black/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95",
                            isFavorite ? "text-red-500 bg-red-500/10" : "text-white/70 hover:text-red-400"
                        )}
                    >
                        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    {subject.questionCount !== undefined && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-white/90">
                                {subject.questionCount} {t('common.questions')}
                            </span>
                        </div>
                    )}

                    {isSelected && (
                        <motion.div
                            layoutId="selected-indicator"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-accent-primary text-white p-2 rounded-full shadow-lg shadow-accent-primary/40"
                        >
                            <Trophy size={18} />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
