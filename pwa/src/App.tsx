import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { StoreProvider } from './lib/store';
import { HomeScreen } from './screens/HomeScreen';
import { LogScreen } from './screens/LogScreen';
import { YouScreen } from './screens/YouScreen';
import './styles/app.css';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/log" element={<LogScreen />} />
            <Route path="/you" element={<YouScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </StoreProvider>
  );
}
