import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren
} from 'react';
import { getStandaloneMode } from '../lib/pwa';
import {
  adjustBalance,
  createAccount,
  createDebtRecord,
  createLoanPlatform,
  createLoanRecord,
  createManualTransaction,
  ensureAppState,
  getAppState,
  getLedgerData,
  repayDebt,
  runLocalMigrations,
  updateAppState,
  payLoanInstallment
} from '../services/repository';
import { dataSourceRegistryService } from '../services/dataSourceRegistry';
import { migrateSnapshot, parseSnapshot } from '../services/snapshot';
import type {
  AppSnapshot,
  AppState,
  BalanceAdjustmentInput,
  CreateAccountInput,
  CreateDebtRecordInput,
  CreateLoanPlatformInput,
  CreateLoanRecordInput,
  CreateManualTransactionInput,
  DataSourceMeta,
  ImportSourceOptions,
  PayLoanInstallmentInput,
  RepayDebtInput,
  SourceLedgerData,
  ThemeMode
} from '../types/models';

type BootStatus = 'loading' | 'ready' | 'error';

interface AppContextValue {
  bootStatus: BootStatus;
  errorMessage: string | null;
  sources: DataSourceMeta[];
  appState: AppState | null;
  currentSource: DataSourceMeta | null;
  currentData: SourceLedgerData | null;
  isStandalone: boolean;
  retryBootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  createEmptySource: (name: string) => Promise<void>;
  renameExistingSource: (sourceId: string, name: string) => Promise<void>;
  switchActiveSource: (sourceId: string) => Promise<void>;
  deleteExistingSource: (sourceId: string) => Promise<void>;
  exportExistingSource: (sourceId: string) => Promise<void>;
  importFromText: (value: string, options: ImportSourceOptions) => Promise<void>;
  importFromUrl: (url: string, options: ImportSourceOptions) => Promise<void>;
  createAccountEntry: (input: CreateAccountInput) => Promise<void>;
  createManualTransactionEntry: (input: CreateManualTransactionInput) => Promise<void>;
  adjustAccountBalance: (input: BalanceAdjustmentInput) => Promise<void>;
  createDebtEntry: (input: CreateDebtRecordInput) => Promise<void>;
  repayDebtEntry: (input: RepayDebtInput) => Promise<void>;
  createLoanPlatformEntry: (input: CreateLoanPlatformInput) => Promise<void>;
  createLoanEntry: (input: CreateLoanRecordInput) => Promise<void>;
  payLoanInstallmentEntry: (input: PayLoanInstallmentInput) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function downloadJson(filename: string, value: AppSnapshot): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AppProvider({ children }: PropsWithChildren) {
  const [bootStatus, setBootStatus] = useState<BootStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sources, setSources] = useState<DataSourceMeta[]>([]);
  const [appState, setAppStateState] = useState<AppState | null>(null);
  const [currentData, setCurrentData] = useState<SourceLedgerData | null>(null);
  const standaloneRef = useRef(getStandaloneMode());

  async function loadAll(): Promise<void> {
    const nextAppState = await getAppState();
    const nextSources = await dataSourceRegistryService.listSources();
    setSources(nextSources);
    setAppStateState(nextAppState);

    if (nextAppState.activeSourceId) {
      setCurrentData(await getLedgerData(nextAppState.activeSourceId));
    } else {
      setCurrentData(null);
    }
  }

