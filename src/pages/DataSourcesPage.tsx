import { useState } from 'react';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';
import { toDateTimeLabel } from '../lib/date';
import { useAppContext } from '../store/AppContext';
import type { ImportMode } from '../types/models';

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
  const [createName, setCreateName] = useState('');
  const [renameTarget, setRenameTarget] = useState('');
  const [renameName, setRenameName] = useState('');
  const [fileText, setFileText] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('create');
  const [newSourceName, setNewSourceName] = useState('');
  const [targetSourceId, setTargetSourceId] = useState('');
  const [urlValue, setUrlValue] = useState('');

  return (
    <div className="space-y-6">
      <PageHeading
        title="数据源管理"
        description="每个数据源都是一套完全隔离的独立账本。你可以创建、切换、导入、覆盖、导出和删除任意数据源。"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="新建空数据源" description="适合从零开始录入一套全新的账本。">
          <form
            className="flex flex-col gap-4 sm:flex-row"
            onSubmit={async (event) => {
              event.preventDefault();
              await createEmptySource(createName);
              setCreateName('');
            }}
          >
            <input
              className="input input-bordered flex-1"
              placeholder="例如：家庭账本 / 公司周转"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              required
            />
            <button className="btn btn-primary">创建</button>
          </form>
        </SectionCard>

        <SectionCard title="重命名数据源" description="只修改元信息，不影响内部业务数据。">
          <form
            className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              await renameExistingSource(renameTarget, renameName);
              setRenameTarget('');
              setRenameName('');
            }}
          >
            <select
              className="select select-bordered"
              value={renameTarget}
              onChange={(event) => setRenameTarget(event.target.value)}
              required
            >
              <option value="" disabled>
                选择数据源
              </option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
            <input
              className="input input-bordered"
              placeholder="新名称"
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              required
            />
            <button className="btn btn-secondary">重命名</button>
          </form>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="文件导入" description="支持作为新数据源导入，也支持覆盖任意一个已存在数据源。">
          <div className="grid gap-4">
            <input
              className="file-input file-input-bordered w-full"
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
            <div className="join">
              <button
                type="button"
                className={`join-item btn ${importMode === 'create' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setImportMode('create')}
              >
                作为新数据源
              </button>
              <button
                type="button"
                className={`join-item btn ${importMode === 'overwrite' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setImportMode('overwrite')}
              >
                覆盖已有数据源
              </button>
            </div>
            {importMode === 'create' ? (
              <input
                className="input input-bordered"
                placeholder="新数据源名称"
                value={newSourceName}
                onChange={(event) => setNewSourceName(event.target.value)}
              />
            ) : (
              <select
                className="select select-bordered"
                value={targetSourceId}
                onChange={(event) => setTargetSourceId(event.target.value)}
              >
                <option value="" disabled>
                  选择要覆盖的数据源
                </option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            )}
            <button
              className="btn btn-primary"
              type="button"
              disabled={!fileText || (importMode === 'create' ? !newSourceName.trim() : !targetSourceId)}
              onClick={async () => {
                if (importMode === 'overwrite') {
                  const targetName = sources.find((source) => source.id === targetSourceId)?.name ?? '目标数据源';
                  const confirmed = window.confirm(`确定用当前文件覆盖“${targetName}”吗？仅会替换该数据源的数据。`);
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
              }}
            >
              开始导入文件
            </button>
          </div>
        </SectionCard>

        <SectionCard title="链接导入" description="仅支持 HTTPS JSON 链接，若目标不支持 CORS 请先手动下载再改用文件导入。">
          <div className="grid gap-4">
            <input
              className="input input-bordered"
              placeholder="https://example.com/data.json"
              value={urlValue}
              onChange={(event) => setUrlValue(event.target.value)}
            />
            {importMode === 'create' ? (
              <input
                className="input input-bordered"
                placeholder="新数据源名称"
                value={newSourceName}
                onChange={(event) => setNewSourceName(event.target.value)}
              />
            ) : (
              <select
                className="select select-bordered"
                value={targetSourceId}
                onChange={(event) => setTargetSourceId(event.target.value)}
              >
                <option value="" disabled>
                  选择要覆盖的数据源
                </option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            )}
            <button
              className="btn btn-secondary"
              type="button"
              disabled={!urlValue.trim() || (importMode === 'create' ? !newSourceName.trim() : !targetSourceId)}
              onClick={async () => {
                if (importMode === 'overwrite') {
                  const targetName = sources.find((source) => source.id === targetSourceId)?.name ?? '目标数据源';
                  const confirmed = window.confirm(`确定用该链接数据覆盖“${targetName}”吗？仅会替换该数据源的数据。`);
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
              }}
            >
              从链接导入
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="数据源列表" description="删除前会二次确认；删除当前激活数据源后，会自动切换到最近使用的数据源。">
        <div className="grid gap-3">
          {sources.length === 0 ? (
            <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">
              还没有数据源。请先创建或导入一个账本。
            </div>
          ) : (
            sources.map((source) => (
              <div key={source.id} className="rounded-2xl border border-base-200 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{source.name}</p>
                      {currentSource?.id === source.id ? <span className="badge badge-primary">当前</span> : null}
                      <span className="badge badge-outline">{source.originType}</span>
                    </div>
                    <p className="text-sm text-base-content/60">
                      最近打开：{toDateTimeLabel(source.lastOpenedAt)} · 更新：{toDateTimeLabel(source.updatedAt)}
                    </p>
                    {source.originLabel ? <p className="mt-1 text-sm text-base-content/70">{source.originLabel}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => void switchActiveSource(source.id)}>
                      切换
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => void exportExistingSource(source.id)}>
                      导出 JSON
                    </button>
                    <button
                      className="btn btn-error btn-outline btn-sm"
                      onClick={() => {
                        const confirmed = window.confirm(`确定删除数据源“${source.name}”吗？此操作不可撤销。`);
                        if (confirmed) {
                          void deleteExistingSource(source.id);
                        }
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
