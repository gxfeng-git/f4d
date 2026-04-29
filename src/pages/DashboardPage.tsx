import { MonthCalendar } from '../components/MonthCalendar';
import { EmptyState } from '../components/EmptyState';
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
      <div className="flex flex-col gap-4">
        <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
          <PageHeading
            title="空状态"
            description="还没有激活的数据源。请先在「数据源」页面创建或导入一个账本。"
          />
        </section>
        <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
          <EmptyState>创建或导入数据源后即可查看看板与统计。</EmptyState>
        </section>
      </div>
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
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <PageHeading
          title={currentSource.name}
          description="当前看板仅基于已激活数据源计算，不会与其他数据源混算。"
        />

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <StatCard
            variant="success"
            label="账户总余额"
            value={formatCurrency(totalBalance)}
            helper={`${accountBalances.length} 个账户`}
          />
          <StatCard
            variant="warning"
            label="借款未结清"
            value={formatCurrency(totalDebtOutstanding)}
            helper={`${debtSummaries.filter((item) => item.outstanding > 0).length} 笔未结清`}
          />
          <StatCard
            variant="info"
            label="贷款待还"
            value={formatCurrency(totalLoanOutstanding)}
            helper={`${upcoming.length} 笔未来分期`}
          />
        </div>
      </section>

      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
          <SectionCard title="本月还款日历" description="未结清贷款分期的应还日。">
            <MonthCalendar installments={upcoming} />
          </SectionCard>

          <SectionCard title="余额预测" description="由当前总余额与贷款计划粗略推算。">
            <div className="space-y-2.5">
              {forecast.length === 0 ? (
                <EmptyState>暂无未来还款计划。</EmptyState>
              ) : (
                forecast.map((row) => (
                  <div key={`${row.date}-${row.label}`} className="ui-tile flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{toDateLabel(row.date)}</p>
                    </div>
                    <p className="font-display text-lg font-semibold tabular-nums">{formatCurrency(row.projectedBalance)}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="账户余额" description="由流水回算，改余额会生成系统流水。">
            <div className="space-y-2.5">
              {accountBalances.length === 0 ? (
                <EmptyState>还没有账户。</EmptyState>
              ) : (
                accountBalances.map((row) => (
                  <div key={row.account.id} className="ui-list-row !flex-row !items-center">
                    <div>
                      <p className="font-medium">{row.account.name}</p>
                      <p className="text-xs text-muted-foreground">{row.account.type}</p>
                    </div>
                    <p className="font-display text-lg font-semibold tabular-nums">{formatCurrency(row.balance)}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="近期待还" description="按到期日排序的贷款分期。">
            <div className="space-y-2.5">
              {upcoming.length === 0 ? (
                <EmptyState>近期没有待还分期。</EmptyState>
              ) : (
                upcoming.slice(0, 6).map((item) => (
                  <div key={item.id} className="ui-list-row !flex-row !items-start">
                    <div>
                      <p className="font-medium">{item.loanTitle}</p>
                      <p className="text-xs text-muted-foreground">{item.platformName}</p>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="font-display font-semibold tabular-nums">{formatCurrency(item.amount - item.paidAmount)}</p>
                      <p className="text-xs text-muted-foreground">{toDateLabel(item.dueDate)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
