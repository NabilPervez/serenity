import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getTimelineEntries, type TimelineEntry } from '../data/db';

export default function BreatheAnalyticsPage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getTimelineEntries();
      const breatheEntries = data.filter((entry) => entry.notes === 'Completed a box breathing session');
      setEntries(breatheEntries);
      setLoading(false);
    }
    load();
  }, []);

  const totalSessions = entries.length;

  return (
    <>
      <TopBar
        title="Box Breathing Analytics"
        icon="insights"
        right={
          <Link to="/breathe" style={{
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '0.5rem 1rem',
            background: 'var(--color-surface-container-high)',
            borderRadius: 'var(--radius-full)'
          }}>
            Back
          </Link>
        }
      />
      <div className="page-content animate-fade-up">
        <header className="page-header" style={{ padding: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-on-background)', marginBottom: '0.5rem' }}>
            Box Breathing Insights
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.95rem' }}>
            Understand your breathing patterns over time.
          </p>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-outline)' }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-outline-variant)', marginBottom: '1rem' }}>monitoring</span>
            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>Not enough data</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Complete more box breathing sessions to see your insights.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Widget: Total Sessions */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-outline)', fontWeight: 600, marginBottom: '0.5rem' }}>Total Sessions</span>
              <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalSessions}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
