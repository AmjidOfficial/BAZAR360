import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Restore real URL path if redirected by GitHub Pages 404.html before React starts rendering
const queryParams = new URLSearchParams(window.location.search);
const redirectPath = queryParams.get('p');
if (redirectPath) {
  let cleanPath = '/' + redirectPath.replace(/~and~/g, '&');
  const redirectSearch = queryParams.get('q');
  if (redirectSearch) {
    cleanPath += '?' + redirectSearch.replace(/~and~/g, '&');
  }
  cleanPath += window.location.hash;
  try {
    window.history.replaceState(null, '', cleanPath);
  } catch (e) {
    console.warn('URL restoration bypassed in main.tsx:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

// Register Progressive Web App Service Worker ONLY in production
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('BAZAR360 PWA Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.error('BAZAR360 PWA Service Worker registration failed:', err);
        });
    });
  } else {
    // In dev mode, unregister any existing service workers to avoid stale caching and Firestore interception issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Stale Dev Service Worker unregistered successfully');
          }
        });
      }
    });
  }
}

