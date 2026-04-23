import { z } from 'zod';
import {
  CURRENT_SCHEMA_VERSION,
  type Account,
  type AppSnapshot,
  type DebtRecord,
  type DebtRepayment,
  type LoanInstallment,
  type LoanPlatform,
  type LoanRecord,
  type Transaction
} from '../types/models';

const accountSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional().default(''),
  name: z.string(),
  type: z.enum(['cash', 'bank', 'credit', 'asset', 'other']),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const transactionSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional().default(''),
  accountId: z.string(),
  type: z.enum([
    'manual_income',
    'manual_expense',
    'balance_adjustment',
    'debt_disbursement',
    'debt_repayment',
    'loan_disbursement',
    'loan_installment_payment'
  ]),
  title: z.string(),
  note: z.string().optional(),
  amountDelta: z.number(),
  occurredAt: z.string(),
  createdAt: z.string(),
  isSystem: z.boolean(),
  relatedEntityType: z.enum(['debtRecord', 'debtRepayment', 'loanRecord', 'loanInstallment']).optional(),
  relatedEntityId: z.string().optional()
});

const debtRecordSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional().default(''),
  personName: z.string(),
  kind: z.enum(['borrowed', 'lent']),
  principal: z.number().positive(),
  accountId: z.string(),
  note: z.string().optional(),
  startedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const debtRepaymentSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional().default(''),
  debtRecordId: z.string(),
  accountId: z.string(),
  amount: z.number().positive(),
  occurredAt: z.string(),
  note: z.string().optional(),
  createdAt: z.string()
});

const loanPlatformSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional().default(''),
  name: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const loanRecordSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional().default(''),
  platformId: z.string(),
  title: z.string(),
  principal: z.number().positive(),
  accountId: z.string(),
  disbursedAt: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const loanInstallmentSchema = z.object({
  id: z.string(),
  sourceId: z.string().optional().default(''),
  loanRecordId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  paidAmount: z.number().min(0),
  paidAt: z.string().nullable().optional(),
  accountId: z.string().nullable().optional(),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const snapshotSchema = z.object({
  schemaVersion: z.number().int().positive().optional(),
  exportedAt: z.string().optional(),
  accounts: z.array(accountSchema).default([]),
  transactions: z.array(transactionSchema).default([]),
  debtRecords: z.array(debtRecordSchema).default([]),
  debtRepayments: z.array(debtRepaymentSchema).default([]),
  loanPlatforms: z.array(loanPlatformSchema).default([]),
  loanRecords: z.array(loanRecordSchema).default([]),
  loanInstallments: z.array(loanInstallmentSchema).default([])
});

export function parseSnapshot(value: unknown): AppSnapshot {
  const parsed = snapshotSchema.parse(value);

  return {
    schemaVersion: parsed.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    exportedAt: parsed.exportedAt ?? new Date().toISOString(),
    accounts: parsed.accounts,
    transactions: parsed.transactions,
    debtRecords: parsed.debtRecords,
    debtRepayments: parsed.debtRepayments,
    loanPlatforms: parsed.loanPlatforms,
    loanRecords: parsed.loanRecords,
    loanInstallments: parsed.loanInstallments
  };
}

export function migrateSnapshot(snapshot: AppSnapshot): AppSnapshot {
  if (snapshot.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(`当前应用仅支持 schemaVersion ${CURRENT_SCHEMA_VERSION} 及以下的数据。`);
  }

  return {
    ...snapshot,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: snapshot.exportedAt || new Date().toISOString()
  };
}
