import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Phase definitions ──────────────────────────────────────────
// 4-4-5-2 box breathing: inhale 4s → hold 4s → exhale 5s → rest 2s
const PHASES = [
  {
    key: 'inhale',
    label: 'Inhale',
    seconds: 4,
    circleScale: 1.15,
    instruction: 'Breathe in slowly through your nose. Let your belly rise and expand fully, filling from the bottom of your lungs upward.',
  },
  {
    key: 'hold-in',
    label: 'Hold',
    seconds: 4,
    circleScale: 1.15,
    instruction: 'Rest here at the top of your breath. You are full, complete, and completely safe in this moment.',
  },
  {
    key: 'exhale',
    label: 'Exhale',
    seconds: 5,
    circleScale: 0.88,
    instruction: 'Breathe out slowly through your mouth. Let your belly fall as you release all tension and worry.',
  },
  {
    key: 'rest',
    label: 'Rest',
    seconds: 2,
    circleScale: 0.88,
    instruction: 'Pause gently at the bottom. Notice the stillness. You are exactly where you need to be.',
  },
] as const;

const TOTAL_CYCLES = 10;
const TOTAL_SECONDS = PHASES.reduce((s, p) => s + p.seconds, 0) * TOTAL_CYCLES;

// ── Component ──────────────────────────────────────────────────
export default function BreathePage() {
  const navigate = useNavigate();

  // All mutable session state lives in a single ref to avoid stale closures
  const sessionRef = useRef<{
    running: boolean;
    phaseIdx: number;
    cycle: number;
    countdown: number;
    elapsed: number;
  }>({
    running: false,
    phaseIdx: 0,
    cycle: 1,
    countdown: PHASES[0].seconds,
    elapsed: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // React display state (derived / copy of ref each tick)
  const [display, setDisplay] = useState<{
    status: 'idle' | 'running' | 'paused' | 'complete';
    phaseIdx: number;
    cycle: number;
    countdown: number;
    elapsed: number;
  }>({
    status: 'idle',
    phaseIdx: 0,
    cycle: 1,
    countdown: PHASES[0].seconds,
    elapsed: 0,
  });

  const flush = () => {
    const s = sessionRef.current;
    setDisplay((prev) => ({ ...prev, phaseIdx: s.phaseIdx, cycle: s.cycle, countdown: s.countdown, elapsed: s.elapsed }));
  };

  const stopInterval = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const tick = () => {
    const s = sessionRef.current;
    if (!s.running) return;

    s.elapsed += 1;
    s.countdown -= 1;

    if (s.countdown <= 0) {
      // Advance to next phase
      const nextIdx = (s.phaseIdx + 1) % PHASES.length;
      const isNewCycle = nextIdx === 0;

      if (isNewCycle) {
        if (s.cycle >= TOTAL_CYCLES) {
          // Session complete
          s.running = false;
          stopInterval();
          setDisplay((prev) => ({ ...prev, status: 'complete', elapsed: s.elapsed }));
          return;
        }
        s.cycle += 1;
      }

      s.phaseIdx = nextIdx;
      s.countdown = PHASES[nextIdx].seconds;
    }

    flush();
  };

  const handleStart = () => {
    sessionRef.current = { running: true, phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds, elapsed: 0 };
    setDisplay({ status: 'running', phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds, elapsed: 0 });
    stopInterval();
    intervalRef.current = setInterval(tick, 1000);
  };

  const handlePause = () => {
    sessionRef.current.running = false;
    stopInterval();
    setDisplay((prev) => ({ ...prev, status: 'paused' }));
  };

  const handleResume = () => {
    sessionRef.current.running = true;
    setDisplay((prev) => ({ ...prev, status: 'running' }));
    intervalRef.current = setInterval(tick, 1000);
  };

  const handleStop = () => {
    sessionRef.current.running = false;
    stopInterval();
    setDisplay({ status: 'idle', phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds, elapsed: 0 });
  };

  useEffect(() => stopInterval, []); // cleanup on unmount

  // ── Derived display values ─────────────────────────────────────
  const { status, phaseIdx, cycle, countdown, elapsed } = display;
  const phase = PHASES[phaseIdx];
  const nextPhase = PHASES[(phaseIdx + 1) % PHASES.length];
  const progressPct = Math.min((elapsed / TOTAL_SECONDS) * 100, 100);
  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;
  const totalMins = Math.floor(TOTAL_SECONDS / 60);

  const isActive = status === 'running' || status === 'paused';

  // Circle scale based on current phase
  const circleStyle = {
    width: 256,
    height: 256,
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 24px 48px rgba(44, 61, 48, 0.08)',
    position: 'relative' as const,
    zIndex: 1,
    transition: `transform ${phase.key === 'inhale' ? '4s' : phase.key === 'hold-in' ? '0.3s' : phase.key === 'exhale' ? '5s' : '0.3s'} cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: isActive ? `scale(${phase.circleScale})` : 'scale(1)',
  };

  // Phase-specific accent color
  const phaseColor = phase.key === 'inhale' || phase.key === 'hold-in'
    ? 'var(--color-primary)'
    : 'var(--color-secondary)';

  return (
    <div className="breathing-canvas">
      {/* Header */}
      <header style={{
        position: 'absolute', top: 0, left: 0, width: '100%',
        padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--color-surface-container-lowest)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
          aria-label="Go back"
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)' }}>close</span>
        </button>
        <div style={{
          fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.75rem',
          color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Box Breathing · 4-4-5-2
        </div>
        <div style={{ width: 48 }} />
      </header>

      {/* Main */}
      <section style={{
        maxWidth: 400, width: '100%', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem',
      }}>
        {/* Cycle label */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(68,72,63,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            {status === 'complete' ? 'Session Complete 🌿' : status === 'idle' ? 'Ready to begin' : status === 'paused' ? 'Paused' : `Cycle ${cycle} of ${TOTAL_CYCLES}`}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-headline)', fontSize: '2.25rem', fontWeight: 800,
            color: isActive ? phaseColor : 'var(--color-on-surface)',
            letterSpacing: '-0.02em',
            transition: 'color 0.4s var(--ease-standard)',
          }}>
            {status === 'complete' ? 'Well done.' : status === 'idle' ? 'Center yourself' : phase.label}
          </h1>
        </div>

        {/* Breathing circle */}
        <div className="breathing-circle-wrap">
          <div className="breathing-glow" />
          <div style={circleStyle}>
            <div className="breathing-inner" style={{ borderColor: `${phaseColor}25` }}>
              {status === 'idle' ? (
                <>
                  <span style={{ fontSize: '2.5rem' }}>🌬️</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(68,72,63,0.6)' }}>Let's breathe</span>
                </>
              ) : status === 'complete' ? (
                <>
                  <span style={{ fontSize: '2.5rem' }}>🌿</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(68,72,63,0.6)' }}>Beautiful</span>
                </>
              ) : (
                <>
                  <span className="breathing-phase-text" style={{ color: phaseColor }}>{phase.label}</span>
                  <span className="breathing-count">{countdown}s</span>
                </>
              )}
            </div>
          </div>

          {/* Phase sequence indicator */}
          {isActive && (
            <div style={{
              position: 'absolute', top: '-44px', right: '-40px',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid rgba(197,200,188,0.2)',
            }}>
              <p style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem', marginBottom: '0.125rem' }}>
                Coming next
              </p>
              <p style={{ fontWeight: 500, color: 'var(--color-on-surface)', fontSize: '0.8rem' }}>
                {nextPhase.label} · {nextPhase.seconds}s
              </p>
            </div>
          )}
        </div>

        {/* Phase step dots */}
        {isActive && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {PHASES.map((p, i) => (
              <div key={p.key} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              }}>
                <div style={{
                  width: i === phaseIdx ? 28 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === phaseIdx ? phaseColor : 'var(--color-surface-container-high)',
                  transition: 'all 0.3s var(--ease-standard)',
                }} />
                <span style={{
                  fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: i === phaseIdx ? phaseColor : 'rgba(68,72,63,0.35)',
                  transition: 'color 0.3s var(--ease-standard)',
                }}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Instruction text */}
        <div style={{ maxWidth: '300px' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7, fontSize: '0.9rem' }}>
            {status === 'complete'
              ? 'You completed a full box breathing session. Your nervous system has been reset. Take a moment to notice how you feel.'
              : status === 'idle'
              ? 'In for 4 · Hold for 4 · Out for 5 · Rest for 2. Ten cycles for a complete nervous system reset.'
              : phase.instruction}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {status === 'idle' && (
            <button className="btn-primary" onClick={handleStart}>
              <span className="material-symbols-outlined">play_arrow</span>
              Begin Session
            </button>
          )}
          {status === 'running' && (
            <>
              <button className="btn-primary" onClick={handlePause}>
                <span className="material-symbols-outlined">pause</span>
                Pause Session
              </button>
              <button className="btn-ghost" onClick={handleStop}>End Session</button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button className="btn-primary" onClick={handleResume}>
                <span className="material-symbols-outlined">play_arrow</span>
                Resume
              </button>
              <button className="btn-ghost" onClick={handleStop}>End Session</button>
            </>
          )}
          {status === 'complete' && (
            <>
              <button className="btn-primary" onClick={handleStart}>
                <span className="material-symbols-outlined">refresh</span>
                New Session
              </button>
              <button className="btn-ghost" onClick={() => navigate(-1)}>Return Home</button>
            </>
          )}
        </div>
      </section>

      {/* Session progress bar */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: '2rem', width: '100%', maxWidth: '280px', padding: '0 1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(68,72,63,0.45)' }}>
            <span>Session Progress</span>
            <span>
              {String(elapsedMins).padStart(2, '0')}:{String(elapsedSecs).padStart(2, '0')} / {totalMins}:00
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--color-surface-container-high)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--color-primary)', borderRadius: 999,
              width: `${progressPct}%`, transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
