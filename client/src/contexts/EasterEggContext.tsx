import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type EasterEggCondition = {
    sequence?: string[]; // Array of keys, e.g., ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']
    // We can add more condition types here later, e.g., specific game states
};

export type EasterEggAction = () => void;

export interface EasterEgg {
    id: string;
    condition: EasterEggCondition;
    action: EasterEggAction;
}

interface EasterEggContextType {
    registerEgg: (egg: EasterEgg) => void;
    unregisterEgg: (id: string) => void;
}

const EasterEggContext = createContext<EasterEggContextType | undefined>(undefined);

export const useEasterEgg = () => {
    const context = useContext(EasterEggContext);
    if (!context) {
        throw new Error('useEasterEgg must be used within an EasterEggProvider');
    }
    return context;
};

export const EasterEggProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [eggs, setEggs] = useState<EasterEgg[]>([]);
    const [inputBuffer, setInputBuffer] = useState<string[]>([]);

    const registerEgg = useCallback((egg: EasterEgg) => {
        setEggs((prev) => [...prev, egg]);
    }, []);

    const unregisterEgg = useCallback((id: string) => {
        setEggs((prev) => prev.filter((e) => e.id !== id));
    }, []);

    // Handle key presses
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { key } = event;

            setInputBuffer((prev) => {
                const newBuffer = [...prev, key];
                // Keep buffer size manageable, max 20 keys should be enough for most codes
                if (newBuffer.length > 20) {
                    return newBuffer.slice(newBuffer.length - 20);
                }
                return newBuffer;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Check for egg triggers
    useEffect(() => {
        if (inputBuffer.length === 0) return;

        eggs.forEach((egg) => {
            if (egg.condition.sequence) {
                const sequence = egg.condition.sequence;
                // Check if the end of the buffer matches the sequence
                if (inputBuffer.length >= sequence.length) {
                    const bufferSlice = inputBuffer.slice(inputBuffer.length - sequence.length);
                    const isMatch = bufferSlice.every((key, index) => key.toLowerCase() === sequence[index].toLowerCase());

                    if (isMatch) {
                        console.log(`Easter Egg triggered: ${egg.id}`);
                        egg.action();
                        // Optional: Clear buffer after successful trigger to prevent double firing? 
                        // For now, let's clear it to be safe and clean.
                        setInputBuffer([]);
                    }
                }
            }
        });
    }, [inputBuffer, eggs]);

    return (
        <EasterEggContext.Provider value={{ registerEgg, unregisterEgg }}>
            {children}
        </EasterEggContext.Provider>
    );
};
