import PageLayout from "@/components/layout/PageLayout";
import SettingsContent from "@/components/dashboard/SettingsContent";

export default function SettingsPage() {
  return (
    <PageLayout>
      <PageLayout.Header title="환경설정" />
      <PageLayout.Content>
        <SettingsContent />
      </PageLayout.Content>
    </PageLayout>
  );
}
