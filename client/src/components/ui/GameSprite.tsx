import React from 'react';
import SpriteAnimation from './SpriteAnimation';
import { cn } from '../../lib/utils';

export type SpriteVariant = 'test1' | 'test2' | 'login' | 'wrong' | 'cube_peek' | 'celebrate';

interface GameSpriteProps {
    variant: SpriteVariant;
    className?: string;
    isPlaying?: boolean;
}

const SPRITE_CONFIGS: Record<SpriteVariant, { src: string; rows: number; cols: number; fps: number; totalWidth: number; totalHeight: number; mode?: 'loop' | 'bounce' }> = {
    test1: {
        src: '/spritesheet_test.png',
        rows: 4,
        cols: 3,
        fps: 12,
        totalWidth: 1024,
        totalHeight: 1024,
    },
    test2: {
        src: '/sproitsheet_test2.png',
        rows: 4,
        cols: 4,
        fps: 12,
        totalWidth: 1024,
        totalHeight: 1024,
    },
    login: {
        src: '/sprite-max-px-36.png',
        rows: 6,
        cols: 6,
        fps: 14,
        totalWidth: 2724,
        totalHeight: 2268,
    },
    wrong: {
        src: '/sprite-max-px-36_into_cube.png',
        rows: 6,
        cols: 6,
        fps: 16,
        totalWidth: 2820,
        totalHeight: 3132,
    },
    cube_peek: {
        src: '/cube_peek_animation.png',
        rows: 6,
        cols: 6,
        fps: 16,
        totalWidth: 2280,
        totalHeight: 2856,
        mode: 'bounce',
    },
    celebrate: {
        src: '/sprite-max-px-36_celebrate.png',
        rows: 6,
        cols: 6,
        fps: 16,
        totalWidth: 3840,
        totalHeight: 3756,
        mode: 'bounce',
    },
};

const GameSprite: React.FC<GameSpriteProps> = ({
    variant,
    className,
    isPlaying = true,
}) => {
    const config = SPRITE_CONFIGS[variant];
    const frameWidth = config.totalWidth / config.cols;
    const frameHeight = config.totalHeight / config.rows;
    const aspectRatio = frameWidth / frameHeight;

    return (
        <div style={{ aspectRatio }} className={cn("inline-block", className)}>
            <SpriteAnimation
                src={config.src}
                rows={config.rows}
                cols={config.cols}
                fps={config.fps}
                width="100%"
                height="100%"
                isPlaying={isPlaying}
                mode={config.mode}
            />
        </div>
    );
};

export default GameSprite;
