import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Briefcase, Users, Calendar, DollarSign, MessageSquare, BarChart3, Settings, Bot, Zap, UserCheck, Phone, Package } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrackingWrapper } from "@/components/ui/TrackingWrapper";
import { useRBAC } from "@/components/auth/RBACProvider";
import { canAccessRoute } from "@/config/routePermissions";

interface RouteItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

// Static route definitions - permissions are centralized in routePermissions.ts
const SIDEBAR_ROUTES: RouteItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: "text-fixlyfy" },
  { label: 'Jobs', icon: Briefcase, href: '/jobs', color: "text-fixlyfy" },
  { label: 'Clients', icon: Users, href: '/clients', color: "text-fixlyfy" },
  { label: 'Schedule', icon: Calendar, href: '/schedule', color: "text-fixlyfy" },
  { label: 'Finance', icon: DollarSign, href: '/finance', color: "text-fixlyfy" },
  { label: 'Products', icon: Package, href: '/products', color: "text-fixlyfy" },
  { label: 'Connect', icon: MessageSquare, href: '/connect', color: "text-fixlyfy" },
  { label: 'AI Center', icon: Bot, href: '/ai-center', color: "text-fixlyfy" },
  { label: 'Automations', icon: Zap, href: '/automations', color: "text-fixlyfy" },
  { label: 'Analytics', icon: BarChart3, href: '/analytics', color: "text-fixlyfy" },
  { label: 'Team', icon: UserCheck, href: '/team', color: "text-fixlyfy" },
  { label: 'Phone Numbers', icon: Phone, href: '/settings/phone-numbers', color: "text-fixlyfy" },
  { label: 'Settings', icon: Settings, href: '/settings', color: "text-fixlyfy-text-muted" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, loading } = useRBAC();

  // Filter routes based on user permissions (centralized in routePermissions.ts)
  // Show all routes while RBAC is loading to prevent flash
  const routes = useMemo(() => {
    if (loading) return SIDEBAR_ROUTES;
    return SIDEBAR_ROUTES.filter((route) => canAccessRoute(route.href, hasPermission));
  }, [hasPermission, loading]);

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-fixlyfy-border shadow-sm">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="group-data-[collapsible=icon]:hidden text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight transform hover:scale-105 transition-transform duration-300" style={{
              textShadow: '2px 2px 4px rgba(138, 77, 213, 0.3)',
              filter: 'drop-shadow(0 4px 8px rgba(138, 77, 213, 0.25))'
            }}>
              Fixlify
            </h2>
            <div className="hidden group-data-[collapsible=icon]:block text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight transform hover:scale-105 transition-transform duration-300" style={{
              textShadow: '2px 2px 4px rgba(138, 77, 213, 0.3)',
              filter: 'drop-shadow(0 4px 8px rgba(138, 77, 213, 0.25))'
            }}>
              F
            </div>
            <div className="relative group-data-[collapsible=icon]:hidden">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300" style={{
                boxShadow: '0 4px 12px rgba(138, 77, 213, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                background: 'linear-gradient(135deg, #8A4DD5 0%, #B084F9 50%, #8A4DD5 100%)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold tracking-wider">
                  AI
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" style={{
                animation: 'pulse 2s infinite',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
              }} />
            </div>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="mt-6">
          <SidebarMenu className="space-y-1 px-3">
            {routes.map(route => (
              <SidebarMenuItem key={route.href}>
                <TrackingWrapper actionType="navigation" element="sidebar_menu" context={{
                  destination: route.href,
                  label: route.label
                }}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === route.href}
                    className="w-full justify-start text-base font-medium transition-all duration-200 hover:scale-[1.02] data-[active=true]:bg-gradient-primary data-[active=true]:text-white data-[active=true]:shadow-md hover:data-[active=true]:shadow-lg"
                    tooltip={route.label}
                  >
                    <Button 
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation(route.href)}
                    >
                      <route.icon className="mr-3 h-4 w-4 transition-colors group-data-[collapsible=icon]:mr-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{route.label}</span>
                    </Button>
                  </SidebarMenuButton>
                </TrackingWrapper>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
