import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, User as UserIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { cn } from '../lib/utils';

interface AvatarUploaderProps {
    currentAvatarUrl?: string;
    onUpload?: (newUrl: string) => void;
    onCrop?: (blob: Blob) => void;
    isEditable?: boolean;
    className?: string;
}

const API_BASE = 'http://localhost:3000/api'; // Should be dynamic or from env

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
    currentAvatarUrl,
    onUpload,
    onCrop,
    isEditable = true,
    className
}) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    // Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    const handleAvatarClick = () => {
        if (isEditable) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleUploadCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setLoading(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            if (!croppedImageBlob) {
                throw new Error('Failed to crop image');
            }

            // If onCrop is provided, return the blob and skip upload
            if (onCrop) {
                onCrop(croppedImageBlob);
                setIsCropping(false);
                setImageSrc(null);
                return;
            }

            const formData = new FormData();
            formData.append('avatar', croppedImageBlob, 'avatar.jpg');

            const token = localStorage.getItem('token');
            const headers: any = {
                'Content-Type': 'multipart/form-data'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await axios.post(`${API_BASE}/users/avatar`, formData, { headers });

            if (res.data.user && res.data.user.avatarUrl && onUpload) {
                onUpload(res.data.user.avatarUrl);
            }

            setIsCropping(false);
            setImageSrc(null);

        } catch (err) {
            console.error(err);
            // Handle error (maybe pass to parent?)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                <div
                    className="rounded-full overflow-hidden border-4 border-accent-primary bg-bg-tertiary flex items-center justify-center shadow-glow"
                    style={{ width: '120px', height: '120px' }}
                >
                    {currentAvatarUrl ? (
                        <img
                            src={`${API_BASE.replace('/api', '')}${currentAvatarUrl}`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserIcon size={48} className="text-text-secondary" />
                    )}
                </div>
                {isEditable && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" />
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {isEditable && <p className="text-sm text-text-secondary mt-2">{t('profile.changeAvatar')}</p>}

            {/* Cropper Modal */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div
                        className="relative bg-bg-primary rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                        style={{ width: '90%', maxWidth: '500px', height: '80vh', maxHeight: '600px' }}
                    >
                        <div className="relative flex-grow w-full h-full bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>

                        <div className="p-4 bg-bg-secondary border-t border-white/10 flex flex-col gap-4 z-50">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-text-secondary">{t('common.zoom')}</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary hover:bg-bg-tertiary/80 transition-colors"
                                />
                            </div>

                            <div className="flex justify-between items-center gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsCropping(false)}
                                    className="flex-1"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    onClick={handleUploadCroppedImage}
                                    className="flex-1 shadow-glow"
                                    disabled={loading}
                                    isLoading={loading}
                                >
                                    {!loading && <Check size={16} className="me-2" />}
                                    {t('common.saveShort')}
                                </Button>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCropping(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm transition-colors z-20"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
