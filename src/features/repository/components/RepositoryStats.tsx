"use client";

import { useQuery } from "@tanstack/react-query";
import { getRepositoryStats } from "@/features/repository/actions/getRepositoryStats";
import { CheckCircle2Icon, FolderGit2Icon, GitPullRequest, XCircleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export const RepositoriesStats = () => {

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['repository-stats'],
    queryFn: async () => await getRepositoryStats(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
        <p className="text-sm text-destructive">
          Error loading stats: {error.message}
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Repositories",
      value: stats?.total || 0,
      icon: FolderGit2Icon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active (AI Enabled)",
      value: stats?.active || 0,
      icon: CheckCircle2Icon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Inactive",
      value: stats?.inactive || 0,
      icon: XCircleIcon,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
    },
    {
      label: "With Pull Requests",
      value: stats?.withPRs || 0,
      icon: GitPullRequest,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Spinner /> : stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

};