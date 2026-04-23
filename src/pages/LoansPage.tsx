import { useState } from 'react';
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
  const {
    currentData,
    createLoanPlatformEntry,
    createLoanEntry,
    payLoanInstallmentEntry
  } = useAppContext();
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
    <div className="space-y-6">
      <PageHeading title="贷款" description="管理贷款平台、放款记录与分期还款计划，所有影响账户余额的动作都会自动写入系统流水。" />

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="贷款平台" description="先建平台，再录入贷款。">
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await createLoanPlatformEntry(platformForm);
              setPlatformForm({ name: '', note: '' });
            }}
          >
            <input
              className="input input-bordered"
              placeholder="平台名称"
              value={platformForm.name}
              onChange={(event) => setPlatformForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <textarea
              className="textarea textarea-bordered min-h-24"
              placeholder="备注（可选）"
              value={platformForm.note}
              onChange={(event) => setPlatformForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="btn btn-primary">新增平台</button>
          </form>
        </SectionCard>

        <SectionCard title="新增贷款" description="每行一个分期：YYYY-MM-DD,金额">
          <form
            className="grid gap-4"
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
            <select
              className="select select-bordered"
              value={loanForm.platformId}
              onChange={(event) => setLoanForm((prev) => ({ ...prev, platformId: event.target.value }))}
              required
            >
              <option value="" disabled>
                选择平台
              </option>
              {currentData?.loanPlatforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
            <input
              className="input input-bordered"
              placeholder="贷款标题"
              value={loanForm.title}
              onChange={(event) => setLoanForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <input
              className="input input-bordered"
              type="number"
              step="0.01"
              placeholder="放款金额"
              value={loanForm.principal}
              onChange={(event) => setLoanForm((prev) => ({ ...prev, principal: event.target.value }))}
              required
            />
            <select
              className="select select-bordered"
              value={loanForm.accountId}
              onChange={(event) => setLoanForm((prev) => ({ ...prev, accountId: event.target.value }))}
              required
            >
              <option value="" disabled>
                放款到账账户
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
              value={loanForm.disbursedAt}
              onChange={(event) => setLoanForm((prev) => ({ ...prev, disbursedAt: event.target.value }))}
              required
            />
            <textarea
              className="textarea textarea-bordered min-h-24"
              placeholder="分期计划，例如：2026-05-01,1200"
              value={loanForm.installments}
              onChange={(event) => setLoanForm((prev) => ({ ...prev, installments: event.target.value }))}
              required
            />
            <textarea
              className="textarea textarea-bordered min-h-20"
              placeholder="备注（可选）"
              value={loanForm.note}
              onChange={(event) => setLoanForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="btn btn-secondary">新增贷款</button>
          </form>
        </SectionCard>

        <SectionCard title="登记还款" description="支持部分还款，系统会自动写入支出流水。">
          <form
            className="grid gap-4"
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
            <select
              className="select select-bordered"
              value={repaymentForm.installmentId}
              onChange={(event) => setRepaymentForm((prev) => ({ ...prev, installmentId: event.target.value }))}
              required
            >
              <option value="" disabled>
                选择分期
              </option>
              {currentData?.loanInstallments
                .filter((installment) => installment.paidAmount < installment.amount)
                .map((installment) => (
                  <option key={installment.id} value={installment.id}>
                    {installment.dueDate} · 剩余 {formatCurrency(installment.amount - installment.paidAmount)}
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
                选择扣款账户
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
              className="textarea textarea-bordered min-h-20"
              placeholder="备注（可选）"
              value={repaymentForm.note}
              onChange={(event) => setRepaymentForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="btn btn-accent">登记还款</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="贷款列表" description="待还金额根据分期计划和已还金额自动计算。">
        <div className="space-y-3">
          {summaries.length === 0 ? (
            <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">还没有贷款记录。</div>
          ) : (
            summaries.map((summary) => (
              <div key={summary.loan.id} className="rounded-2xl border border-base-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{summary.loan.title}</p>
                    <p className="text-sm text-base-content/60">
                      {summary.platform?.name ?? '未命名平台'} · 放款日 {toDateLabel(summary.loan.disbursedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">待还 {formatCurrency(summary.outstanding)}</p>
                    <p className="text-sm text-base-content/60">
                      共 {summary.installmentCount} 期，剩余 {summary.unpaidCount} 期
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
