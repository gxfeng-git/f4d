import { compareDateAsc } from '../lib/date';
import type {
  Account,
  DebtRecord,
  DebtRepayment,
  LoanInstallment,
  LoanRecord,
  LoanPlatform,
  SourceLedgerData,
  Transaction
} from '../types/models';

export interface AccountBalanceRow {
  account: Account;
  balance: number;
}

export interface DebtSummaryRow {
  record: DebtRecord;
  repaid: number;
  outstanding: number;
}

export interface LoanSummaryRow {
  loan: LoanRecord;
  platform?: LoanPlatform;
  totalPaid: number;
  outstanding: number;
  installmentCount: number;
  unpaidCount: number;
}

export interface ForecastRow {
  date: string;
  label: string;
  projectedBalance: number;
}

export function getAccountBalances(accounts: Account[], transactions: Transaction[]): AccountBalanceRow[] {
  return accounts.map((account) => ({
    account,
    balance: transactions
      .filter((transaction) => transaction.accountId === account.id)
      .reduce((sum, transaction) => sum + transaction.amountDelta, 0)
  }));
}

export function getTotalBalance(accounts: Account[], transactions: Transaction[]): number {
  return getAccountBalances(accounts, transactions).reduce((sum, row) => sum + row.balance, 0);
}

export function getDebtSummaries(
  debtRecords: DebtRecord[],
  debtRepayments: DebtRepayment[]
): DebtSummaryRow[] {
  return debtRecords.map((record) => {
    const repaid = debtRepayments
      .filter((repayment) => repayment.debtRecordId === record.id)
      .reduce((sum, repayment) => sum + repayment.amount, 0);

    return {
      record,
      repaid,
      outstanding: Math.max(record.principal - repaid, 0)
    };
  });
}

export function getLoanSummaries(
  loans: LoanRecord[],
  installments: LoanInstallment[],
  platforms: LoanPlatform[]
): LoanSummaryRow[] {
  return loans.map((loan) => {
    const loanInstallments = installments.filter((installment) => installment.loanRecordId === loan.id);
    const totalScheduled = loanInstallments.reduce((sum, installment) => sum + installment.amount, 0);
    const totalPaid = loanInstallments.reduce((sum, installment) => sum + installment.paidAmount, 0);

    return {
      loan,
      platform: platforms.find((platform) => platform.id === loan.platformId),
      totalPaid,
      outstanding: Math.max(totalScheduled - totalPaid, 0),
      installmentCount: loanInstallments.length,
      unpaidCount: loanInstallments.filter((installment) => installment.paidAmount < installment.amount).length
    };
  });
}

export function getUpcomingInstallments(
  installments: LoanInstallment[],
  loans: LoanRecord[],
  platforms: LoanPlatform[]
): Array<LoanInstallment & { loanTitle: string; platformName: string }> {
  return installments
    .filter((installment) => installment.paidAmount < installment.amount)
    .map((installment) => {
      const loan = loans.find((item) => item.id === installment.loanRecordId);
      const platform = platforms.find((item) => item.id === loan?.platformId);

      return {
        ...installment,
        loanTitle: loan?.title ?? '未命名贷款',
        platformName: platform?.name ?? '未命名平台'
      };
    })
    .sort((left, right) => compareDateAsc(left.dueDate, right.dueDate));
}

export function getForecastRows(data: SourceLedgerData): ForecastRow[] {
  const totalBalance = getTotalBalance(data.accounts, data.transactions);
  const upcoming = getUpcomingInstallments(data.loanInstallments, data.loanRecords, data.loanPlatforms).slice(0, 8);
  let running = totalBalance;

  return upcoming.map((installment) => {
    running -= installment.amount - installment.paidAmount;

    return {
      date: installment.dueDate,
      label: `${installment.platformName} · ${installment.loanTitle}`,
      projectedBalance: running
    };
  });
}

export function getMonthMatrix(referenceDate = new Date()): Date[][] {
  const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(start);
      date.setDate(start.getDate() + weekIndex * 7 + dayIndex);
      return date;
    })
  );
}

export function getInstallmentMap(installments: LoanInstallment[]): Map<string, LoanInstallment[]> {
  return installments.reduce((map, installment) => {
    const list = map.get(installment.dueDate) ?? [];
    list.push(installment);
    map.set(installment.dueDate, list);
    return map;
  }, new Map<string, LoanInstallment[]>());
}
