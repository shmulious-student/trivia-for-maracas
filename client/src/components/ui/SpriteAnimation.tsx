import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../lib/utils';

interface SpriteAnimationProps {
    src: string;
    rows: number;
    cols: number;
    fps?: number;
    width?: number | string;
    height?: number | string;
    className?: string;
    isPlaying?: boolean;
    mode?: 'loop' | 'bounce';
}

const SpriteAnimation: React.FC<SpriteAnimationProps> = ({
    src,
    rows,
    cols,
    fps = 12,
    width = 100,
    height = 100,
    className,
    isPlaying = true,
    mode = 'loop',
}) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const totalFrames = rows * cols;
    const lastFrameTimeRef = useRef<number>(0);
    const requestRef = useRef<number>(0);
    const directionRef = useRef<1 | -1>(1);

    useEffect(() => {
        if (!isPlaying) return;

        const animate = (time: number) => {
            if (time - lastFrameTimeRef.current >= 1000 / fps) {
                setCurrentFrame((prev) => {
                    if (mode === 'loop') {
                        return (prev + 1) % totalFrames;
                    } else {
                        // Bounce mode
                        let next = prev + directionRef.current;
                        if (next >= totalFrames) {
                            directionRef.current = -1;
                            next = totalFrames - 2;
                        } else if (next < 0) {
                            directionRef.current = 1;
                            next = 1;
                        }
                        return next;
                    }
                });
                lastFrameTimeRef.current = time;
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, [fps, totalFrames, isPlaying, mode]);

    const colIndex = currentFrame % cols;
    const rowIndex = Math.floor(currentFrame / cols);

    const bgPosX = cols > 1 ? (colIndex / (cols - 1)) * 100 : 0;
    const bgPosY = rows > 1 ? (rowIndex / (rows - 1)) * 100 : 0;

    return (
        <div
            className={cn('inline-block overflow-hidden bg-no-repeat', className)}
            style={{
                width,
                height,
                backgroundImage: `url(${src})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                imageRendering: 'pixelated', // Optional: for crisp pixel art
            }}
        />
    );
};

export default SpriteAnimation;
