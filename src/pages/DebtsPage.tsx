import { useState } from 'react';
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
    <div className="space-y-6">
      <PageHeading title="借款" description="支持记录向他人借入或借出，并自动生成影响账户余额的系统流水。" />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="新增借款记录" description="借入会记入账户，借出会从账户扣减。">
          <form
            className="grid gap-4"
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
            <input
              className="input input-bordered"
              placeholder="对方名称"
              value={createForm.personName}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, personName: event.target.value }))}
              required
            />
            <select
              className="select select-bordered"
              value={createForm.kind}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, kind: event.target.value as 'borrowed' | 'lent' }))}
            >
              <option value="borrowed">向他人借入</option>
              <option value="lent">借给他人</option>
            </select>
            <input
              className="input input-bordered"
              type="number"
              step="0.01"
              placeholder="本金"
              value={createForm.principal}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, principal: event.target.value }))}
              required
            />
            <select
              className="select select-bordered"
              value={createForm.accountId}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, accountId: event.target.value }))}
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
              type="date"
              value={createForm.startedAt}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, startedAt: event.target.value }))}
              required
            />
            <textarea
              className="textarea textarea-bordered min-h-24"
              placeholder="备注（可选）"
              value={createForm.note}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="btn btn-primary">新增借款记录</button>
          </form>
        </SectionCard>

        <SectionCard title="登记还款" description="部分还款会保留剩余未结清金额。">
          <form
            className="grid gap-4"
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
            <select
              className="select select-bordered"
              value={repaymentForm.debtRecordId}
              onChange={(event) => setRepaymentForm((prev) => ({ ...prev, debtRecordId: event.target.value }))}
              required
            >
              <option value="" disabled>
                选择借款记录
              </option>
              {summaries.map((summary) => (
                <option key={summary.record.id} value={summary.record.id}>
                  {summary.record.personName} · 剩余 {formatCurrency(summary.outstanding)}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered"
              value={repaymentForm.accountId}
              onChange={(event) => setRepaymentForm((prev) => ({ ...prev, accountId: event.target.value }))}
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
              placeholder="还款金额"
              value={repaymentForm.amount}
              onChange={(event) => setRepaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
            <input
              className="input input-bordered"
              type="date"
              value={repaymentForm.occurredAt}
              onChange={(event) => setRepaymentForm((prev) => ({ ...prev, occurredAt: event.target.value }))}
              required
            />
            <textarea
              className="textarea textarea-bordered min-h-24"
              placeholder="备注（可选）"
              value={repaymentForm.note}
              onChange={(event) => setRepaymentForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="btn btn-secondary">登记还款</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="借款列表" description="借入与借出都会按剩余未结清金额展示。">
        <div className="space-y-3">
          {summaries.length === 0 ? (
            <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">还没有借款记录。</div>
          ) : (
            summaries.map((summary) => (
              <div key={summary.record.id} className="rounded-2xl border border-base-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{summary.record.personName}</p>
                      <span className="badge badge-outline">
                        {summary.record.kind === 'borrowed' ? '借入' : '借出'}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/60">{toDateLabel(summary.record.startedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">剩余 {formatCurrency(summary.outstanding)}</p>
                    <p className="text-sm text-base-content/60">
                      本金 {formatCurrency(summary.record.principal)} · 已处理 {formatCurrency(summary.repaid)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
