import { useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const CHANNEL_NAME = 'ledger-pwa-updates';

export function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);
  const [remoteSignal, setRemoteSignal] = useState(false);
  const channel = useMemo(() => {
    if (typeof BroadcastChannel === 'undefined') {
      return null;
    }

    return new BroadcastChannel(CHANNEL_NAME);
  }, []);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW();

  useEffect(() => {
    if (!channel) {
      return;
    }

    const onMessage = (event: MessageEvent<{ type: 'update-available' | 'apply-update' }>) => {
      if (event.data?.type === 'update-available') {
        setRemoteSignal(true);
      }

      if (event.data?.type === 'apply-update') {
        void updateServiceWorker(true);
      }
    };

    channel.addEventListener('message', onMessage);
    return () => channel.removeEventListener('message', onMessage);
  }, [channel, updateServiceWorker]);

  useEffect(() => {
    if (needRefresh) {
      channel?.postMessage({ type: 'update-available' });
    }
  }, [channel, needRefresh]);

  const visible = (needRefresh || remoteSignal) && !dismissed;

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-lg rounded-3xl border border-primary/20 bg-base-100 p-5 shadow-2xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">新版本已可用</h3>
          <p className="text-sm leading-6 text-base-content/70">
            更新只会刷新前端静态资源，不会清除本地数据源和账务数据。若当前表单有未提交内容，刷新后仍可能丢失未保存输入。
          </p>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <button className="btn btn-ghost" onClick={() => setDismissed(true)}>
            稍后再说
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const confirmed = window.confirm('确认立即更新吗？未提交的表单输入可能会丢失，但本地数据不会被清除。');
              if (!confirmed) {
                return;
              }

              channel?.postMessage({ type: 'apply-update' });
              void updateServiceWorker(true);
            }}
          >
            立即更新
          </button>
        </div>
      </div>
    </div>
  );
}
