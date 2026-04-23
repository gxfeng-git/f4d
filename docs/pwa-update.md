# PWA 与更新机制

## 安装与沉浸式启动

- manifest 默认配置 `display: "standalone"`。
- 提供 `id`、`start_url`、`scope`、`theme_color`、`background_color` 和高质量图标。
- HTML head 中包含：
  - `manifest`
  - `theme-color`
  - `mobile-web-app-capable`
  - `apple-mobile-web-app-capable`
  - `apple-touch-icon`

目标行为：

- 用户把应用添加到移动端桌面后，从桌面图标启动应用时进入沉浸式 PWA 模式。
- 普通浏览器标签页访问时，不尝试隐藏浏览器地址栏和工具栏。

## 缓存策略

- Service Worker 仅缓存前端静态资源。
- 账务数据始终存放于 IndexedDB。
- 链接导入的远程 JSON 不进入离线缓存。

## 更新提示

- 新版本下载完成后显示全局提示。
- 用户可选“立即更新”或“稍后再说”。
- “稍后再说”仅在当前会话内生效，刷新后会重新根据 SW 状态判断。
- “立即更新”前会再次确认，提醒未提交表单可能丢失。

## 多标签页同步

- 通过 `BroadcastChannel` 同步“有新版本”和“立即更新”事件。
- 避免多标签页出现新旧静态资源混用。

## 启动迁移

- 应用启动时先执行本地 schema 检查和迁移。
- 若迁移失败，不进入主业务界面。
- 错误页提供“重试迁移”和“导出受影响数据源备份”入口。
