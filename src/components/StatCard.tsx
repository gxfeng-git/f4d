import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-base-200 bg-base-100/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/55">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {helper ? <p className="text-sm text-base-content/65">{helper}</p> : null}
        </div>
        {icon ? <div className="text-primary">{icon}</div> : null}
      </div>
    </div>
  );
}
