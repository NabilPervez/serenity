import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useAppStore } from '../store/useAppStore';
import journalPrompts from '../data/journalPrompts.json';
import { MOODS } from '../data/constants';
import { Link } from 'react-router-dom';

/** Formats date + optional time into a human-friendly label. */
function formatEntryDateTime(entry: { date: string; timestamp?: number }): { date: string; time: string } {
  const ts = entry.timestamp;
  if (ts) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let dateLabel: string;
    if (d.toDateString() === today.toDateString()) dateLabel = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) dateLabel = 'Yesterday';
    else dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const timeLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { date: dateLabel, time: timeLabel };
  }

  // Fallback for legacy entries without timestamp
  const [year, month, day] = entry.date.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return { date: 'Today', time: '' };
  if (d.toDateString() === yesterday.toDateString()) return { date: 'Yesterday', time: '' };
  return { date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), time: '' };
}

export default function JournalPage() {
  const { saveJournalEntry, journalEntries } = useAppStore();

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [justSaved, setJustSaved] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // All entries newest-first
  const sortedEntries = [...journalEntries].sort((a, b) => {
    const ta = a.timestamp ?? 0;
    const tb = b.timestamp ?? 0;
    return tb - ta;
  });

  const hasAnyResponse = Object.values(responses).some((v) => v.trim().length > 0);

  const handleTextChange = (promptId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [promptId]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveJournalEntry({ responses, mood: selectedMood });
    // Clear form and show brief success indicator
    setResponses({});
    setSelectedMood('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  return (
    <>
      <TopBar
        title="Journal"
        icon="edit_note"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {journalEntries.length > 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 500 }}>
                {journalEntries.length} entr{journalEntries.length === 1 ? 'y' : 'ies'}
              </span>
            ) : null}
            <Link
              to="/journal-analytics"
              aria-label="Analytics"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-primary)', textDecoration: 'none',
                background: 'var(--color-surface-container-high)',
                borderRadius: '50%', width: '32px', height: '32px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-container)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface-container-high)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>insights</span>
            </Link>
          </div>
        }
      />

      <div className="page-content">

        {/* ── Entry Form (always visible) ── */}
        <form onSubmit={handleSave} className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '0.5rem' }}>

          {/* Header card */}
          <section className="card" style={{
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
                {justSaved ? 'Entry saved ✓' : 'Reflect & Release'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                {justSaved
                  ? 'Your thoughts have been recorded. Add another entry any time.'
                  : 'Take a few minutes to ground yourself with these prompts.'}
              </p>
            </div>
          </section>

          {/* Only show prompts when not in "just saved" flash state */}
          {!justSaved && (
            <>
              <div className="section-header">
                <span className="material-symbols-outlined">edit_note</span>
                <h3 className="section-title">New Entry</h3>
              </div>


              <div style={{
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                boxShadow: 'var(--shadow-card)',
              }}>
                <label style={{ display: 'block' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                    How are you feeling?
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                    Select a mood that best describes your current state.
                  </p>
                </label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-outline-variant)',
                    background: 'var(--color-surface)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    color: 'var(--color-on-surface)'
                  }}
                >
                  <option value="">Select a mood</option>
                  {MOODS.map(m => (
                    <option key={m.label} value={m.label}>{m.icon} {m.label}</option>
                  ))}
                </select>
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

              <button
                type="submit"
                className="btn-primary"
                disabled={!hasAnyResponse}
                style={{ marginTop: '0.5rem' }}
              >
                <span className="material-symbols-outlined">check_circle</span>
                Save Entry
              </button>
            </>
          )}

          {/* After save: show a "Write another" button to immediately open a fresh form */}
          {justSaved && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setJustSaved(false)}
            >
              <span className="material-symbols-outlined">add</span>
              Write Another Entry
            </button>
          )}
        </form>

        {/* ── Journal History Timeline ── */}
        {sortedEntries.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: '0.1s', paddingBottom: '2rem' }}>
            <div className="section-header" style={{ marginTop: '1.5rem' }}>
              <span className="material-symbols-outlined">history_edu</span>
              <h3 className="section-title">Journal History</h3>
            </div>

            {sortedEntries.length >= 3 && (
              <div style={{
                background: 'linear-gradient(to right, var(--color-primary-container), var(--color-tertiary-container))',
                borderRadius: 'var(--radius-md)',
                padding: '0.25rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{
                  background: 'var(--color-surface-container-lowest)',
                  borderRadius: '1.85rem',
                  padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.125rem' }}>Building your practice</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>
                      {sortedEntries.length} entries and counting. Keep it up!
                    </p>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined filled" style={{ color: 'var(--color-primary)', fontSize: '1.75rem' }}>workspace_premium</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
              <div className="timeline-line" />

              {sortedEntries.map((entry, i) => {
                const isExpanded = expandedEntry === entry.id;
                const { date: dateLabel, time: timeLabel } = formatEntryDateTime(entry);
                const responseCount = Object.values(entry.responses).filter((r) => r.trim()).length;

                return (
                  <div key={entry.id} className="timeline-entry" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="timeline-dot" style={{ background: 'var(--color-primary)' }} />
                    <div style={{
                      background: 'var(--color-surface-container-low)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      transition: 'background 0.2s var(--ease-standard)',
                    }}>
                      {/* Header row — tap to expand */}
                      <div
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '1rem 1.25rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'rgba(82,100,66,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>edit_note</span>
                          </div>
                          <div>
                            <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-on-surface)' }}>
                              {dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}
                            </h3>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {responseCount} of {journalPrompts.length} prompts answered
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined" style={{
                          color: 'var(--color-outline)',
                          fontSize: '1.2rem',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s var(--ease-standard)',
                        }}>
                          expand_more
                        </span>
                      </div>


                        {entry.mood && (
                          <div style={{
                            padding: '1rem 1.25rem 0',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                          }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              Mood:
                            </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                              {MOODS.find(m => m.label === entry.mood)?.icon} {entry.mood}
                            </span>
                          </div>
                        )}

                      {/* Expanded responses */}
                      {isExpanded && (
                        <div style={{
                          borderTop: '1px solid rgba(197,200,188,0.3)',
                          padding: '1rem 1.25rem',
                          display: 'flex', flexDirection: 'column', gap: '1rem',
                        }}>
                          {journalPrompts.map((prompt) => {
                            const response = entry.responses[prompt.id];
                            if (!response?.trim()) return null;
                            return (
                              <div key={prompt.id}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                                  {prompt.title}
                                </p>
                                <p style={{
                                  fontSize: '0.875rem',
                                  color: 'var(--color-on-surface-variant)',
                                  lineHeight: 1.6,
                                  fontStyle: 'italic',
                                }}>
                                  "{response}"
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </>
  );
}
