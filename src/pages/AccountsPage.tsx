import { useState, type ComponentType, type SVGProps } from 'react';
import { Banknote, CreditCard, Landmark, MoreHorizontal, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { EmptyState } from '../components/EmptyState';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { todayIsoDate } from '../lib/date';
import { formatCurrency } from '../lib/format';
import { getAccountBalances } from '../services/ledger';
import { useAppContext } from '../store/AppContext';
import type { Account } from '../types/models';

type AccountTypeMeta = {
  value: Account['type'];
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const accountTypes: AccountTypeMeta[] = [
  { value: 'cash', label: '现金', Icon: Banknote },
  { value: 'bank', label: '银行卡', Icon: Landmark },
  { value: 'credit', label: '信用卡', Icon: CreditCard },
  { value: 'asset', label: '资产', Icon: Wallet },
  { value: 'other', label: '其他', Icon: MoreHorizontal }
];

const accountTypeMap = new Map(accountTypes.map((t) => [t.value, t]));

function AccountTypeOption({ type }: { type: AccountTypeMeta }) {
  const { Icon, label } = type;
  return (
    <span className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      <span>{label}</span>
    </span>
  );
}

function AccountTypeSelect({ value, onChange }: { value: Account['type']; onChange: (v: Account['type']) => void }) {
  const current = accountTypeMap.get(value) ?? accountTypes[0];
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Account['type'])}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue>
          <AccountTypeOption type={current} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {accountTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <AccountTypeOption type={type} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function getAccountTypeLabel(type: Account['type']): string {
  return accountTypeMap.get(type)?.label ?? type;
}

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
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <PageHeading title="账户" description="创建账户、查看余额；调余额会写入系统流水。" />
      </section>

      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="新建账户" description="余额不单独存储，由流水回算。">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await createAccountEntry(accountForm);
                setAccountForm({ name: '', type: 'cash', note: '' });
              }}
            >
              <Input
                placeholder="账户名称"
                value={accountForm.name}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
              <AccountTypeSelect
                value={accountForm.type}
                onChange={(v) => setAccountForm((prev) => ({ ...prev, type: v }))}
              />
              <Textarea
                className="min-h-24"
                placeholder="备注（可选）"
                value={accountForm.note}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, note: event.target.value }))}
              />
              <Button type="submit" className="w-full rounded-lg sm:w-auto">
                创建账户
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="余额调整" description="写入系统流水，不直改库内余额。">
            <form
              className="grid gap-3"
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
              <Select
                value={
                  adjustmentForm.accountId &&
                  currentData?.accounts.some((a) => a.id === adjustmentForm.accountId)
                    ? adjustmentForm.accountId
                    : undefined
                }
                onValueChange={(v) => setAdjustmentForm((prev) => ({ ...prev, accountId: v }))}
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
                placeholder="调整金额，可为负"
                value={adjustmentForm.amountDelta}
                onChange={(event) => setAdjustmentForm((prev) => ({ ...prev, amountDelta: event.target.value }))}
                required
              />
              <DatePicker
                value={adjustmentForm.occurredAt}
                onChange={(v) => setAdjustmentForm((prev) => ({ ...prev, occurredAt: v }))}
              />
              <Textarea
                className="min-h-24"
                placeholder="备注（可选）"
                value={adjustmentForm.note}
                onChange={(event) => setAdjustmentForm((prev) => ({ ...prev, note: event.target.value }))}
              />
              <Button type="submit" variant="dark" className="w-full rounded-lg sm:w-auto">
                写入余额调整流水
              </Button>
            </form>
          </SectionCard>
        </div>
      </section>

      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <SectionCard title="账户列表" description="当前数据源的回算余额。">
          <div className="space-y-2.5">
            {balances.length === 0 ? (
              <EmptyState>还没有账户。</EmptyState>
            ) : (
              balances.map((row) => {
                const meta = accountTypeMap.get(row.account.type);
                const Icon = meta?.Icon ?? MoreHorizontal;
                return (
                  <div key={row.account.id} className="ui-list-row !flex-row !items-center">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div>
                        <p className="font-medium">{row.account.name}</p>
                        <p className="text-xs text-muted-foreground">{meta?.label ?? row.account.type}</p>
                      </div>
                    </div>
                    <p className="font-display text-lg font-semibold tabular-nums">{formatCurrency(row.balance)}</p>
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
