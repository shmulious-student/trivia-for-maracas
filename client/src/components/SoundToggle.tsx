import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSoundContext } from '../contexts/SoundContext';
import { Button } from './ui/Button';

export const SoundToggle: React.FC = () => {
    const { isMuted, toggleMute } = useSoundContext();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-text-secondary hover:text-text-primary"
            title={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>
    );
};
