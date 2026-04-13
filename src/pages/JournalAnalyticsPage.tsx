import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useAppStore } from '../store/useAppStore';
import { MOODS } from '../data/constants';

export default function JournalAnalyticsPage() {
  const { journalEntries } = useAppStore();

  const totalEntries = journalEntries.length;

  const moodCounts = journalEntries.reduce((acc, entry) => {
    if (entry.mood) {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1]);

  const mostCommonMood = sortedMoods.length > 0 ? sortedMoods[0] : null;

  function getMoodIcon(moodLabel: string) {
    return MOODS.find(m => m.label === moodLabel)?.icon || '🫀';
  }

  return (
    <>
      <TopBar
        title="Journal Analytics"
        icon="insights"
        right={
          <Link to="/journal" style={{
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
            Journal Insights
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.95rem' }}>
            Reflect on your journaling journey.
          </p>
        </header>

        {totalEntries === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-outline-variant)', marginBottom: '1rem' }}>edit_note</span>
            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>Not enough data</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Write more journal entries to see your insights.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-outline)', fontWeight: 600, marginBottom: '0.5rem' }}>Total Entries</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalEntries}</span>
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-outline)', fontWeight: 600, marginBottom: '0.5rem' }}>Most Frequent Mood</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                  {mostCommonMood ? `${getMoodIcon(mostCommonMood[0])} ${mostCommonMood[0]}` : 'N/A'}
                </span>
                {mostCommonMood && <span style={{ fontSize: '0.75rem', color: 'var(--color-outline-variant)' }}>{mostCommonMood[1]} times</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
