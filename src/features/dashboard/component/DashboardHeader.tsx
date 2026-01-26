'use client';

import { LogOut } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/components/Logout';
import { ThemeSwitcher } from '@/provider/ThemeSwitcher';

export function DashboardHeader() {
  const { logout, loading } = useLogout();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2"
          onClick={logout}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Sign out
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
