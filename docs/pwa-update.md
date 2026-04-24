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

## 常见问题排查

### 从桌面图标启动后仍看到地址栏/底部工具栏

先确认是否真的进入了 `standalone` 模式：

- iOS：从主屏幕图标打开，而不是从 Safari 书签或分享面板里的“添加到阅读列表”。
- Android：从主屏幕图标打开，而不是从 Chrome 的“快捷方式”（快捷方式不等同于已安装的 WebAPK）。

如果仍不符合预期，优先检查：

- 站点是否为 HTTPS，且 `manifest.webmanifest` 能 200 打开。
- 图标是否可访问（至少 192/512，并包含 `maskable`）。
- 是否刚刚切换过域名或 `manifest.id`：已安装实例可能缓存旧配置，建议删除桌面图标后重新安装。

平台差异说明：

- iOS 的“全屏”体验与 Android Chrome 的 WebAPK 并不完全一致；部分系统 UI（例如顶部状态栏区域、手势条）仍会保留，这不属于浏览器地址栏。

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
