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
  const todayEntry = journalEntries.find(entry => entry.date === today);

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
    // Stay on this page to show the completed entry instead of navigating away.
  };

  return (
    <div className="page-container page-enter">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-subtitle">Reflect and release</p>
        </div>
        <Link to="/settings" className="header-icon-button" aria-label="Settings">
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </header>

      {todayEntry ? (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
          <div className="card glass-card fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>task_alt</span>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Journal Complete</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>You've completed your journal entry for today. Come back tomorrow!</p>
          </div>
          
          <h3 style={{ marginTop: '1rem', fontFamily: 'var(--font-headline)', color: 'var(--color-primary)' }}>Your Responses</h3>
          {journalPrompts.map((prompt) => (
            <div key={prompt.id} className="card glass-card">
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {prompt.title}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {prompt.prompt}
              </p>
              <div style={{
                background: 'var(--color-surface-container-low)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'pre-wrap'
              }}>
                {todayEntry.responses[prompt.id] || <span style={{ color: 'var(--color-outline)' }}>No response provided.</span>}
              </div>
            </div>
          ))}
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
              />
            </div>
          ))}
          
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Save Journal Entry
          </button>
        </form>
      )}
    </div>
  );
}
