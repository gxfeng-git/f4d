/** Inline SVGs, currentColor, 1em baseline */
const icon = 'h-[1.15em] w-[1.15em] shrink-0 opacity-80';

export function IconDashboard() {
  return (
    <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1.2" />
      <rect x="14" y="3" width="7" height="5" rx="1.2" />
      <rect x="14" y="11" width="7" height="10" rx="1.2" />
      <rect x="3" y="15" width="7" height="6" rx="1.2" />
    </svg>
  );
}

export function IconWallet() {
  return (
    <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 6a2 2 0 0 1 2-2h10l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
      <path d="M18 8h-6a2 2 0 0 0 0 4h6" />
    </svg>
  );
}

export function IconHandshake() {
  return (
    <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M8 11V8.5A2.5 2.5 0 0 1 10.5 6h.5" />
      <path d="M16 11V8.5A2.5 2.5 0 0 0 13.5 6H13" />
      <path d="M3 15l2.5-2.5a2 2 0 0 1 2.3-.4l.7.3a2 2 0 0 0 1.2 0l.8-.2a2 2 0 0 1 1.5.2l1.5 1" />
      <path d="M20 20v-2a3 3 0 0 0-1-2.2L17 15" />
    </svg>
  );
}

export function IconBuilding() {
  return (
    <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 20h18" />
      <path d="M5 20V6a1 1 0 0 1 1-1h5v15" />
      <path d="M19 9v11" />
      <rect x="14" y="9" width="5" height="3" />
      <rect x="7" y="8" width="2" height="2" />
      <rect x="7" y="12" width="2" height="2" />
    </svg>
  );
}

export function IconReceipt() {
  return (
    <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 3h9l3 3v16l-2-1-2 1-2-1-2 1-2-1-2 1-2-1V3Z" />
      <path d="M8 7h6M8 11h6M8 15h4" />
    </svg>
  );
}

export function IconDatabase() {
  return (
    <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5" />
      <path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" />
    </svg>
  );
}

export function IconAppMark() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect width="36" height="36" rx="10" className="fill-primary" />
      <path
        d="M11 10.5h8.2a3.2 3.2 0 0 1 0 6.4H11V10.5Zm0 7.8h9.1a2.8 2.8 0 1 1 0 5.6H11v-5.6Z"
        className="fill-primary-content"
      />
      <path d="M23.5 11.5h4v13h-4v-13Z" className="fill-primary-content" opacity="0.85" />
    </svg>
  );
}
