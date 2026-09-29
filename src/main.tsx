import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global protection against third-party browser extension errors (MetaMask, Phantom, etc.)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason ? (event.reason.message || String(event.reason) || '') : '';
    if (
      typeof reason === 'string' &&
      (reason.includes('MetaMask') ||
       reason.includes('metamask') ||
       reason.includes('ethereum') ||
       reason.includes('chrome-extension://') ||
       reason.includes('moz-extension://'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('error', (event) => {
    const msg = event.message || (event.error && event.error.message) || '';
    const filename = event.filename || '';
    if (
      (typeof msg === 'string' && (msg.includes('MetaMask') || msg.includes('metamask') || msg.includes('ethereum'))) ||
      filename.includes('chrome-extension://') ||
      filename.includes('moz-extension://')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
