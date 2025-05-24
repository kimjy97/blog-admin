import Sidebar from "@/components/layout/Sidebar/Sidebar";
import MobileSidebar from "@/components/layout/Sidebar/MobileSidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "사용자";
  return {
    title: `블로그 관리자 | ${userName}`,
    description: "블로그 콘텐츠 및 설정을 관리하는 대시보드입니다.",
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen">
      <div className="flex h-screen">
        <Sidebar />
        <MobileSidebar />
        <main className="flex-1 p-0 bg-background scrollbar overflow-y-scroll">
          {children}
        </main>
      </div>
    </div>
  );
}
