import { RepositoriesStats } from "@/features/repository/components/RepositoryStats";
import { ImportRepositoryButton } from "@/features/repository/components/ImportRepositoryButton";
import { getRepositories } from "@/features/repository/actions/getRepositories";
import { requireAuth } from "@/lib/auth-utils";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function RepositoriesPage() {
  // Require authentication
  await requireAuth();

  // Prefetch data on server
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    }
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['repositories', {}],
    queryFn: async () => await getRepositories({ limit: 20, cursor: null }),
    initialPageParam: null,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Repositories</h1>
            <p className="text-muted-foreground mt-1">
              Manage your connected repositories and AI review settings
            </p>
          </div>
          <ImportRepositoryButton />
        </div>

        {/* Stats Cards */}
        <RepositoriesStats />

        {/* Repository list will go here */}
      </div>
    </HydrationBoundary>
  );
}
