import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

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
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true
  }
});
