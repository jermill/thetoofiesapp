import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { LoadSplash } from './components/LoadSplash';
import { PageTransition } from './components/PageTransition';
import { ToastProvider } from './components/Toast';
import { StoreProvider, useStore } from './lib/store';
import { loadUiPrefs } from './lib/uiPrefs';
import { AuthScreen } from './screens/AuthScreen';
import { BuddiesScreen } from './screens/BuddiesScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LogScreen } from './screens/LogScreen';
import { MomentsScreen } from './screens/MomentsScreen';
import { MoveScreen } from './screens/MoveScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RecapScreen } from './screens/RecapScreen';
import { ResourcesScreen } from './screens/ResourcesScreen';
import { WidgetScreen } from './screens/WidgetScreen';
import { YouScreen } from './screens/YouScreen';
import './styles/app.css';

function Gate({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [authGateDone, setAuthGateDone] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(true);

  useEffect(() => {
    const p = loadUiPrefs();
    setAuthGateDone(p.authGateDone);
    setOnboardingDone(p.onboardingDone);
  }, [loc.pathname]);

  const onAuth = loc.pathname === '/auth';
  const onOnboarding = loc.pathname === '/onboarding';

  // Account first, then onboarding — never the reverse.
  if (!authGateDone && !onAuth) {
    return <Navigate to="/auth" replace />;
  }
  if (authGateDone && !onboardingDone && !onOnboarding && !onAuth) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function BootGate({ children }: { children: React.ReactNode }) {
  const { ready: storeReady } = useStore();
  const [prefsReady, setPrefsReady] = useState(false);
  const [minSplashDone, setMinSplashDone] = useState(false);
  const [mascotReady, setMascotReady] = useState(false);

  useEffect(() => {
    loadUiPrefs();
    setPrefsReady(true);
  }, []);

  // Hold splash long enough to see Toofie walk (~2 cycles at 10fps).
  useEffect(() => {
    if (!mascotReady) return;
    const t = window.setTimeout(() => setMinSplashDone(true), 1600);
    return () => window.clearTimeout(t);
  }, [mascotReady]);

  // Safety: don't block forever if image fails
  useEffect(() => {
    const t = window.setTimeout(() => {
      setMascotReady(true);
      setMinSplashDone(true);
    }, 4000);
    return () => window.clearTimeout(t);
  }, []);

  if (!storeReady || !prefsReady || !minSplashDone) {
    return (
      <LoadSplash
        label="Warming up the bakery…"
        onReady={() => setMascotReady(true)}
      />
    );
  }

  return <>{children}</>;
}

function ShellRoutes() {
  const loc = useLocation();
  return (
    <BootGate>
      <AppShell path={loc.pathname}>
        <Gate>
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/log" element={<LogScreen />} />
              <Route path="/move" element={<MoveScreen />} />
              <Route path="/buddies" element={<BuddiesScreen />} />
              <Route path="/moments" element={<MomentsScreen />} />
              <Route path="/you" element={<YouScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/recap" element={<RecapScreen />} />
              <Route path="/widget" element={<WidgetScreen />} />
              <Route path="/privacy" element={<PrivacyScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/notifications" element={<NotificationsScreen />} />
              <Route path="/resources" element={<ResourcesScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </Gate>
      </AppShell>
    </BootGate>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <ShellRoutes />
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
