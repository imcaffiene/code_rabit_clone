
import { requireAuth } from '@/lib/auth-utils';

export default async function DashboardPage() {
  const session = await requireAuth(); // Redirects to /login if not authenticated

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
