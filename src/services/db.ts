import Dexie, { type Table } from 'dexie';
import type {
  Account,
  AppState,
  DataSourceMeta,
  DebtRecord,
  DebtRepayment,
  LoanInstallment,
  LoanPlatform,
  LoanRecord,
  Transaction
} from '../types/models';

export class AppShellDb extends Dexie {
  sources!: Table<DataSourceMeta, string>;
  settings!: Table<AppState, string>;

  constructor() {
    super('app-shell-db');

    this.version(1).stores({
      sources: 'id, updatedAt, lastOpenedAt, name',
      settings: 'key'
    });
  }
}

export class LedgerDb extends Dexie {
  accounts!: Table<Account, string>;
  transactions!: Table<Transaction, string>;
  debtRecords!: Table<DebtRecord, string>;
  debtRepayments!: Table<DebtRepayment, string>;
  loanPlatforms!: Table<LoanPlatform, string>;
  loanRecords!: Table<LoanRecord, string>;
  loanInstallments!: Table<LoanInstallment, string>;

  constructor() {
    super('ledger-db');

    this.version(1).stores({
      accounts: 'id, sourceId, updatedAt, name',
      transactions: 'id, sourceId, accountId, occurredAt, type',
      debtRecords: 'id, sourceId, accountId, startedAt',
      debtRepayments: 'id, sourceId, debtRecordId, accountId, occurredAt',
      loanPlatforms: 'id, sourceId, updatedAt, name',
      loanRecords: 'id, sourceId, platformId, accountId, disbursedAt',
      loanInstallments: 'id, sourceId, loanRecordId, dueDate, paidAt'
    });

    this.version(2).stores({
      accounts: 'id, sourceId, [sourceId+id], [sourceId+updatedAt], [sourceId+name]',
      transactions: 'id, sourceId, [sourceId+id], [sourceId+occurredAt], [sourceId+accountId], type',
      debtRecords: 'id, sourceId, [sourceId+id], [sourceId+accountId], [sourceId+startedAt]',
      debtRepayments: 'id, sourceId, [sourceId+id], [sourceId+debtRecordId], [sourceId+occurredAt]',
      loanPlatforms: 'id, sourceId, [sourceId+id], [sourceId+updatedAt], [sourceId+name]',
      loanRecords: 'id, sourceId, [sourceId+id], [sourceId+platformId], [sourceId+accountId], [sourceId+disbursedAt]',
      loanInstallments: 'id, sourceId, [sourceId+id], [sourceId+loanRecordId], [sourceId+dueDate], [sourceId+paidAt]'
    });
  }
}

export const appShellDb = new AppShellDb();
export const ledgerDb = new LedgerDb();
