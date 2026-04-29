import { useNavigate } from 'react-router-dom';
import { IconDatabase } from './NavIcons';
import { useAppContext } from '../store/AppContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SourceSwitcher() {
  const navigate = useNavigate();
  const { appState, sources, switchActiveSource } = useAppContext();

  if (sources.length === 0) {
    return (
      <div className="w-full max-w-full space-y-1.5 px-2">
        <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="text-primary/90">
            <IconDatabase />
          </span>
          当前数据源
        </Label>
        <p className="text-xs text-muted-foreground">暂无数据源，请先创建</p>
      </div>
    );
  }

  const activeId = appState?.activeSourceId ?? '';
  const selectValue = activeId && sources.some((s) => s.id === activeId) ? activeId : undefined;

  return (
    <div className="w-full max-w-full space-y-1.5 px-2">
      <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <span className="text-primary/90">
          <IconDatabase />
        </span>
        当前数据源
      </Label>
      <Select
        value={selectValue}
        onValueChange={async (value) => {
          if (!value) {
            return;
          }
          await switchActiveSource(value);
          navigate('/dashboard');
        }}
      >
        <SelectTrigger className="h-9 w-full bg-background">
          <SelectValue placeholder="请选择数据源" />
        </SelectTrigger>
        <SelectContent>
          {sources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
