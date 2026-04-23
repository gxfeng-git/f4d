export const CURRENT_SCHEMA_VERSION = 1;

export type SourceOriginType = 'manual' | 'file' | 'url';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ImportMode = 'create' | 'overwrite';

export interface DataSourceMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  originType: SourceOriginType;
  originLabel?: string;
  schemaVersion: number;
}

export interface UiPreferences {
  compactMode: boolean;
}

export interface AppState {
  key: 'app';
  activeSourceId: string | null;
  theme: ThemeMode;
  uiPreferences: UiPreferences;
  dismissedUpdateVersion?: string | null;
}

export interface Account {
  id: string;
  sourceId: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'asset' | 'other';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'manual_income'
  | 'manual_expense'
  | 'balance_adjustment'
  | 'debt_disbursement'
  | 'debt_repayment'
  | 'loan_disbursement'
  | 'loan_installment_payment';

export interface Transaction {
  id: string;
  sourceId: string;
  accountId: string;
  type: TransactionType;
  title: string;
  note?: string;
  amountDelta: number;
  occurredAt: string;
  createdAt: string;
  isSystem: boolean;
  relatedEntityType?: 'debtRecord' | 'debtRepayment' | 'loanRecord' | 'loanInstallment';
  relatedEntityId?: string;
}

export interface DebtRecord {
  id: string;
  sourceId: string;
  personName: string;
  kind: 'borrowed' | 'lent';
  principal: number;
  accountId: string;
  note?: string;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtRepayment {
  id: string;
  sourceId: string;
  debtRecordId: string;
  accountId: string;
  amount: number;
  occurredAt: string;
  note?: string;
  createdAt: string;
}

export interface LoanPlatform {
  id: string;
  sourceId: string;
  name: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRecord {
  id: string;
  sourceId: string;
  platformId: string;
  title: string;
  principal: number;
  accountId: string;
  disbursedAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanInstallment {
  id: string;
  sourceId: string;
  loanRecordId: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paidAt?: string | null;
  accountId?: string | null;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSnapshot {
  schemaVersion: number;
  exportedAt: string;
  accounts: Account[];
  transactions: Transaction[];
  debtRecords: DebtRecord[];
  debtRepayments: DebtRepayment[];
  loanPlatforms: LoanPlatform[];
  loanRecords: LoanRecord[];
  loanInstallments: LoanInstallment[];
}

export interface SourceLedgerData {
  accounts: Account[];
  transactions: Transaction[];
  debtRecords: DebtRecord[];
  debtRepayments: DebtRepayment[];
  loanPlatforms: LoanPlatform[];
  loanRecords: LoanRecord[];
  loanInstallments: LoanInstallment[];
}

export interface ImportSourceOptions {
  mode: ImportMode;
  newSourceName?: string;
  targetSourceId?: string;
  originType: Extract<SourceOriginType, 'file' | 'url'>;
  originLabel?: string;
}

export interface CreateAccountInput {
  name: string;
  type: Account['type'];
  note?: string;
}

export interface CreateManualTransactionInput {
  accountId: string;
  title: string;
  amount: number;
  direction: 'in' | 'out';
  occurredAt: string;
  note?: string;
}

export interface BalanceAdjustmentInput {
  accountId: string;
  amountDelta: number;
  occurredAt: string;
  note?: string;
}

export interface CreateDebtRecordInput {
  personName: string;
  kind: DebtRecord['kind'];
  principal: number;
  accountId: string;
  startedAt: string;
  note?: string;
}

export interface RepayDebtInput {
  debtRecordId: string;
  accountId: string;
  amount: number;
  occurredAt: string;
  note?: string;
}

export interface CreateLoanPlatformInput {
  name: string;
  note?: string;
}

export interface InstallmentDraft {
  dueDate: string;
  amount: number;
}

export interface CreateLoanRecordInput {
  platformId: string;
  title: string;
  principal: number;
  accountId: string;
  disbursedAt: string;
  note?: string;
  installments: InstallmentDraft[];
}

export interface PayLoanInstallmentInput {
  installmentId: string;
  accountId: string;
  amount: number;
  occurredAt: string;
  note?: string;
}

export interface UpdateManager {
  onUpdateAvailable: (listener: () => void) => () => void;
  dismissForSession: () => void;
  applyUpdate: () => Promise<void>;
}
