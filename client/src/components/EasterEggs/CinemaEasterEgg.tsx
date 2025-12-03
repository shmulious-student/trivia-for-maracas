import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface CinemaEasterEggProps {
    onComplete?: () => void;
}

export const CinemaEasterEgg: React.FC<CinemaEasterEggProps> = ({ onComplete }) => {
    const { t } = useLanguage();
    const [stage, setStage] = useState<'curtains-closing' | 'permission' | 'rejected' | 'curtains-opening' | 'countdown' | 'video' | 'camera'>('curtains-closing');
    const [count, setCount] = useState(3);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [showOverlay, setShowOverlay] = useState(false);

    // Placeholder video URL - can be replaced with a specific asset later
    const VIDEO_URL = "/easterEgg/easterEgg.mp4";

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (stage === 'curtains-closing') {
            // Start camera initialization immediately
            timer = setTimeout(() => {
                setStage('permission');
            }, 2000);
        } else if (stage === 'permission') {
            // Wait for user input
        } else if (stage === 'curtains-opening') {
            timer = setTimeout(() => {
                setStage('countdown');
            }, 2000);
        } else if (stage === 'countdown') {
            if (count > 0) {
                timer = setTimeout(() => setCount(c => c - 1), 1000);
            } else {
                setStage('video');
            }
        } else if (stage === 'camera') {
            // Attach pre-loaded stream if available
            if (cameraVideoRef.current && streamRef.current) {
                cameraVideoRef.current.srcObject = streamRef.current;
            } else {
                // Fallback if stream wasn't ready yet
                startCamera().then(() => {
                    if (cameraVideoRef.current && streamRef.current) {
                        cameraVideoRef.current.srcObject = streamRef.current;
                    }
                });
            }
        }

        return () => clearTimeout(timer);
    }, [stage, count]);

    const startCamera = async () => {
        if (streamRef.current) return; // Already started

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            // Handle permission denied or no camera
            setStage('rejected');
        }
    };

    const handlePermission = (allowed: boolean) => {
        if (allowed) {
            startCamera().then(() => {
                if (streamRef.current) {
                    setStage('curtains-opening');
                }
            });
        } else {
            setStage('rejected');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = "";
        }
        if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        const handleBlur = () => {
            stopCamera();
        };

        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('blur', handleBlur);
            stopCamera();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
            {/* Cinema Screen Container */}
            <div className="relative w-full h-full max-w-6xl max-h-[80vh] bg-black border-8 border-gray-800 rounded-lg shadow-2xl overflow-hidden flex items-center justify-center">

                {/* Content based on stage */}
                <AnimatePresence mode="wait">
                    {stage === 'countdown' && (
                        <motion.div
                            key="countdown"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-9xl font-black text-white font-mono"
                        >
                            {count > 0 ? count : ''}
                        </motion.div>
                    )}

                    {stage === 'video' && (
                        <div className="relative w-full h-full">
                            <motion.video
                                key="video"
                                ref={videoRef}
                                src={VIDEO_URL}
                                className="w-full h-full object-contain"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                autoPlay
                                playsInline
                                onEnded={() => setStage('camera')}
                                onTimeUpdate={(e) => {
                                    if (e.currentTarget.currentTime >= 10 && !showOverlay) {
                                        setShowOverlay(true);
                                    }
                                }}
                                onLoadedData={(e) => {
                                    const video = e.currentTarget;
                                    video.play().catch(err => console.error("Video play failed:", err));
                                }}
                            />

                            {/* Camera Overlay */}
                            <AnimatePresence>
                                {showOverlay && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0, y: -50 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="absolute top-4 left-1/2 transform -translate-x-1/2 w-44 h-44 rounded-full border-4 border-white shadow-lg overflow-hidden z-10"
                                    >
                                        <video
                                            ref={(el) => {
                                                if (el && streamRef.current) {
                                                    el.srcObject = streamRef.current;
                                                }
                                            }}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover transform scale-x-[-1]"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {stage === 'camera' && (
                        <motion.div
                            key="camera"
                            className="relative w-full h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <video
                                ref={cameraVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                            />
                            <div className="absolute bottom-10 left-0 right-0 text-center">
                                <h2 className="text-4xl font-bold text-white drop-shadow-md">
                                    {t('easterEgg.youAreTheStar')}
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    stopCamera();
                                    if (onComplete) onComplete();
                                }}
                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Curtains */}
                <AnimatePresence>
                    {(stage === 'curtains-closing' || stage === 'curtains-opening') && (
                        <>
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: stage === 'curtains-closing' ? '0%' : '-100%' }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute top-0 left-0 w-1/2 h-full bg-red-800 z-20 shadow-[10px_0_20px_rgba(0,0,0,0.5)]"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 50%, #991b1b 100%)',
                                    backgroundSize: '100px 100%',
                                }}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: stage === 'curtains-closing' ? '0%' : '100%' }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute top-0 right-0 w-1/2 h-full bg-red-800 z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.5)]"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 50%, #991b1b 100%)',
                                    backgroundSize: '100px 100%',
                                }}
                            />
                        </>
                    )}
                </AnimatePresence>
                {/* Permission Modal */}
                <AnimatePresence>
                    {stage === 'permission' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute z-50 bg-gray-900 border border-gray-700 p-8 rounded-xl shadow-2xl text-center max-w-md mx-4"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">
                                {t('easterEgg.cameraPermission')}
                            </h3>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => handlePermission(true)}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    {t('easterEgg.allow')}
                                </button>
                                <button
                                    onClick={() => handlePermission(false)}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    {t('easterEgg.deny')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rejected State */}
                <AnimatePresence>
                    {stage === 'rejected' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute z-50 text-center"
                        >
                            <h1 className="text-6xl md:text-8xl font-black text-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] rotate-[-15deg] border-4 border-red-600 p-4 rounded-xl bg-black/50 backdrop-blur-sm">
                                {t('easterEgg.chickenShit')}
                            </h1>
                            <button
                                onClick={onComplete}
                                className="mt-12 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/20"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};
