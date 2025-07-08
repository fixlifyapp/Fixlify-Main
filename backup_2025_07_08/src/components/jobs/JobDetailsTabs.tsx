
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  return (
    <div className="mb-4 sm:mb-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="mb-4">
          <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60 rounded-2xl shadow-lg shadow-gray-200/50 p-2 sm:p-4 backdrop-blur-sm">
            <TabsList className={`bg-gradient-to-r from-gray-100/80 to-gray-50/60 p-2 sm:p-3 rounded-xl w-full shadow-inner border border-gray-200/40 ${isMobile ? 'gap-1' : 'gap-2'}`}>
              <TabsTrigger 
                value="overview" 
                className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-3 text-sm'} rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70 flex-1 min-h-[44px] flex items-center justify-center`}
              >
                {isMobile ? 'Overview' : 'Overview'}
              </TabsTrigger>
              
              <TabsTrigger 
                value="estimates" 
                className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-3 text-sm'} rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70 flex-1 min-h-[44px] flex items-center justify-center`}
              >
                {isMobile ? 'Quotes' : 'Estimates'}
              </TabsTrigger>
              
              <TabsTrigger 
                value="invoices" 
                className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-3 text-sm'} rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70 flex-1 min-h-[44px] flex items-center justify-center`}
              >
                {isMobile ? 'Bills' : 'Invoices'}
              </TabsTrigger>
              
              <TabsTrigger 
                value="payments" 
                className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-3 text-sm'} rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70 flex-1 min-h-[44px] flex items-center justify-center`}
              >
                {isMobile ? 'Pay' : 'Payments'}
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-3 text-sm'} rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70 flex-1 min-h-[44px] flex items-center justify-center`}
              >
                {isMobile ? 'Log' : 'History'}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        {children}
      </Tabs>
    </div>
  );
};
