import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { EmptyState } from '../components/EmptyState';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { toDateLabel, todayIsoDate } from '../lib/date';
import { formatSignedCurrency } from '../lib/format';
import { useAppContext } from '../store/AppContext';

export function TransactionsPage() {
  const { currentData, createManualTransactionEntry } = useAppContext();
  const [form, setForm] = useState({
    accountId: '',
    title: '',
    amount: '',
    direction: 'out' as 'in' | 'out',
    occurredAt: todayIsoDate(),
    note: ''
  });

  const transactions = [...(currentData?.transactions ?? [])].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt)
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <PageHeading title="流水" description="手工与系统流水均在此；金额仅影响当前数据源。" />
      </section>

      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
        <SectionCard title="新增手工流水" description="收入为流入，支出为流出。">
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              await createManualTransactionEntry({
                accountId: form.accountId,
                title: form.title,
                amount: Number(form.amount),
                direction: form.direction,
                occurredAt: form.occurredAt,
                note: form.note
              });
              setForm({
                accountId: '',
                title: '',
                amount: '',
                direction: 'out',
                occurredAt: todayIsoDate(),
                note: ''
              });
            }}
          >
            <Select
              value={
                form.accountId && currentData?.accounts.some((a) => a.id === form.accountId)
                  ? form.accountId
                  : undefined
              }
              onValueChange={(v) => setForm((p) => ({ ...p, accountId: v }))}
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
              placeholder="标题"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="金额"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
            <Select
              value={form.direction}
              onValueChange={(v) => setForm((prev) => ({ ...prev, direction: v as 'in' | 'out' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">收入</SelectItem>
                <SelectItem value="out">支出</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker
              value={form.occurredAt}
              onChange={(v) => setForm((prev) => ({ ...prev, occurredAt: v }))}
            />
            <Input
              className="md:col-span-2"
              placeholder="备注（可选）"
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <Button type="submit" className="w-full rounded-lg md:col-span-2">
              新增流水
            </Button>
          </form>
        </SectionCard>
      </section>

      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <SectionCard title="流水列表" description="系统类流水会标注「系统」。">
          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <EmptyState>暂无流水。</EmptyState>
            ) : (
              transactions.map((transaction) => {
                const account = currentData?.accounts.find((item) => item.id === transaction.accountId);
                return (
                  <div
                    key={transaction.id}
                    className="ui-list-row !flex-col !items-stretch gap-2 sm:!flex-row sm:!items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{transaction.title}</p>
                        {transaction.isSystem ? (
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            系统
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {account?.name ?? '未知'} · {toDateLabel(transaction.occurredAt)}
                      </p>
                      {transaction.note ? <p className="mt-1 text-[17px] text-muted-foreground">{transaction.note}</p> : null}
                    </div>
                    <p
                      className={`font-display shrink-0 text-lg font-semibold tabular-nums ${
                        transaction.amountDelta >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {formatSignedCurrency(transaction.amountDelta)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
