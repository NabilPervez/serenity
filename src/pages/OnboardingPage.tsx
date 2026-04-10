import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { COPING_SKILLS, AFFIRMATIONS } from '../data/constants';
import { Toast, useToast } from '../components/Toast';

type Step = 'welcome' | 'skills' | 'affirmations' | 'permissions';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const {
    selectedSkillIds,
    selectedAffirmationIds,
    setSelectedSkills,
    setSelectedAffirmations,
    completeOnboarding,
    setNotificationsEnabled,
  } = useAppStore();

  const [step, setStep] = useState<Step>('welcome');

  // ── Skills ──
  const toggleSkill = (id: string) => {
    if (selectedSkillIds.includes(id)) {
      setSelectedSkills(selectedSkillIds.filter((s) => s !== id));
    } else {
      if (selectedSkillIds.length >= 5) {
        showToast('You can only select 5 coping skills. Deselect one first.');
        return;
      }
      setSelectedSkills([...selectedSkillIds, id]);
    }
  };

  // ── Affirmations ──
  const toggleAffirmation = (id: string) => {
    if (selectedAffirmationIds.includes(id)) {
      setSelectedAffirmations(selectedAffirmationIds.filter((a) => a !== id));
    } else {
      if (selectedAffirmationIds.length >= 7) {
        showToast('You can only select 7 affirmations. Deselect one first.');
        return;
      }
      setSelectedAffirmations([...selectedAffirmationIds, id]);
    }
  };

  const handleSkillsNext = () => {
    if (selectedSkillIds.length < 5) {
      showToast(`Please select ${5 - selectedSkillIds.length} more coping skill(s).`);
      return;
    }
    setStep('affirmations');
  };

  const handleAffirmationsNext = () => {
    if (selectedAffirmationIds.length < 7) {
      showToast(`Please select ${7 - selectedAffirmationIds.length} more affirmation(s).`);
      return;
    }
    setStep('permissions');
  };

  const handleFinish = async () => {
    try {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        setNotificationsEnabled(perm === 'granted');
      }
    } catch {
      // Notifications not supported
    }
    completeOnboarding();
    navigate('/', { replace: true });
  };

  return (
    <div className="onboarding-wrap">
      <Toast message={toast.message} show={toast.show} />

      {step === 'welcome' && <WelcomeStep onNext={() => setStep('skills')} />}
      {step === 'skills' && (
        <SkillsStep
          selectedIds={selectedSkillIds}
          onToggle={toggleSkill}
          onNext={handleSkillsNext}
        />
      )}
      {step === 'affirmations' && (
        <AffirmationsStep
          selectedIds={selectedAffirmationIds}
          onToggle={toggleAffirmation}
          onNext={handleAffirmationsNext}
          onBack={() => setStep('skills')}
        />
      )}
      {step === 'permissions' && <PermissionsStep onFinish={handleFinish} />}
    </div>
  );
}

// ─── Welcome Step ────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '2rem',
      minHeight: '100dvh',
    }}>
      <div style={{ animation: 'scale-in 0.5s var(--ease-standard) both' }}>
        <div style={{
          width: 96,
          height: 96,
          background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-tertiary-container))',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 16px 40px rgba(82, 100, 66, 0.2)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>spa</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          fontWeight: 800,
          color: 'var(--color-on-surface)',
          letterSpacing: '-0.03em',
          marginBottom: '1rem',
        }}>
          Welcome to<br />Serenity
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-on-surface-variant)',
          lineHeight: 1.7,
          maxWidth: '360px',
        }}>
          Your private, phone-only companion for managing anxiety through mindful habits—no cloud, no ads, no judgment.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '360px', textAlign: 'left' }}>
        {[
          { icon: 'checklist', label: 'Daily affirmations & coping skills' },
          { icon: 'timeline', label: 'Mood & anxiety timeline journal' },
          { icon: 'air', label: 'Guided box breathing exercises' },
          { icon: 'lock', label: '100% private—stored only on this device' },
        ].map((f) => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: 'var(--color-surface-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{f.icon}</span>
            </div>
            <span style={{ color: 'var(--color-on-surface)', fontSize: '0.95rem', fontWeight: 500 }}>{f.label}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onNext} style={{ maxWidth: '360px', width: '100%' }}>
        <span className="material-symbols-outlined">arrow_forward</span>
        Get Started
      </button>
    </div>
  );
}

