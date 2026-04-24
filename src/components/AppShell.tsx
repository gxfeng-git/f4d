import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { SourceSwitcher } from './SourceSwitcher';
import { useAppContext } from '../store/AppContext';
import { UpdatePrompt } from './UpdatePrompt';

const navItems = [
  { to: '/dashboard', label: '看板' },
  { to: '/accounts', label: '账户' },
  { to: '/debts', label: '借款' },
  { to: '/loans', label: '贷款' },
  { to: '/transactions', label: '流水' },
  { to: '/data-sources', label: '数据源' }
];

const EMPTY_SOURCE_REDIRECT_PATHS = new Set([
  '/',
  '/dashboard',
  '/accounts',
  '/debts',
  '/loans',
  '/transactions'
]);

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { appState, bootStatus, currentSource, isStandalone, setTheme, sources } = useAppContext();

  useEffect(() => {
    if (bootStatus !== 'ready') {
      return;
    }

    if (sources.length === 0 && EMPTY_SOURCE_REDIRECT_PATHS.has(location.pathname)) {
      navigate('/data-sources', { replace: true });
    }
  }, [bootStatus, location.pathname, navigate, sources.length]);

  return (
    <div className={`min-h-screen bg-app-shell ${isStandalone ? 'pb-safe' : ''}`}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col gap-6 rounded-[2rem] border border-base-200 bg-base-100/85 p-6 shadow-xl backdrop-blur md:flex">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">PWA Ledger</p>
            <h1 className="font-serif text-3xl font-bold">多数据源账务助手</h1>
            <p className="text-sm leading-6 text-base-content/70">
              单机离线、多账本隔离、移动端可安装。
            </p>
          </div>
          <SourceSwitcher />
          <label className="form-control gap-2">
            <span className="label-text text-xs uppercase tracking-[0.16em] text-base-content/60">主题</span>
            <select
              className="select select-bordered"
              value={appState?.theme ?? 'light'}
              onChange={(event) => void setTheme(event.target.value as 'light' | 'dark' | 'system')}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </select>
          </label>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-3xl bg-base-200/60 p-4 text-sm text-base-content/70">
            <p className="font-semibold text-base-content">{currentSource?.name ?? '暂无激活数据源'}</p>
            <p className="mt-1">从桌面启动时会以 `standalone` 模式隐藏浏览器地址栏和底部工具栏。</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="mb-4 rounded-[2rem] border border-base-200 bg-base-100/85 p-4 shadow-lg backdrop-blur md:hidden">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">PWA Ledger</p>
                <h1 className="mt-1 font-serif text-2xl font-bold">多数据源账务助手</h1>
              </div>
              <SourceSwitcher />
              <select
                className="select select-bordered"
                value={appState?.theme ?? 'light'}
                onChange={(event) => void setTheme(event.target.value as 'light' | 'dark' | 'system')}
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="system">跟随系统</option>
              </select>
              <div className="tabs tabs-boxed bg-base-200/70">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </header>

          <main className="space-y-6 rounded-[2rem] border border-base-200 bg-base-100/85 p-4 shadow-xl backdrop-blur md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <UpdatePrompt />
      {appState?.activeSourceId === null ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-base-200 bg-base-100/90 px-4 py-3 text-center text-sm text-base-content/70 backdrop-blur md:hidden">
          请先创建或导入一个数据源
        </div>
      ) : null}
    </div>
  );
}
