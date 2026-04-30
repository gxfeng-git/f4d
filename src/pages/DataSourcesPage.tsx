import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '../components/EmptyState';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { toDateTimeLabel } from '../lib/date';
import { useAppContext } from '../store/AppContext';
import type { ImportMode } from '../types/models';
import { cn } from '@/lib/utils';

const fileInputClass =
  'flex h-9 w-full cursor-pointer items-center rounded-lg border border-[#86868b] bg-background px-3 py-0 text-sm leading-none text-foreground shadow-none transition-[color,box-shadow] file:mt-[3px] file:mb-[5px] file:mr-3 file:box-border file:inline-flex file:h-7 file:cursor-pointer file:items-center file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-0 file:align-middle file:text-sm file:font-medium file:leading-none file:text-primary-foreground hover:file:bg-primary/90 dark:bg-transparent';

export function DataSourcesPage() {
  const {
    currentSource,
    sources,
    createEmptySource,
    renameExistingSource,
    switchActiveSource,
    deleteExistingSource,
    exportExistingSource,
    importFromText,
    importFromUrl
  } = useAppContext();
  const navigate = useNavigate();
  const [createName, setCreateName] = useState('');
  const [renameTarget, setRenameTarget] = useState('');
  const [renameName, setRenameName] = useState('');
  const [fileText, setFileText] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('create');
  const [newSourceName, setNewSourceName] = useState('');
  const [targetSourceId, setTargetSourceId] = useState('');
  const [urlValue, setUrlValue] = useState('');

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <PageHeading
          title="数据源"
          description="每个数据源是一套隔离账本。可创建、切换、导入/覆盖、导出与删除。"
        />
      </section>

      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="新建空数据源" description="从零建一套新账本。">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
            onSubmit={async (event) => {
              event.preventDefault();
              await createEmptySource(createName);
              setCreateName('');
              navigate('/dashboard');
            }}
          >
            <Input
              className="sm:flex-1"
              placeholder="如：家庭账本 / 公司周转"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              required
            />
            <Button type="submit" className="w-full rounded-lg sm:w-28 sm:shrink-0">
              创建
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="重命名" description="只改元信息，不动业务数据。">
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            onSubmit={async (event) => {
              event.preventDefault();
              await renameExistingSource(renameTarget, renameName);
              setRenameTarget('');
              setRenameName('');
            }}
          >
            <Select
              value={
                renameTarget && sources.some((s) => s.id === renameTarget) ? renameTarget : undefined
              }
              onValueChange={(v) => setRenameTarget(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择数据源" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="新名称"
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              required
            />
            <Button type="submit" variant="dark" className="w-full rounded-lg sm:w-24 sm:shrink-0">
              重命名
            </Button>
          </form>
        </SectionCard>
      </div>
      </section>

      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="文件导入" description="新建数据源或覆盖已有。">
          <div className="grid gap-3">
            <input
              className={fileInputClass}
              type="file"
              accept="application/json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                setFileText(await file.text());
              }}
            />
            <div
              className={cn(
                'inline-flex w-full max-w-md overflow-hidden rounded-lg border border-[#d2d2d7] bg-[#fafafc] p-0.5 dark:border-[#424245] dark:bg-[#1d1d1f]'
              )}
            >
              <Button
                type="button"
                className="flex-1 rounded-md"
                variant={importMode === 'create' ? 'default' : 'ghost'}
                onClick={() => setImportMode('create')}
              >
                新建
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-md"
                variant={importMode === 'overwrite' ? 'default' : 'ghost'}
                onClick={() => setImportMode('overwrite')}
              >
                覆盖
              </Button>
            </div>
            {importMode === 'create' ? (
              <Input
                placeholder="新数据源名称"
                value={newSourceName}
                onChange={(event) => setNewSourceName(event.target.value)}
              />
            ) : (
              <Select
                value={
                  targetSourceId && sources.some((s) => s.id === targetSourceId)
                    ? targetSourceId
                    : undefined
                }
                onValueChange={setTargetSourceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="要覆盖的数据源" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              disabled={!fileText || (importMode === 'create' ? !newSourceName.trim() : !targetSourceId)}
              onClick={async () => {
                if (importMode === 'overwrite') {
                  const targetName = sources.find((source) => source.id === targetSourceId)?.name ?? '目标';
                  const confirmed = window.confirm(`确定用文件覆盖「${targetName}」？`);
                  if (!confirmed) {
                    return;
                  }
                }

                await importFromText(fileText, {
                  mode: importMode,
                  newSourceName: importMode === 'create' ? newSourceName.trim() : undefined,
                  targetSourceId: importMode === 'overwrite' ? targetSourceId : undefined,
                  originType: 'file',
                  originLabel: '本地 JSON 文件'
                });
                setFileText('');
                setNewSourceName('');
                setTargetSourceId('');
                if (importMode === 'create') {
                  navigate('/dashboard');
                }
              }}
            >
              导入文件
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="链接导入" description="需 HTTPS。无 CORS 时请先下载再文件导入。">
          <div className="grid gap-3">
            <Input
              placeholder="https://example.com/data.json"
              value={urlValue}
              onChange={(event) => setUrlValue(event.target.value)}
            />
            <div
              className={cn(
                'inline-flex w-full max-w-md overflow-hidden rounded-lg border border-[#d2d2d7] bg-[#fafafc] p-0.5 dark:border-[#424245] dark:bg-[#1d1d1f]'
              )}
            >
              <Button
                type="button"
                className="flex-1 rounded-md"
                variant={importMode === 'create' ? 'default' : 'ghost'}
                onClick={() => setImportMode('create')}
              >
                新建
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-md"
                variant={importMode === 'overwrite' ? 'default' : 'ghost'}
                onClick={() => setImportMode('overwrite')}
              >
                覆盖
              </Button>
            </div>
            {importMode === 'create' ? (
              <Input
                placeholder="新数据源名称"
                value={newSourceName}
                onChange={(event) => setNewSourceName(event.target.value)}
              />
            ) : (
              <Select
                value={
                  targetSourceId && sources.some((s) => s.id === targetSourceId)
                    ? targetSourceId
                    : undefined
                }
                onValueChange={setTargetSourceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="要覆盖的数据源" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              variant="secondary"
              disabled={!urlValue.trim() || (importMode === 'create' ? !newSourceName.trim() : !targetSourceId)}
              onClick={async () => {
                if (importMode === 'overwrite') {
                  const targetName = sources.find((source) => source.id === targetSourceId)?.name ?? '目标';
                  const confirmed = window.confirm(`确定用链接数据覆盖「${targetName}」？`);
                  if (!confirmed) {
                    return;
                  }
                }

                await importFromUrl(urlValue, {
                  mode: importMode,
                  newSourceName: importMode === 'create' ? newSourceName.trim() : undefined,
                  targetSourceId: importMode === 'overwrite' ? targetSourceId : undefined,
                  originType: 'url',
                  originLabel: urlValue
                });
                setUrlValue('');
                if (importMode === 'create') {
                  navigate('/dashboard');
                }
              }}
            >
              从链接导入
            </Button>
          </div>
        </SectionCard>
      </div>
      </section>

      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
      <SectionCard title="全部数据源" description="删除会二次确认；删当前会切到最近使用。">
        <div className="space-y-2.5">
          {sources.length === 0 ? (
            <EmptyState>还没有数据源。请先创建或导入。</EmptyState>
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                className="ui-list-row !flex-col !items-stretch gap-3 xl:!flex-row xl:!items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{source.name}</p>
                    {currentSource?.id === source.id ? (
                      <Badge className="text-[10px]">当前</Badge>
                    ) : null}
                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                      {source.originType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    最近：{toDateTimeLabel(source.lastOpenedAt)} · 更新 {toDateTimeLabel(source.updatedAt)}
                  </p>
                  {source.originLabel ? <p className="ui-mono mt-1 block truncate">{source.originLabel}</p> : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    onClick={() => void switchActiveSource(source.id)}
                  >
                    切换
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    onClick={() => void exportExistingSource(source.id)}
                  >
                    导出
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                    onClick={() => {
                      const confirmed = window.confirm(`确定删除「${source.name}」？不可撤销。`);
                      if (confirmed) {
                        void deleteExistingSource(source.id);
                      }
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
      </section>
    </div>
  );
}
