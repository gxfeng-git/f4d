import { useState } from 'react';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { toDateLabel } from '../lib/date';
import { formatSignedCurrency } from '../lib/format';
import { todayIsoDate } from '../lib/date';
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

  const transactions = [...(currentData?.transactions ?? [])].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

  return (
    <div className="space-y-6">
      <PageHeading title="流水" description="手工记账与系统流水都会汇总在这里，所有金额都只作用于当前激活的数据源。" />

      <SectionCard title="新增手工流水" description="收入记为正向流入，支出记为负向流出。">
        <form
          className="grid gap-4 md:grid-cols-2"
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
          <select
            className="select select-bordered"
            value={form.accountId}
            onChange={(event) => setForm((prev) => ({ ...prev, accountId: event.target.value }))}
            required
          >
            <option value="" disabled>
              选择账户
            </option>
            {currentData?.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <input
            className="input input-bordered"
            placeholder="流水标题"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <input
            className="input input-bordered"
            type="number"
            step="0.01"
            placeholder="金额"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            required
          />
          <select
            className="select select-bordered"
            value={form.direction}
            onChange={(event) => setForm((prev) => ({ ...prev, direction: event.target.value as 'in' | 'out' }))}
          >
            <option value="in">收入</option>
            <option value="out">支出</option>
          </select>
          <input
            className="input input-bordered"
            type="date"
            value={form.occurredAt}
            onChange={(event) => setForm((prev) => ({ ...prev, occurredAt: event.target.value }))}
            required
          />
          <input
            className="input input-bordered"
            placeholder="备注（可选）"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
          <button className="btn btn-primary md:col-span-2">新增流水</button>
        </form>
      </SectionCard>

      <SectionCard title="流水列表" description="系统生成的借款、贷款和余额调整流水会带有系统标记。">
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">暂无流水。</div>
          ) : (
            transactions.map((transaction) => {
              const account = currentData?.accounts.find((item) => item.id === transaction.accountId);
              return (
                <div key={transaction.id} className="rounded-2xl border border-base-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{transaction.title}</p>
                        {transaction.isSystem ? <span className="badge badge-outline">系统</span> : null}
                      </div>
                      <p className="text-sm text-base-content/60">
                        {account?.name ?? '未知账户'} · {toDateLabel(transaction.occurredAt)}
                      </p>
                      {transaction.note ? <p className="mt-1 text-sm text-base-content/70">{transaction.note}</p> : null}
                    </div>
                    <p className={`text-lg font-semibold ${transaction.amountDelta >= 0 ? 'text-success' : 'text-error'}`}>
                      {formatSignedCurrency(transaction.amountDelta)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}
