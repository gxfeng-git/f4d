import { getInstallmentMap, getMonthMatrix } from '../services/ledger';
import type { LoanInstallment } from '../types/models';

interface MonthCalendarProps {
  installments: LoanInstallment[];
}

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];

export function MonthCalendar({ installments }: MonthCalendarProps) {
  const now = new Date();
  const matrix = getMonthMatrix(now);
  const installmentMap = getInstallmentMap(installments);
  const todayIso = now.toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73] dark:text-muted-foreground sm:gap-2">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {matrix.flat().map((date) => {
          const isoDate = date.toISOString().slice(0, 10);
          const dayInstallments = installmentMap.get(isoDate) ?? [];
          const isCurrentMonth = date.getMonth() === now.getMonth();
          const isToday = isoDate === todayIso;

          return (
            <div
              key={isoDate}
              className={`flex min-h-[5.5rem] flex-col rounded-lg border p-1.5 sm:min-h-24 sm:p-2 ${
                isToday
                  ? 'border-primary bg-background ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : isCurrentMonth
                    ? 'border-[#d2d2d7] bg-[#fafafc] dark:border-[#424245] dark:bg-[#272729]'
                    : 'border-[#d2d2d7]/50 bg-muted/30 opacity-75 dark:border-[#424245]/50'
              }`}
            >
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground sm:mb-1.5 sm:text-xs">
                <span className="inline-flex items-center justify-center">
                  {isToday ? (
                    <span
                      className="flex h-2 w-2 rounded-full bg-primary"
                      title="今天"
                      aria-label="今天"
                    />
                  ) : null}
                  <span
                    className={`ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md ${isToday ? 'font-semibold text-primary' : ''}`}
                  >
                    {date.getDate()}
                  </span>
                </span>
                {dayInstallments.length > 0 ? (
                  <span className="rounded bg-primary/15 px-1 font-mono text-[9px] font-semibold text-primary sm:text-[10px]">
                    {dayInstallments.length}
                  </span>
                ) : null}
              </div>
              <div className="mt-auto space-y-0.5">
                {dayInstallments.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="truncate rounded-md bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary sm:px-1.5 sm:text-[10px]"
                    title={item.amount - item.paidAmount > 0 ? `待还 ${item.amount - item.paidAmount}` : '已还清'}
                  >
                    {item.amount - item.paidAmount > 0 ? `待还 ${item.amount - item.paidAmount}` : '已还清'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
