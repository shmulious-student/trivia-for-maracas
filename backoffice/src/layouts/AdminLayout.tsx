import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { LayoutDashboard, Settings, LogOut, Languages, Book } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: '#1f2937',
                color: 'white',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #374151' }}>
                    Trivia Admin
                </div>
                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: '#d1d5db', textDecoration: 'none', borderRadius: '4px' }}>
                                <LayoutDashboard size={20} /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/subjects" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: '#d1d5db', textDecoration: 'none', borderRadius: '4px' }}>
                                <Book size={20} /> Subjects
                            </Link>
                        </li>
                        <li>
                            <Link to="/translations" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: '#d1d5db', textDecoration: 'none', borderRadius: '4px' }}>
                                <Languages size={20} /> Translations
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: '#d1d5db', textDecoration: 'none', borderRadius: '4px' }}>
                                <Settings size={20} /> Settings
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div style={{ padding: '1rem', borderTop: '1px solid #374151' }}>
                    <button onClick={handleLogout} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
