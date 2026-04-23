import { useState } from 'react';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { todayIsoDate } from '../lib/date';
import { formatCurrency } from '../lib/format';
import { getAccountBalances } from '../services/ledger';
import { useAppContext } from '../store/AppContext';
import type { Account } from '../types/models';

const accountTypes: Account['type'][] = ['cash', 'bank', 'credit', 'asset', 'other'];

export function AccountsPage() {
  const { currentData, createAccountEntry, adjustAccountBalance } = useAppContext();
  const [accountForm, setAccountForm] = useState({ name: '', type: 'cash' as Account['type'], note: '' });
  const [adjustmentForm, setAdjustmentForm] = useState({
    accountId: '',
    amountDelta: '',
    occurredAt: todayIsoDate(),
    note: ''
  });

  const balances = currentData ? getAccountBalances(currentData.accounts, currentData.transactions) : [];

  return (
    <div className="space-y-6">
      <PageHeading title="账户" description="创建账户、查看余额，并通过系统“余额调整流水”修正当前数据源中的账户余额。" />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="新建账户" description="账户余额不会直接存储，实际余额通过流水自动回算。">
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await createAccountEntry(accountForm);
              setAccountForm({ name: '', type: 'cash', note: '' });
            }}
          >
            <input
              className="input input-bordered w-full"
              placeholder="账户名称"
              value={accountForm.name}
              onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <select
              className="select select-bordered"
              value={accountForm.type}
              onChange={(event) => setAccountForm((prev) => ({ ...prev, type: event.target.value as Account['type'] }))}
            >
              {accountTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <textarea
              className="textarea textarea-bordered min-h-24"
              placeholder="备注（可选）"
              value={accountForm.note}
              onChange={(event) => setAccountForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="btn btn-primary">创建账户</button>
          </form>
        </SectionCard>

        <SectionCard title="余额调整" description="用于写入系统流水，不会直接修改账户表。">
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await adjustAccountBalance({
                accountId: adjustmentForm.accountId,
                amountDelta: Number(adjustmentForm.amountDelta),
                occurredAt: adjustmentForm.occurredAt,
                note: adjustmentForm.note
              });
              setAdjustmentForm({
                accountId: '',
                amountDelta: '',
                occurredAt: todayIsoDate(),
                note: ''
              });
            }}
          >
            <select
              className="select select-bordered"
              value={adjustmentForm.accountId}
              onChange={(event) => setAdjustmentForm((prev) => ({ ...prev, accountId: event.target.value }))}
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
              type="number"
              step="0.01"
              placeholder="调整金额，可为负数"
              value={adjustmentForm.amountDelta}
              onChange={(event) => setAdjustmentForm((prev) => ({ ...prev, amountDelta: event.target.value }))}
              required
            />
            <input
              className="input input-bordered"
              type="date"
              value={adjustmentForm.occurredAt}
              onChange={(event) => setAdjustmentForm((prev) => ({ ...prev, occurredAt: event.target.value }))}
              required
            />
            <textarea
              className="textarea textarea-bordered min-h-24"
              placeholder="备注（可选）"
              value={adjustmentForm.note}
              onChange={(event) => setAdjustmentForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="btn btn-secondary">写入余额调整流水</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="账户列表" description="展示当前数据源下所有账户及回算余额。">
        <div className="grid gap-3">
          {balances.length === 0 ? (
            <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">还没有账户。</div>
          ) : (
            balances.map((row) => (
              <div key={row.account.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-base-200 p-4 md:flex-row md:items-center">
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
    </div>
  );
}
