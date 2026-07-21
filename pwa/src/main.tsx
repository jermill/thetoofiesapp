import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { hydrateThemeFromPrefs } from './lib/uiPrefs';

hydrateThemeFromPrefs();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
