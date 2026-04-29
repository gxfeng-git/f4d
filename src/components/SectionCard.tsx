import type { PropsWithChildren, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionCardProps extends PropsWithChildren {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionCard({ title, description, action, children }: SectionCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-[#d2d2d7] shadow-none dark:border-[#424245]">
      <CardHeader className="border-b border-[#d2d2d7] bg-card py-4 sm:px-6 sm:py-5 dark:border-[#424245]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-[19px] font-semibold tracking-tight">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-[17px] leading-relaxed text-[#6e6e73] dark:text-muted-foreground">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:px-6 sm:py-5">{children}</CardContent>
    </Card>
  );
}
