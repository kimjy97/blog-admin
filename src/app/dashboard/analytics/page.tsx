import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { PopularTagsList } from "@/components/analytics/PopularTagsList";
import AnalyticsHeaderAction from "@/components/analytics/AnalyticsHeaderAction";
import PageLayout from "@/components/layout/PageLayout";
import AnalyticsControlHeader from "@/components/analytics/AnalyticsControlHeader"
import PathnameChart from "@/components/analytics/PathnameChart";

export default function AnalyticsPage() {
  return (
    <PageLayout>
      <PageLayout.Header
        title="통계/분석"
        actions={<AnalyticsHeaderAction />}
      >
        <AnalyticsControlHeader />
      </PageLayout.Header>
      <PageLayout.Content>
        <div className="grid gap-6">
          <AnalyticsChart />
          <div className="flex gap-6 lg:flex-row flex-col">
            <PathnameChart />
            <PopularTagsList />
          </div>
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
}
