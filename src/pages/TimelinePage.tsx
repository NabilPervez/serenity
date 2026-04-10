import { useState, useEffect } from 'react';
import { addTimelineEntry, getTimelineEntries, type TimelineEntry } from '../data/db';
import { MOODS } from '../data/constants';
import { Toast, useToast } from '../components/Toast';

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getAnxietyColor(score: number): string {
  if (score <= 3) return 'var(--color-primary)';
  if (score <= 6) return 'var(--color-tertiary)';
  return 'var(--color-secondary)';
}

function getAnxietyLabel(score: number): string {
  if (score <= 2) return 'Peaceful';
  if (score <= 4) return 'Mild';
  if (score <= 6) return 'Moderate';
  if (score <= 8) return 'Elevated';
  return 'High';
}

function getMoodIcon(mood: string): string {
  const found = MOODS.find((m) => m.label === mood);
  return found?.icon || '🫀';
}

export default function TimelinePage() {
  const { toast, showToast } = useToast();

  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTimelineEntries().then(setEntries);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      showToast('Please select a mood tag first.');
      return;
    }
    setSubmitting(true);
    const now = Date.now();
    const entry: Omit<TimelineEntry, 'id'> = {
      timestamp: now,
      mood: selectedMood,
      moodIcon: getMoodIcon(selectedMood),
      anxietyLevel,
      notes: notes.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    await addTimelineEntry(entry);
    const updated = await getTimelineEntries();
    setEntries(updated);
    setSelectedMood('');
    setAnxietyLevel(5);
    setNotes('');
    setSubmitting(false);
    showToast('Check-in saved ✓');
  };

  return (
    <>
      <Toast message={toast.message} show={toast.show} />

      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-title">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>auto_stories</span>
          Your Journey
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)', fontWeight: 500 }}>
          {entries.length} check-in{entries.length !== 1 ? 's' : ''}
        </span>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}
          className="timeline-layout">

          {/* ── Check-In Form ── */}
          <section className="card animate-fade-up" style={{ alignSelf: 'start' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-on-surface)' }}>
              How are you feeling now?
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Mood Tags */}
              <div>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)', marginBottom: '0.75rem' }}>
                  Mood Tag
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {MOODS.map((mood) => (
                    <button
                      key={mood.label}
                      type="button"
                      className={`mood-chip${selectedMood === mood.label ? ' selected' : ' idle'}`}
                      onClick={() => setSelectedMood(mood.label)}
                    >
                      <span>{mood.icon}</span>
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anxiety Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)' }}>
                    Anxiety Level
                  </p>
                  <span style={{ fontWeight: 700, fontSize: '1.25rem', color: getAnxietyColor(anxietyLevel) }}>
                    {anxietyLevel}/10
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: '0.25rem', color: 'var(--color-outline)' }}>
                      {getAnxietyLabel(anxietyLevel)}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={anxietyLevel}
                  onChange={(e) => setAnxietyLevel(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 500 }}>
                  <span>Peaceful</span>
                  <span>High Tension</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)', marginBottom: '0.75rem' }}>
                  Daily Notes
                </p>
                <textarea
                  placeholder="What's on your mind? Capture the moment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                className="btn-primary"
                type="submit"
                disabled={submitting || !selectedMood}
                style={{ background: 'linear-gradient(to right, var(--color-secondary), var(--color-secondary-container))' }}
              >
                <span className="material-symbols-outlined">save</span>
                {submitting ? 'Saving...' : 'Save Check-in'}
              </button>
            </form>
          </section>

          {/* ── Timeline History ── */}
          <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {entries.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '3rem 1rem',
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-outline-variant)', display: 'block', marginBottom: '1rem' }}>timeline</span>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>No check-ins yet</p>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Log your first mood using the form above.</p>
              </div>
            ) : (
              <>
                {/* Streak Banner */}
                {entries.length >= 5 && (
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
                        <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.125rem' }}>Consistency is key</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>You've logged {entries.length} check-ins. Keep going!</p>
                      </div>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined filled" style={{ color: 'var(--color-primary)', fontSize: '1.75rem' }}>workspace_premium</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline List */}
                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                  <div className="timeline-line" />
                  {entries.map((entry, i) => {
                    const color = getAnxietyColor(entry.anxietyLevel);
                    return (
                      <div key={entry.id} className="timeline-entry" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="timeline-dot" style={{ background: color }} />
                        <div style={{
                          background: 'var(--color-surface-container-low)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.25rem',
                          transition: 'background 0.2s var(--ease-standard)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: `${color}18`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem',
                              }}>
                                {entry.moodIcon}
                              </div>
                              <div>
                                <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-on-surface)' }}>{entry.mood}</h3>
                                <p style={{ fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {formatDate(entry.timestamp)}, {formatTime(entry.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div style={{
                              padding: '0.25rem 0.875rem',
                              borderRadius: '999px',
                              background: `${color}15`,
                              border: `1px solid ${color}30`,
                            }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>
                                {entry.anxietyLevel}/10
                              </span>
                            </div>
                          </div>
                          {entry.notes && (
                            <p style={{
                              color: 'var(--color-on-surface-variant)',
                              lineHeight: 1.6,
                              fontSize: '0.875rem',
                              fontStyle: 'italic',
                            }}>
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .timeline-layout {
            grid-template-columns: 380px 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
