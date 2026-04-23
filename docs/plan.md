# 实施计划

## Summary

- 从空仓开始搭建 `Vite + React + TypeScript + Tailwind CSS + daisyUI` 的纯前端 PWA，支持 PC 与移动端响应式使用，可安装到手机桌面，并可离线访问已缓存的前端静态资源与本地 IndexedDB 数据。
- 使用 `pnpm` 作为唯一包管理工具。
- 依赖主版本策略：
  - `vite@8.x`
  - `tailwindcss@4.x`
  - `daisyui@5.5.x`
- 数据层采用 `Dexie + Zod`。
- 多数据源严格隔离，所有操作显式带 `sourceId`。
- 移动端沉浸式体验通过标准 PWA `display: "standalone"` 实现。
- 支持 GitHub Pages 发布流程。
- 每次功能变更都必须同步更新受影响文档。

## Key Decisions

- `BrowserRouter`（history 路由）作为默认路由，并使用 `404.html` 回跳方案兼容 GitHub Pages。
- 数据库存储拆分为 `app-shell-db` 与 `ledger-db`。
- 导入 JSON 时支持：
  - 作为新数据源导入
  - 覆盖任意已有数据源
- 余额不直接存储，统一通过流水回算。
- Service Worker 只缓存静态资源，不缓存业务数据。

## Documentation Rule

- `README.md`、`docs/*.md` 是交付的一部分。
- 修改架构、数据模型、PWA 或部署流程时，必须同步更新对应文档。
