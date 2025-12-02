import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Save, User as UserIcon, X, Check } from 'lucide-react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const API_BASE = 'http://localhost:3000/api';

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth(); // login updates the user state
    const { t } = useLanguage();
    const [username, setUsername] = useState(user?.username || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
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

            const formData = new FormData();
            formData.append('avatar', croppedImageBlob, 'avatar.jpg');

            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/users/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.user) {
                updateUser(res.data.user);
            }

            setMessage({ type: 'success', text: t('profile.avatarUpdated') });
            setIsCropping(false);
            setImageSrc(null);

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: t('profile.uploadFailed') });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_BASE}/users/profile`, { username }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data) {
                updateUser(res.data);
            }

            setMessage({ type: 'success', text: t('profile.saved') });
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.message || t('profile.saveFailed') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in">
            <h1 className="text-2xl font-bold mb-6 text-center">{t('profile.title')}</h1>

            <div className="glass-panel max-w-md mx-auto p-6 rounded-xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                        <div
                            className="rounded-full overflow-hidden border-4 border-accent-primary bg-bg-tertiary flex items-center justify-center shadow-glow"
                            style={{ width: '120px', height: '120px' }}
                        >
                            {user?.avatarUrl ? (
                                <img
                                    src={`http://localhost:3000${user.avatarUrl}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon size={48} className="text-text-secondary" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <p className="text-sm text-text-secondary mt-2">{t('profile.changeAvatar')}</p>
                </div>

                {message && (
                    <div className={cn(
                        "p-3 rounded-lg mb-4 text-center text-sm font-medium",
                        message.type === 'success' ? "bg-success/20 text-success border border-success/20" : "bg-error/20 text-error border border-error/20"
                    )}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">{t('profile.username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input w-full"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading} isLoading={loading}>
                        {!loading && <Save size={18} className="me-2" />}
                        {t('common.save')}
                    </Button>
                </form>
            </div>

            {/* Cropper Modal */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div
                        className="relative bg-bg-primary rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                        style={{ width: '90%', maxWidth: '500px', height: '80vh', maxHeight: '600px' }}
                    >
                        {/* Cropper fills the container */}
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

                        {/* Controls */}
                        <div className="p-4 bg-bg-secondary border-t border-white/10 flex flex-col gap-4 z-50">
                            {/* Zoom Control */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-text-secondary">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary hover:bg-bg-tertiary/80 transition-colors"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsCropping(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUploadCroppedImage}
                                    className="flex-1 shadow-glow"
                                    disabled={loading}
                                    isLoading={loading}
                                >
                                    {!loading && <Check size={16} className="me-2" />}
                                    Save
                                </Button>
                            </div>
                        </div>

                        {/* Close Button (Top Right) */}
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

export default Profile;
