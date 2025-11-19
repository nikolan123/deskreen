

import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { i18nPromise } from './config/i18n';
import App from './App.tsx'
import { AppContextProvider } from './providers/AppContextProvider';
import LoadingScreen from './components/LoadingScreen';

// Wait for i18n to be ready before rendering
i18nPromise
  .then(() => {
    console.log('[i18n] Translations loaded successfully');
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <Suspense fallback={<LoadingScreen />}>
          <AppContextProvider>

            <App />
          </AppContextProvider>
        </Suspense>
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error('[i18n] Failed to load translations:', error);
    // Render anyway to avoid blank screen
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <Suspense fallback={<LoadingScreen />}>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </Suspense>
      </StrictMode>,
    )
  });
