import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import journalPrompts from '../data/journalPrompts.json';

export default function JournalPage() {
  const navigate = useNavigate();
  const { saveJournalEntry, journalEntries } = useAppStore();
  
  // State to hold the responses for each prompt id
  const [responses, setResponses] = useState<Record<string, string>>({});
  
  const today = new Date().toISOString().split('T')[0];
  const hasEntryToday = journalEntries.some(entry => entry.date === today);

  const handleTextChange = (promptId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [promptId]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveJournalEntry({
      responses
    });
    // Maybe take user back home or just show a success state
    navigate('/');
  };

  return (
    <div className="page-container page-enter">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-subtitle">Reflect and release</p>
        </div>
        <Link to="/settings" className="header-icon-button" aria-label="Settings">
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </header>

      {hasEntryToday ? (
        <div className="card glass-card fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>task_alt</span>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Journal Complete</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>You've already completed your journal entry for today. Great job checking in.</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
          {journalPrompts.map((prompt) => (
            <div key={prompt.id} className="card glass-card">
              <label htmlFor={prompt.id} style={{ display: 'block', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {prompt.title}
              </label>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {prompt.prompt}
              </p>
              <textarea
                id={prompt.id}
                value={responses[prompt.id] || ''}
                onChange={(e) => handleTextChange(prompt.id, e.target.value)}
                placeholder="Write your thoughts..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          ))}
          
          <button type="submit" className="button button-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Save Journal Entry
          </button>
        </form>
      )}
    </div>
  );
}
