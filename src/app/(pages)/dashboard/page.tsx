import { getDashboardStats } from '@/features/dashboard/actions';
import { DashboardOverview } from '@/features/dashboard/component/DashboardOverview';
import { requireAuth } from '@/lib/auth-utils';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function DashboardPage() {


  await requireAuth(); // Redirects to /login if not authenticated


  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['dashboardData'],
    queryFn: () => getDashboardStats()
  });


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardOverview />
    </HydrationBoundary>

  );
}
