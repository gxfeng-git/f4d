# 部署说明

## GitHub Pages

项目默认使用 GitHub Pages 托管前端静态资源。

### 关键点

- `vite@8` 需要 Node.js `22.12+` 或更新版本。
- 默认构建 `base` 为 `/`，适配自定义域名根路径部署（例如 `https://f4d.gxfeng.xyz/`）。
- 若需要仓库子路径部署（例如 `https://<user>.github.io/f4d/`），可在构建前设置 `PAGES_USE_REPO_BASE=true`，或直接设置 `PAGES_BASE_PATH=/f4d/`。
- 路由默认使用 `BrowserRouter`（history 路由）。
- `public/404.html` 会把 GitHub Pages 的 404 路径回跳到应用入口，并通过 `redirect` 参数恢复原始路由。
- GitHub Pages 默认使用 HTTPS，满足 PWA 安装前提。

## 自动部署

工作流文件位于 `.github/workflows/deploy.yml`，主要步骤：

1. checkout 代码
2. 安装 pnpm
3. 配置 Node.js 与 pnpm 缓存
4. 执行 `pnpm install --frozen-lockfile`
5. 执行 `pnpm build`
6. 上传 `dist`
7. 发布到 GitHub Pages

## 发布后注意事项

- 首次发布后，manifest 和 Service Worker 的传播可能存在缓存延迟。
- 如果修改了图标、应用名、`display`、`start_url`，请在移动端重新验证已安装实例的更新表现。
