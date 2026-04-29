import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'f4d';
const isPagesBuild = process.env.GITHUB_ACTIONS === 'true';

function normalizeBase(rawBase: string): string {
  const trimmed = rawBase.trim();
  if (!trimmed) {
    return '/';
  }

  const leading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

const repoBase = `/${repositoryName}/`;
const envBase = process.env.PAGES_BASE_PATH;
const useRepoBase = process.env.PAGES_USE_REPO_BASE === 'true';
const base = envBase
  ? normalizeBase(envBase)
  : isPagesBuild && useRepoBase
  ? repoBase
  : '/';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src')
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['apple-touch-icon.png', 'favicon.svg', '404.html'],
      manifestFilename: 'manifest.json',
      manifest: {
        id: 'ledger-pwa',
        name: '多数据源账务助手',
        short_name: '账务助手',
        description: '纯前端、多数据源、本地持久化的账务与贷款管理应用',
        start_url: base,
        scope: base,
        display: 'standalone',
        lang: 'zh-CN',
        orientation: 'portrait-primary',
        theme_color: '#0d5c4d',
        background_color: '#faf8f4',
        icons: [
          {
            src: `${base}pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: `${base}pwa-216x216.png`,
            sizes: '216x216',
            type: 'image/png'
          },
          {
            src: `${base}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: `${base}maskable-icon-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  build: {
    sourcemap: true
  }
});
