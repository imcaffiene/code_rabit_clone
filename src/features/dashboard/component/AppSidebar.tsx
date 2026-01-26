'use client';


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  useSidebar
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/provider/ThemeProvider";
import {
  Code2Icon,
  CrownIcon,
  GitBranchIcon,
  GithubIcon,
  Settings2Icon,
  TableOfContentsIcon,
  UserStarIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


const navItem = [
  { title: "Overview", url: "/dashboard", icon: TableOfContentsIcon },
  { title: "Repositories", url: "/dashboard/repositories", icon: GitBranchIcon },
  { title: "Review", url: "/dashboard/review", icon: UserStarIcon },
  { title: "Subscription", url: "/dashboard/subscription", icon: CrownIcon },
  { title: "Settings", url: "/dashboard/settings", icon: Settings2Icon },
];

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathName = usePathname();

  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const { data: session } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (url: string) => {
    return pathName === url || pathName?.startsWith(url + "/dashboard");
  };

  if (!mounted || !session) {
    return null;
  }

  const user = session.user;
  const userName = user.name || "User";
  const userEmail = user.email || "";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2Icon className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground"> CodeGuardian</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItem.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className='gap-x-4 h-10 px-4'
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.url}
                      prefetch
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-4 px-2 py-6">
          <div className="flex items-center gap-4 px-3 py-4 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent/70 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shrink-0">
              <GithubIcon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground tracking-wide">Connected Account</p>
              <p className="text-sm font-medium text-sidebar-foreground/90">@{userName}</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};