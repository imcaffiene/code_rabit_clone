import { AppSidebar } from "@/features/dashboard/component/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/features/dashboard/component/DashboardHeader";

const DashboardLayout = ({ children }: { children: React.ReactNode; }) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <DashboardHeader/>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
