import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  selectedSkillIds: string[];       // exactly 5
  selectedAffirmationIds: string[]; // exactly 7
  onboardingComplete: boolean;
  currentStreak: number;
  lastOpenedDate: string; // YYYY-MM-DD
  notificationsEnabled: boolean;
  wakingHoursStart: number; // 8 = 8AM
  wakingHoursEnd: number;   // 20 = 8PM
  timezone: string;
}

interface AppStore extends UserPreferences {
  // Actions
  setSelectedSkills: (ids: string[]) => void;
  setSelectedAffirmations: (ids: string[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateStreak: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setWakingHours: (start: number, end: number) => void;
  setTimezone: (tz: string) => void;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedSkillIds: [],
      selectedAffirmationIds: [],
      onboardingComplete: false,
      currentStreak: 0,
      lastOpenedDate: '',
      notificationsEnabled: false,
      wakingHoursStart: 8,
      wakingHoursEnd: 20,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      setSelectedSkills: (ids) => set({ selectedSkillIds: ids }),
      setSelectedAffirmations: (ids) => set({ selectedAffirmationIds: ids }),

      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () => set({
        onboardingComplete: false,
        selectedSkillIds: [],
        selectedAffirmationIds: [],
      }),

      updateStreak: () => {
        const today = getTodayDateString();
        const { lastOpenedDate, currentStreak } = get();

        if (lastOpenedDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const newStreak = lastOpenedDate === yesterdayStr ? currentStreak + 1 : 1;
        set({ currentStreak: newStreak, lastOpenedDate: today });
      },

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setWakingHours: (start, end) => set({ wakingHoursStart: start, wakingHoursEnd: end }),
      setTimezone: (tz) => set({ timezone: tz }),
    }),
    {
      name: 'serenity-preferences',
    }
  )
);
