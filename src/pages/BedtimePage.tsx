import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface BedtimeItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  duration?: string;
}

const WIND_DOWN_STEPS: BedtimeItem[] = [
  { id: 'electronics', icon: 'devices_off', title: 'Digital Detox', subtitle: 'Put all screens away. Blue light blocks melatonin production.', duration: '1 hr before bed' },
  { id: 'lights', icon: 'light_mode', title: 'Dim the Lights', subtitle: "Switch to warm, low lighting to signal your brain it's time to rest.", duration: '45 min before' },
  { id: 'tea', icon: 'local_cafe', title: 'Warm Herbal Tea', subtitle: 'Chamomile or lavender tea to calm the nervous system.', duration: '30 min before' },
  { id: 'bath', icon: 'shower', title: 'Warm Bath or Shower', subtitle: 'A warm shower drops your core body temperature — the signal for sleep onset.', duration: '30 min before' },
  { id: 'gratitude', icon: 'edit_note', title: 'Gratitude Journal', subtitle: 'Write three things you are grateful for from today.', duration: '15 min before' },
  { id: 'breathe', icon: 'air', title: 'Box Breathing', subtitle: 'Complete one round of box breathing to calm your nervous system.', duration: '10 min before' },
  { id: 'mantras', icon: 'auto_awesome', title: 'Sleep Mantras', subtitle: 'Read your affirmations aloud, then let go of the day.', duration: '5 min before' },
];

const SLEEP_MANTRAS = [
  'I have done enough today. I am enough.',
  'My body knows how to heal and restore itself as I sleep.',
  'Tomorrow is a new beginning. Tonight, I rest.',
  'I release the worries of today. They will still be there tomorrow if I need them, but right now I choose peace.',
  'I am safe. I am calm. I am exactly where I need to be.',
  'My mind is becoming quiet. My body is becoming heavy. I am drifting into peaceful sleep.',
  'I trust the process of life. All is well. I sleep in peace.',
];

function getTimeUntilBedtime(): string {
  const now = new Date();
  const target = new Date();
  target.setHours(22, 0, 0, 0); // 10 PM default
  if (now >= target) target.setDate(target.getDate() + 1);
  const diff = Math.round((target.getTime() - now.getTime()) / 60000);
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export default function BedtimePage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<string[]>([]);
  const [mantraIdx, setMantraIdx] = useState(0);

  const toggle = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const progress = Math.round((checked.length / WIND_DOWN_STEPS.length) * 100);
  const allDone = checked.length === WIND_DOWN_STEPS.length;

  const nextMantra = () => setMantraIdx((i) => (i + 1) % SLEEP_MANTRAS.length);
  const prevMantra = () => setMantraIdx((i) => (i - 1 + SLEEP_MANTRAS.length) % SLEEP_MANTRAS.length);

  return (
    <>
      <TopBar
        title="Bedtime Routine"
        icon="bedtime"
      />

      <div className="page-content">

        {/* Time & Progress Header */}
        <section className="card animate-fade-up" style={{
          background: 'var(--color-on-background)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-32px', right: '-32px', width: 160, height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, background: `linear-gradient(to right, var(--color-primary-container) ${progress}%, rgba(255,255,255,0.1) ${progress}%)`, transition: 'background 0.6s var(--ease-standard)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Wind-down Routine
                </p>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  {allDone ? '🌙 You\'re ready for bed' : 'Good evening'}
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                  {allDone ? 'Routine complete. Sleep well.' : `${WIND_DOWN_STEPS.length - checked.length} step${WIND_DOWN_STEPS.length - checked.length !== 1 ? 's' : ''} remaining · Approx. ${getTimeUntilBedtime()} until 10 PM`}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '2rem', color: 'white' }}>
                  {progress}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>done</div>
              </div>
            </div>

            {/* Moon phase dots */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {WIND_DOWN_STEPS.map((step) => (
                <div key={step.id} style={{
                  flex: 1, height: 4, borderRadius: 999,
                  background: checked.includes(step.id) ? 'var(--color-primary-container)' : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s var(--ease-standard)',
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* Wind-Down Checklist */}
        <section className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="section-header">
            <span className="material-symbols-outlined">checklist</span>
            <h3 className="section-title">Wind-Down Steps</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {WIND_DOWN_STEPS.map((step, i) => {
              const done = checked.includes(step.id);
              return (
                <div
                  key={step.id}
                  onClick={() => {
                    if (step.id === 'breathe') { navigate('/breathe'); return; }
                    toggle(step.id);
                  }}
                  role="checkbox"
                  aria-checked={done}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggle(step.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '1.125rem 1.25rem',
                    background: done ? 'var(--color-surface-container-low)' : 'var(--color-surface-container-lowest)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    opacity: done ? 0.65 : 1,
                    transition: 'all 0.2s var(--ease-standard)',
                    boxShadow: done ? 'none' : 'var(--shadow-card)',
                    border: '1px solid transparent',
                    animationDelay: `${0.05 + i * 0.04}s`,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 13,
                    background: done ? 'var(--color-primary-container)' : 'var(--color-surface-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.2s var(--ease-standard)',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: done ? 'var(--color-on-primary-container)' : 'var(--color-primary)', fontSize: '1.2rem' }}>
                      {done && step.id !== 'breathe' ? 'check' : step.icon}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p style={{
                        fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.95rem',
                        color: 'var(--color-on-surface)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>
                        {step.title}
                        {step.id === 'breathe' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginLeft: '0.5rem', fontWeight: 600, textDecoration: 'none' }}>
                            → Open
                          </span>
                        )}
                      </p>
                      {step.duration && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-outline)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sleep Mantras */}
        <section className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="section-header">
            <span className="material-symbols-outlined">auto_awesome</span>
            <h3 className="section-title">Sleep Mantras</h3>
          </div>
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
          }}>
            <div style={{
              minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-headline)', fontSize: '1.1rem', fontWeight: 600,
                color: 'var(--color-on-surface)', fontStyle: 'italic', lineHeight: 1.6,
              }}>
                "{SLEEP_MANTRAS[mantraIdx]}"
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={prevMantra}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--color-surface-container)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_left</span>
              </button>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                {SLEEP_MANTRAS.map((_, i) => (
                  <div key={i} style={{
                    width: i === mantraIdx ? 20 : 6, height: 6, borderRadius: 999,
                    background: i === mantraIdx ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                    transition: 'all 0.3s var(--ease-standard)',
                    cursor: 'pointer',
                  }} onClick={() => setMantraIdx(i)} />
                ))}
              </div>
              <button
                onClick={nextMantra}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--color-surface-container)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* What to Avoid */}
        <section className="animate-fade-up" style={{ animationDelay: '0.2s', paddingBottom: '2rem' }}>
          <div className="section-header">
            <span className="material-symbols-outlined">block</span>
            <h3 className="section-title">Avoid Tonight</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { icon: 'coffee', label: 'Caffeine', note: 'After 2 PM' },
              { icon: 'phone_android', label: 'Screens', note: '1 hr before' },
              { icon: 'nightlife', label: 'Alcohol', note: 'Disrupts REM' },
              { icon: 'restaurant', label: 'Heavy Meals', note: '3 hrs before' },
              { icon: 'fitness_center', label: 'Intense Exercise', note: '2 hrs before' },
              { icon: 'notifications', label: 'Stressful News', note: 'All evening' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(186, 26, 26, 0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: '1rem' }}>{item.icon}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-on-surface)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)' }}>{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
