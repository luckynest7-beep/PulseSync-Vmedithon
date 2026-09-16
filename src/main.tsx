import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Auto-applies new deploys: without this, a previously-visited PWA can keep
// serving a stale cached build indefinitely since the browser only checks
// for service worker updates sporadically on navigation.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    registration && setInterval(() => registration.update(), 60 * 60 * 1000);
  },
  onNeedRefresh() {
    updateSW(true);
  },
});
