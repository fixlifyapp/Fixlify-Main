
import { useState } from "react";
import { InsightsGenerator } from "@/components/ai/InsightsGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Brain, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const BusinessInsights = () => {
  const [insights, setInsights] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { user } = useAuth();
  
  const testOpenAI = async () => {
    try {
      setTestStatus("loading");
      
      // Test the OpenAI connection via edge function
      const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/test-openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('OpenAI connection failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTestStatus("success");
        toast.success("OpenAI connection successful!", {
          description: "Your AI insights feature is ready to use"
        });
      } else {
        throw new Error(result.error || 'OpenAI connection failed');
      }
    } catch (error) {
      setTestStatus("error");
      toast.error("OpenAI connection failed", {
        description: "Please check your API key and try again"
      });
      console.error("OpenAI test error:", error);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            Business Insights
          </CardTitle>
          <Badge className="bg-fixlyfy-success">AI Powered</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={testOpenAI}
            variant="outline" 
            size="sm"
            disabled={testStatus === "loading"}
          >
            {testStatus === "loading" && (
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent text-fixlyfy rounded-full" />
            )}
            Test OpenAI Connection
          </Button>
          
          {insights && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInsights(null)}
              className="text-fixlyfy-text-secondary"
            >
              <RefreshCw size={14} className="mr-1" />
              Reset Insights
            </Button>
          )}
        </div>
        
        <InsightsGenerator 
          data={null} 
          topic="monthly business performance"
          onInsightsGenerated={setInsights}
          mode="business"
          systemContext="You are an expert business analyst for a field service company. Analyze the metrics and provide 3-5 specific actionable insights to improve performance. Format your response with bullet points using the '•' symbol."
        />
      </CardContent>
    </Card>
  );
};
