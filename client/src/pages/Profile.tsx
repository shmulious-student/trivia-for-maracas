import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { User as UserIcon, ArrowLeft, Settings, Plus, Minus, Trash2, Sun, Moon, LogOut, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { AvatarUploader } from '../components/AvatarUploader';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Modal } from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { GenderSelector } from '../components/GenderSelector';
import { API_BASE } from '../config/api';

const Profile: React.FC = () => {
    const { user, updateUser, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.username || '');
    const [preferences, setPreferences] = useState<{
        questionsPerTournament: number;
        gameTimer: number;
        isTimerEnabled: boolean;
        gender: 'male' | 'female' | 'other';
    }>({
        questionsPerTournament: 20,
        gameTimer: 30,
        isTimerEnabled: false,
        gender: 'other',
        ...user?.preferences
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Sync state with user data when it changes
    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setPreferences(prev => ({ ...prev, ...user.preferences }));
        }
    }, [user]);

    // Auto-save functionality
    useEffect(() => {
        if (!user) return;

        // Skip initial load
        if (username === user.username &&
            JSON.stringify(preferences) === JSON.stringify(user.preferences)) {
            return;
        }

        const saveProfile = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.put(`${API_BASE}/users/profile`, {
                    username,
                    preferences
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data) {
                    updateUser(res.data);
                }
                // Optional: Show subtle saving indicator or success toast
            } catch (err: any) {
                console.error(err);
                setMessage({ type: 'error', text: err.response?.data?.message || t('profile.saveFailed') });
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(saveProfile, 1000); // Debounce 1s
        return () => clearTimeout(timeoutId);
    }, [username, preferences, user, updateUser, t]);

    const handleAvatarUpdate = async (newUrl: string) => {
        if (user) {
            try {
                // Note: AvatarUploader already uploads the file. 
                // If we need to update the user context with the new URL returned by AvatarUploader (which calls /avatar endpoint),
                // we might need to fetch the updated user or just update local state.
                // However, the /avatar endpoint updates the user in DB.
                // We just need to update the context.

                // Wait, AvatarUploader calls onUpload with the new URL.
                // We should update the user context.
                updateUser({ ...user, avatarUrl: newUrl });
                setMessage({ type: 'success', text: t('profile.avatarUpdated') });
                setTimeout(() => setMessage(null), 3000);
            } catch (err: any) {
                console.error('Failed to update avatar:', err);
                setMessage({ type: 'error', text: t('profile.avatarUpdateFailed') });
            }
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            logout();
            navigate('/login');
        } catch (err) {
            console.error('Failed to delete account:', err);
            setMessage({ type: 'error', text: t('profile.deleteAccountFailed') });
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl relative">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-purple-400">
                        {t('profile.title')}
                    </h1>
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary animate-pulse ml-4">
                            <Loader2 size={16} className="animate-spin" />
                            {t('common.saving')}
                        </div>
                    )}
                </div>

                <Card className="p-8 space-y-8 bg-bg-secondary/50 backdrop-blur-xl border-white/10">
                    {/* Avatar Section */}
                    <AvatarUploader
                        currentAvatarUrl={user.avatarUrl}
                        onUpload={handleAvatarUpdate}
                        isEditable={true}
                    />

                    {/* User Info Form */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary ml-1">
                                {t('Username')}
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input pl-10"
                                    placeholder={t('Enter your username')}
                                />
                            </div>
                            <div className="text-xs text-text-muted ml-1">
                                {t('profile.timezone')}: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary ml-1">
                                {t('profile.gender')}
                            </label>
                            <GenderSelector
                                value={preferences.gender}
                                onChange={(g) => setPreferences({ ...preferences, gender: g })}
                            />
                        </div>

                        {/* Preferences */}
                        <div className="pt-6 border-t border-white/10 space-y-6">
                            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                <Settings size={20} className="text-accent-primary" />
                                {t('profile.gameSettings')}
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary/50 border border-white/5">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-text-primary">
                                            {t('profile.questionsPerTournament')}
                                        </label>
                                        <p className="text-xs text-text-muted">
                                            {t('profile.questionsPerTournamentDesc')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-bg-primary rounded-lg p-1">
                                        <button
                                            type="button"
                                            onClick={() => setPreferences(prev => ({ ...prev, questionsPerTournament: Math.max(5, prev.questionsPerTournament - 5) }))}
                                            className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-mono font-bold">{preferences.questionsPerTournament}</span>
                                        <button
                                            type="button"
                                            onClick={() => setPreferences(prev => ({ ...prev, questionsPerTournament: Math.min(50, prev.questionsPerTournament + 5) }))}
                                            className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary/50 border border-white/5">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-text-primary">
                                            {t('profile.enableTimer')}
                                        </label>
                                        <p className="text-xs text-text-muted">
                                            {t('profile.enableTimerDesc')}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPreferences(prev => ({ ...prev, isTimerEnabled: !prev.isTimerEnabled }))}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            preferences.isTimerEnabled ? "bg-accent-primary" : "bg-bg-primary"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                            preferences.isTimerEnabled ? "left-7" : "left-1"
                                        )} />
                                    </button>
                                </div>

                                {preferences.isTimerEnabled && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary/50 border border-white/5 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium text-text-primary">
                                                {t('profile.timePerQuestion')}
                                            </label>
                                            <p className="text-xs text-text-muted">
                                                {t('profile.timePerQuestionDesc')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-bg-primary rounded-lg p-1">
                                            <button
                                                type="button"
                                                onClick={() => setPreferences(prev => ({ ...prev, gameTimer: Math.max(10, prev.gameTimer - 5) }))}
                                                className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-mono font-bold">{preferences.gameTimer}s</span>
                                            <button
                                                type="button"
                                                onClick={() => setPreferences(prev => ({ ...prev, gameTimer: Math.min(60, prev.gameTimer + 5) }))}
                                                className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Appearance & Language */}
                        <div className="pt-6 border-t border-white/10 space-y-6">
                            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                <Sun size={20} className="text-accent-secondary" />
                                {t('settings.appearance')} & {t('settings.language')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary/30 border border-white/5">
                                    <span className="text-text-secondary">{t('settings.darkMode')}</span>
                                    <button
                                        type="button"
                                        onClick={toggleTheme}
                                        className={cn(
                                            "relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-primary/50",
                                            theme === 'dark' ? "bg-accent-primary" : "bg-slate-300"
                                        )}
                                    >
                                        <motion.div
                                            layout
                                            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center"
                                            animate={{ x: theme === 'dark' ? 28 : 0 }}
                                        >
                                            {theme === 'dark' ? (
                                                <Moon size={12} className="text-accent-primary" />
                                            ) : (
                                                <Sun size={12} className="text-yellow-500" />
                                            )}
                                        </motion.div>
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setLanguage('he')}
                                        className={cn(
                                            "flex-1 p-2 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 font-medium",
                                            language === 'he'
                                                ? "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-glow"
                                                : "bg-bg-tertiary/30 border-white/5 text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary"
                                        )}
                                    >
                                        <span className="text-xl">🇮🇱</span>
                                        עברית
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLanguage('en')}
                                        className={cn(
                                            "flex-1 p-2 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 font-medium",
                                            language === 'en'
                                                ? "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-glow"
                                                : "bg-bg-tertiary/30 border-white/5 text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary"
                                        )}
                                    >
                                        <span className="text-xl">🇺🇸</span>
                                        English
                                    </button>
                                </div>
                            </div>
                        </div>

                        {message && message.text && (
                            <div className={cn(
                                "p-3 rounded-lg text-sm text-center animate-in fade-in slide-in-from-bottom-2",
                                message.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            )}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4 flex flex-col gap-4">
                            {/* Save button removed */}

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={logout}
                                    className="w-full text-text-secondary hover:text-text-primary"
                                >
                                    <LogOut size={18} className="me-2" />
                                    {t('auth.logout')}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                >
                                    <Trash2 size={18} className="mr-2" />
                                    {t('profile.deleteAccount')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('profile.deleteConfirmationTitle')}
            >
                <div className="space-y-6">
                    <p className="text-text-secondary">
                        {t('profile.deleteConfirmationMessage')}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            {t('profile.deleteCancelButton')}
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white border-none"
                            onClick={handleDeleteAccount}
                        >
                            {t('profile.deleteConfirmButton')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;
