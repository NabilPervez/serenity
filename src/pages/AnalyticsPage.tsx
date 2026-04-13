import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getAllTimelineEntries, type TimelineEntry } from '../data/db';
import { MOODS } from '../data/constants';

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllTimelineEntries();
      setEntries(data);
      setLoading(false);
    }
    load();
  }, []);

  // --- Widget 1: Most Common Emotions ---
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5

  const maxMoodCount = sortedMoods.length > 0 ? sortedMoods[0][1] : 1;

  function getMoodIconAndColor(moodLabel: string) {
    const found = MOODS.find(m => m.label === moodLabel);
    return {
      icon: found?.icon || '🫀',
      color: found?.color === 'primary' ? 'var(--color-primary)' :
             found?.color === 'secondary' ? 'var(--color-secondary)' :
             found?.color === 'tertiary' ? 'var(--color-tertiary)' : 'var(--color-primary)'
    };
  }

  // --- Widget 2: Time of Day Analysis ---
  const timeOfDayCounts = {
    Morning: 0,   // 5am - 12pm
    Afternoon: 0, // 12pm - 5pm
    Evening: 0,   // 5pm - 9pm
    Night: 0      // 9pm - 5am
  };

  const timeOfDayMoods: Record<string, Record<string, number>> = {
    Morning: {},
    Afternoon: {},
    Evening: {},
    Night: {}
  };

  entries.forEach(entry => {
    const d = new Date(entry.timestamp);
    const hour = d.getHours();
    let period = 'Night';
    if (hour >= 5 && hour < 12) period = 'Morning';
    else if (hour >= 12 && hour < 17) period = 'Afternoon';
    else if (hour >= 17 && hour < 21) period = 'Evening';

    timeOfDayCounts[period as keyof typeof timeOfDayCounts]++;
    timeOfDayMoods[period][entry.mood] = (timeOfDayMoods[period][entry.mood] || 0) + 1;
  });

  const timeOfDayData = Object.entries(timeOfDayCounts).map(([period, count]) => {
    const moods = timeOfDayMoods[period];
    const topMood = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];
    return { period, count, topMood: topMood ? topMood[0] : null };
  });

  // --- Widget 3: Calendar Heatmap ---
  // Generate last 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendarDays = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyCounts = entries.reduce((acc, entry) => {
    const d = new Date(entry.timestamp);
    d.setHours(0,0,0,0);
    const dateStr = d.toISOString().split('T')[0];
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxDailyCount = Math.max(...Object.values(dailyCounts), 1);

  // --- Widget 4: Anxiety Insights ---
  const totalCheckins = entries.length;
  const avgAnxiety = totalCheckins > 0
    ? (entries.reduce((sum, e) => sum + e.anxietyLevel, 0) / totalCheckins).toFixed(1)
    : 0;

  return (
    <>
      <TopBar
        title="Analytics"
        icon="insights"
        right={
          <Link to="/timeline" style={{
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
            Your Insights
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.95rem' }}>
            Understand your mood patterns over time.
          </p>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-outline)' }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-outline-variant)', marginBottom: '1rem' }}>monitoring</span>
            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>Not enough data</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>Log more check-ins on the timeline to see your insights.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>

            {/* Widget 4: Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-outline)', fontWeight: 600, marginBottom: '0.5rem' }}>Total Check-ins</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalCheckins}</span>
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-outline)', fontWeight: 600, marginBottom: '0.5rem' }}>Avg Anxiety</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{avgAnxiety}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-outline-variant)' }}>out of 10</span>
              </div>
            </div>


            {/* Widget 5: Anxious Mood Insights */}
            {(() => {
              const anxiousEntries = entries.filter(e => e.mood === 'Anxious');
              if (anxiousEntries.length === 0) return null;

              const totalAnxious = anxiousEntries.length;
              const avgAnxiousLevel = (anxiousEntries.reduce((sum, e) => sum + e.anxietyLevel, 0) / totalAnxious).toFixed(1);

              const timeOfDayCounts = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
              anxiousEntries.forEach(entry => {
                const hour = new Date(entry.timestamp).getHours();
                if (hour >= 5 && hour < 12) timeOfDayCounts.Morning++;
                else if (hour >= 12 && hour < 17) timeOfDayCounts.Afternoon++;
                else if (hour >= 17 && hour < 21) timeOfDayCounts.Evening++;
                else timeOfDayCounts.Night++;
              });

              const mostCommonTime = Object.entries(timeOfDayCounts).sort((a, b) => b[1] - a[1])[0];

              return (
                <section className="card" style={{ background: 'var(--color-secondary-container)' }}>
                  <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-secondary-container)' }}>warning</span>
                    <h2 className="section-title" style={{ color: 'var(--color-on-secondary-container)' }}>Anxiety Deep Dive</h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', color: 'var(--color-on-secondary-container)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8, marginBottom: '0.5rem' }}>Total Logs</p>
                      <p style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700 }}>{totalAnxious}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8, marginBottom: '0.5rem' }}>Avg Level</p>
                      <p style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700 }}>{avgAnxiousLevel}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8, marginBottom: '0.5rem' }}>Most Frequent</p>
                      <p style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700 }}>{mostCommonTime[0]}</p>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Widget 1: Most Common Emotions */}
            <section className="card">
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined">bar_chart</span>
                <h2 className="section-title">Most Common Emotions</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedMoods.map(([mood, count]) => {
                  const { icon, color } = getMoodIconAndColor(mood);
                  const percentage = (count / maxMoodCount) * 100;
                  return (
                    <div key={mood}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-on-surface)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{icon}</span> {mood}
                        </span>
                        <span style={{ color: 'var(--color-outline)' }}>{count}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--color-surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: '4px', transition: 'width 1s ease-out' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Widget 2: Time of Day Analysis */}
            <section className="card">
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined">schedule</span>
                <h2 className="section-title">Time of Day</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                {timeOfDayData.map(({ period, count, topMood }) => {
                  const moodInfo = topMood ? getMoodIconAndColor(topMood) : null;
                  return (
                    <div key={period} style={{ background: 'var(--color-surface-container-lowest)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-outline)', marginBottom: '0.5rem' }}>{period}</p>
                      <p style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>{count}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', minHeight: '1.2rem' }}>
                        {topMood ? `${moodInfo?.icon} ${topMood}` : 'No logs'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Widget 3: Calendar Heatmap */}
            <section className="card">
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined">calendar_month</span>
                <h2 className="section-title">Activity (Last 30 Days)</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-outline)' }}>{d}</div>
                ))}

                {/* Pad start of calendar so the days align with the correct day of week */}
                {(() => {
                  if (calendarDays.length === 0) return null;
                  const firstDayDate = new Date(calendarDays[0]);
                  const firstDayOfWeek = firstDayDate.getDay();
                  const padding = Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`pad-${i}`} style={{ aspectRatio: '1/1' }} />
                  ));

                  const days = calendarDays.map(dateStr => {
                    const count = dailyCounts[dateStr] || 0;
                    const intensity = count === 0 ? 0 : 0.2 + (count / maxDailyCount) * 0.8;
                    const d = new Date(dateStr);
                    return (
                      <div
                        key={dateStr}
                        title={`${dateStr}: ${count} logs`}
                        style={{
                          aspectRatio: '1/1',
                          borderRadius: '4px',
                          background: count > 0 ? `rgba(82, 100, 66, ${intensity})` : 'var(--color-surface-container-high)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          color: count > 0 && intensity > 0.5 ? 'white' : 'var(--color-on-surface-variant)'
                        }}
                      >
                        {d.getDate()}
                      </div>
                    );
                  });

                  return [...padding, ...days];
                })()}
              </div>
            </section>

          </div>
        )}
      </div>
    </>
  );
}
