import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { EmptyState } from '../components/EmptyState';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { toDateLabel, todayIsoDate } from '../lib/date';
import { formatCurrency } from '../lib/format';
import { getDebtSummaries } from '../services/ledger';
import { useAppContext } from '../store/AppContext';

export function DebtsPage() {
  const { currentData, createDebtEntry, repayDebtEntry } = useAppContext();
  const [createForm, setCreateForm] = useState({
    personName: '',
    kind: 'borrowed' as 'borrowed' | 'lent',
    principal: '',
    accountId: '',
    startedAt: todayIsoDate(),
    note: ''
  });
  const [repaymentForm, setRepaymentForm] = useState({
    debtRecordId: '',
    accountId: '',
    amount: '',
    occurredAt: todayIsoDate(),
    note: ''
  });

  const summaries = currentData ? getDebtSummaries(currentData.debtRecords, currentData.debtRepayments) : [];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <PageHeading title="借款" description="记借入/借出，并生成影响账户的流水。" />
      </section>

      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="新增借款" description="借入入账、借出扣账。">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await createDebtEntry({
                  personName: createForm.personName,
                  kind: createForm.kind,
                  principal: Number(createForm.principal),
                  accountId: createForm.accountId,
                  startedAt: createForm.startedAt,
                  note: createForm.note
                });
                setCreateForm({
                  personName: '',
                  kind: 'borrowed',
                  principal: '',
                  accountId: '',
                  startedAt: todayIsoDate(),
                  note: ''
                });
              }}
            >
              <Input
                placeholder="对方名称"
                value={createForm.personName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, personName: event.target.value }))}
                required
              />
              <Select
                value={createForm.kind}
                onValueChange={(v) => setCreateForm((prev) => ({ ...prev, kind: v as 'borrowed' | 'lent' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrowed">向他人借入</SelectItem>
                  <SelectItem value="lent">借给他人</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder="本金"
                value={createForm.principal}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, principal: event.target.value }))}
                required
              />
              <Select
                value={
                  createForm.accountId &&
                  currentData?.accounts.some((a) => a.id === createForm.accountId)
                    ? createForm.accountId
                    : undefined
                }
                onValueChange={(v) => setCreateForm((prev) => ({ ...prev, accountId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择账户" />
                </SelectTrigger>
                <SelectContent>
                  {currentData?.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DatePicker
                value={createForm.startedAt}
                onChange={(v) => setCreateForm((prev) => ({ ...prev, startedAt: v }))}
              />
              <Textarea className="min-h-24" placeholder="备注（可选）" value={createForm.note} onChange={(e) => setCreateForm((p) => ({ ...p, note: e.target.value }))} />
              <Button type="submit" className="w-full rounded-lg sm:w-auto">
                新增记录
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="登记还款" description="可部分还款，保留未结清。">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await repayDebtEntry({
                  debtRecordId: repaymentForm.debtRecordId,
                  accountId: repaymentForm.accountId,
                  amount: Number(repaymentForm.amount),
                  occurredAt: repaymentForm.occurredAt,
                  note: repaymentForm.note
                });
                setRepaymentForm({
                  debtRecordId: '',
                  accountId: '',
                  amount: '',
                  occurredAt: todayIsoDate(),
                  note: ''
                });
              }}
            >
              <Select
                value={
                  repaymentForm.debtRecordId &&
                  summaries.some((s) => s.record.id === repaymentForm.debtRecordId)
                    ? repaymentForm.debtRecordId
                    : undefined
                }
                onValueChange={(v) => setRepaymentForm((p) => ({ ...p, debtRecordId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择借款记录" />
                </SelectTrigger>
                <SelectContent>
                  {summaries.map((summary) => (
                    <SelectItem key={summary.record.id} value={summary.record.id}>
                      {summary.record.personName} · 剩余 {formatCurrency(summary.outstanding)}
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
                  <SelectValue placeholder="选择账户" />
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
              <DatePicker
                value={repaymentForm.occurredAt}
                onChange={(v) => setRepaymentForm((p) => ({ ...p, occurredAt: v }))}
              />
              <Textarea className="min-h-24" placeholder="备注（可选）" value={repaymentForm.note} onChange={(e) => setRepaymentForm((p) => ({ ...p, note: e.target.value }))} />
              <Button type="submit" variant="dark" className="w-full rounded-lg sm:w-auto">
                登记还款
              </Button>
            </form>
          </SectionCard>
        </div>
      </section>

      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <SectionCard title="借款列表" description="按剩余未结清展示。">
          <div className="space-y-2.5">
            {summaries.length === 0 ? (
              <EmptyState>还没有借款记录。</EmptyState>
            ) : (
              summaries.map((summary) => (
                <div key={summary.record.id} className="ui-list-row !flex-col sm:!flex-row sm:!items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{summary.record.personName}</p>
                      <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide">
                        {summary.record.kind === 'borrowed' ? '借入' : '借出'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{toDateLabel(summary.record.startedAt)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-display font-semibold tabular-nums">剩余 {formatCurrency(summary.outstanding)}</p>
                    <p className="text-xs text-muted-foreground">
                      本金 {formatCurrency(summary.record.principal)} · 已还 {formatCurrency(summary.repaid)}
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
