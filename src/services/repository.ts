import { appShellDb, ledgerDb } from './db';
import { createId } from '../lib/id';
import {
  CURRENT_SCHEMA_VERSION,
  type AppSnapshot,
  type AppState,
  type BalanceAdjustmentInput,
  type CreateAccountInput,
  type CreateDebtRecordInput,
  type CreateLoanPlatformInput,
  type CreateLoanRecordInput,
  type CreateManualTransactionInput,
  type DataSourceMeta,
  type ImportSourceOptions,
  type LoanInstallment,
  type PayLoanInstallmentInput,
  type RepayDebtInput,
  type SourceLedgerData
} from '../types/models';
import { migrateSnapshot } from './snapshot';

const DEFAULT_APP_STATE: AppState = {
  key: 'app',
  activeSourceId: null,
  theme: 'light',
  uiPreferences: {
    compactMode: false
  },
  dismissedUpdateVersion: null
};

let lastIssuedTimestamp = 0;

function nowIso(): string {
  const next = Math.max(Date.now(), lastIssuedTimestamp + 1);
  lastIssuedTimestamp = next;
  return new Date(next).toISOString();
}

export async function ensureAppState(): Promise<AppState> {
  const existing = await appShellDb.settings.get('app');
  if (existing) {
    return existing;
  }

  await appShellDb.settings.put(DEFAULT_APP_STATE);
  return DEFAULT_APP_STATE;
}

export async function getAppState(): Promise<AppState> {
  return (await ensureAppState()) ?? DEFAULT_APP_STATE;
}

export async function updateAppState(patch: Partial<AppState>): Promise<AppState> {
  const current = await getAppState();
  const next = { ...current, ...patch };
  await appShellDb.settings.put(next);
  return next;
}

export async function listSources(): Promise<DataSourceMeta[]> {
  return appShellDb.sources.orderBy('lastOpenedAt').reverse().toArray();
}

export async function getSourceById(sourceId: string): Promise<DataSourceMeta | undefined> {
  return appShellDb.sources.get(sourceId);
}

export async function createSource(
  name: string,
  originType: DataSourceMeta['originType'] = 'manual',
  originLabel?: string
): Promise<DataSourceMeta> {
  const timestamp = nowIso();
  const source: DataSourceMeta = {
    id: createId('source'),
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    originType,
    originLabel,
    schemaVersion: CURRENT_SCHEMA_VERSION
  };

  await appShellDb.sources.add(source);
  await updateAppState({ activeSourceId: source.id });
  return source;
}

export async function renameSource(sourceId: string, name: string): Promise<void> {
  const source = await getSourceById(sourceId);
  if (!source) {
    throw new Error('数据源不存在。');
  }

  await appShellDb.sources.put({
    ...source,
    name,
    updatedAt: nowIso()
  });
}

export async function switchSource(sourceId: string): Promise<void> {
  const source = await getSourceById(sourceId);
  if (!source) {
    throw new Error('要切换的数据源不存在。');
  }

  const timestamp = nowIso();
  await appShellDb.sources.put({
    ...source,
    lastOpenedAt: timestamp,
    updatedAt: timestamp
  });
  await updateAppState({ activeSourceId: sourceId });
}

export async function deleteSource(sourceId: string): Promise<string | null> {
  const appState = await getAppState();
  const remaining = (await listSources()).filter((source) => source.id !== sourceId);

  await ledgerDb.transaction(
    'rw',
    [
      ledgerDb.accounts,
      ledgerDb.transactions,
      ledgerDb.debtRecords,
      ledgerDb.debtRepayments,
      ledgerDb.loanPlatforms,
      ledgerDb.loanRecords,
      ledgerDb.loanInstallments
    ],
    async () => {
      await Promise.all([
        ledgerDb.accounts.where('sourceId').equals(sourceId).delete(),
        ledgerDb.transactions.where('sourceId').equals(sourceId).delete(),
        ledgerDb.debtRecords.where('sourceId').equals(sourceId).delete(),
        ledgerDb.debtRepayments.where('sourceId').equals(sourceId).delete(),
        ledgerDb.loanPlatforms.where('sourceId').equals(sourceId).delete(),
        ledgerDb.loanRecords.where('sourceId').equals(sourceId).delete(),
        ledgerDb.loanInstallments.where('sourceId').equals(sourceId).delete()
      ]);
    }
  );

  await appShellDb.sources.delete(sourceId);

  const nextSourceId = appState.activeSourceId === sourceId ? remaining[0]?.id ?? null : appState.activeSourceId;
  await updateAppState({ activeSourceId: nextSourceId });
  return nextSourceId;
}

