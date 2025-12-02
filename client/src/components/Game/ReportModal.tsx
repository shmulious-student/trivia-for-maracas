import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { Check, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface Question {
    id: string;
    text: { en: string; he: string };
    options: Array<{ text: { en: string; he: string } }>;
    correctAnswerIndex: number;
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: Question[];
}

interface ReportItem {
    questionId: string;
    reportType: string[];
    suggestedCorrection: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, questions }) => {
    const { t, language } = useLanguage();
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [reports, setReports] = useState<Record<string, ReportItem>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const toggleQuestion = (questionId: string) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );

        if (!reports[questionId]) {
            setReports(prev => ({
                ...prev,
                [questionId]: {
                    questionId,
                    reportType: [],
                    suggestedCorrection: ''
                }
            }));
        }
    };

    const updateReport = (questionId: string, field: keyof ReportItem, value: any) => {
        setReports(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [field]: value
            }
        }));
    };

    const toggleReportType = (questionId: string, type: string) => {
        const currentTypes = reports[questionId]?.reportType || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter(t => t !== type)
            : [...currentTypes, type];
        updateReport(questionId, 'reportType', newTypes);
    };

    const handleSubmit = async () => {
        if (selectedQuestions.length === 0) return;

        setSubmitting(true);
        setError('');

        try {
            const reportsToSubmit = selectedQuestions.map(qId => reports[qId]);
            const token = localStorage.getItem('token');

            await axios.post(
                'http://localhost:3000/api/reports',
                { reports: reportsToSubmit },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedQuestions([]);
                setReports({});
            }, 2000);
        } catch (err) {
            console.error('Failed to submit report:', err);
            setError(t('report.error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('report.title')}>
            {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <Check size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">{t('report.successTitle')}</h3>
                    <p className="text-text-secondary">{t('report.successMessage')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="text-text-secondary">{t('report.description')}</p>

                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div
                                key={q.id || idx}
                                className={`p-4 rounded-xl border transition-all ${selectedQuestions.includes(q.id)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border bg-surface hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedQuestions.includes(q.id)}
                                        onChange={() => toggleQuestion(q.id)}
                                        className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-text-primary mb-2">
                                            {q.text[language]}
                                        </p>

                                        {selectedQuestions.includes(q.id) && (
                                            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['text', 'answers', 'correctAnswer', 'other'].map(type => (
                                                        <label
                                                            key={type}
                                                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${reports[q.id]?.reportType.includes(type)
                                                                    ? 'bg-primary/10 border-primary text-primary'
                                                                    : 'border-border hover:bg-white/5'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={reports[q.id]?.reportType.includes(type)}
                                                                onChange={() => toggleReportType(q.id, type)}
                                                            />
                                                            <span className="text-sm font-medium">{t(`report.types.${type}`)}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <textarea
                                                    placeholder={t('report.correctionPlaceholder')}
                                                    value={reports[q.id]?.suggestedCorrection}
                                                    onChange={(e) => updateReport(q.id, 'suggestedCorrection', e.target.value)}
                                                    className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[80px] text-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-border">
                        <button
                            onClick={handleSubmit}
                            disabled={selectedQuestions.length === 0 || submitting}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <AlertTriangle size={18} />
                            )}
                            {t('report.submit')}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
