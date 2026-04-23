# 架构说明

## 分层

- `src/store/AppContext.tsx`：应用级启动、激活数据源、主题和所有核心操作入口。
- `src/services/db.ts`：Dexie 数据库定义，拆分为 `app-shell-db` 与 `ledger-db`。
- `src/services/repository.ts`：所有本地业务读写、导入导出、覆盖、切换、迁移操作。
- `src/services/dataSourceRegistry.ts`：数据源注册服务抽象，统一暴露创建/切换/删除/导入导出 API。
- `src/services/ledger.ts`：纯计算层，负责余额、待还、预测和看板汇总。
- `src/pages/*`：面向路由的页面层。

## 路由

- `/dashboard`
- `/accounts`
- `/debts`
- `/loans`
- `/transactions`
- `/data-sources`

应用默认使用 `BrowserRouter`（history 路由）。GitHub Pages 刷新深层路由时，通过 `public/404.html` 将地址回跳到应用入口并恢复原始路径。

## 响应式外壳

- 桌面端使用侧边导航 + 顶部数据源切换器。
- 移动端使用顶部应用头 + tabs 导航。
- 在 `display-mode: standalone` 下，页面自动为安全区增加留白。

## 数据边界

- 所有业务记录都必须携带 `sourceId`。
- `ledger-db` 为常用查询建立 `[sourceId+id]`、`[sourceId+occurredAt]` 等复合索引，减少串源查询风险。
- UI 仅使用“当前激活数据源”的数据。
- 不提供跨数据源统计、合并看板或跨源转账。
