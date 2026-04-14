import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import AppShell from './components/AppShell';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import BreathePage from './pages/BreathePage';
import BedtimePage from './pages/BedtimePage';
import SettingsPage from './pages/SettingsPage';
import JournalPage from './pages/JournalPage';
import AnalyticsPage from './pages/AnalyticsPage';
import JournalAnalyticsPage from './pages/JournalAnalyticsPage';
import BreatheAnalyticsPage from './pages/BreatheAnalyticsPage';
import { initGlobalButtonSounds } from './utils/audio';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="page-transition-wrapper"
    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const { onboardingComplete, updateStreak } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  useEffect(() => {
    const cleanup = initGlobalButtonSounds();
    return cleanup;
  }, []);

  if (!onboardingComplete) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/journal" element={<PageTransition><JournalPage /></PageTransition>} />
          <Route path="/journal-analytics" element={<PageTransition><JournalAnalyticsPage /></PageTransition>} />
          <Route path="/timeline" element={<PageTransition><TimelinePage /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/breathe-analytics" element={<PageTransition><BreatheAnalyticsPage /></PageTransition>} />
          <Route path="/breathe" element={<PageTransition><BreathePage /></PageTransition>} />
          <Route path="/bedtime" element={<PageTransition><BedtimePage /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  );
}