export async function getLedgerData(sourceId: string): Promise<SourceLedgerData> {
  const [accounts, transactions, debtRecords, debtRepayments, loanPlatforms, loanRecords, loanInstallments] =
    await Promise.all([
      ledgerDb.accounts.where('sourceId').equals(sourceId).sortBy('createdAt'),
      ledgerDb.transactions.where('sourceId').equals(sourceId).sortBy('occurredAt'),
      ledgerDb.debtRecords.where('sourceId').equals(sourceId).sortBy('startedAt'),
      ledgerDb.debtRepayments.where('sourceId').equals(sourceId).sortBy('occurredAt'),
      ledgerDb.loanPlatforms.where('sourceId').equals(sourceId).sortBy('createdAt'),
      ledgerDb.loanRecords.where('sourceId').equals(sourceId).sortBy('disbursedAt'),
      ledgerDb.loanInstallments.where('sourceId').equals(sourceId).sortBy('dueDate')
    ]);

  return {
    accounts,
    transactions,
    debtRecords,
    debtRepayments,
    loanPlatforms,
    loanRecords,
    loanInstallments
  };
}

export async function exportSource(sourceId: string): Promise<AppSnapshot> {
  const snapshot = await getLedgerData(sourceId);
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: nowIso(),
    ...snapshot
  };
}

function rebaseSnapshot(snapshot: AppSnapshot, sourceId: string): AppSnapshot {
  const accountIds = new Map(snapshot.accounts.map((record) => [record.id, `${sourceId}:acct:${record.id}`]));
  const debtRecordIds = new Map(snapshot.debtRecords.map((record) => [record.id, `${sourceId}:debt:${record.id}`]));
  const debtRepaymentIds = new Map(
    snapshot.debtRepayments.map((record) => [record.id, `${sourceId}:debtpay:${record.id}`])
  );
  const platformIds = new Map(snapshot.loanPlatforms.map((record) => [record.id, `${sourceId}:platform:${record.id}`]));
  const loanIds = new Map(snapshot.loanRecords.map((record) => [record.id, `${sourceId}:loan:${record.id}`]));
  const installmentIds = new Map(
    snapshot.loanInstallments.map((record) => [record.id, `${sourceId}:inst:${record.id}`])
  );

  return {
    ...snapshot,
    accounts: snapshot.accounts.map((record) => ({
      ...record,
      id: accountIds.get(record.id) ?? createId('acct'),
      sourceId
    })),
    debtRecords: snapshot.debtRecords.map((record) => ({
      ...record,
      id: debtRecordIds.get(record.id) ?? createId('debt'),
      sourceId,
      accountId: accountIds.get(record.accountId) ?? record.accountId
    })),
    debtRepayments: snapshot.debtRepayments.map((record) => ({
      ...record,
      id: debtRepaymentIds.get(record.id) ?? createId('debtpay'),
      sourceId,
      debtRecordId: debtRecordIds.get(record.debtRecordId) ?? record.debtRecordId,
      accountId: accountIds.get(record.accountId) ?? record.accountId
    })),
    loanPlatforms: snapshot.loanPlatforms.map((record) => ({
      ...record,
      id: platformIds.get(record.id) ?? createId('platform'),
      sourceId
    })),
    loanRecords: snapshot.loanRecords.map((record) => ({
      ...record,
      id: loanIds.get(record.id) ?? createId('loan'),
      sourceId,
      platformId: platformIds.get(record.platformId) ?? record.platformId,
      accountId: accountIds.get(record.accountId) ?? record.accountId
    })),
    loanInstallments: snapshot.loanInstallments.map((record) => ({
      ...record,
      id: installmentIds.get(record.id) ?? createId('inst'),
      sourceId,
      loanRecordId: loanIds.get(record.loanRecordId) ?? record.loanRecordId,
      accountId: record.accountId ? accountIds.get(record.accountId) ?? record.accountId : record.accountId
    })),
    transactions: snapshot.transactions.map((record) => {
      const relatedEntityId = record.relatedEntityType === 'debtRecord'
        ? debtRecordIds.get(record.relatedEntityId ?? '')
        : record.relatedEntityType === 'debtRepayment'
          ? debtRepaymentIds.get(record.relatedEntityId ?? '')
          : record.relatedEntityType === 'loanRecord'
            ? loanIds.get(record.relatedEntityId ?? '')
            : record.relatedEntityType === 'loanInstallment'
              ? installmentIds.get(record.relatedEntityId ?? '')
              : record.relatedEntityId;

      return {
        ...record,
        id: createId('txn'),
        sourceId,
        accountId: accountIds.get(record.accountId) ?? record.accountId,
        relatedEntityId
      };
    })
  };
}

