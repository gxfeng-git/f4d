export function getBaseUrl(): string {
  return import.meta.env.BASE_URL;
}

export function getStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}
