import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { DebtsPage } from './pages/DebtsPage';
import { LoansPage } from './pages/LoansPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAppContext } from './store/AppContext';
import { getBaseUrl } from './lib/pwa';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-shell p-6">
      <div className="rounded-[2rem] border border-base-200 bg-base-100 p-8 text-center shadow-xl">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-4 text-base-content/70">正在初始化本地数据与迁移状态…</p>
      </div>
    </div>
  );
}

function ErrorScreen({
  message,
  onRetry,
  sources,
  onExport
}: {
  message: string;
  onRetry: () => Promise<void>;
  sources: Array<{ id: string; name: string }>;
  onExport: (sourceId: string) => Promise<void>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-shell p-6">
      <div className="max-w-xl rounded-[2rem] border border-error/20 bg-base-100 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-error">启动迁移失败</h1>
        <p className="mt-3 leading-7 text-base-content/75">
          当前本地库未能安全完成迁移，因此应用没有进入主界面。你可以重试迁移，或先导出受影响数据源备份。
        </p>
        <pre className="mt-4 overflow-auto rounded-2xl bg-base-200 p-4 text-sm text-base-content/75">{message}</pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => void onRetry()}>
            重试迁移
          </button>
          {sources.length > 0 ? (
            <details className="dropdown">
              <summary className="btn btn-outline">导出受影响数据源备份</summary>
              <ul className="menu dropdown-content z-10 mt-2 w-72 rounded-box border border-base-200 bg-base-100 p-2 shadow-lg">
                {sources.map((source) => (
                  <li key={source.id}>
                    <button type="button" onClick={() => void onExport(source.id)}>
                      导出：{source.name}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { bootStatus, errorMessage, retryBootstrap, sources, exportExistingSource } = useAppContext();

  if (bootStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (bootStatus === 'error') {
    return (
      <ErrorScreen
        message={errorMessage ?? '未知错误'}
        onRetry={retryBootstrap}
        sources={sources}
        onExport={exportExistingSource}
      />
    );
  }

  return (
    <BrowserRouter basename={getBaseUrl()}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
