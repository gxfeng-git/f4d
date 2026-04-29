import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '../components/EmptyState';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { toDateLabel, todayIsoDate } from '../lib/date';
import { formatCurrency } from '../lib/format';
import { getLoanSummaries } from '../services/ledger';
import { useAppContext } from '../store/AppContext';

function parseInstallments(text: string): Array<{ dueDate: string; amount: number }> {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [dueDate, amount] = line.split(',').map((item) => item.trim());
      if (!dueDate || !amount || Number.isNaN(Number(amount))) {
        throw new Error('分期计划格式错误，请使用 YYYY-MM-DD,金额');
      }

      return { dueDate, amount: Number(amount) };
    });
}

export function LoansPage() {
  const { currentData, createLoanPlatformEntry, createLoanEntry, payLoanInstallmentEntry } = useAppContext();
  const [platformForm, setPlatformForm] = useState({ name: '', note: '' });
  const [loanForm, setLoanForm] = useState({
    platformId: '',
    title: '',
    principal: '',
    accountId: '',
    disbursedAt: todayIsoDate(),
    note: '',
    installments: ''
  });
  const [repaymentForm, setRepaymentForm] = useState({
    installmentId: '',
    accountId: '',
    amount: '',
    occurredAt: todayIsoDate(),
    note: ''
  });

  const summaries = currentData
    ? getLoanSummaries(currentData.loanRecords, currentData.loanInstallments, currentData.loanPlatforms)
    : [];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <PageHeading title="贷款" description="平台、放款与分期；扣款会写系统流水。" />
      </section>

      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="贷款平台" description="先建平台再录贷款。">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await createLoanPlatformEntry(platformForm);
                setPlatformForm({ name: '', note: '' });
              }}
            >
              <Input
                placeholder="平台名称"
                value={platformForm.name}
                onChange={(e) => setPlatformForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Textarea
                className="min-h-24"
                placeholder="备注（可选）"
                value={platformForm.note}
                onChange={(e) => setPlatformForm((p) => ({ ...p, note: e.target.value }))}
              />
              <Button type="submit" className="w-full rounded-lg sm:w-auto">
                新增平台
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="新增贷款" description="每行一个分期：YYYY-MM-DD,金额">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await createLoanEntry({
                  platformId: loanForm.platformId,
                  title: loanForm.title,
                  principal: Number(loanForm.principal),
                  accountId: loanForm.accountId,
                  disbursedAt: loanForm.disbursedAt,
                  note: loanForm.note,
                  installments: parseInstallments(loanForm.installments)
                });
                setLoanForm({
                  platformId: '',
                  title: '',
                  principal: '',
                  accountId: '',
                  disbursedAt: todayIsoDate(),
                  note: '',
                  installments: ''
                });
              }}
            >
              <Select
                value={
                  loanForm.platformId &&
                  currentData?.loanPlatforms.some((p) => p.id === loanForm.platformId)
                    ? loanForm.platformId
                    : undefined
                }
                onValueChange={(v) => setLoanForm((p) => ({ ...p, platformId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择平台" />
                </SelectTrigger>
                <SelectContent>
                  {currentData?.loanPlatforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="贷款标题"
                value={loanForm.title}
                onChange={(e) => setLoanForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="放款金额"
                value={loanForm.principal}
                onChange={(e) => setLoanForm((p) => ({ ...p, principal: e.target.value }))}
                required
              />
              <Select
                value={
                  loanForm.accountId &&
                  currentData?.accounts.some((a) => a.id === loanForm.accountId)
                    ? loanForm.accountId
                    : undefined
                }
                onValueChange={(v) => setLoanForm((p) => ({ ...p, accountId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="放款到账账户" />
                </SelectTrigger>
                <SelectContent>
                  {currentData?.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={loanForm.disbursedAt}
                onChange={(e) => setLoanForm((p) => ({ ...p, disbursedAt: e.target.value }))}
                required
              />
              <Textarea
                className="min-h-24"
                placeholder="分期计划，例如：2026-05-01,1200"
                value={loanForm.installments}
                onChange={(e) => setLoanForm((p) => ({ ...p, installments: e.target.value }))}
                required
              />
              <Textarea
                className="min-h-20"
                placeholder="备注（可选）"
                value={loanForm.note}
                onChange={(e) => setLoanForm((p) => ({ ...p, note: e.target.value }))}
              />
              <Button type="submit" variant="dark" className="w-full rounded-lg sm:w-auto">
                新增贷款
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="登记还款" description="可部分还款，写支出类流水。">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await payLoanInstallmentEntry({
                  installmentId: repaymentForm.installmentId,
                  accountId: repaymentForm.accountId,
                  amount: Number(repaymentForm.amount),
                  occurredAt: repaymentForm.occurredAt,
                  note: repaymentForm.note
                });
                setRepaymentForm({
                  installmentId: '',
                  accountId: '',
                  amount: '',
                  occurredAt: todayIsoDate(),
                  note: ''
                });
              }}
            >
              <Select
                value={
                  repaymentForm.installmentId &&
                  currentData?.loanInstallments.some((i) => i.id === repaymentForm.installmentId)
                    ? repaymentForm.installmentId
                    : undefined
                }
                onValueChange={(v) => setRepaymentForm((p) => ({ ...p, installmentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分期" />
                </SelectTrigger>
                <SelectContent>
                  {currentData?.loanInstallments
                    .filter((installment) => installment.paidAmount < installment.amount)
                    .map((installment) => (
                      <SelectItem key={installment.id} value={installment.id}>
                        {installment.dueDate} · 剩余 {formatCurrency(installment.amount - installment.paidAmount)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                value={
                  repaymentForm.accountId &&
                  currentData?.accounts.some((a) => a.id === repaymentForm.accountId)
                    ? repaymentForm.accountId
                    : undefined
                }
                onValueChange={(v) => setRepaymentForm((p) => ({ ...p, accountId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="扣款账户" />
                </SelectTrigger>
                <SelectContent>
                  {currentData?.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder="还款金额"
                value={repaymentForm.amount}
                onChange={(e) => setRepaymentForm((p) => ({ ...p, amount: e.target.value }))}
                required
              />
              <Input
                type="date"
                value={repaymentForm.occurredAt}
                onChange={(e) => setRepaymentForm((p) => ({ ...p, occurredAt: e.target.value }))}
                required
              />
              <Textarea
                className="min-h-20"
                placeholder="备注（可选）"
                value={repaymentForm.note}
                onChange={(e) => setRepaymentForm((p) => ({ ...p, note: e.target.value }))}
              />
              <Button type="submit" className="w-full rounded-lg sm:w-auto">
                登记还款
              </Button>
            </form>
          </SectionCard>
        </div>
      </section>

      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <SectionCard title="贷款列表" description="待还由分期与已还计算。">
          <div className="space-y-2.5">
            {summaries.length === 0 ? (
              <EmptyState>还没有贷款记录。</EmptyState>
            ) : (
              summaries.map((summary) => (
                <div key={summary.loan.id} className="ui-list-row !flex-col sm:!flex-row sm:!items-center">
                  <div>
                    <p className="font-medium">{summary.loan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {summary.platform?.name ?? '未命名平台'} · 放款 {toDateLabel(summary.loan.disbursedAt)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-display font-semibold tabular-nums">待还 {formatCurrency(summary.outstanding)}</p>
                    <p className="text-xs text-muted-foreground">
                      共 {summary.installmentCount} 期 · 余 {summary.unpaidCount} 期未还
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
