import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import type { IQuestion, ISubject } from '@trivia/shared';
import { Edit, Trash2, Plus, ArrowLeft, Save, X } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

const QuestionManager: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [subject, setSubject] = useState<ISubject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Edit/Create State
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or ID
    const [formData, setFormData] = useState<Partial<IQuestion>>({
        text: { en: '', he: '' },
        options: [
            { text: { en: '', he: '' } },
            { text: { en: '', he: '' } },
            { text: { en: '', he: '' } },
            { text: { en: '', he: '' } }
        ],
        correctAnswerIndex: 0,
        type: 'multiple-choice'
    });

    useEffect(() => {
        if (subjectId) {
            fetchData();
        }
    }, [subjectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subjRes, questRes] = await Promise.all([
                axios.get(`${API_BASE}/subjects`),
                axios.get(`${API_BASE}/questions?subjectId=${subjectId}`)
            ]);

            const foundSubject = subjRes.data.find((s: ISubject) => s.id === subjectId);
            setSubject(foundSubject || null);
            setQuestions(questRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                subjectId
            };

            if (isEditing === 'new') {
                await axios.post(`${API_BASE}/questions`, payload);
            } else {
                await axios.put(`${API_BASE}/questions/${isEditing}`, payload);
            }

            setIsEditing(null);
            resetForm();
            fetchData();
        } catch (err) {
            setError('Failed to save question');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_BASE}/questions/${id}`);
            fetchData();
        } catch (err) {
            setError('Failed to delete question');
            console.error(err);
        }
    };

    const startEdit = (question?: IQuestion) => {
        if (question) {
            setIsEditing(question.id);
            setFormData(JSON.parse(JSON.stringify(question))); // Deep copy
        } else {
            setIsEditing('new');
            resetForm();
        }
    };

    const resetForm = () => {
        setFormData({
            text: { en: '', he: '' },
            options: [
                { text: { en: '', he: '' } },
                { text: { en: '', he: '' } },
                { text: { en: '', he: '' } },
                { text: { en: '', he: '' } }
            ],
            correctAnswerIndex: 0,
            type: 'multiple-choice'
        });
    };

    const updateOption = (index: number, lang: 'en' | 'he', value: string) => {
        const newOptions = [...(formData.options || [])];
        if (!newOptions[index]) newOptions[index] = { text: { en: '', he: '' } };
        newOptions[index].text[lang] = value;
        setFormData({ ...formData, options: newOptions });
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!subject) return <div className="container">Subject not found</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <Link to="/subjects" className="btn btn-secondary">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 style={{ marginBottom: 0 }}>{subject.name.en}</h1>
                    <p style={{ margin: 0 }}>Manage Questions</p>
                </div>
                <button
                    onClick={() => startEdit()}
                    className="btn btn-primary"
                    style={{ marginLeft: 'auto' }}
                >
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Question
                </button>
            </div>

            {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}

            {isEditing && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-accent-primary)' }}>
                    <h3>{isEditing === 'new' ? 'New Question' : 'Edit Question'}</h3>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <label>Question Text (EN)</label>
                                </div>
                                <textarea
                                    value={formData.text?.en}
                                    onChange={e => setFormData({ ...formData, text: { ...formData.text!, en: e.target.value } })}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <label>Question Text (HE)</label>
                                </div>
                                <textarea
                                    value={formData.text?.he}
                                    onChange={e => setFormData({ ...formData, text: { ...formData.text!, he: e.target.value } })}
                                    required
                                    dir="rtl"
                                    style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                        </div>

                        <h4>Answers</h4>
                        {formData.options?.map((option, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={formData.correctAnswerIndex === idx}
                                    onChange={() => setFormData({ ...formData, correctAnswerIndex: idx })}
                                />
                                <div style={{ position: 'relative' }}>
                                    <input
                                        placeholder={`Option ${idx + 1} (EN)`}
                                        value={option.text.en}
                                        onChange={e => updateOption(idx, 'en', e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        placeholder={`Option ${idx + 1} (HE)`}
                                        value={option.text.he}
                                        onChange={e => updateOption(idx, 'he', e.target.value)}
                                        required
                                        dir="rtl"
                                        style={{ width: '100%', padding: '0.5rem', background: 'var(--color-bg-tertiary)', color: 'white', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                {questions.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>No questions yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {questions.map(q => (
                            <div key={q.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{q.text.en}</div>
                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9em' }} dir="rtl">{q.text.he}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(q)} className="btn btn-secondary"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(q.id)} className="btn" style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionManager;
