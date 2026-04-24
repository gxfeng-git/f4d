import { Link, useLocation } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <PageHeading title="页面不存在" description="你访问的路径在当前应用中不存在。" />
      <SectionCard title="404" description="请检查链接是否正确，或返回首页继续操作。">
        <p className="text-sm text-base-content/70">
          当前路径：<span className="font-mono text-base-content">{location.pathname}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="btn btn-primary" to="/dashboard">
            返回看板
          </Link>
          <Link className="btn btn-outline" to="/data-sources">
            数据源管理
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