  async function bootstrap(): Promise<void> {
    try {
      setBootStatus('loading');
      setErrorMessage(null);
      await ensureAppState();
      await runLocalMigrations();
      await loadAll();
      setBootStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : '初始化失败。';
      setErrorMessage(message);
      try {
        setSources(await dataSourceRegistryService.listSources());
      } catch {
        setSources([]);
      }
      setBootStatus('error');
    }
  }

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!appState) {
      return;
    }

    const root = document.documentElement;
    const resolvedTheme = appState.theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : appState.theme;

    root.dataset.theme = resolvedTheme;
    root.classList.toggle('dark', resolvedTheme === 'dark');
  }, [appState]);

  const currentSource = appState?.activeSourceId
    ? sources.find((source) => source.id === appState.activeSourceId) ?? null
    : null;

  async function refresh(): Promise<void> {
    await loadAll();
  }

  async function setTheme(theme: ThemeMode): Promise<void> {
    const nextState = await updateAppState({ theme });
    setAppStateState(nextState);
  }

  async function createEmptySource(name: string): Promise<void> {
    await dataSourceRegistryService.createSource(name);
    await refresh();
  }

  async function renameExistingSource(sourceId: string, name: string): Promise<void> {
    await dataSourceRegistryService.renameSource(sourceId, name);
    await refresh();
  }

  async function switchActiveSource(sourceId: string): Promise<void> {
    await dataSourceRegistryService.switchSource(sourceId);
    await refresh();
  }

  async function deleteExistingSource(sourceId: string): Promise<void> {
    await dataSourceRegistryService.deleteSource(sourceId);
    await refresh();
  }

  async function exportExistingSource(sourceId: string): Promise<void> {
    const source = sources.find((item) => item.id === sourceId);
    const snapshot = await dataSourceRegistryService.exportSource(sourceId);
    downloadJson(`${source?.name ?? 'ledger'}-${new Date().toISOString().slice(0, 10)}.json`, snapshot);
  }

  async function importSnapshotValue(snapshot: AppSnapshot, options: ImportSourceOptions): Promise<void> {
    await dataSourceRegistryService.importSource(migrateSnapshot(snapshot), options);
    await refresh();
  }

  async function importFromText(value: string, options: ImportSourceOptions): Promise<void> {
    const snapshot = parseSnapshot(JSON.parse(value));
    await importSnapshotValue(snapshot, options);
  }

  async function importFromUrl(url: string, options: ImportSourceOptions): Promise<void> {
    if (!url.startsWith('https://')) {
      throw new Error('链接导入仅支持 https:// 地址。');
    }

    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new Error('无法下载该链接，请检查网络或改用文件导入。');
    }

    if (!response.ok) {
      throw new Error(`下载失败：HTTP ${response.status}`);
    }

    const text = await response.text();
    try {
      await importFromText(text, options);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('链接资源未允许跨域访问，请先手动下载 JSON 文件后再导入。');
      }
      throw error;
    }
  }

  async function withCurrentSource<T>(action: (sourceId: string) => Promise<T>): Promise<T> {
    if (!appState?.activeSourceId) {
      throw new Error('请先创建或切换到一个数据源。');
    }

    const result = await action(appState.activeSourceId);
    await refresh();
    return result;
  }

  const value: AppContextValue = {
    bootStatus,
    errorMessage,
    sources,
    appState,
    currentSource,
    currentData,
    isStandalone: standaloneRef.current,
    retryBootstrap: bootstrap,
    refresh,
    setTheme,
    createEmptySource,
    renameExistingSource,
    switchActiveSource,
    deleteExistingSource,
    exportExistingSource,
    importFromText,
    importFromUrl,
    createAccountEntry: async (input) => withCurrentSource((sourceId) => createAccount(sourceId, input)),
    createManualTransactionEntry: async (input) =>
      withCurrentSource((sourceId) => createManualTransaction(sourceId, input)),
    adjustAccountBalance: async (input) => withCurrentSource((sourceId) => adjustBalance(sourceId, input)),
    createDebtEntry: async (input) => withCurrentSource((sourceId) => createDebtRecord(sourceId, input)),
    repayDebtEntry: async (input) => withCurrentSource((sourceId) => repayDebt(sourceId, input)),
    createLoanPlatformEntry: async (input) =>
      withCurrentSource((sourceId) => createLoanPlatform(sourceId, input)),
    createLoanEntry: async (input) => withCurrentSource((sourceId) => createLoanRecord(sourceId, input)),
    payLoanInstallmentEntry: async (input) =>
      withCurrentSource((sourceId) => payLoanInstallment(sourceId, input))
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext 必须在 AppProvider 内使用。');
  }
  return context;
}