async function replaceSourceData(sourceId: string, snapshot: AppSnapshot): Promise<void> {
  const rebasedSnapshot = rebaseSnapshot(snapshot, sourceId);

  await ledgerDb.transaction(
    'rw',
    [
      ledgerDb.accounts,
      ledgerDb.transactions,
      ledgerDb.debtRecords,
      ledgerDb.debtRepayments,
      ledgerDb.loanPlatforms,
      ledgerDb.loanRecords,
      ledgerDb.loanInstallments
    ],
    async () => {
      await Promise.all([
        ledgerDb.accounts.where('sourceId').equals(sourceId).delete(),
        ledgerDb.transactions.where('sourceId').equals(sourceId).delete(),
        ledgerDb.debtRecords.where('sourceId').equals(sourceId).delete(),
        ledgerDb.debtRepayments.where('sourceId').equals(sourceId).delete(),
        ledgerDb.loanPlatforms.where('sourceId').equals(sourceId).delete(),
        ledgerDb.loanRecords.where('sourceId').equals(sourceId).delete(),
        ledgerDb.loanInstallments.where('sourceId').equals(sourceId).delete()
      ]);

      if (rebasedSnapshot.accounts.length > 0) {
        await ledgerDb.accounts.bulkAdd(rebasedSnapshot.accounts);
      }
      if (rebasedSnapshot.transactions.length > 0) {
        await ledgerDb.transactions.bulkAdd(rebasedSnapshot.transactions);
      }
      if (rebasedSnapshot.debtRecords.length > 0) {
        await ledgerDb.debtRecords.bulkAdd(rebasedSnapshot.debtRecords);
      }
      if (rebasedSnapshot.debtRepayments.length > 0) {
        await ledgerDb.debtRepayments.bulkAdd(rebasedSnapshot.debtRepayments);
      }
      if (rebasedSnapshot.loanPlatforms.length > 0) {
        await ledgerDb.loanPlatforms.bulkAdd(rebasedSnapshot.loanPlatforms);
      }
      if (rebasedSnapshot.loanRecords.length > 0) {
        await ledgerDb.loanRecords.bulkAdd(rebasedSnapshot.loanRecords);
      }
      if (rebasedSnapshot.loanInstallments.length > 0) {
        await ledgerDb.loanInstallments.bulkAdd(rebasedSnapshot.loanInstallments);
      }
    }
  );
}

