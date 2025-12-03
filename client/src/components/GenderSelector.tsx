import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';


interface GenderSelectorProps {
    value: 'male' | 'female' | 'other';
    onChange: (gender: 'male' | 'female' | 'other') => void;
    className?: string;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onChange, className }) => {
    const { t } = useLanguage();

    const genders = [
        { id: 'male', label: t('profile.gender.male'), img: '/avatars/male.png' },
        { id: 'female', label: t('profile.gender.female'), img: '/avatars/female.png' },
        { id: 'other', label: t('profile.gender.other'), img: '/avatars/other.png' },
    ] as const;

    return (
        <div className={cn("flex gap-4 justify-center", className)}>
            {genders.map((gender) => (
                <button
                    key={gender.id}
                    type="button"
                    onClick={() => onChange(gender.id)}
                    className={cn(
                        "relative group flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300",
                        value === gender.id
                            ? "bg-accent-primary/10 scale-110"
                            : "hover:bg-white/5 opacity-70 hover:opacity-100"
                    )}
                >
                    <div className={cn(
                        "w-[84px] h-[84px] rounded-full overflow-hidden border-2 transition-all duration-300 shadow-lg",
                        value === gender.id
                            ? "border-4 border-accent-primary shadow-accent-primary/50"
                            : "border-2 border-transparent group-hover:border-white/20"
                    )}>
                        <img
                            src={gender.img}
                            alt={gender.label}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className={cn(
                        "text-sm font-medium transition-colors",
                        value === gender.id ? "text-accent-primary" : "text-text-secondary"
                    )}>
                        {gender.label}
                    </span>


                </button>
            ))}
        </div>
    );
};
