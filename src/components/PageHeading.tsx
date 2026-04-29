import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface PageHeadingProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeading({ title, description, actions }: PageHeadingProps) {
  return (
    <div className="mb-2 space-y-4 pb-6 last:mb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">工作区</p>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px] md:text-[40px]">
            {title}
          </h1>
          <p className="max-w-2xl text-[17px] leading-relaxed text-[#6e6e73] dark:text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      <Separator className="bg-border" />
    </div>
  );
}
