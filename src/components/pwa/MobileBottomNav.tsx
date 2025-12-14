import { useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, Users, Calendar, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  action?: "navigate" | "menu";
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/dashboard", action: "navigate" },
  { icon: Briefcase, label: "Jobs", path: "/jobs", action: "navigate" },
  { icon: Users, label: "Clients", path: "/clients", action: "navigate" },
  { icon: Calendar, label: "Schedule", path: "/schedule", action: "navigate" },
  { icon: Menu, label: "Menu", path: "", action: "menu" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  // Only show on mobile and when in PWA standalone mode or just mobile
  if (!isMobile) {
    return null;
  }

  const handleNavClick = (item: NavItem) => {
    if (item.action === "menu") {
      toggleSidebar();
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-16 md:hidden" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.action === "navigate" && isActive(item.path);

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full px-2 py-1 transition-colors",
                  "active:bg-gray-100 dark:active:bg-gray-800",
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 mb-1",
                    active && "text-blue-600 dark:text-blue-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