// ─── Skills Step ─────────────────────────────────────────
function SkillsStep({
  selectedIds,
  onToggle,
  onNext,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  const filledCount = selectedIds.length;
  const progress = (filledCount / 5) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header style={{
        padding: '1.5rem 1.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-surface)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 1 of 3</p>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-on-surface)' }}>Your Coping Toolset</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '0.25rem', fontSize: '0.95rem' }}>Choose exactly 5 techniques you'd like to practice.</p>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem 1.5rem 160px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {COPING_SKILLS.map((skill) => {
            const isSelected = selectedIds.includes(skill.id);
            const isDisabled = !isSelected && selectedIds.length >= 5;
            return (
              <div
                key={skill.id}
                className={`skill-card${isSelected ? ' selected' : ''}`}
                onClick={() => !isDisabled && onToggle(skill.id)}
                style={{ opacity: isDisabled ? 0.45 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => e.key === ' ' && !isDisabled && onToggle(skill.id)}
              >
                <div className={`skill-icon${isSelected ? ' selected' : ''}`}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: '1.25rem' }}>{skill.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-on-surface)' }}>{skill.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginTop: '0.125rem' }}>{skill.description}</div>
                </div>
                <div className="skill-check">
                  {isSelected && <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: 'white' }}>check</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%',
        padding: '1.25rem 1.5rem calc(1.25rem + env(safe-area-inset-bottom))',
        background: 'rgba(252, 249, 243, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 20,
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
              <div style={{ width: '128px', height: '8px', background: 'var(--color-surface-container-high)', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient-silk)', borderRadius: '999px', transition: 'width 0.3s var(--ease-standard)' }} />
              </div>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>{filledCount} of 5 selected</span>
          </div>
          <button
            className="btn-primary"
            onClick={onNext}
            disabled={filledCount < 5}
          >
            Next: Choose Affirmations
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Affirmations Step ───────────────────────────────────
function AffirmationsStep({
  selectedIds,
  onToggle,
  onNext,
  onBack,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const filledCount = selectedIds.length;
  const progress = (filledCount / 7) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header style={{
        padding: '1.5rem 1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        background: 'var(--color-surface)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.875rem', fontWeight: 500, alignSelf: 'flex-start' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
          Back
        </button>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 2 of 3</p>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-on-surface)', marginTop: '0.125rem' }}>Your Daily Affirmations</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.95rem' }}>Choose exactly 7 affirmations to read each morning.</p>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem 1.5rem 160px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {AFFIRMATIONS.map((aff) => {
            const isSelected = selectedIds.includes(aff.id);
            const isDisabled = !isSelected && selectedIds.length >= 7;
            return (
              <label
                key={aff.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: isSelected ? 'rgba(82, 100, 66, 0.05)' : 'var(--color-surface-container-lowest)',
                  borderRadius: 'var(--radius-md)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  border: isSelected ? '1.5px solid var(--color-primary-container)' : '1.5px solid transparent',
                  transition: 'all 0.2s var(--ease-standard)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onToggle(aff.id)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    width: '1.25rem',
                    height: '1.25rem',
                    minWidth: '1.25rem',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                    background: isSelected ? 'var(--color-primary)' : 'transparent',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s var(--ease-standard)',
                  }}
                />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-on-surface)',
                  fontWeight: isSelected ? 500 : 400,
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}>
                  "{aff.text}"
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <footer style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%',
        padding: '1.25rem 1.5rem calc(1.25rem + env(safe-area-inset-bottom))',
        background: 'rgba(252, 249, 243, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 20,
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
              <div style={{ width: '128px', height: '8px', background: 'var(--color-surface-container-high)', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient-silk)', borderRadius: '999px', transition: 'width 0.3s var(--ease-standard)' }} />
              </div>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>{filledCount} of 7 selected</span>
          </div>
          <button className="btn-primary" onClick={onNext} disabled={filledCount < 7}>
            Next: Permissions
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Permissions Step ────────────────────────────────────
function PermissionsStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', textAlign: 'center',
      gap: '2rem', minHeight: '100dvh',
    }}>
      <div style={{
        width: 96, height: 96,
        background: 'var(--color-secondary-container)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 32px rgba(254, 156, 132, 0.3)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--color-on-secondary-container)' }}>notifications</span>
      </div>

      <div>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-on-surface)', marginBottom: '0.75rem' }}>
          Stay on Track
        </h1>
        <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.7, maxWidth: '340px' }}>
          Allow notifications to receive hourly check-in reminders and scheduled breathing prompts during your waking hours.
        </p>
      </div>

      <div style={{
        background: 'var(--color-surface-container-lowest)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        width: '100%', maxWidth: '360px',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'left',
      }}>
        {[
          { icon: 'schedule', label: 'Hourly Check-ins (8 AM – 8 PM)' },
          { icon: 'air', label: 'Box Breathing at 9 AM & 1 PM' },
          { icon: 'bedtime', label: 'Wind-down reminder at 9 PM' },
        ].map((n) => (
          <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'var(--color-surface-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>{n.icon}</span>
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-on-surface)', fontWeight: 500 }}>{n.label}</span>
          </div>
        ))}
        <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', marginTop: '0.5rem' }}>
          Note: iOS notifications require the app to be added to your Home Screen.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button className="btn-primary" onClick={onFinish}>
          <span className="material-symbols-outlined">check_circle</span>
          Allow & Enter Serenity
        </button>
        <button className="btn-ghost" onClick={onFinish}>
          Skip for Now
        </button>
      </div>
    </div>
  );
}
