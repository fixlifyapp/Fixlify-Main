import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Search, Loader2, Building, Wrench, Home, Car, Droplets, Lightbulb, Hammer, Paintbrush, Trees, Shield, Truck, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { loadEnhancedNicheData } from "@/utils/enhanced-niche-data-loader";

interface EnhancedOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const referralSources = [
  { value: "search_engine", label: "Search Engine (Google, Bing, etc.)" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Friend or Colleague" },
  { value: "advertisement", label: "Advertisement" },
  { value: "other", label: "Other" }
];

const businessNiches = [
  { value: "hvac", label: "HVAC Services", icon: Zap, description: "Heating, ventilation, and air conditioning" },
  { value: "plumbing", label: "Plumbing", icon: Droplets, description: "Residential and commercial plumbing" },
  { value: "electrical", label: "Electrical", icon: Lightbulb, description: "Electrical installation and repair" },
  { value: "appliance_repair", label: "Appliance Repair", icon: Wrench, description: "Home appliance maintenance and repair" },
  { value: "construction", label: "Construction", icon: Building, description: "General construction and contracting" },
  { value: "roofing", label: "Roofing", icon: Home, description: "Roof installation and repair" },
  { value: "carpentry", label: "Carpentry", icon: Hammer, description: "Woodworking and custom carpentry" },
  { value: "painting", label: "Painting", icon: Paintbrush, description: "Interior and exterior painting" },
  { value: "landscaping", label: "Landscaping", icon: Trees, description: "Lawn care and landscaping services" },
  { value: "pest_control", label: "Pest Control", icon: Shield, description: "Pest management and extermination" },
  { value: "auto_repair", label: "Auto Repair", icon: Car, description: "Vehicle maintenance and repair" },
  { value: "moving", label: "Moving Services", icon: Truck, description: "Residential and commercial moving" }
];

export function EnhancedOnboardingModal({ open, onOpenChange, onComplete }: EnhancedOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [referralSource, setReferralSource] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupStatus, setSetupStatus] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);

  const filteredNiches = businessNiches.filter(niche =>
    niche.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    niche.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const setupWorkspace = async (niche: string) => {
    setSetupError(null);
    const steps = [
      { status: "Creating workspace...", progress: 10 },
      { status: "Setting up job types...", progress: 25 },
      { status: "Adding service tags...", progress: 40 },
      { status: "Loading product catalog...", progress: 60 },
      { status: "Configuring workflows...", progress: 80 },
      { status: "Finalizing setup...", progress: 95 }
    ];

    try {
      for (const step of steps) {
        setSetupStatus(step.status);
        setSetupProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Load the enhanced niche data
      const success = await loadEnhancedNicheData(niche);
      
      if (!success) {
        throw new Error("Failed to load niche data");
      }

      // Update profile with business niche
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            business_niche: niche,
            has_completed_onboarding: true 
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw new Error("Failed to update profile");
        }

        // Ensure company_settings exists
        const { error: settingsError } = await supabase
          .from('company_settings')
          .upsert({ 
            user_id: user.id,
            business_niche: niche 
          }, {
            onConflict: 'user_id'
          });

        if (settingsError) {
          console.error('Error creating company settings:', settingsError);
          // Don't throw here, company settings can be created later
        }
      }

      setSetupProgress(100);
      setSetupStatus("Setup complete!");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onComplete) {
        onComplete();
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Setup error:', error);
      setSetupError(error instanceof Error ? error.message : "Failed to complete setup");
      setSetupStatus("Setup failed");
      toast.error("Failed to complete setup", {
        description: "Please try again or contact support"
      });
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && referralSource) {
      setCurrentStep(2);
    } else if (currentStep === 2 && businessType) {
      setIsLoading(true);
      await setupWorkspace(businessType);
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ has_completed_onboarding: true })
          .eq('id', user.id);
      }
      
      if (onComplete) {
        onComplete();
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast.error("Failed to skip onboarding");
    }
  };

  const getStepContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 py-8">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h3 className="text-lg font-medium">{setupStatus}</h3>
            <Progress value={setupProgress} className="w-full max-w-xs mx-auto" />
            {setupError && (
              <div className="flex items-center gap-2 text-red-600 justify-center mt-4">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{setupError}</p>
              </div>
            )}
          </div>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <h4 className="font-medium text-sm">What we're setting up for you:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className={setupProgress >= 25 ? "text-foreground" : ""}>
                <CheckCircle2 className={`h-4 w-4 inline mr-2 ${setupProgress >= 25 ? "text-green-600" : "text-muted-foreground"}`} />
                Industry-specific job types and workflows
              </li>
              <li className={setupProgress >= 40 ? "text-foreground" : ""}>
                <CheckCircle2 className={`h-4 w-4 inline mr-2 ${setupProgress >= 40 ? "text-green-600" : "text-muted-foreground"}`} />
                Common service tags for your business
              </li>
              <li className={setupProgress >= 60 ? "text-foreground" : ""}>
                <CheckCircle2 className={`h-4 w-4 inline mr-2 ${setupProgress >= 60 ? "text-green-600" : "text-muted-foreground"}`} />
                Pre-loaded product catalog with 30-50 items
              </li>
              <li className={setupProgress >= 80 ? "text-foreground" : ""}>
                <CheckCircle2 className={`h-4 w-4 inline mr-2 ${setupProgress >= 80 ? "text-green-600" : "text-muted-foreground"}`} />
                Default settings and configurations
              </li>
            </ul>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">How did you hear about Fixlyfy?</h3>
              <RadioGroup value={referralSource} onValueChange={setReferralSource}>
                {referralSources.map((source) => (
                  <div key={source.value} className="flex items-center space-x-3 mb-3">
                    <RadioGroupItem value={source.value} id={source.value} />
                    <Label htmlFor={source.value} className="cursor-pointer">
                      {source.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">What type of business do you run?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We'll customize your experience based on your industry
              </p>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search business types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredNiches.map((niche) => {
                  const Icon = niche.icon;
                  return (
                    <Card
                      key={niche.value}
                      className={`cursor-pointer transition-all ${
                        businessType === niche.value
                          ? "border-primary shadow-sm"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() => setBusinessType(niche.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            businessType === niche.value
                              ? "bg-primary/10 text-primary"
                              : "bg-muted"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{niche.label}</h4>
                              {businessType === niche.value && (
                                <Badge variant="default" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {niche.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Welcome to Fixlyfy! 👋</DialogTitle>
          <DialogDescription>
            Let's get your workspace set up in just a few steps
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {getStepContent()}
        </div>

        {!isLoading && (
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </Button>
            
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={
                  isLoading ||
                  (currentStep === 1 && !referralSource) ||
                  (currentStep === 2 && !businessType)
                }
              >
                {currentStep === 2 ? "Complete Setup" : "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 