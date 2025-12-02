import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface AnimatedLogoProps {
    className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className }) => {
    const [currentImage, setCurrentImage] = useState<'logo' | 'parrot'>('logo');
    const [direction, setDirection] = useState<'up' | 'down'>('up');

    useEffect(() => {
        const swapInterval = setInterval(() => {
            // Randomize direction
            const newDirection = Math.random() > 0.5 ? 'up' : 'down';
            setDirection(newDirection);

            // Swap image
            setCurrentImage((prev) => (prev === 'logo' ? 'parrot' : 'logo'));
        }, 5000 + Math.random() * 3000); // Random interval between 5-8 seconds

        return () => clearInterval(swapInterval);
    }, []);

    const variants: Variants = {
        enter: (direction: string) => ({
            y: direction === 'up' ? 100 : -100,
            opacity: 0,
            scale: 0.8,
        }),
        center: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                y: { type: "spring", stiffness: 300, damping: 20 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
            }
        },
        exit: (direction: string) => ({
            y: direction === 'up' ? -100 : 100,
            opacity: 0,
            scale: 0.8,
            transition: {
                y: { type: "spring", stiffness: 300, damping: 20 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
            }
        }),
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentImage}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex items-center justify-center w-full h-full"
                >
                    <motion.img
                        src={currentImage === 'logo' ? '/app_logo.png' : '/kor-parot-transparent.png'}
                        alt="App Logo"
                        className="w-full h-full object-contain"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                            scale: {
                                repeat: Infinity,
                                duration: 3,
                                ease: "easeInOut",
                                delay: 0.5 // Wait for enter animation to finish
                            }
                        }}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AnimatedLogo;
