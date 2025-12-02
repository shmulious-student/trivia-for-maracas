import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Save, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const Profile: React.FC = () => {
    const { user } = useAuth(); // login updates the user state
    const { t } = useLanguage();
    const [username, setUsername] = useState(user?.username || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE}/users/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update local user state with new avatar
            // We re-use login to update the user object in context, 
            // assuming the backend returns the updated user.
            // Ideally AuthContext should have an updateProfile method, but this works if we just update the user object.
            // For now, let's assume we need to manually update or re-fetch.
            // Since useAuth doesn't expose a simple update, we might need to reload or hack it slightly if we don't want to refactor AuthContext.
            // Let's try to just show success and maybe the user needs to refresh or we can try to update if possible.
            // Actually, the login function usually takes a token and user.
            // Let's just show a success message.
            setMessage({ type: 'success', text: t('profile.avatarUpdated') });

            // Force reload to see changes if context doesn't support update
            window.location.reload();

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
            await axios.put(`${API_BASE}/users/profile`, { username }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: t('profile.saved') });
            // Ideally update context here too
            window.location.reload();
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
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent-primary bg-bg-tertiary flex items-center justify-center">
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
        </div>
    );
};

export default Profile;
