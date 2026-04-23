import type { AppSnapshot, DataSourceMeta, ImportSourceOptions } from '../types/models';
import {
  createSource,
  deleteSource,
  exportSource,
  importSnapshot,
  listSources,
  renameSource,
  switchSource
} from './repository';

export class DataSourceRegistryService {
  listSources(): Promise<DataSourceMeta[]> {
    return listSources();
  }

  createSource(name: string): Promise<DataSourceMeta> {
    return createSource(name);
  }

  renameSource(sourceId: string, name: string): Promise<void> {
    return renameSource(sourceId, name);
  }

  switchSource(sourceId: string): Promise<void> {
    return switchSource(sourceId);
  }

  deleteSource(sourceId: string): Promise<string | null> {
    return deleteSource(sourceId);
  }

  exportSource(sourceId: string): Promise<AppSnapshot> {
    return exportSource(sourceId);
  }

  importSource(snapshot: AppSnapshot, options: ImportSourceOptions): Promise<string> {
    return importSnapshot(snapshot, options);
  }
}

export const dataSourceRegistryService = new DataSourceRegistryService();
