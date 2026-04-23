import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';

export function SourceSwitcher() {
  const navigate = useNavigate();
  const { appState, sources, switchActiveSource } = useAppContext();

  return (
    <label className="form-control w-full max-w-xs gap-2">
      <span className="label-text text-xs uppercase tracking-[0.16em] text-base-content/60">当前数据源</span>
      <select
        className="select select-bordered w-full"
        value={appState?.activeSourceId ?? ''}
        onChange={async (event) => {
          if (!event.target.value) {
            return;
          }

          await switchActiveSource(event.target.value);
          navigate('/dashboard');
        }}
      >
        <option value="" disabled>
          请选择数据源
        </option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
        ))}
      </select>
    </label>
  );
}
