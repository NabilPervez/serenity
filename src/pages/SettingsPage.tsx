import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { COPING_SKILLS, AFFIRMATIONS } from '../data/constants';
import { getTimelineEntries, db } from '../data/db';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const {
    selectedSkillIds,
    selectedAffirmationIds,
    notificationsEnabled,
    wakingHoursStart,
    wakingHoursEnd,
    currentStreak,
    timezone,
    setNotificationsEnabled,
    resetOnboarding,
  } = useAppStore();

  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [showAffPicker, setShowAffPicker] = useState(false);
  const [tempSkills, setTempSkills] = useState<string[]>(selectedSkillIds);
  const [tempAffs, setTempAffs] = useState<string[]>(selectedAffirmationIds);
  const { setSelectedSkills, setSelectedAffirmations } = useAppStore();

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!confirm('This will overwrite your existing data. Are you sure you want to proceed?')) {
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.timeline && Array.isArray(data.timeline)) {
          await db.timeline.clear();
          await db.timeline.bulkAdd(data.timeline);
        }

        if (data.preferences) {
          useAppStore.setState(data.preferences);
          setTempSkills(data.preferences.selectedSkillIds || []);
          setTempAffs(data.preferences.selectedAffirmationIds || []);
        }

        showToast('Data imported successfully ✓');
      } catch (error) {
        showToast('Import failed. Invalid file format.');
        console.error('Import error:', error);
      }
    };
    input.click();
  };

  const handleExportData = async () => {
    try {
      const entries = await getTimelineEntries(1000);
      const storeState = useAppStore.getState();
      const data = {
        preferences: storeState,
        timeline: entries,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `serenity-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully ✓');
    } catch {
      showToast('Export failed. Please try again.');
    }
  };

  const handleClearData = () => {
    if (confirm('This will permanently delete all your timeline entries and reset onboarding. This cannot be undone.')) {
      db.timeline.clear();
      db.checklist.clear();
      resetOnboarding();
      navigate('/onboarding', { replace: true });
    }
  };

  const formatHour = (h: number) => {
    const d = new Date();
    d.setHours(h, 0, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  };

  // --- Skill Picker ---
  const toggleTempSkill = (id: string) => {
    if (tempSkills.includes(id)) {
      setTempSkills(tempSkills.filter((s) => s !== id));
    } else {
      if (tempSkills.length >= 5) { showToast('Max 5 skills allowed.'); return; }
      setTempSkills([...tempSkills, id]);
    }
  };

  const saveSkills = () => {
    if (tempSkills.length !== 5) { showToast('Please select exactly 5 skills.'); return; }
    setSelectedSkills(tempSkills);
    setShowSkillPicker(false);
    showToast('Coping skills updated ✓');
  };

  // --- Affirmation Picker ---
  const toggleTempAff = (id: string) => {
    if (tempAffs.includes(id)) {
      setTempAffs(tempAffs.filter((a) => a !== id));
    } else {
      if (tempAffs.length >= 7) { showToast('Max 7 affirmations allowed.'); return; }
      setTempAffs([...tempAffs, id]);
    }
  };

  const saveAffs = () => {
    if (tempAffs.length !== 7) { showToast('Please select exactly 7 affirmations.'); return; }
    setSelectedAffirmations(tempAffs);
    setShowAffPicker(false);
    showToast('Affirmations updated ✓');
  };

  if (showSkillPicker) {
    return (
      <PickerModal
        title="Edit Coping Skills"
        subtitle={`${tempSkills.length} / 5 selected`}
        onClose={() => { setTempSkills(selectedSkillIds); setShowSkillPicker(false); }}
        onSave={saveSkills}
      >
        {COPING_SKILLS.map((skill) => {
          const isSelected = tempSkills.includes(skill.id);
          const isDisabled = !isSelected && tempSkills.length >= 5;
          return (
            <div
              key={skill.id}
              className={`skill-card${isSelected ? ' selected' : ''}`}
              onClick={() => !isDisabled && toggleTempSkill(skill.id)}
              style={{ opacity: isDisabled ? 0.45 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', marginBottom: '0.5rem' }}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
            >
              <div className={`skill-icon`}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{skill.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem' }}>{skill.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{skill.description}</div>
              </div>
              <div className="skill-check">
                {isSelected && <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: 'white' }}>check</span>}
              </div>
            </div>
          );
        })}
      </PickerModal>
    );
  }

  if (showAffPicker) {
    return (
      <PickerModal
        title="Edit Affirmations"
        subtitle={`${tempAffs.length} / 7 selected`}
        onClose={() => { setTempAffs(selectedAffirmationIds); setShowAffPicker(false); }}
        onSave={saveAffs}
      >
        {AFFIRMATIONS.map((aff) => {
          const isSelected = tempAffs.includes(aff.id);
          const isDisabled = !isSelected && tempAffs.length >= 7;
          return (
            <label
              key={aff.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 1rem',
                background: isSelected ? 'rgba(82,100,66,0.05)' : 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-md)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                border: `1.5px solid ${isSelected ? 'var(--color-primary-container)' : 'transparent'}`,
                marginBottom: '0.375rem',
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => toggleTempAff(aff.id)}
                style={{
                  appearance: 'none', WebkitAppearance: 'none',
                  width: '1.1rem', height: '1.1rem', minWidth: '1.1rem',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--color-on-surface)', lineHeight: 1.5 }}>
                "{aff.text}"
              </span>
            </label>
          );
        })}
      </PickerModal>
    );
  }

  return (
    <>
      <Toast message={toast.message} show={toast.show} />

      <header className="top-bar">
        <div className="top-bar-title">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>settings</span>
          Settings
        </div>
        {/* No cog here — this IS the settings page */}
      </header>

      <div className="page-content">

        {/* Profile Summary */}
        <section className="card animate-fade-up" style={{
          background: 'var(--gradient-silk)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: 120, height: 120, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: 'white' }}>spa</span>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>Your Serenity Profile</h2>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>{timezone}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Current Streak', value: `${currentStreak}d` },
                { label: 'Skills', value: `${selectedSkillIds.length}/5` },
                { label: 'Affirmations', value: `${selectedAffirmationIds.length}/7` },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.5rem', color: 'white' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.125rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* My Toolkit */}
        <section className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>My Personal Toolkit</h3>
          <div className="settings-group">
            {/* Affirmations first, then Coping Skills */}
            <div className="settings-row" onClick={() => { setTempAffs(selectedAffirmationIds); setShowAffPicker(true); }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>favorite</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem' }}>Daily Affirmations</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>
                  {selectedAffirmationIds.length} affirmations selected
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', flexShrink: 0 }}>chevron_right</span>
            </div>
            <div className="settings-row" onClick={() => { setTempSkills(selectedSkillIds); setShowSkillPicker(true); }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>self_improvement</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem' }}>Coping Skills</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>
                  {COPING_SKILLS.filter((s) => selectedSkillIds.includes(s.id)).map((s) => s.name).join(', ')}
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', flexShrink: 0 }}>chevron_right</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Notifications</h3>
          <div className="settings-group">
            <div className="settings-row">
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Enable Reminders</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>Hourly check-ins & breathing prompts</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-row" style={{ cursor: 'default' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Notification Schedule</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                  {[
                    { icon: 'schedule', text: `Hourly check-ins · ${formatHour(wakingHoursStart)} – ${formatHour(wakingHoursEnd)}` },
                    { icon: 'air', text: 'Box Breathing at 9 AM & 1 PM' },
                    { icon: 'air', text: 'Box Breathing at 9 PM' },
                    { icon: 'bedtime', text: 'Wind-down reminder at 9 PM' },
                  ].map((n) => (
                    <div key={n.text} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>{n.icon}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Data & Privacy</h3>
          <div className="settings-group">
            <div className="settings-row" onClick={handleExportData}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>download</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem' }}>Export My Data</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>Download your data and settings as JSON</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', flexShrink: 0 }}>chevron_right</span>
            </div>
            <div className="settings-row" onClick={handleImportData}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>upload</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem' }}>Import My Data</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>Restore your data and settings from JSON</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', flexShrink: 0 }}>chevron_right</span>
            </div>
            <div className="settings-row" style={{ cursor: 'default' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>lock</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem' }}>100% Private</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>All data is stored only on this device. Zero cloud sync.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="animate-fade-up" style={{ animationDelay: '0.2s', paddingBottom: '2rem' }}>
          <h3 className="section-title" style={{ marginBottom: '0.75rem', color: 'var(--color-error)' }}>Danger Zone</h3>
          <div className="settings-group">
            <div className="settings-row" onClick={handleClearData} style={{ color: 'var(--color-error)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: '1.1rem' }}>delete_forever</span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Reset Everything</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>Delete all data and restart onboarding</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', flexShrink: 0 }}>chevron_right</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Picker Modal ────────────────────────────────────────
function PickerModal({
  title,
  subtitle,
  onClose,
  onSave,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header style={{
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid rgba(197,200,188,0.2)',
      }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
          Cancel
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, color: 'var(--color-on-surface)', fontSize: '1rem' }}>{title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-outline)' }}>{subtitle}</div>
        </div>
        <button onClick={onSave} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-headline)', fontSize: '1rem' }}>
          Save
        </button>
      </header>
      <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.5rem 100px' }}>
        {children}
      </div>
    </div>
  );
}
