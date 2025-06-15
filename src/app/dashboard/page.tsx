import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import DashboardHeaderAction from "@/components/dashboard/DashboardHeaderAction";
import Dashboard from "@/components/dashboard/Dashboard";
import SearchIPModal from "@/components/modals/SearchIPModal";

export default function DashboardPage() {
  return (
    <PageLayout>
      <PageLayout.Header
        title="대시보드"
        actions={<DashboardHeaderAction />}
      />
      <PageLayout.Content>
        <Dashboard />
      </PageLayout.Content>
      <SearchIPModal />
    </PageLayout>
  );
}
