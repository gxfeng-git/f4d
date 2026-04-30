import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/app.css';
import { AppProvider } from './store/AppContext';

function restoreRedirectedPath(): void {
  const url = new URL(window.location.href);
  const redirected = url.searchParams.get('redirect');

  if (!redirected) {
    return;
  }

  try {
    const decoded = decodeURIComponent(redirected);
    window.history.replaceState(null, '', decoded);
  } catch {
    url.searchParams.delete('redirect');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

restoreRedirectedPath();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
