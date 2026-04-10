import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import AppShell from './components/AppShell';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import BreathePage from './pages/BreathePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { onboardingComplete, updateStreak } = useAppStore();

  useEffect(() => {
    updateStreak();
  }, []);

  if (!onboardingComplete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/breathe" element={<BreathePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        }
      />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
