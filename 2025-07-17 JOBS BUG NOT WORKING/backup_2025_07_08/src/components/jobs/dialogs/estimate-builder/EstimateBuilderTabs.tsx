
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListPlus, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EstimateBuilderTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const EstimateBuilderTabs = ({ activeTab, setActiveTab }: EstimateBuilderTabsProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-b">
        <TabsList className="w-full bg-background">
          <TabsTrigger value="form" className="flex-1">Form</TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  return (
    <div className="w-20 bg-muted/10 border-r flex flex-col items-center pt-8 gap-8">
      <button 
        onClick={() => setActiveTab("form")}
        className={`p-3 rounded-lg flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === "form" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70"}`}
      >
        <ListPlus size={20} />
        <span>Form</span>
      </button>
      
      <button 
        onClick={() => setActiveTab("preview")}
        className={`p-3 rounded-lg flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === "preview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70"}`}
      >
        <FileText size={20} />
        <span>Preview</span>
      </button>
    </div>
  );
};
