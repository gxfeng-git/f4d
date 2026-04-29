import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { DebtsPage } from './pages/DebtsPage';
import { LoansPage } from './pages/LoansPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAppContext } from './store/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm border-[#d2d2d7] bg-card text-center shadow-none dark:border-[#424245]">
        <CardContent className="flex flex-col items-center p-8">
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
          <p className="mt-4 text-[17px] text-muted-foreground">正在初始化本地数据与迁移状态…</p>
        </CardContent>
      </Card>
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
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl border-destructive/40 bg-card shadow-none sm:p-2 dark:border-destructive/50">
        <CardHeader>
          <CardTitle className="font-display text-xl text-destructive">启动迁移失败</CardTitle>
          <CardDescription className="text-[17px] text-foreground/90">
            本地库未能安全完成迁移。你可以重试迁移，或先导出受影响数据源备份。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="ui-mono max-h-48 overflow-auto rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] p-3 text-left text-xs dark:border-[#424245] dark:bg-[#272729]">
            {message}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="rounded-lg" onClick={() => void onRetry()}>
              重试迁移
            </Button>
            {sources.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="rounded-lg">
                    导出受影响数据源
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  {sources.map((source) => (
                    <DropdownMenuItem key={source.id} onClick={() => void onExport(source.id)}>
                      导出：{source.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </CardContent>
      </Card>
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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
