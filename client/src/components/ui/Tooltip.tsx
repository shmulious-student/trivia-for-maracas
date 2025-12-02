import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    className
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
        bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
        left: 'top-1/2 -left-2 -translate-x-full -translate-y-1/2',
        right: 'top-1/2 -right-2 translate-x-full -translate-y-1/2',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute z-50 px-3 py-1.5 text-sm font-medium text-white bg-bg-secondary border border-white/10 rounded-md shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-md",
                            positions[position],
                            className
                        )}
                    >
                        {content}
                        {/* Arrow */}
                        <div className={cn(
                            "absolute w-2 h-2 bg-bg-secondary border-white/10 transform rotate-45",
                            position === 'top' && "bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r",
                            position === 'bottom' && "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l",
                            position === 'left' && "right-[-5px] top-1/2 -translate-y-1/2 border-t border-r",
                            position === 'right' && "left-[-5px] top-1/2 -translate-y-1/2 border-b border-l"
                        )} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
