import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { COPING_SKILLS, AFFIRMATIONS } from '../data/constants';
import { getTodayChecklist, saveChecklist } from '../data/db';
import { Toast, useToast } from '../components/Toast';
import TopBar from '../components/TopBar';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { selectedSkillIds, selectedAffirmationIds, currentStreak } = useAppStore();
  const { toast, showToast } = useToast();

  const [checkedAffirmations, setCheckedAffirmations] = useState<string[]>([]);
  const [checkedSkills, setCheckedSkills] = useState<string[]>([]);
  const [checklistId, setChecklistId] = useState<number | undefined>(undefined);
  const today = getTodayDate();

  useEffect(() => {
    getTodayChecklist(today).then((existing) => {
      if (existing) {
        setCheckedAffirmations(existing.checkedAffirmations);
        setCheckedSkills(existing.checkedCopingSkills);
        setChecklistId(existing.id);
      }
    });
  }, [today]);

  const persist = (affs: string[], skills: string[]) => {
    saveChecklist(
      { date: today, checkedAffirmations: affs, checkedCopingSkills: skills },
      checklistId
    ).then(() => {
      if (!checklistId) {
        getTodayChecklist(today).then((r) => setChecklistId(r?.id));
      }
    });
  };

  const toggleAffirmation = (id: string) => {
    const next = checkedAffirmations.includes(id)
      ? checkedAffirmations.filter((a) => a !== id)
      : [...checkedAffirmations, id];
    setCheckedAffirmations(next);
    persist(next, checkedSkills);
    if (!checkedAffirmations.includes(id)) showToast('Affirmation checked ✓');
  };

  const toggleSkill = (id: string) => {
    const next = checkedSkills.includes(id)
      ? checkedSkills.filter((s) => s !== id)
      : [...checkedSkills, id];
    setCheckedSkills(next);
    persist(checkedAffirmations, next);
    if (!checkedSkills.includes(id)) showToast('Coping skill practiced ✓');
  };

  const mySkills = COPING_SKILLS.filter((s) => selectedSkillIds.includes(s.id));
  const myAffirmations = AFFIRMATIONS.filter((a) => selectedAffirmationIds.includes(a.id));

  const totalTasks = myAffirmations.length + mySkills.length;
  const completedTasks = checkedAffirmations.length + checkedSkills.length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference - (progressPct / 100) * circumference;

  return (
    <>
      <Toast message={toast.message} show={toast.show} />

      <TopBar
        title={`${getGreeting()}, breathe deep`}
        icon="spa"
        right={
          currentStreak > 0 ? (
            <div className="streak-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>local_fire_department</span>
              {currentStreak} day streak
            </div>
          ) : undefined
        }
      />

      <div className="page-content">

        {/* Progress Header */}
        <section className="card animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-16px', top: '-16px', width: '128px', height: '128px', background: 'rgba(156, 175, 136, 0.08)', borderRadius: '50%', filter: 'blur(24px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', marginBottom: '0.375rem' }}>Daily Balance</h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
              {progressPct === 100 ? '🎉 Today is complete! Amazing work.' : progressPct > 50 ? 'You\'re more than halfway there!' : 'You\'re finding your center today.'}
            </p>
          </div>
          <div className="progress-ring-container" style={{ width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="48" cy="48" r={radius} fill="transparent" stroke="var(--color-surface-container-high)" strokeWidth="8" />
              <circle
                cx="48" cy="48" r={radius}
                fill="transparent"
                stroke="var(--color-primary-container)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s var(--ease-standard)' }}
              />
            </svg>
            <span className="progress-ring-text">{progressPct}%</span>
          </div>
        </section>

        {/* Affirmations */}
        <section className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="section-header">
            <span className="material-symbols-outlined">favorite</span>
            <h3 className="section-title">Daily Affirmations</h3>
          </div>
          <div className="card-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {myAffirmations.map((aff) => {
              const checked = checkedAffirmations.includes(aff.id);
              return (
                <label key={aff.id} className={`check-item${checked ? ' checked' : ''}`} htmlFor={`aff-${aff.id}`}>
                  <input id={`aff-${aff.id}`} type="checkbox" checked={checked} onChange={() => toggleAffirmation(aff.id)} />
                  <span className="check-label" style={{ fontStyle: 'italic' }}>"{aff.text}"</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Coping Skills */}
        <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <span className="material-symbols-outlined">self_improvement</span>
            <h3 className="section-title">Coping Skills</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mySkills.map((skill) => {
              const checked = checkedSkills.includes(skill.id);
              return (
                <div
                  key={skill.id}
                  className={`coping-card${checked ? ' checked' : ''}`}
                  onClick={() => toggleSkill(skill.id)}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggleSkill(skill.id)}
                >
                  <input type="checkbox" checked={checked} readOnly aria-hidden="true" />
                  <div>
                    <p className="coping-title" style={{ fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.125rem' }}>{skill.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>{skill.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </>
  );
}
