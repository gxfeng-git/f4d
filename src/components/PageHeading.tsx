import type { ReactNode } from 'react';

interface PageHeadingProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeading({ title, description, actions }: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Ledger PWA</p>
        <h1 className="font-serif text-3xl font-bold text-base-content md:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-base-content/70">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
