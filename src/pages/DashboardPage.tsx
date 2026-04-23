import { MonthCalendar } from '../components/MonthCalendar';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { toDateLabel } from '../lib/date';
import { formatCurrency } from '../lib/format';
import { getAccountBalances, getDebtSummaries, getForecastRows, getLoanSummaries, getUpcomingInstallments } from '../services/ledger';
import { useAppContext } from '../store/AppContext';

export function DashboardPage() {
  const { currentData, currentSource } = useAppContext();

  if (!currentData || !currentSource) {
    return (
      <PageHeading
        title="空状态"
        description="还没有激活的数据源。请先在“数据源”页面创建或导入一个账本。"
      />
    );
  }

  const accountBalances = getAccountBalances(currentData.accounts, currentData.transactions);
  const debtSummaries = getDebtSummaries(currentData.debtRecords, currentData.debtRepayments);
  const loanSummaries = getLoanSummaries(currentData.loanRecords, currentData.loanInstallments, currentData.loanPlatforms);
  const upcoming = getUpcomingInstallments(currentData.loanInstallments, currentData.loanRecords, currentData.loanPlatforms);
  const forecast = getForecastRows(currentData);

  const totalBalance = accountBalances.reduce((sum, item) => sum + item.balance, 0);
  const totalDebtOutstanding = debtSummaries.reduce((sum, item) => sum + item.outstanding, 0);
  const totalLoanOutstanding = loanSummaries.reduce((sum, item) => sum + item.outstanding, 0);

  return (
    <div className="space-y-6">
      <PageHeading
        title={currentSource.name}
        description="当前看板完全基于已激活数据源计算，账户余额、借款、贷款与未来还款计划不会和其他数据源串联。"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="账户总余额" value={formatCurrency(totalBalance)} helper={`${accountBalances.length} 个账户`} />
        <StatCard
          label="借款往来未结清"
          value={formatCurrency(totalDebtOutstanding)}
          helper={`${debtSummaries.filter((item) => item.outstanding > 0).length} 笔未结清`}
        />
        <StatCard
          label="贷款待还"
          value={formatCurrency(totalLoanOutstanding)}
          helper={`${upcoming.length} 笔未来分期`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard title="本月还款日历" description="仅展示当前数据源中未结清的贷款还款计划。">
          <MonthCalendar installments={upcoming} />
        </SectionCard>

        <SectionCard title="余额预测" description="基于当前账户总余额与未来贷款还款计划进行简单预测。">
          <div className="space-y-3">
            {forecast.length === 0 ? (
              <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">暂无未来还款计划。</div>
            ) : (
              forecast.map((row) => (
                <div key={`${row.date}-${row.label}`} className="rounded-2xl border border-base-200 bg-base-200/40 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{row.label}</p>
                      <p className="text-sm text-base-content/60">{toDateLabel(row.date)}</p>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(row.projectedBalance)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="账户余额" description="余额完全由流水回算，直接改余额会生成系统流水。">
          <div className="space-y-3">
            {accountBalances.length === 0 ? (
              <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">还没有账户。</div>
            ) : (
              accountBalances.map((row) => (
                <div key={row.account.id} className="flex items-center justify-between rounded-2xl border border-base-200 p-4">
                  <div>
                    <p className="font-medium">{row.account.name}</p>
                    <p className="text-sm text-base-content/60">{row.account.type}</p>
                  </div>
                  <p className="text-lg font-semibold">{formatCurrency(row.balance)}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="近期待处理事项" description="优先展示即将到期的贷款分期。">
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">近期没有待还分期。</div>
            ) : (
              upcoming.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-2xl border border-base-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.loanTitle}</p>
                      <p className="text-sm text-base-content/60">{item.platformName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.amount - item.paidAmount)}</p>
                      <p className="text-sm text-base-content/60">{toDateLabel(item.dueDate)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
