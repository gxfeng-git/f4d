import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  children: ReactNode;
  className?: string;
}

export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-dashed border-[#d2d2d7] bg-[#f5f5f7] px-4 py-10 text-center text-[17px] leading-relaxed text-[#6e6e73] dark:border-[#424245] dark:bg-[#272729] dark:text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
