import { useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card className="pointer-events-auto w-full max-w-md border-[#d2d2d7] bg-card shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] dark:border-[#424245] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">新版本已可用</CardTitle>
          <CardDescription className="text-[17px]">
            将刷新前端资源，不删除本地数据。未提交的表单可能在刷新后丢失。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-end gap-2 pt-0">
          <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => setDismissed(true)}>
            稍后再说
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-lg"
            onClick={() => {
              const confirmed = window.confirm('确认立即更新？未保存的输入可能丢失。');
              if (!confirmed) {
                return;
              }

              channel?.postMessage({ type: 'apply-update' });
              void updateServiceWorker(true);
            }}
          >
            立即更新
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
