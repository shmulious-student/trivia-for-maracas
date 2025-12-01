import { useTheme } from './contexts/ThemeContext';

function App() {
  const { language, toggleLanguage } = useTheme();

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Backoffice</h1>
        <button onClick={toggleLanguage} className="btn btn-secondary">
          {language === 'he' ? 'English' : 'עברית'}
        </button>
      </header>

      <main className="card">
        <h2>{language === 'he' ? 'ניהול מערכת' : 'System Management'}</h2>
        <p>
          {language === 'he'
            ? 'כאן תוכל לנהל את השאלות, הנושאים והגדרות המשחק.'
            : 'Here you can manage questions, subjects, and game settings.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn btn-primary">
            {language === 'he' ? 'הוסף שאלה' : 'Add Question'}
          </button>
          <button className="btn btn-secondary">
            {language === 'he' ? 'הגדרות' : 'Settings'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
