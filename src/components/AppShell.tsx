import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, type ComponentType } from 'react';
import {
  IconAppMark,
  IconBuilding,
  IconDashboard,
  IconDatabase,
  IconHandshake,
  IconReceipt,
  IconWallet
} from './NavIcons';
import { SourceSwitcher } from './SourceSwitcher';
import { useAppContext } from '../store/AppContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems: Array<{ to: string; label: string; Icon: ComponentType }> = [
  { to: '/dashboard', label: '看板', Icon: IconDashboard },
  { to: '/accounts', label: '账户', Icon: IconWallet },
  { to: '/debts', label: '借款', Icon: IconHandshake },
  { to: '/loans', label: '贷款', Icon: IconBuilding },
  { to: '/transactions', label: '流水', Icon: IconReceipt },
  { to: '/data-sources', label: '数据源', Icon: IconDatabase }
];

const EMPTY_SOURCE_REDIRECT_PATHS = new Set([
  '/',
  '/dashboard',
  '/accounts',
  '/debts',
  '/loans',
  '/transactions'
]);

function navIsActive(path: string, pathname: string): boolean {
  if (path === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function AppSidebarNav({ pathname }: { pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>导航</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const NavIcon = item.Icon;
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={navIsActive(item.to, pathname)} tooltip={item.label}>
                  <NavLink to={item.to}>
                    <NavIcon />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ThemeField() {
  const { appState, setTheme } = useAppContext();
  const raw = appState?.theme;
  const themeValue =
    raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'light';

  return (
    <div className="space-y-1.5 px-2">
      <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">主题</Label>
      <Select
        value={themeValue}
        onValueChange={(v) => void setTheme(v as 'light' | 'dark' | 'system')}
      >
        <SelectTrigger className="h-9 w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">浅色</SelectItem>
          <SelectItem value="dark">深色</SelectItem>
          <SelectItem value="system">跟随系统</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { appState, bootStatus, currentSource, sources } = useAppContext();
  const pathname = location.pathname;

  useEffect(() => {
    if (bootStatus !== 'ready') {
      return;
    }

    if (sources.length === 0 && EMPTY_SOURCE_REDIRECT_PATHS.has(location.pathname)) {
      navigate('/data-sources', { replace: true });
    }
  }, [bootStatus, location.pathname, navigate, sources.length]);

  return (
    <SidebarProvider
      className={cn(
        'mx-auto min-h-svh w-full max-w-[100rem] bg-background px-3 py-3 sm:px-4 sm:py-4 md:gap-4 md:px-6 md:py-5 lg:px-8'
      )}
    >
      <Sidebar
        variant="inset"
        collapsible="offcanvas"
        className="border-transparent md:border md:border-border"
      >
        <SidebarHeader className="border-b border-sidebar-border pb-4">
          <div className="flex items-center gap-3 px-1">
            <IconAppMark />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">账本</p>
              <h1 className="text-[17px] font-semibold leading-tight tracking-tight text-foreground">
                多数据源账务
              </h1>
            </div>
          </div>
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            本地离线、多账本管理。
          </p>
        </SidebarHeader>
        <SidebarContent className="gap-3 pt-2">
          <div className="px-0">
            <SourceSwitcher />
          </div>
          <ThemeField />
          <AppSidebarNav pathname={pathname} />
        </SidebarContent>
        <SidebarFooter className="mt-auto border-t border-sidebar-border">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent p-3 text-xs text-muted-foreground">
            <p className="font-medium text-sidebar-foreground">当前</p>
            <p className="mt-1 line-clamp-2">{currentSource?.name ?? '未选择数据源'}</p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-0 flex-1 bg-transparent p-0 shadow-none">
        <header className="mb-0 flex min-h-11 items-center gap-2 border-b border-border bg-[#f5f5f7] px-2 py-2 dark:bg-[#1d1d1f] md:hidden">
          <SidebarTrigger className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">多数据源账务</p>
            <h1 className="text-[17px] font-semibold leading-tight tracking-tight">助手</h1>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1240px] flex-1 px-0 py-4 sm:py-5 md:py-6 lg:py-8">
          <Outlet />
        </div>
      </SidebarInset>
      {appState?.activeSourceId === null ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 text-center text-xs text-muted-foreground backdrop-blur-sm md:hidden">
          请先创建或导入一个数据源
        </div>
      ) : null}
    </SidebarProvider>
  );
}
