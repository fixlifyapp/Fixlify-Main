import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  Search, 
  Info, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Package,
  Tags,
  Settings,
  Users,
  FileText,
  Zap,
  Building,
  Wrench,
  Home,
  Car,
  Droplets,
  Lightbulb,
  Hammer,
  Paintbrush,
  Trees,
  Shield,
  Truck,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const referralSources = [
  { id: "social_media", label: "Social Media", icon: "📱" },
  { id: "search_engine", label: "Search Engines", icon: "🔍" },
  { id: "recommendation", label: "Word of Mouth", icon: "💬" },
  { id: "advertisement", label: "Advertisement", icon: "📢" },
  { id: "other", label: "Other", icon: "📝" }
];

// Extended list of business niches with icons and descriptions
const businessNiches = [
  { 
    id: "appliance_repair", 
    label: "Appliance Repair & Installation", 
    icon: Wrench,
    description: "Fix and install home appliances",
    features: ["30+ common appliances", "Service tags", "Repair workflows"]
  },
  { 
    id: "garage_door", 
    label: "Garage Door Services", 
    icon: Car,
    description: "Repair and install garage doors",
    features: ["Door types catalog", "Spring & motor services", "Safety protocols"]
  },
  { 
    id: "hvac", 
    label: "HVAC Services", 
    icon: Zap,
    description: "Heating, ventilation, and AC services",
    features: ["AC & heating units", "Seasonal maintenance", "Energy efficiency"]
  },
  { 
    id: "plumbing", 
    label: "Plumbing Services", 
    icon: Droplets,
    description: "Residential and commercial plumbing",
    features: ["Fixture catalog", "Emergency services", "Water heater services"]
  },
  { 
    id: "electrical", 
    label: "Electrical Services", 
    icon: Lightbulb,
    description: "Electrical installation and repair",
    features: ["Wiring & panels", "Safety compliance", "Smart home setup"]
  },
  { 
    id: "construction", 
    label: "General Construction", 
    icon: Building,
    description: "Construction and renovation",
    features: ["Project phases", "Material tracking", "Subcontractor management"]
  },
  { 
    id: "roofing", 
    label: "Roofing Services", 
    icon: Home,
    description: "Roof repair and replacement",
    features: ["Material types", "Inspection checklists", "Weather tracking"]
  },
  { 
    id: "painting", 
    label: "Painting & Decorating", 
    icon: Paintbrush,
    description: "Interior and exterior painting",
    features: ["Color catalogs", "Surface preparation", "Material calculator"]
  },
  { 
    id: "landscaping", 
    label: "Landscaping & Lawn Care", 
    icon: Trees,
    description: "Outdoor maintenance and design",
    features: ["Plant database", "Seasonal schedules", "Equipment tracking"]
  },
  { 
    id: "security", 
    label: "Security Systems", 
    icon: Shield,
    description: "Security installation and monitoring",
    features: ["System types", "Monitoring plans", "Service contracts"]
  },
  { 
    id: "moving", 
    label: "Moving Services", 
    icon: Truck,
    description: "Residential and commercial moving",
    features: ["Inventory lists", "Route planning", "Packing supplies"]
  },
  { 
    id: "handyman", 
    label: "General Handyman", 
    icon: Hammer,
    description: "Multi-service home maintenance",
    features: ["50+ service types", "Flexible pricing", "Task management"]
  }
];

