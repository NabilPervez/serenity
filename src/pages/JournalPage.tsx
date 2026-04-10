import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { useAppStore } from '../store/useAppStore';
import journalPrompts from '../data/journalPrompts.json';

/** Returns today's date as YYYY-MM-DD using the user's LOCAL timezone (not UTC). */
function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function JournalPage() {
  const { saveJournalEntry, journalEntries } = useAppStore();

  // Track the current local date so we can reset when the day changes mid-session.
  const [currentDate, setCurrentDate] = useState(getLocalDateString);

  // Local draft responses – cleared automatically when the date changes.
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Poll for midnight rollover (every 60 s is plenty).
  useEffect(() => {
    const id = setInterval(() => {
      const today = getLocalDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
        setResponses({});
        setSaved(false);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [currentDate]);

  // Whether the user has already submitted an entry for today.
  const today = currentDate;
  const todayEntry = journalEntries.find((e) => e.date === today);

  const handleTextChange = (promptId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [promptId]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveJournalEntry({ responses });
    setSaved(true);
  };

  const showCompleted = !!todayEntry || saved;

  return (
    <>
      <TopBar title="Journal" icon="edit_note" />

      <div className="page-content">

        {showCompleted ? (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>

            {/* Completion banner */}
            <section className="card animate-fade-up" style={{
              background: 'var(--color-on-background)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-32px', right: '-32px', width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: '2rem', color: 'var(--color-primary-container)' }}>task_alt</span>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.2rem' }}>
                      Today's Journal
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>
                      Entry Complete ✓
                    </h2>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                  Great work. Come back tomorrow for a fresh entry.
                </p>
              </div>
            </section>

            {/* Review responses */}
            <div className="section-header">
              <span className="material-symbols-outlined">history_edu</span>
              <h3 className="section-title">Your Responses</h3>
            </div>

            {journalPrompts.map((prompt) => {
              const response = todayEntry?.responses[prompt.id] || responses[prompt.id];
              return (
                <div key={prompt.id} style={{
                  background: 'var(--color-surface-container-lowest)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                    {prompt.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {prompt.prompt}
                  </p>
                  <div style={{
                    background: 'var(--color-surface-container)',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {response || <span style={{ color: 'var(--color-outline)', fontStyle: 'italic' }}>No response provided.</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSave} className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>

            {/* Intro card */}
            <section className="card animate-fade-up" style={{
              background: 'var(--color-on-background)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-32px', right: '-32px', width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.35rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
                  Reflect &amp; Release
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                  Take a few minutes to ground yourself with these prompts.
                </p>
              </div>
            </section>

            {/* Prompt fields */}
            <div className="section-header">
              <span className="material-symbols-outlined">edit_note</span>
              <h3 className="section-title">Today's Prompts</h3>
            </div>

            {journalPrompts.map((prompt) => (
              <div key={prompt.id} style={{
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                boxShadow: 'var(--shadow-card)',
              }}>
                <label htmlFor={prompt.id} style={{ display: 'block' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                    {prompt.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                    {prompt.prompt}
                  </p>
                </label>
                <textarea
                  id={prompt.id}
                  value={responses[prompt.id] || ''}
                  onChange={(e) => handleTextChange(prompt.id, e.target.value)}
                  placeholder="Write your thoughts…"
                />
              </div>
            ))}

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              <span className="material-symbols-outlined">check_circle</span>
              Save Journal Entry
            </button>
          </form>
        )}

      </div>
    </>
  );
}
