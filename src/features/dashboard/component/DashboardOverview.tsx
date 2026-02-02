"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranchIcon, GitCommitIcon, GitPullRequestIcon, MessageSquareCodeIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ContributionGraph } from "@/github/ContributionGraph";

export const DashboardOverview = () => {

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  });

  // const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
  //   queryKey: ["monthly-activity"],
  //   queryFn: async () => await getMonthlyActivity(),
  //   refetchOnWindowFocus: false,
  // });


  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back{stats?.username ? `, ${stats.username}` : ''}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your repositories and recent activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Repository</CardTitle>
            <GitBranchIcon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Spinner /> : stats?.totalRepo}</div>
            <p className="text-xs text-muted-foreground">Connected Repositories</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commit</CardTitle>
            <GitCommitIcon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Spinner /> : stats?.totalContributions}</div>
            <p className="text-xs text-muted-foreground">in the last year</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pull Request</CardTitle>
            <GitPullRequestIcon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Spinner /> : stats?.totalPRs}</div>
            <p className="text-xs text-muted-foreground">All Time</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Reviews</CardTitle>
            <MessageSquareCodeIcon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Spinner /> : stats?.totalAIReviews}</div>
            <p className="text-xs text-muted-foreground">Generated Review</p>
          </CardContent>
        </Card>
      </div>

      <ContributionGraph
        username={stats?.username}
        avatarUrl={stats?.avatarUrl}
      />

    </div>
  );
};