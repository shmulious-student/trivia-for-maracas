import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { IUITranslation } from '@trivia/shared';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/ui-translations';

const TranslationManager: React.FC = () => {
    const [translations, setTranslations] = useState<IUITranslation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or ID

    // Form State
    const [formData, setFormData] = useState<Partial<IUITranslation>>({
        key: '',
        category: 'general',
        text: { en: '', he: '' }
    });

    useEffect(() => {
        fetchTranslations();
    }, []);

    const fetchTranslations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setTranslations(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch translations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing === 'new') {
                await axios.post(API_URL, formData);
            } else {
                await axios.put(`${API_URL}/${isEditing}`, formData);
            }
            setIsEditing(null);
            resetForm();
            fetchTranslations();
        } catch (err) {
            setError('Failed to save translation');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchTranslations();
        } catch (err) {
            setError('Failed to delete translation');
            console.error(err);
        }
    };

    const startEdit = (translation?: IUITranslation) => {
        if (translation) {
            setIsEditing(translation.id!); // Assuming id exists on object from DB
            setFormData(JSON.parse(JSON.stringify(translation)));
        } else {
            setIsEditing('new');
            resetForm();
        }
    };

    const resetForm = () => {
        setFormData({
            key: '',
            category: 'general',
            text: { en: '', he: '' }
        });
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>UI Translations</h1>
                <button onClick={() => startEdit()} className="btn btn-primary">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Key
                </button>
            </div>

            {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}

            {isEditing && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-accent-primary)' }}>
                    <h3>{isEditing === 'new' ? 'New Translation Key' : 'Edit Translation Key'}</h3>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label>Key (e.g., login.title)</label>
                                <input
                                    value={formData.key}
                                    onChange={e => setFormData({ ...formData, key: e.target.value })}
                                    required
                                    disabled={isEditing !== 'new'}
                                    style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div>
                                <label>Category</label>
                                <input
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label>English Text</label>
                                <textarea
                                    value={formData.text?.en}
                                    onChange={e => setFormData({ ...formData, text: { ...formData.text!, en: e.target.value } })}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div>
                                <label>Hebrew Text</label>
                                <textarea
                                    value={formData.text?.he}
                                    onChange={e => setFormData({ ...formData, text: { ...formData.text!, he: e.target.value } })}
                                    required
                                    dir="rtl"
                                    style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary">
                                <Save size={18} style={{ marginRight: '0.5rem' }} /> Save
                            </button>
                            <button type="button" onClick={() => setIsEditing(null)} className="btn btn-secondary">
                                <X size={18} style={{ marginRight: '0.5rem' }} /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Key</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>English</th>
                                <th style={{ padding: '1rem' }}>Hebrew</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {translations.map((t: any) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{t.key}</td>
                                    <td style={{ padding: '1rem' }}>{t.category}</td>
                                    <td style={{ padding: '1rem' }}>{t.text.en}</td>
                                    <td style={{ padding: '1rem' }} dir="rtl">{t.text.he}</td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => startEdit(t)} className="btn btn-secondary"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(t.id)} className="btn" style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TranslationManager;
