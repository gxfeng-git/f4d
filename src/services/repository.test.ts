import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { AppSnapshot } from '../types/models';

let appShellDb: typeof import('./db').appShellDb;
let ledgerDb: typeof import('./db').ledgerDb;
let createAccount: typeof import('./repository').createAccount;
let createSource: typeof import('./repository').createSource;
let exportSource: typeof import('./repository').exportSource;
let getAppState: typeof import('./repository').getAppState;
let getLedgerData: typeof import('./repository').getLedgerData;
let importSnapshot: typeof import('./repository').importSnapshot;
let listSources: typeof import('./repository').listSources;
let renameSource: typeof import('./repository').renameSource;
let switchSource: typeof import('./repository').switchSource;
let deleteSource: typeof import('./repository').deleteSource;

beforeEach(async () => {
  const dbModule = await import('./db');
  const repositoryModule = await import('./repository');

  appShellDb = dbModule.appShellDb;
  ledgerDb = dbModule.ledgerDb;
  createAccount = repositoryModule.createAccount;
  createSource = repositoryModule.createSource;
  exportSource = repositoryModule.exportSource;
  getAppState = repositoryModule.getAppState;
  getLedgerData = repositoryModule.getLedgerData;
  importSnapshot = repositoryModule.importSnapshot;
  listSources = repositoryModule.listSources;
  renameSource = repositoryModule.renameSource;
  switchSource = repositoryModule.switchSource;
  deleteSource = repositoryModule.deleteSource;

  await appShellDb.sources.clear();
  await appShellDb.settings.clear();
  await ledgerDb.accounts.clear();
  await ledgerDb.transactions.clear();
  await ledgerDb.debtRecords.clear();
  await ledgerDb.debtRepayments.clear();
  await ledgerDb.loanPlatforms.clear();
  await ledgerDb.loanRecords.clear();
  await ledgerDb.loanInstallments.clear();
});

describe('repository multi-source behavior', () => {
  it('imports snapshot as a brand new source', async () => {
    const source = await createSource('A');
    await createAccount(source.id, { name: '现金', type: 'cash' });
    const snapshot = await exportSource(source.id);

    await importSnapshot(snapshot, {
      mode: 'create',
      newSourceName: 'B',
      originType: 'file',
      originLabel: 'backup.json'
    });

    const sources = await listSources();
    expect(sources).toHaveLength(2);
    const target = sources.find((item) => item.name === 'B');
    expect(target).toBeTruthy();

    const data = await getLedgerData(target!.id);
    expect(data.accounts).toHaveLength(1);
    expect(data.accounts[0]?.sourceId).toBe(target!.id);
  });

  it('overwrites only the selected target source', async () => {
    const sourceA = await createSource('A');
    await createAccount(sourceA.id, { name: '账户 A', type: 'cash' });
    const snapshotA: AppSnapshot = await exportSource(sourceA.id);

    const sourceB = await createSource('B');
    await createAccount(sourceB.id, { name: '账户 B', type: 'bank' });
    await switchSource(sourceB.id);

    await importSnapshot(snapshotA, {
      mode: 'overwrite',
      targetSourceId: sourceB.id,
      originType: 'file',
      originLabel: 'replace.json'
    });

    const dataA = await getLedgerData(sourceA.id);
    const dataB = await getLedgerData(sourceB.id);

    expect(dataA.accounts[0]?.name).toBe('账户 A');
    expect(dataB.accounts[0]?.name).toBe('账户 A');
    expect(dataB.accounts[0]?.sourceId).toBe(sourceB.id);
  });

  it('keeps target metadata when overwriting existing source', async () => {
    const sourceA = await createSource('A');
    await createAccount(sourceA.id, { name: '账户 A', type: 'cash' });
    const snapshotA = await exportSource(sourceA.id);

    const sourceB = await createSource('B');
    await renameSource(sourceB.id, 'B2');
    await importSnapshot(snapshotA, {
      mode: 'overwrite',
      targetSourceId: sourceB.id,
      originType: 'url',
      originLabel: 'https://example.com/snapshot.json'
    });

    const refreshed = (await listSources()).find((source) => source.id === sourceB.id);
    expect(refreshed?.id).toBe(sourceB.id);
    expect(refreshed?.name).toBe('B2');
    expect(refreshed?.createdAt).toBe(sourceB.createdAt);
    expect(refreshed?.originType).toBe('url');
    expect(refreshed?.originLabel).toBe('https://example.com/snapshot.json');
  });

  it('switches to most recently opened remaining source after deleting active source', async () => {
    const sourceA = await createSource('A');
    const sourceB = await createSource('B');
    const sourceC = await createSource('C');

    await switchSource(sourceB.id);
    await switchSource(sourceA.id);
    await switchSource(sourceC.id);

    await deleteSource(sourceC.id);
    const appState = await getAppState();
    expect(appState.activeSourceId).toBe(sourceA.id);
  });
});
