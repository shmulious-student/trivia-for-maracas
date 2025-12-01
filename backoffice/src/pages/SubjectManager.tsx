import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { ISubject } from '@trivia/shared';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, ArrowRight, Download } from 'lucide-react';
import JsonImporter from '../components/JsonImporter';

const API_URL = 'http://localhost:3000/api/subjects';

const SubjectManager: React.FC = () => {
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [showImport, setShowImport] = useState(false);

    // Form State
    const [nameEn, setNameEn] = useState('');
    const [nameHe, setNameHe] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setSubjects(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch subjects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: { en: nameEn, he: nameHe }
        };

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${isEditing}`, payload);
            } else {
                await axios.post(API_URL, payload);
            }
            resetForm();
            fetchSubjects();
        } catch (err) {
            setError('Failed to save subject');
            console.error(err);
        }
    };

    const handleEdit = (subject: ISubject) => {
        setIsEditing(subject.id);
        setNameEn(subject.name.en);
        setNameHe(subject.name.he);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This will delete all questions in this subject.')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchSubjects();
        } catch (err) {
            setError('Failed to delete subject');
            console.error(err);
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setNameEn('');
        setNameHe('');
    };

    const handleExport = () => {
        window.open(`${API_URL}/export`, '_blank');
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Subject Manager</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleExport} className="btn btn-secondary">
                        <Download size={18} style={{ marginRight: '0.5rem' }} /> Export All
                    </button>
                    <button onClick={() => setShowImport(!showImport)} className="btn btn-secondary">
                        {showImport ? 'Hide Import' : 'Import JSON'}
                    </button>
                </div>
            </div>

            {showImport && <JsonImporter onImportSuccess={fetchSubjects} />}

            {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>{isEditing ? 'Edit Subject' : 'Add New Subject'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name (English)</label>
                        <input
                            type="text"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-primary)'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name (Hebrew)</label>
                        <input
                            type="text"
                            value={nameHe}
                            onChange={(e) => setNameHe(e.target.value)}
                            required
                            dir="rtl"
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-primary)'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Update' : <><Plus size={18} style={{ marginRight: '0.5rem' }} /> Add</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Name (EN)</th>
                                <th style={{ padding: '1rem' }}>Name (HE)</th>
                                <th style={{ padding: '1rem' }}>Questions</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject) => (
                                <tr key={subject.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{subject.name.en}</td>
                                    <td style={{ padding: '1rem' }}>{subject.name.he}</td>
                                    <td style={{ padding: '1rem' }}>{subject.questionCount || 0}</td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <Link
                                            to={`/subjects/${subject.id}/questions`}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                        >
                                            Manage Questions <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(subject)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem' }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject.id)}
                                            className="btn"
                                            style={{ padding: '0.5rem', color: 'var(--color-error)' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subjects.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No subjects found. Add one above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SubjectManager;
