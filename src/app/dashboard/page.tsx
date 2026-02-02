
import { DashboardOverview } from '@/features/dashboard/component/DashboardOverview';
import { requireAuth } from '@/lib/auth-utils';

export default async function DashboardPage() {
  const session = await requireAuth(); // Redirects to /login if not authenticated

  return (
    <DashboardOverview />
  );
}