export async function importSnapshot(snapshotInput: AppSnapshot, options: ImportSourceOptions): Promise<string> {
  const snapshot = migrateSnapshot(snapshotInput);
  const timestamp = nowIso();

  if (options.mode === 'create') {
    const sourceName = options.newSourceName?.trim();
    if (!sourceName) {
      throw new Error('作为新数据源导入时必须填写新数据源名称。');
    }

    const source = await createSource(sourceName, options.originType, options.originLabel);
    await replaceSourceData(source.id, snapshot);
    return source.id;
  }

  if (!options.targetSourceId) {
    throw new Error('覆盖已有数据源时必须提供 targetSourceId。');
  }

  const existing = await getSourceById(options.targetSourceId);
  if (!existing) {
    throw new Error('目标数据源不存在。');
  }

  await replaceSourceData(existing.id, snapshot);
  await appShellDb.sources.put({
    ...existing,
    updatedAt: timestamp,
    lastOpenedAt: existing.id === (await getAppState()).activeSourceId ? timestamp : existing.lastOpenedAt,
    originType: options.originType,
    originLabel: options.originLabel,
    schemaVersion: CURRENT_SCHEMA_VERSION
  });

  return existing.id;
}

export async function runLocalMigrations(): Promise<void> {
  const sources = await listSources();
  await Promise.all(
    sources
      .filter((source) => source.schemaVersion < CURRENT_SCHEMA_VERSION)
      .map((source) =>
        appShellDb.sources.put({
          ...source,
          schemaVersion: CURRENT_SCHEMA_VERSION,
          updatedAt: nowIso()
        })
      )
  );
}

