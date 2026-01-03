import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  History
} from "lucide-react";

interface JobDetailsTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
  onEstimateTabClick?: () => void;
}

export const JobDetailsTabs = ({
  activeTab = "overview",
  onTabChange,
  children,
  onEstimateTabClick
}: JobDetailsTabsProps) => {
  const isMobile = useIsMobile();

  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  const tabs = [
    { value: "overview", label: "Overview", mobileLabel: "Overview", icon: LayoutDashboard },
    { value: "estimates", label: "Estimates", mobileLabel: "Quotes", icon: FileText },
    { value: "invoices", label: "Invoices", mobileLabel: "Bills", icon: Receipt },
    { value: "payments", label: "Payments", mobileLabel: "Pay", icon: CreditCard },
    { value: "history", label: "History", mobileLabel: "Log", icon: History },
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Clean Professional Tabs - Underline Style */}
        <div className="mb-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <TabsList className="bg-transparent p-0 h-auto w-full border-b border-slate-200 rounded-none flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`
                      relative flex-1 flex items-center justify-center gap-2
                      ${isMobile ? 'px-2 py-3 text-xs' : 'px-4 py-4 text-sm'}
                      font-medium transition-all duration-200
                      border-b-2 -mb-[1px] rounded-none
                      ${isActive
                        ? 'border-violet-500 text-violet-600 bg-violet-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }
                      data-[state=active]:shadow-none
                    `}
                  >
                    <Icon className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} flex-shrink-0`} />
                    <span className={isMobile ? 'hidden sm:inline' : ''}>
                      {isMobile ? tab.mobileLabel : tab.label}
                    </span>
                    {isMobile && (
                      <span className="sm:hidden">
                        {tab.mobileLabel}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        {children}
      </Tabs>
    </div>
  );
};
