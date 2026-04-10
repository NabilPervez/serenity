import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { useAppStore } from '../store/useAppStore';
import journalPrompts from '../data/journalPrompts.json';

/** Returns today's date as YYYY-MM-DD in the user's LOCAL timezone. */
function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Formats a YYYY-MM-DD date string into a human-friendly label. */
function formatJournalDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function JournalPage() {
  const { saveJournalEntry, journalEntries } = useAppStore();

  const [currentDate, setCurrentDate] = useState(getLocalDateString);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Poll for midnight rollover (every 60s).
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

  const today = currentDate;
  const todayEntry = journalEntries.find((e) => e.date === today);
  const showCompleted = !!todayEntry || saved;

  // All entries newest-first for the timeline
  const sortedEntries = [...journalEntries].reverse();

  const handleTextChange = (promptId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [promptId]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveJournalEntry({ responses });
    setSaved(true);
  };

  return (
    <>
      <TopBar
        title="Journal"
        icon="edit_note"
        right={
          journalEntries.length > 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 500 }}>
              {journalEntries.length} entr{journalEntries.length === 1 ? 'y' : 'ies'}
            </span>
          ) : undefined
        }
      />

      <div className="page-content">

        {/* ── Today Section: form or completion card ── */}
        {showCompleted ? (
          <section className="card animate-fade-up" style={{
            background: 'var(--color-on-background)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '0.5rem',
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
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                Great work. Come back tomorrow for a fresh entry.
              </p>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSave} className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '0.5rem' }}>

            {/* Date header card */}
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
                  Reflect &amp; Release
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                  Take a few minutes to ground yourself with these prompts.
                </p>
              </div>
            </section>

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
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>You've journaled {sortedEntries.length} times. Keep it up!</p>
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
                const responseCount = Object.values(entry.responses).filter((r) => r.trim()).length;
                return (
                  <div key={entry.id} className="timeline-entry" style={{ animationDelay: `${i * 0.05}s` }}>
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
                              {formatJournalDate(entry.date)}
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
