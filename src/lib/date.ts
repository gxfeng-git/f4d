export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toDateTimeLabel(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function toDateLabel(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

export function compareDateAsc(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime();
}
