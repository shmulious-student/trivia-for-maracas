import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Volume2, VolumeX } from 'lucide-react';

interface CinemaEasterEggProps {
    onComplete?: () => void;
}

export const CinemaEasterEgg: React.FC<CinemaEasterEggProps> = ({ onComplete }) => {
    const { t } = useLanguage();
    const [stage, setStage] = useState<'curtains-closing' | 'permission' | 'rejected' | 'curtains-opening' | 'countdown' | 'video' | 'camera' | 'finished'>('curtains-closing');
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [showOverlay, setShowOverlay] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [countdown, setCountdown] = useState(3);

    // Placeholder video URL
    const VIDEO_URL = "https://res.cloudinary.com/dodcuvvnq/video/upload/v1764743841/trivia-assets/easter-egg-video.mp4";

    // Prime the video (play then immediately pause) to allow programmatic playback later
    const primeVideo = async () => {
        if (videoRef.current) {
            try {
                videoRef.current.muted = true; // Must be muted to autoplay/prime without gesture issues
                await videoRef.current.play();
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                console.log("Video primed successfully");
            } catch (err) {
                console.error("Video priming failed:", err);
            }
        }
    };

    const playVideo = async () => {
        if (videoRef.current) {
            try {
                // Ensure it's muted initially as per requirements
                videoRef.current.muted = true;
                setIsMuted(true);
                await videoRef.current.play();
            } catch (err) {
                console.error("Play failed:", err);
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (stage === 'curtains-closing') {
            timer = setTimeout(() => {
                setStage('permission');
            }, 2000);
        } else if (stage === 'curtains-opening') {
            timer = setTimeout(() => {
                setStage('countdown');
            }, 1500); // Match curtain animation duration
        } else if (stage === 'countdown') {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            } else {
                setStage('video');
                playVideo();
            }
        } else if (stage === 'finished') {
            // Stop camera when finished
            stopCamera();
        }

        return () => clearTimeout(timer);
    }, [stage, countdown]);

    const startCamera = async () => {
        if (streamRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            setStage('rejected');
        }
    };

    const handlePermission = async (allowed: boolean) => {
        if (allowed) {
            // 1. Prime video immediately on user gesture
            await primeVideo();

            // 2. Request camera permission
            try {
                await startCamera();
                // If successful, proceed
                setStage('curtains-opening');
            } catch (err) {
                // If camera fails/denied here
                setStage('rejected');
            }
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

                {/* Video Layer - ALWAYS rendered but hidden when not needed to allow priming */}
                <div className={`relative w-full h-full ${stage === 'video' || stage === 'camera' || stage === 'finished' ? 'block' : 'hidden'}`}>
                    <video
                        ref={videoRef}
                        src={VIDEO_URL}
                        className="w-full h-full object-contain"
                        playsInline
                        onEnded={() => {
                            setStage('finished');
                        }}
                        onTimeUpdate={(e) => {
                            // Show camera overlay at 9 seconds
                            if (e.currentTarget.currentTime >= 9 && !showOverlay) {
                                setShowOverlay(true);
                                setStage('camera'); // Update stage to indicate camera is active
                            }
                        }}
                    />

                    {/* Mute Toggle */}
                    {stage === 'video' && (
                        <button
                            onClick={toggleMute}
                            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20 backdrop-blur-sm"
                        >
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                    )}

                    {/* Camera Overlay */}
                    <AnimatePresence>
                        {showOverlay && stage !== 'finished' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 1 } }}
                                transition={{ duration: 1.5 }}
                                className="absolute top-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30"
                            >
                                <div
                                    className="w-48 h-48 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden mb-4 relative"
                                    style={{
                                        maskImage: 'radial-gradient(circle, black 60%, transparent 100%)',
                                        WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 100%)'
                                    }}
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
                                </div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                                >
                                    {t('easterEgg.wideOpenForDaddy')}
                                </motion.h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Countdown Layer */}
                <AnimatePresence>
                    {stage === 'countdown' && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center z-30 bg-black"
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                key={countdown}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 1 }}
                                exit={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-9xl font-bold text-white font-mono"
                            >
                                {countdown > 0 ? countdown : ''}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Curtains */}
                <AnimatePresence>
                    {(stage === 'curtains-closing' || stage === 'curtains-opening' || stage === 'permission' || stage === 'rejected') && (
                        <>
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: (stage === 'curtains-closing' || stage === 'permission' || stage === 'rejected') ? '0%' : '-100%' }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute top-0 left-0 w-1/2 h-full bg-red-800 z-20 shadow-[10px_0_20px_rgba(0,0,0,0.5)]"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, #991b1b 0%, #7f1d1d 50%, #991b1b 100%)',
                                    backgroundSize: '100px 100%',
                                }}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: (stage === 'curtains-closing' || stage === 'permission' || stage === 'rejected') ? '0%' : '100%' }}
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

                {/* Finished State */}
                <AnimatePresence>
                    {stage === 'finished' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute z-50 text-center"
                        >
                            <h1 className="text-6xl md:text-8xl font-black text-green-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] rotate-[-15deg] border-4 border-green-500 p-4 rounded-xl bg-black/50 backdrop-blur-sm">
                                {t('easterEgg.goodGirl')}
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

                {/* Close Button (Always available in video/camera stages) */}
                {(stage === 'video' || stage === 'camera') && (
                    <button
                        onClick={() => {
                            stopCamera();
                            if (onComplete) onComplete();
                        }}
                        className="absolute top-4 left-4 text-white/50 hover:text-white z-50"
                    >
                        ✕
                    </button>
                )}

            </div>
        </div>
    );
};
