import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

// ── Phase definitions ──────────────────────────────────────────
// Box breathing: inhale 4s → hold 4s → exhale 5s → rest 2s
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

// ── Component ──────────────────────────────────────────────────
export default function BreathePage() {
  const navigate = useNavigate();

  const sessionRef = useRef<{
    running: boolean;
    phaseIdx: number;
    cycle: number;
    countdown: number;
  }>({
    running: false,
    phaseIdx: 0,
    cycle: 1,
    countdown: PHASES[0].seconds,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [display, setDisplay] = useState<{
    status: 'idle' | 'running' | 'paused' | 'complete';
    phaseIdx: number;
    cycle: number;
    countdown: number;
  }>({
    status: 'idle',
    phaseIdx: 0,
    cycle: 1,
    countdown: PHASES[0].seconds,
  });

  const flush = () => {
    const s = sessionRef.current;
    setDisplay((prev) => ({ ...prev, phaseIdx: s.phaseIdx, cycle: s.cycle, countdown: s.countdown }));
  };

  const stopInterval = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const tick = () => {
    const s = sessionRef.current;
    if (!s.running) return;

    s.countdown -= 1;

    if (s.countdown <= 0) {
      const nextIdx = (s.phaseIdx + 1) % PHASES.length;
      const isNewCycle = nextIdx === 0;

      if (isNewCycle) {
        if (s.cycle >= TOTAL_CYCLES) {
          s.running = false;
          stopInterval();
          setDisplay((prev) => ({ ...prev, status: 'complete' }));
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
    sessionRef.current = { running: true, phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds };
    setDisplay({ status: 'running', phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds });
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
    setDisplay({ status: 'idle', phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds });
  };

  useEffect(() => stopInterval, []); // cleanup on unmount

  // ── Derived display values ─────────────────────────────────────
  const { status, phaseIdx, cycle, countdown } = display;
  const phase = PHASES[phaseIdx];
  const nextPhase = PHASES[(phaseIdx + 1) % PHASES.length];
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

  const phaseColor = phase.key === 'inhale' || phase.key === 'hold-in'
    ? 'var(--color-primary)'
    : 'var(--color-secondary)';

  // Solid "End Session" / "Return Home" button style (not transparent)
  const solidSecondaryBtn: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 2rem',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-surface-container)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-headline)',
    fontWeight: 600,
    fontSize: '1rem',
    color: 'var(--color-on-surface-variant)',
    transition: 'background 0.2s var(--ease-standard)',
  };

  return (
    <>
      <TopBar title="Box Breathing" icon="air" />

      <div style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(156, 175, 136, 0.08) 0%, var(--color-surface) 70%)',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <section style={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}>

          {/* Status + phase label */}
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

            {/* Coming next tooltip */}
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
                <div key={p.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
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
                ? 'You completed 10 cycles of box breathing. Your nervous system has been reset. Take a moment to notice how you feel.'
                : status === 'idle'
                ? 'In for 4 · Hold for 4 · Out for 5 · Rest for 2. Ten cycles for a complete nervous system reset.'
                : phase.instruction}
            </p>
          </div>

          {/* 10-cycle rep progress bar */}
          {(isActive || status === 'complete') && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(68,72,63,0.45)' }}>
                  Reps
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(68,72,63,0.45)' }}>
                  {status === 'complete' ? `${TOTAL_CYCLES}/${TOTAL_CYCLES}` : `${cycle - 1}/${TOTAL_CYCLES}`} done
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {Array.from({ length: TOTAL_CYCLES }).map((_, i) => {
                  const completed = status === 'complete' || i < cycle - 1;
                  const current = isActive && i === cycle - 1;
                  return (
                    <div key={i} style={{
                      flex: 1, height: 8, borderRadius: 999,
                      background: completed
                        ? 'var(--color-primary)'
                        : current
                          ? 'var(--color-primary-container)'
                          : 'var(--color-surface-container-high)',
                      transition: 'background 0.5s var(--ease-standard)',
                    }} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons — End Session uses solid background to prevent overlap/bleed-through */}
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
                <button onClick={handleStop} style={solidSecondaryBtn}>
                  End Session
                </button>
              </>
            )}
            {status === 'paused' && (
              <>
                <button className="btn-primary" onClick={handleResume}>
                  <span className="material-symbols-outlined">play_arrow</span>
                  Resume
                </button>
                <button onClick={handleStop} style={solidSecondaryBtn}>
                  End Session
                </button>
              </>
            )}
            {status === 'complete' && (
              <>
                <button className="btn-primary" onClick={handleStart}>
                  <span className="material-symbols-outlined">refresh</span>
                  New Session
                </button>
                <button onClick={() => navigate(-1)} style={solidSecondaryBtn}>
                  Return Home
                </button>
              </>
            )}
          </div>

        </section>
      </div>
    </>
  );
}
