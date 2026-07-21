import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { StoreProvider } from './lib/store';
import { loadUiPrefs } from './lib/uiPrefs';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LogScreen } from './screens/LogScreen';
import { MomentsScreen } from './screens/MomentsScreen';
import { MoveScreen } from './screens/MoveScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ResourcesScreen } from './screens/ResourcesScreen';
import { YouScreen } from './screens/YouScreen';
import './styles/app.css';

function Gate({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(true);

  useEffect(() => {
    const p = loadUiPrefs();
    setOnboardingDone(p.onboardingDone);
    setReady(true);
  }, [loc.pathname]);

  if (!ready) return null;

  const bypass = loc.pathname === '/onboarding' || loc.pathname === '/auth';
  if (!onboardingDone && !bypass) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function ShellRoutes() {
  const loc = useLocation();
  return (
    <AppShell path={loc.pathname}>
      <Gate>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/log" element={<LogScreen />} />
          <Route path="/move" element={<MoveScreen />} />
          <Route path="/moments" element={<MomentsScreen />} />
          <Route path="/you" element={<YouScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
          <Route path="/resources" element={<ResourcesScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Gate>
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ShellRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
