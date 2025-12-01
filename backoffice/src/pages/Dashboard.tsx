import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4b5563' }}>Total Questions</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4b5563' }}>Total Subjects</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
