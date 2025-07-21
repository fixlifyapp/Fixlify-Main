import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, Briefcase, Users, Calendar, DollarSign, MessageSquare, BarChart3, Settings, Bot, Zap, UserCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrackingWrapper } from "@/components/ui/TrackingWrapper";

interface RouteItem {
  label: string;
  icon: any;
  href: string;
  color: string;
  indent?: boolean;
  isSection?: boolean;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({
  className
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const routes = [{
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-fixlyfy"
  }, {
    label: 'Jobs',
    icon: Briefcase,
    href: '/jobs',
    color: "text-fixlyfy"
  }, {
    label: 'Clients',
    icon: Users,
    href: '/clients',
    color: "text-fixlyfy"
  }, {
    label: 'Schedule',
    icon: Calendar,
    href: '/schedule',
    color: "text-fixlyfy"
  }, {
    label: 'Finance',
    icon: DollarSign,
    href: '/finance',
    color: "text-fixlyfy"
  }, {
    label: 'Connect Center',
    icon: MessageSquare,
    href: '/connect',
    color: "text-fixlyfy"
  }, {
    label: 'AI Center',
    icon: Bot,
    href: '/ai-center',
    color: "text-fixlyfy"
  }, {
    label: 'Automations',
    icon: Zap,
    href: '/automations',
    color: "text-fixlyfy"
  }, {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: "text-fixlyfy"
  }, {
    label: 'Team',
    icon: UserCheck,
    href: '/team',
    color: "text-fixlyfy"
  }, {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: "text-fixlyfy-text-muted"
  }];

  const handleNavigation = (href: string) => {
    console.log(`Navigating to: ${href}`);
    navigate(href);
  };

  return (
    <div className={cn("pb-12 w-64 bg-white border-r border-fixlyfy-border shadow-sm", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-6 px-4 py-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight transform hover:scale-105 transition-transform duration-300" style={{
                textShadow: '2px 2px 4px rgba(138, 77, 213, 0.3)',
                filter: 'drop-shadow(0 4px 8px rgba(138, 77, 213, 0.25))'
              }}>
                Fixlify
              </h2>
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300" style={{
                  boxShadow: '0 4px 12px rgba(138, 77, 213, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                  background: 'linear-gradient(135deg, #8A4DD5 0%, #B084F9 50%, #8A4DD5 100%)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold tracking-wider">
                    AI
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-primary rounded-full opacity-60" style={{
                  animation: 'pulse 2s infinite',
                  boxShadow: '0 0 8px rgba(138, 77, 213, 0.6)'
                }} />
              </div>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {routes.map(route => 
                <TrackingWrapper key={route.href} actionType="navigation" element="sidebar_menu" context={{
                  destination: route.href,
                  label: route.label
                }}>
                  <Button 
                    variant={location.pathname === route.href ? "default" : "ghost"} 
                    className={cn(
                      "w-full justify-start text-base font-medium transition-all duration-200 hover:scale-[1.02]", 
                      location.pathname === route.href 
                        ? "bg-gradient-primary text-white shadow-md hover:shadow-lg" 
                        : "text-fixlyfy-text hover:bg-fixlyfy/10 hover:text-fixlyfy"
                    )} 
                    onClick={() => handleNavigation(route.href)}
                  >
                    <route.icon className={cn("mr-3 h-4 w-4 transition-colors", location.pathname === route.href ? "text-white" : route.color)} />
                    <span className="truncate">{route.label}</span>
                  </Button>
                </TrackingWrapper>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
