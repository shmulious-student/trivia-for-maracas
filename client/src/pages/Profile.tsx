import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Save, User as UserIcon, X, Check } from 'lucide-react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

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

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
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

            <div className="card max-w-md mx-auto">
                <div className="flex flex-col items-center mb-6">
                    <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                        <div
                            className="rounded-full overflow-hidden border-4 border-accent-primary bg-bg-tertiary flex items-center justify-center"
                            style={{ width: '120px', height: '120px' }}
                        >
                            {user?.avatarUrl ? (
                                <img
                                    src={`http://localhost:3000${user.avatarUrl}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    <div className={`p-3 rounded mb-4 text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('profile.username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input w-full"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        <Save size={18} className="mr-2" />
                        {loading ? t('common.saving') : t('common.save')}
                    </button>
                </form>
            </div>

            {/* Cropper Modal */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div
                        className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
                        style={{ width: '40vw', height: '40vh', minWidth: '320px', minHeight: '320px' }}
                    >
                        {/* Cropper fills the container */}
                        <div className="absolute inset-0 z-0">
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

                        {/* Floating Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-3 z-50">
                            {/* Zoom Control */}
                            <div className="flex items-center gap-3 px-2">
                                <span className="text-xs font-medium text-white/80">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-accent-primary hover:bg-white/40 transition-colors"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={() => setIsCropping(false)}
                                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadCroppedImage}
                                    className="px-6 py-2 rounded-full bg-accent-primary hover:bg-accent-secondary text-white text-sm font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                                    disabled={loading}
                                >
                                    <Check size={16} />
                                    Save
                                </button>
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
