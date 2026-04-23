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

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-base-content/60">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {matrix.flat().map((date) => {
          const isoDate = date.toISOString().slice(0, 10);
          const dayInstallments = installmentMap.get(isoDate) ?? [];
          const isCurrentMonth = date.getMonth() === now.getMonth();

          return (
            <div
              key={isoDate}
              className={`min-h-24 rounded-2xl border p-2 ${
                isCurrentMonth ? 'border-base-300 bg-base-200/40' : 'border-base-200 bg-base-200/10'
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-xs text-base-content/70">
                <span>{date.getDate()}</span>
                {dayInstallments.length > 0 ? (
                  <span className="badge badge-primary badge-outline badge-sm">{dayInstallments.length}</span>
                ) : null}
              </div>
              <div className="space-y-1">
                {dayInstallments.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-xl bg-primary/10 px-2 py-1 text-[11px] text-primary">
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
