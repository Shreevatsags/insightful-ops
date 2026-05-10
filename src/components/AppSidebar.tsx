import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Activity, Boxes, Cloud, AlertTriangle, ScrollText, Siren, Settings, LogOut, TerminalSquare } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/store/auth";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Activity },
  { title: "Docker", url: "/docker", icon: Boxes },
  { title: "AWS / EC2", url: "/aws", icon: Cloud },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Logs", url: "/logs", icon: ScrollText },
  { title: "Incidents", url: "/incidents", icon: Siren },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <TerminalSquare className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-mono text-sm font-semibold text-gradient">obsrv.io</p>
              <p className="text-[10px] text-muted-foreground">DevOps monitoring</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-mono text-xs uppercase">
              {user.name.slice(0, 2)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="text-muted-foreground hover:text-destructive" aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