export async function createAccount(sourceId: string, input: CreateAccountInput): Promise<void> {
  const timestamp = nowIso();
  await ledgerDb.accounts.add({
    id: createId('acct'),
    sourceId,
    name: input.name,
    type: input.type,
    note: input.note,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function createManualTransaction(
  sourceId: string,
  input: CreateManualTransactionInput
): Promise<void> {
  await ledgerDb.transactions.add({
    id: createId('txn'),
    sourceId,
    accountId: input.accountId,
    type: input.direction === 'in' ? 'manual_income' : 'manual_expense',
    title: input.title,
    note: input.note,
    amountDelta: input.direction === 'in' ? Math.abs(input.amount) : -Math.abs(input.amount),
    occurredAt: input.occurredAt,
    createdAt: nowIso(),
    isSystem: false
  });
}

export async function adjustBalance(sourceId: string, input: BalanceAdjustmentInput): Promise<void> {
  await ledgerDb.transactions.add({
    id: createId('txn'),
    sourceId,
    accountId: input.accountId,
    type: 'balance_adjustment',
    title: '余额调整',
    note: input.note,
    amountDelta: input.amountDelta,
    occurredAt: input.occurredAt,
    createdAt: nowIso(),
    isSystem: true
  });
}

export async function createDebtRecord(sourceId: string, input: CreateDebtRecordInput): Promise<void> {
  const timestamp = nowIso();
  const recordId = createId('debt');

  await ledgerDb.transaction('rw', ledgerDb.debtRecords, ledgerDb.transactions, async () => {
    await ledgerDb.debtRecords.add({
      id: recordId,
      sourceId,
      personName: input.personName,
      kind: input.kind,
      principal: input.principal,
      accountId: input.accountId,
      note: input.note,
      startedAt: input.startedAt,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    await ledgerDb.transactions.add({
      id: createId('txn'),
      sourceId,
      accountId: input.accountId,
      type: 'debt_disbursement',
      title: `${input.kind === 'borrowed' ? '借入' : '借出'}：${input.personName}`,
      note: input.note,
      amountDelta: input.kind === 'borrowed' ? Math.abs(input.principal) : -Math.abs(input.principal),
      occurredAt: input.startedAt,
      createdAt: timestamp,
      isSystem: true,
      relatedEntityType: 'debtRecord',
      relatedEntityId: recordId
    });
  });
}

export async function repayDebt(sourceId: string, input: RepayDebtInput): Promise<void> {
  const debtRecord = await ledgerDb.debtRecords.get(input.debtRecordId);
  if (!debtRecord) {
    throw new Error('债务记录不存在。');
  }

  const timestamp = nowIso();
  const repaymentId = createId('debtpay');

  await ledgerDb.transaction('rw', ledgerDb.debtRepayments, ledgerDb.transactions, async () => {
    await ledgerDb.debtRepayments.add({
      id: repaymentId,
      sourceId,
      debtRecordId: input.debtRecordId,
      accountId: input.accountId,
      amount: input.amount,
      occurredAt: input.occurredAt,
      note: input.note,
      createdAt: timestamp
    });

    await ledgerDb.transactions.add({
      id: createId('txn'),
      sourceId,
      accountId: input.accountId,
      type: 'debt_repayment',
      title: `${debtRecord.kind === 'borrowed' ? '偿还借款' : '收回借出'}：${debtRecord.personName}`,
      note: input.note,
      amountDelta: debtRecord.kind === 'borrowed' ? -Math.abs(input.amount) : Math.abs(input.amount),
      occurredAt: input.occurredAt,
      createdAt: timestamp,
      isSystem: true,
      relatedEntityType: 'debtRepayment',
      relatedEntityId: repaymentId
    });
  });
}

export async function createLoanPlatform(sourceId: string, input: CreateLoanPlatformInput): Promise<void> {
  const timestamp = nowIso();
  await ledgerDb.loanPlatforms.add({
    id: createId('platform'),
    sourceId,
    name: input.name,
    note: input.note,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function createLoanRecord(sourceId: string, input: CreateLoanRecordInput): Promise<void> {
  const timestamp = nowIso();
  const loanId = createId('loan');

  await ledgerDb.transaction(
    'rw',
    ledgerDb.loanRecords,
    ledgerDb.loanInstallments,
    ledgerDb.transactions,
    async () => {
      await ledgerDb.loanRecords.add({
        id: loanId,
        sourceId,
        platformId: input.platformId,
        title: input.title,
        principal: input.principal,
        accountId: input.accountId,
        disbursedAt: input.disbursedAt,
        note: input.note,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      const installments: LoanInstallment[] = input.installments.map((installment) => ({
        id: createId('inst'),
        sourceId,
        loanRecordId: loanId,
        amount: installment.amount,
        dueDate: installment.dueDate,
        paidAmount: 0,
        paidAt: null,
        accountId: null,
        note: undefined,
        createdAt: timestamp,
        updatedAt: timestamp
      }));

      if (installments.length > 0) {
        await ledgerDb.loanInstallments.bulkAdd(installments);
      }

      await ledgerDb.transactions.add({
        id: createId('txn'),
        sourceId,
        accountId: input.accountId,
        type: 'loan_disbursement',
        title: `贷款放款：${input.title}`,
        note: input.note,
        amountDelta: Math.abs(input.principal),
        occurredAt: input.disbursedAt,
        createdAt: timestamp,
        isSystem: true,
        relatedEntityType: 'loanRecord',
        relatedEntityId: loanId
      });
    }
  );
}

export async function payLoanInstallment(sourceId: string, input: PayLoanInstallmentInput): Promise<void> {
  const installment = await ledgerDb.loanInstallments.get(input.installmentId);
  const loan = installment ? await ledgerDb.loanRecords.get(installment.loanRecordId) : undefined;

  if (!installment || !loan) {
    throw new Error('贷款分期不存在。');
  }

  if (installment.paidAmount + input.amount > installment.amount + 0.0001) {
    throw new Error('还款金额不能超过剩余应还金额。');
  }

  const timestamp = nowIso();

  await ledgerDb.transaction('rw', ledgerDb.loanInstallments, ledgerDb.transactions, async () => {
    const nextPaidAmount = installment.paidAmount + input.amount;
    await ledgerDb.loanInstallments.put({
      ...installment,
      paidAmount: nextPaidAmount,
      paidAt: input.occurredAt,
      accountId: input.accountId,
      note: input.note,
      updatedAt: timestamp
    });

    await ledgerDb.transactions.add({
      id: createId('txn'),
      sourceId,
      accountId: input.accountId,
      type: 'loan_installment_payment',
      title: `贷款还款：${loan.title}`,
      note: input.note,
      amountDelta: -Math.abs(input.amount),
      occurredAt: input.occurredAt,
      createdAt: timestamp,
      isSystem: true,
      relatedEntityType: 'loanInstallment',
      relatedEntityId: installment.id
    });
  });
}
