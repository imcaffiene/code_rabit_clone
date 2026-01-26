import Auth from "@/features/auth/components/Auth";
import { requireUnAuth } from "@/lib/auth-utils";

export default async function LoginPage() {
  await requireUnAuth();
  return (
    <Auth />
  );
}