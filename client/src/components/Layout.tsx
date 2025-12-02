import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, User as UserIcon, Trophy, Home } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SoundToggle } from './SoundToggle';
import { useGameStore } from '../stores/useGameStore';

const Layout: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const resetGame = useGameStore((state) => state.resetGame);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="relative flex items-center justify-between px-4 py-2 h-32 shrink-0 z-50 bg-fuchsia-100 dark:bg-slate-950">
                {/* Left Buttons */}
                <div className="flex items-center gap-4 z-10">
                    <Link to="/" title="Home" onClick={resetGame} className="text-inherit hover:text-accent-primary transition-colors">
                        <Home size={20} />
                    </Link>
                    <Link to="/profile" title="Profile" className="text-inherit hover:text-accent-primary transition-colors">
                        <UserIcon size={20} />
                    </Link>
                    <Link to="/leaderboard" title="Leaderboard" className="text-inherit hover:text-accent-primary transition-colors">
                        <Trophy size={20} />
                    </Link>
                </div>

                {/* Center Logo */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 mt-[21px] ml-[10px]">
                    <Link to="/" onClick={resetGame} className="block relative group">
                        <div className="w-40 h-40 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <img
                                src="/app_logo.png"
                                alt="Trivia Maracas"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </Link>
                </div>

                {/* Right Buttons */}
                <div className="flex items-center gap-4 z-10">
                    <button onClick={toggleTheme} title="Toggle Theme" className="bg-transparent border-none cursor-pointer text-inherit hover:text-accent-primary transition-colors">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <SoundToggle />
                    <LanguageSwitcher showLabel={false} />
                </div>
            </header>
            <main style={{ flex: 1, padding: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
