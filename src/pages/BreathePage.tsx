import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type Phase = 'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

// 4-4-5 box breathing (PRD spec — 4s inhale, 4s hold, 5s exhale, 2s pause)
const PHASES: { phase: Phase; label: string; instruction: string; duration: number }[] = [
  { phase: 'inhale', label: 'Inhale', instruction: 'Allow your chest to expand fully. Feel the cool air grounding your awareness.', duration: 4 },
  { phase: 'hold-in', label: 'Hold', instruction: 'Rest in this moment of fullness. You are completely safe right now.', duration: 4 },
  { phase: 'exhale', label: 'Exhale', instruction: 'Slowly release all tension. Let each exhale carry your worries away.', duration: 5 },
  { phase: 'hold-out', label: 'Rest', instruction: 'Pause gently. Notice the stillness. You are exactly where you need to be.', duration: 2 },
];

const TOTAL_CYCLES = 10;

export default function BreathePage() {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  const totalSessionSeconds = PHASES.reduce((s, p) => s + p.duration, 0) * TOTAL_CYCLES;

  const currentPhase = sessionState !== 'idle' && sessionState !== 'complete'
    ? PHASES[phaseIndex]
    : null;

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = useCallback(() => {
    secondsRef.current += 1;
    setElapsed(secondsRef.current);

    setCountdown((prev) => {
      if (prev <= 1) {
        // Advance phase
        setPhaseIndex((pi) => {
          const nextPi = (pi + 1) % PHASES.length;
          if (nextPi === 0) {
            // New cycle
            setCurrentCycle((c) => {
              if (c >= TOTAL_CYCLES) {
                // Done
                setSessionState('complete');
                clearTimer();
                return c;
              }
              return c + 1;
            });
          }
          return nextPi;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length].duration;
      }
      return prev - 1;
    });
  }, [phaseIndex]);

  useEffect(() => {
    if (sessionState === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [sessionState, tick]);

  const handleStart = () => {
    setPhaseIndex(0);
    setCurrentCycle(1);
    setCountdown(PHASES[0].duration);
    secondsRef.current = 0;
    setElapsed(0);
    setSessionState('running');
  };

  const handlePause = () => setSessionState('paused');
  const handleResume = () => setSessionState('running');
  const handleStop = () => {
    clearTimer();
    setSessionState('idle');
    setPhaseIndex(0);
    setCurrentCycle(1);
    setElapsed(0);
  };

  const progressPct = Math.min((elapsed / totalSessionSeconds) * 100, 100);
  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;
  const totalMins = Math.floor(totalSessionSeconds / 60);

  const circleClass = currentPhase?.phase === 'inhale' ? 'breathing-circle inhale'
    : currentPhase?.phase === 'hold-in' ? 'breathing-circle hold'
    : currentPhase?.phase === 'exhale' ? 'breathing-circle exhale'
    : currentPhase?.phase === 'hold-out' ? 'breathing-circle'
    : 'breathing-circle';

  return (
    <div className="breathing-canvas">
      {/* Close / Back Button */}
      <header style={{
        position: 'absolute', top: 0, left: 0, width: '100%',
        padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--color-surface-container-lowest)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
            transition: 'background 0.2s var(--ease-standard)',
          }}
          aria-label="Close breathing session"
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)' }}>close</span>
        </button>
        <div style={{
          fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.75rem',
          color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Box Breathing
        </div>
        <div style={{ width: 48 }} />
      </header>

      {/* Main Content */}
      <section style={{ maxWidth: 400, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>

        {/* Cycle & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(68,72,63,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            {sessionState === 'complete' ? 'Session Complete 🌿' : sessionState === 'idle' ? 'Ready to begin' : `Cycle ${currentCycle} of ${TOTAL_CYCLES}`}
          </p>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            {sessionState === 'complete' ? 'Well done.' : sessionState === 'idle' ? 'Center yourself' : currentPhase?.label}
          </h1>
        </div>

        {/* Breathing Circle */}
        <div className="breathing-circle-wrap">
          <div className="breathing-glow" />
          <div className={circleClass}>
            <div className="breathing-inner">
              {sessionState === 'idle' ? (
                <>
                  <span style={{ font: 'normal 2.5rem var(--font-headline)', fontWeight: 600, color: 'var(--color-primary)' }}>🌬️</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(68,72,63,0.6)' }}>Let's breathe</span>
                </>
              ) : sessionState === 'complete' ? (
                <>
                  <span style={{ fontSize: '2.5rem' }}>🌿</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(68,72,63,0.6)' }}>Beautiful</span>
                </>
              ) : (
                <>
                  <span className="breathing-phase-text">{currentPhase?.label}</span>
                  <span className="breathing-count">{countdown}s</span>
                </>
              )}
            </div>
          </div>

          {/* Coming Next chip */}
          {sessionState === 'running' && (
            <div style={{
              position: 'absolute', top: '-40px', right: '-32px',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid rgba(197,200,188,0.15)',
              fontSize: '0.75rem',
            }}>
              <p style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.125rem' }}>Coming next</p>
              <p style={{ fontWeight: 500, color: 'var(--color-on-surface)' }}>
                {PHASES[(phaseIndex + 1) % PHASES.length].label} ({PHASES[(phaseIndex + 1) % PHASES.length].duration}s)
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ maxWidth: '300px' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7, fontSize: '0.9rem' }}>
            {sessionState === 'complete'
              ? 'You completed a full box breathing session. Your nervous system has been reset. Take a moment to notice how you feel.'
              : sessionState === 'idle'
              ? '4 seconds in, 4 seconds hold, 5 seconds out. Repeat 10 cycles for a complete grounding session.'
              : currentPhase?.instruction}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {sessionState === 'idle' && (
            <button className="btn-primary" onClick={handleStart}>
              <span className="material-symbols-outlined">play_arrow</span>
              Begin Session
            </button>
          )}
          {sessionState === 'running' && (
            <>
              <button className="btn-primary" onClick={handlePause}>
                <span className="material-symbols-outlined">pause</span>
                Pause Session
              </button>
              <button className="btn-ghost" onClick={handleStop}>
                End Session
              </button>
            </>
          )}
          {sessionState === 'paused' && (
            <>
              <button className="btn-primary" onClick={handleResume}>
                <span className="material-symbols-outlined">play_arrow</span>
                Resume
              </button>
              <button className="btn-ghost" onClick={handleStop}>
                End Session
              </button>
            </>
          )}
          {sessionState === 'complete' && (
            <>
              <button className="btn-primary" onClick={handleStart}>
                <span className="material-symbols-outlined">refresh</span>
                New Session
              </button>
              <button className="btn-ghost" onClick={() => navigate('/')}>
                Return Home
              </button>
            </>
          )}
        </div>
      </section>

      {/* Progress Bar */}
      {sessionState !== 'idle' && (
        <div style={{
          position: 'absolute', bottom: '2rem', width: '100%', maxWidth: '280px', padding: '0 1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(68,72,63,0.5)' }}>
            <span>Session Progress</span>
            <span>
              {String(elapsedMins).padStart(2, '0')}:{String(elapsedSecs).padStart(2, '0')} / {totalMins}:00
            </span>
          </div>
          <div style={{ height: 6, width: '100%', background: 'var(--color-surface-container-high)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--color-primary)', borderRadius: '999px',
              width: `${progressPct}%`,
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
