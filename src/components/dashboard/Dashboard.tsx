"use client"

import { getDashboardCardsConfig } from "@/components/dashboard/Config";
import DashboardCard from "@/components/dashboard/DashboardCard";
import Grid from "@/components/dashboard/Grid";
import RecentCommentList from "@/components/dashboard/RecentCommentList";
import RecentLogTable from "@/components/dashboard/RecentLogTable";
import RecentPostList from "@/components/dashboard/RecentPostList";
import VisitorLogChart from "@/components/dashboard/VisitorLogChart";
import { fetchCommentsForDashboard, fetchDashboardVisits, fetchPostsForDashboard } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const Dashboard = () => {
  const { data: visitsData, isLoading: loadingViews, error: visitsError } = useQuery({
    queryKey: ['dashboard', 'visits'],
    queryFn: fetchDashboardVisits,
    select: (response) => {
      if (!response || !response.success || !response.data) {
        return { totalViews: 0, todayViews: 0 };
      }
      const totalViews = response.data.totalViews;
      const todayViews = response.data.todayViews;

      return { totalViews, todayViews };
    },
  });

  const { data: postsStats, isLoading: loadingPosts, error: postsError } = useQuery({
    queryKey: ['dashboard', 'postsStats'],
    queryFn: fetchPostsForDashboard,
  });

  const { data: commentsStats, isLoading: loadingComments, error: commentsError } = useQuery({
    queryKey: ['dashboard', 'commentsStats'],
    queryFn: fetchCommentsForDashboard,
  });

  if (visitsError) console.error("Error fetching visits:", visitsError);
  if (postsError) console.error("Error fetching posts stats:", postsError);
  if (commentsError) console.error("Error fetching comments stats:", commentsError);

  const dashboardCards = getDashboardCardsConfig(
    visitsData,
    postsStats,
    commentsStats,
    postsStats?.draftPostsCount || 0,
  );

  const overallLoading = loadingViews || loadingPosts || loadingComments;

  const RenderDashboardCards = useCallback(() => {
    return dashboardCards.map((card, i) => (
      <DashboardCard key={i} {...card} className="py-5 col-span-1 gap-4" isLoading={overallLoading} />
    ));
  }, [overallLoading]);

  return (
    <Grid.Layout>
      <Grid.Overview>
        <RenderDashboardCards />
      </Grid.Overview>
      <Grid.Default>
        <RecentLogTable />
        <VisitorLogChart />
      </Grid.Default>
      <Grid.Default>
        <RecentPostList />
        <RecentCommentList />
      </Grid.Default>
    </Grid.Layout>
  )
}

export default Dashboard;