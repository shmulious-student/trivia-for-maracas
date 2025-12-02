import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export type MascotVariant = 'dancing' | 'celebrating' | 'idle' | 'shivering';

interface MascotProps {
    variant: MascotVariant;
    src: string;
    alt: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const variants: any = {
    dancing: {
        animate: {
            y: [0, -20, 0],
            rotate: [0, -5, 5, 0],
            scale: [1, 1.05, 1],
            transition: {
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut" as any
            }
        }
    },
    celebrating: {
        initial: { scale: 0, opacity: 0, rotate: -180 },
        animate: {
            scale: 1,
            opacity: 1,
            rotate: 0,
            y: [0, -15, 0],
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                y: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeOut",
                    delay: 0.5
                }
            }
        }
    },
    shivering: {
        animate: {
            x: [-2, 2, -2],
            rotate: [-1, 1, -1],
            transition: {
                duration: 0.1,
                repeat: Infinity,
                ease: "linear"
            }
        }
    },
    idle: {
        animate: {
            y: [0, -5, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }
};

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
};

export const Mascot: React.FC<MascotProps> = ({ variant, src, alt, className, size = 'md' }) => {
    return (
        <motion.div
            variants={variants[variant]}
            initial={variant === 'celebrating' ? "initial" : undefined}
            animate="animate"
            className={cn("relative", className)}
        >
            <img
                src={src}
                alt={alt}
                className={cn("object-contain drop-shadow-xl", sizeClasses[size])}
            />
        </motion.div>
    );
};
