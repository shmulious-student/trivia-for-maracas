import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Check, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/subjects/import';

interface JsonImporterProps {
    onImportSuccess: () => void;
}

const JsonImporter: React.FC<JsonImporterProps> = ({ onImportSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            setMessage({ type: 'error', text: 'Please upload a JSON file' });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                await uploadData(json);
            } catch (err) {
                setMessage({ type: 'error', text: 'Invalid JSON file' });
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    const uploadData = async (data: any) => {
        setUploading(true);
        setMessage(null);
        try {
            const res = await axios.post(API_URL, data);
            setMessage({
                type: 'success',
                text: `Imported ${res.data.result.subjects} subjects and ${res.data.result.questions} questions.`
            });
            onImportSuccess();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setMessage({ type: 'error', text: 'Import failed. Check console.' });
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card" style={{ marginBottom: '2rem', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Import Data</h3>
            <p style={{ marginBottom: '1rem', textAlign: 'center' }}>Upload a JSON file to import Subjects and Questions.</p>

            <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                disabled={uploading}
            >
                {uploading ? 'Uploading...' : <><Upload size={18} style={{ marginRight: '0.5rem' }} /> Select JSON File</>}
            </button>

            {message && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {message.type === 'success' ? <Check size={16} style={{ marginRight: '0.5rem' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />}
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default JsonImporter;
