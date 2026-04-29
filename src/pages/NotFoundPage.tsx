import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeading } from '../components/PageHeading';
import { SectionCard } from '../components/SectionCard';

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="rounded-[28px] bg-[#f5f5f7] px-4 py-8 dark:bg-[#272729] sm:px-6">
        <PageHeading title="页面不存在" description="你访问的路径不在应用路由中。" />
      </section>
      <section className="rounded-[28px] bg-white px-4 py-8 dark:bg-card sm:px-6">
        <SectionCard title="404" description="检查链接或返回首页。">
          <p className="text-[17px] text-muted-foreground">
            路径 <span className="ui-mono font-medium text-foreground">{location.pathname}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-lg">
              <Link to="/dashboard">看板</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg">
              <Link to="/data-sources">数据源</Link>
            </Button>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
