import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import GameSprite from './ui/GameSprite';
import { useLanguage } from '../contexts/LanguageContext';
import { Check, X } from 'lucide-react';

interface BonusPointsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (enableTimer: boolean, timePerQuestion: number) => void;
}

export const BonusPointsModal: React.FC<BonusPointsModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useLanguage();
    const [enableTimer, setEnableTimer] = useState(true);
    const [timePerQuestion, setTimePerQuestion] = useState(30);

    const handleSave = () => {
        onSave(enableTimer, timePerQuestion);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('bonusModal.title')}>
            <div className="flex flex-col items-center space-y-6">
                <div className="relative w-32 h-32">
                    <GameSprite variant="cube_peek" className="w-full h-full" />
                </div>

                <p className="text-center text-text-secondary text-lg">
                    {t('bonusModal.description')}
                </p>

                <div className="w-full space-y-4 bg-surface-hover p-4 rounded-xl border border-border">
                    {/* Timer Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary">{t('bonusModal.enableTimer')}</span>
                        <button
                            onClick={() => setEnableTimer(!enableTimer)}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-surface ${enableTimer ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                        >
                            <span
                                className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center ${enableTimer ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            >
                                {enableTimer ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-gray-400" />}
                            </span>
                        </button>
                    </div>

                    {/* Seconds Slider */}
                    <div className={`space-y-2 transition-opacity duration-200 ${enableTimer ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-primary">{t('bonusModal.secondsPerQuestion')}</span>
                            <span className="font-bold text-accent-primary">{timePerQuestion}s</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            value={timePerQuestion}
                            onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                        />
                        <div className="flex justify-between text-xs text-text-secondary">
                            <span>10s</span>
                            <span>60s</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full gap-3 sm:flex-row">
                    <Button
                        onClick={handleSave}
                        className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {t('bonusModal.save')}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full sm:flex-1"
                    >
                        {t('bonusModal.noThanks')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
