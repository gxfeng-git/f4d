import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/app.css';
import { AppProvider } from './store/AppContext';

function normalizeLegacyRepoPrefixPath(): void {
  const isGithubIoHost = window.location.hostname.endsWith('.github.io');
  if (isGithubIoHost) {
    return;
  }

  const legacyPrefix = '/f4d';
  const { pathname, search, hash } = window.location;
  if (pathname === legacyPrefix || pathname.startsWith(`${legacyPrefix}/`)) {
    const normalizedPath = pathname.slice(legacyPrefix.length) || '/';
    window.history.replaceState(null, '', `${normalizedPath}${search}${hash}`);
  }
}

function restoreRedirectedPath(): void {
  const url = new URL(window.location.href);
  const redirected = url.searchParams.get('redirect');

  if (!redirected) {
    return;
  }

  try {
    const decoded = decodeURIComponent(redirected);
    const isGithubIoHost = window.location.hostname.endsWith('.github.io');
    const normalizedDecoded = !isGithubIoHost && (decoded === '/f4d' || decoded.startsWith('/f4d/'))
      ? decoded.slice('/f4d'.length) || '/'
      : decoded;
    window.history.replaceState(null, '', normalizedDecoded);
  } catch {
    url.searchParams.delete('redirect');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

normalizeLegacyRepoPrefixPath();
restoreRedirectedPath();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
