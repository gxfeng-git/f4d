import { describe, expect, it } from 'vitest';
import { getAccountBalances, getDebtSummaries, getLoanSummaries } from './ledger';
import type {
  Account,
  DebtRecord,
  DebtRepayment,
  LoanInstallment,
  LoanPlatform,
  LoanRecord,
  Transaction
} from '../types/models';

describe('ledger helpers', () => {
  it('calculates account balances from signed transactions', () => {
    const accounts: Account[] = [
      {
        id: 'a1',
        sourceId: 's1',
        name: '主卡',
        type: 'bank',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];
    const transactions: Transaction[] = [
      {
        id: 't1',
        sourceId: 's1',
        accountId: 'a1',
        type: 'manual_income',
        title: '收入',
        amountDelta: 1000,
        occurredAt: '2026-01-01',
        createdAt: '2026-01-01',
        isSystem: false
      },
      {
        id: 't2',
        sourceId: 's1',
        accountId: 'a1',
        type: 'manual_expense',
        title: '支出',
        amountDelta: -250,
        occurredAt: '2026-01-02',
        createdAt: '2026-01-02',
        isSystem: false
      }
    ];

    expect(getAccountBalances(accounts, transactions)[0]?.balance).toBe(750);
  });

  it('derives debt outstanding and loan outstanding correctly', () => {
    const debts: DebtRecord[] = [
      {
        id: 'd1',
        sourceId: 's1',
        personName: '张三',
        kind: 'borrowed',
        principal: 5000,
        accountId: 'a1',
        startedAt: '2026-01-01',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];
    const repayments: DebtRepayment[] = [
      {
        id: 'r1',
        sourceId: 's1',
        debtRecordId: 'd1',
        accountId: 'a1',
        amount: 1200,
        occurredAt: '2026-02-01',
        createdAt: '2026-02-01'
      }
    ];
    const platforms: LoanPlatform[] = [
      {
        id: 'p1',
        sourceId: 's1',
        name: '平台 A',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];
    const loans: LoanRecord[] = [
      {
        id: 'l1',
        sourceId: 's1',
        platformId: 'p1',
        title: '消费贷',
        principal: 12000,
        accountId: 'a1',
        disbursedAt: '2026-01-01',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];
    const installments: LoanInstallment[] = [
      {
        id: 'i1',
        sourceId: 's1',
        loanRecordId: 'l1',
        amount: 3000,
        dueDate: '2026-03-01',
        paidAmount: 1000,
        paidAt: '2026-03-01',
        accountId: 'a1',
        createdAt: '2026-01-01',
        updatedAt: '2026-03-01'
      },
      {
        id: 'i2',
        sourceId: 's1',
        loanRecordId: 'l1',
        amount: 3000,
        dueDate: '2026-04-01',
        paidAmount: 0,
        paidAt: null,
        accountId: null,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];

    expect(getDebtSummaries(debts, repayments)[0]?.outstanding).toBe(3800);
    expect(getLoanSummaries(loans, installments, platforms)[0]?.outstanding).toBe(5000);
  });
});
