# 部署说明

## GitHub Pages

项目默认使用 GitHub Pages 托管前端静态资源。

### 关键点

- `vite@8` 需要 Node.js `22.12+` 或更新版本。
- GitHub Actions 环境下，Vite 会根据 `GITHUB_REPOSITORY` 自动推导 `base` 路径。
- 路由默认使用 `HashRouter`，避免刷新子路径 404。
- `public/404.html` 作为额外兜底入口。
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
