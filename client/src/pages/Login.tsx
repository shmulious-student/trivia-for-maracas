import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User as UserIcon, Sparkles, ArrowRight, Search, Plus } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { AvatarUploader } from '../components/AvatarUploader';
import axios from 'axios';
import { GenderSelector } from '../components/GenderSelector';
import { API_BASE, getAssetUrl } from '../config/api';
import GameSprite from '../components/ui/GameSprite';

interface UserResult {
    _id: string;
    username: string;
    avatarUrl?: string;
    preferences?: {
        gender?: string;
    };
}

const Login: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    // New User Form State
    const [newUsername, setNewUsername] = useState('');
    const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('other');
    const [newAvatarBlob, setNewAvatarBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, updateUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Debounced Search
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE}/users/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error('Search failed', err);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleUserSelect = (user: UserResult) => {
        setSelectedUser(user);
        setSearchQuery('');
        setSearchResults([]);
        setIsCreatingNew(false);
    };

    const handleCreateNew = () => {
        setNewUsername(searchQuery);
        setIsCreatingNew(true);
        setSelectedUser(null);
        setSearchResults([]);
    };

    const handleLogin = async () => {
        if (!selectedUser) return;
        try {
            setLoading(true);
            await login(selectedUser.username); // Login with existing username
            navigate('/');
        } catch (err) {
            setError(t('Login failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim()) {
            setError(t('Username is required'));
            return;
        }

        try {
            setLoading(true);

            // 1. Register/Login with preferences
            await login(newUsername, undefined, {
                gender: newGender,
                questionsPerTournament: 20,
                isTimerEnabled: false,
                gameTimer: 30
            });

            // 2. Upload Avatar if exists
            const token = localStorage.getItem('token');
            if (token && newAvatarBlob) {
                const formData = new FormData();
                formData.append('avatar', newAvatarBlob, 'avatar.jpg');
                const uploadRes = await axios.post(`${API_BASE}/users/avatar`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Update user with new avatar URL
                if (uploadRes.data.user) {
                    updateUser(uploadRes.data.user);
                }
            }

            // 3. Profile update removed as it's now handled in step 1

            navigate('/');
        } catch (err) {
            console.error(err);
            setError(t('Registration failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 relative">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8 space-y-2">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex p-3 rounded-full bg-accent-primary/10 mb-2"
                    >
                        <Sparkles size={32} className="text-accent-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-purple-400">
                        {t('Join Game')}
                    </h1>
                    <p className="text-text-secondary">
                        {t('Enter your details to start playing')}
                    </p>
                </div>

                <Card className="p-8 shadow-2xl border-white/10 bg-bg-secondary/60 backdrop-blur-xl overflow-visible">
                    {!isCreatingNew && !selectedUser ? (
                        <div className="space-y-6">
                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium text-text-secondary ml-1">
                                    {t('login.selectUser')}
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('login.searchPlaceholder')}
                                        className="input pl-10"
                                        autoFocus
                                    />
                                </div>

                                {/* Autocomplete Results */}
                                <AnimatePresence>
                                    {(searchResults.length > 0 || searchQuery) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute w-full mt-2 bg-bg-tertiary border border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                                        >
                                            {searchResults.map(user => (
                                                <div
                                                    key={user._id}
                                                    onClick={() => handleUserSelect(user)}
                                                    className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                                >
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-primary flex-shrink-0">
                                                        {user.avatarUrl ? (
                                                            <img src={getAssetUrl(user.avatarUrl)} alt={user.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-full h-full p-1.5 text-text-muted" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{user.username}</span>
                                                </div>
                                            ))}

                                            {/* Create New User Option */}
                                            {searchQuery && (
                                                <div
                                                    key="create-new-user"
                                                    onClick={handleCreateNew}
                                                    className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors text-accent-primary"
                                                >
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Plus size={16} />
                                                    </div>
                                                    <span className="font-medium">
                                                        {t('login.createUser')} "{searchQuery}"
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Animated Sprite */}
                            <div className="w-full h-64 flex items-center justify-center mt-4">
                                <GameSprite
                                    variant="login"
                                    className="h-full w-auto object-contain"
                                />
                            </div>
                        </div>
                    ) : selectedUser ? (
                        <div className="space-y-6 text-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-tertiary mx-auto border-4 border-accent-primary shadow-glow">
                                {selectedUser.avatarUrl ? (
                                    <img src={getAssetUrl(selectedUser.avatarUrl)} alt={selectedUser.username} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-full h-full p-4 text-text-muted" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                                <p className="text-sm text-text-secondary">{t('Welcome back!')}</p>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setSelectedUser(null)} className="flex-1">
                                    {t('common.cancel')}
                                </Button>
                                <Button onClick={handleLogin} className="flex-1 shadow-glow" isLoading={loading}>
                                    {t('login.proceed', { name: selectedUser.username })}
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold">{t('login.createUser')}</h3>
                            </div>

                            {/* Avatar Upload */}
                            <div className="flex justify-center">
                                <AvatarUploader
                                    currentAvatarUrl={previewUrl || undefined}
                                    onCrop={(blob) => {
                                        setNewAvatarBlob(blob);
                                        setPreviewUrl(URL.createObjectURL(blob));
                                    }}
                                    isEditable={true}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary ml-1">
                                    {t('Username')}
                                </label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="input"
                                    placeholder={t('Enter your username')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary ml-1">
                                    {t('login.gender')}
                                </label>
                                <GenderSelector
                                    value={newGender}
                                    onChange={(g) => setNewGender(g)}
                                />
                            </div>

                            {error && (
                                <div className="text-error text-sm text-center">{error}</div>
                            )}

                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setIsCreatingNew(false)} className="flex-1">
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" className="flex-1 shadow-glow" isLoading={loading}>
                                    {t('Start Playing')}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </motion.div>
        </div >
    );
};

export default Login;
