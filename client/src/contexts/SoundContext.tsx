import React, { createContext, useContext, useState, useEffect } from 'react';
import useSound from 'use-sound';

type SoundType = 'click' | 'correct' | 'wrong' | 'gameOver' | 'newRecord';

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        const saved = localStorage.getItem('isMuted');
        return saved ? JSON.parse(saved) : false;
    });

    const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5, soundEnabled: !isMuted });
    const [playCorrect] = useSound('/sounds/correct.mp3', { volume: 0.5, soundEnabled: !isMuted });
    const [playWrong] = useSound('/sounds/wrong.mp3', { volume: 0.5, soundEnabled: !isMuted });
    const [playGameOver] = useSound('/sounds/game-over.mp3', { volume: 0.5, soundEnabled: !isMuted });
    const [playNewRecord] = useSound('/sounds/game-over-new-record.wav', { volume: 0.5, soundEnabled: !isMuted });

    useEffect(() => {
        localStorage.setItem('isMuted', JSON.stringify(isMuted));
    }, [isMuted]);

    const toggleMute = () => setIsMuted(prev => !prev);

    const playSound = (type: SoundType) => {
        if (isMuted) return;

        switch (type) {
            case 'click':
                playClick();
                break;
            case 'correct':
                playCorrect();
                break;
            case 'wrong':
                playWrong();
                break;
            case 'gameOver':
                playGameOver();
                break;
            case 'newRecord':
                playNewRecord();
                break;
        }
    };

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSoundContext = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSoundContext must be used within a SoundProvider');
    }
    return context;
};