interface EnhancedOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedOnboardingModal({ open, onOpenChange }: EnhancedOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [referralSource, setReferralSource] = useState("");
  const [businessNiche, setBusinessNiche] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupStatus, setSetupStatus] = useState<string>("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalSteps = 3;
  const progressPercentage = (step / totalSteps) * 100;

  const filteredNiches = businessNiches.filter(niche =>
    niche.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    niche.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSkipOnboarding = async () => {
    if (!user) return;
    
    try {
      // Mark onboarding as complete without setting up data
      await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', user.id);
      
      toast.info("You can set up your business details later in Settings");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !referralSource) {
      toast.error("Please select how you heard about us");
      return;
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const setupWorkspace = async (niche: string) => {
    const steps = [
      { status: "Creating workspace...", progress: 10 },
      { status: "Setting up job types...", progress: 25 },
      { status: "Adding service tags...", progress: 40 },
      { status: "Loading product catalog...", progress: 60 },
      { status: "Configuring workflows...", progress: 80 },
      { status: "Finalizing setup...", progress: 95 }
    ];

    for (const step of steps) {
      setSetupStatus(step.status);
      setSetupProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Import and use the enhanced niche data loader
    const { loadEnhancedNicheData } = await import("@/utils/enhanced-niche-data-loader");
    const success = await loadEnhancedNicheData(niche);
    
    if (!success) {
      throw new Error("Failed to load niche data");
    }

    setSetupProgress(100);
    setSetupStatus("Setup complete!");
  };

  const handleComplete = async () => {
    if (!businessNiche) {
      toast.error("Please select a business type");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    setStep(3); // Move to setup progress step

    try {
      // First ensure company_settings exists for the user
      const { data: existingSettings } = await supabase
        .from('company_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingSettings) {
        // Create company_settings if it doesn't exist
        const { error: createError } = await supabase
          .from('company_settings')
          .insert({
            user_id: user.id,
            company_name: '',
            business_type: businessNiche,
            business_niche: businessNiche,
            company_address: '',
            company_city: '',
            company_state: '',
            company_zip: '',
            company_country: 'United States',
            company_phone: '',
            company_email: '',
            company_website: '',
            tax_id: '',
            company_tagline: '',
            company_description: '',
            service_radius: 50,
            service_zip_codes: '',
            business_hours: {
              monday: { start: "09:00", end: "17:00", enabled: true },
              tuesday: { start: "09:00", end: "17:00", enabled: true },
              wednesday: { start: "09:00", end: "17:00", enabled: true },
              thursday: { start: "09:00", end: "17:00", enabled: true },
              friday: { start: "09:00", end: "17:00", enabled: true },
              saturday: { start: "09:00", end: "17:00", enabled: false },
              sunday: { start: "09:00", end: "17:00", enabled: false }
            }
          });

        if (createError) {
          console.error("Error creating company settings:", createError);
        }
      }

      // Update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          referral_source: referralSource,
          business_niche: businessNiche,
          has_completed_onboarding: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      // Set up workspace with niche-specific data
      await setupWorkspace(businessNiche);
      
      toast.success("Welcome to Fixlify! Your workspace is ready.");
      
      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error("Setup failed. Please try again or contact support.");
      setStep(2); // Go back to niche selection
    } finally {
      setIsLoading(false);
      setSetupProgress(0);
      setSetupStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {step === 1 && "Welcome to Fixlify! 👋"}
                {step === 2 && "Choose Your Business Type"}
                {step === 3 && "Setting Up Your Workspace"}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {step === 1 && "Let's get to know you better"}
                {step === 2 && "We'll customize your experience based on your industry"}
                {step === 3 && "Please wait while we prepare everything for you"}
              </DialogDescription>
            </div>
            {step < 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkipOnboarding}
                      className="text-muted-foreground"
                    >
                      Skip for now
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You can complete setup later in Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">How did you hear about us?</h3>
              <RadioGroup value={referralSource} onValueChange={setReferralSource} className="space-y-3">
                {referralSources.map((source) => (
                  <Card 
                    key={source.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      referralSource === source.id && "border-primary shadow-md"
                    )}
                    onClick={() => setReferralSource(source.id)}
                  >
                    <CardContent className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value={source.id} id={`source-${source.id}`} />
                      <Label 
                        htmlFor={`source-${source.id}`} 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <span className="text-2xl">{source.icon}</span>
                        <span className="font-medium">{source.label}</span>
                      </Label>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleNextStep}
                disabled={!referralSource}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      key={niche.id} 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        businessNiche === niche.id && "border-primary shadow-md"
                      )}
                      onClick={() => setBusinessNiche(niche.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem 
                            value={niche.id} 
                            id={`niche-${niche.id}`}
                            checked={businessNiche === niche.id}
                          />
                          <div className="flex-1 space-y-2">
                            <Label 
                              htmlFor={`niche-${niche.id}`} 
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Icon className="h-5 w-5 text-primary" />
                              <span className="font-medium">{niche.label}</span>
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {niche.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {niche.features.map((feature, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {businessNiche && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium">What happens next?</p>
                        <p className="text-sm text-muted-foreground">
                          We'll automatically set up your workspace with:
                        </p>
                        <ul className="text-sm text-muted-foreground ml-4 mt-2 space-y-1">
                          <li>• 30-50 products specific to your industry</li>
                          <li>• Relevant service tags and categories</li>
                          <li>• Common job types and workflows</li>
                          <li>• Industry-standard pricing templates</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={!businessNiche || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{setupStatus || "Preparing your workspace..."}</h3>
                <Progress value={setupProgress} className="max-w-sm mx-auto" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card className={cn(
                  "transition-all",
                  setupProgress >= 25 ? "border-green-500 bg-green-50" : "opacity-50"
                )}>
                  <CardContent className="p-4 text-center">
                    <FileText className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      setupProgress >= 25 ? "text-green-600" : "text-muted-foreground"
                    )} />
                    <p className="text-sm font-medium">Job Types</p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "transition-all",
                  setupProgress >= 40 ? "border-green-500 bg-green-50" : "opacity-50"
                )}>
                  <CardContent className="p-4 text-center">
                    <Tags className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      setupProgress >= 40 ? "text-green-600" : "text-muted-foreground"
                    )} />
                    <p className="text-sm font-medium">Service Tags</p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "transition-all",
                  setupProgress >= 60 ? "border-green-500 bg-green-50" : "opacity-50"
                )}>
                  <CardContent className="p-4 text-center">
                    <Package className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      setupProgress >= 60 ? "text-green-600" : "text-muted-foreground"
                    )} />
                    <p className="text-sm font-medium">Products</p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "transition-all",
                  setupProgress >= 80 ? "border-green-500 bg-green-50" : "opacity-50"
                )}>
                  <CardContent className="p-4 text-center">
                    <Settings className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      setupProgress >= 80 ? "text-green-600" : "text-muted-foreground"
                    )} />
                    <p className="text-sm font-medium">Workflows</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 