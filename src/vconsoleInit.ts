/**
 * 开发环境自动启用；生产环境在 URL 加 `?vconsole=1` 开启（适合手机端调试）。
 * 使用动态 import，避免正常访问生产包时打入 vconsole。
 */
export function initVConsole(): void {
  const dev = import.meta.env.DEV;
  const query = new URLSearchParams(window.location.search).get('vconsole');
  if (!dev && query !== '1') {
    return;
  }

  void import('vconsole').then(({ default: VConsole }) => {
    new VConsole();
  });
}
