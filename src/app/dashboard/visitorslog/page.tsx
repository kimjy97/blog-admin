import PageLayout from "@/components/layout/PageLayout";
import VisitorsLogControlHeader from "@/components/visitorslog/VisitorsLogControlHeader";
import VisitorsLogHeaderAction from "@/components/visitorslog/VisitorsLogHeaderAction";
import { VisitorsLogTable } from "@/components/visitorslog/VisitorsLogTable";

export default function VisitorsLogPage() {
  return (
    <PageLayout>
      <PageLayout.Header
        title="방문자 로그"
        actions={<VisitorsLogHeaderAction />}
      >
        <VisitorsLogControlHeader />
      </PageLayout.Header>
      <PageLayout.Content>
        <VisitorsLogTable />
      </PageLayout.Content>
    </PageLayout>
  );
}
