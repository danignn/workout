import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the service worker so the app opens offline once installed.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .then((reg) => {
        // An installed app can sit on an old worker for a long time, which is
        // how it ends up missing features the new build depends on. Check for
        // a newer one on every launch and again hourly.
        reg.update().catch(() => undefined);
        window.setInterval(() => reg.update().catch(() => undefined), 60 * 60 * 1000);
      })
      .catch(() => {
        /* Offline support is a bonus; the app works without it. */
      });

    // When a new worker takes over, reload once so the page is served by it.
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  });
}
