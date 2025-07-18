
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Get auth session to use with edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Authentication required", {
          description: "Please sign in to generate reports"
        });
        setIsGenerating(false);
        return;
      }
      
      // Simulate API call for demonstration
      setTimeout(() => {
        toast.success("Report generated successfully!", {
          description: "Your AI summary report is ready to view",
          action: {
            label: "View",
            onClick: () => console.log("View report clicked")
          }
        });
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      toast.error("Failed to generate report", {
        description: "Please try again later"
      });
      console.error("Error generating report:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 mx-6 mb-6 rounded-lg bg-gradient-primary">
      <div className="flex items-center mb-2">
        <Brain size={16} className="text-white mr-2" />
        <h3 className="text-sm font-medium text-white">AI Summary Report</h3>
      </div>
      <p className="text-xs text-white/80 mb-3">
        Get an AI-generated report summarizing your business performance for the week.
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        className="w-full"
        onClick={generateReport}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Report"}
      </Button>
    </div>
  );
};
