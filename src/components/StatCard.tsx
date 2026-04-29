import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatVariant = 'default' | 'success' | 'warning' | 'info';

const accentBar: Record<StatVariant, string> = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info'
};

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  variant?: StatVariant;
}

export function StatCard({ label, value, helper, icon, variant = 'default' }: StatCardProps) {
  const bar = accentBar[variant];
  return (
    <Card className="relative overflow-hidden rounded-[18px] border-[#d2d2d7] shadow-none dark:border-[#424245]">
      <span
        className={cn('absolute top-0 left-0 h-full w-1 rounded-l-[18px]', bar)}
        aria-hidden
      />
      <CardContent className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-semibold tracking-[0.08em] text-[#6e6e73] uppercase dark:text-muted-foreground">
              {label}
            </p>
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
              {value}
            </p>
            {helper ? <p className="text-xs text-[#6e6e73] dark:text-muted-foreground">{helper}</p> : null}
          </div>
          {icon ? <div className="shrink-0 text-primary">{icon}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
