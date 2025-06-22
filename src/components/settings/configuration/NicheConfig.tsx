import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Search, Building, Wrench, Home, Car, Droplets, Lightbulb, Hammer, Paintbrush, Trees, Shield, Truck, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Use the same comprehensive list from onboarding
const businessNiches = [
  { 
    id: "appliance_repair", 
    label: "Appliance Repair & Installation", 
    icon: Wrench,
    description: "Fix and install home appliances"
  },
  { 
    id: "garage_door", 
    label: "Garage Door Services", 
    icon: Car,
    description: "Repair and install garage doors"
  },
  { 
    id: "hvac", 
    label: "HVAC Services", 
    icon: Zap,
    description: "Heating, ventilation, and AC services"
  },
  { 
    id: "plumbing", 
    label: "Plumbing Services", 
    icon: Droplets,
    description: "Residential and commercial plumbing"
  },
  { 
    id: "electrical", 
    label: "Electrical Services", 
    icon: Lightbulb,
    description: "Electrical installation and repair"
  },
  { 
    id: "construction", 
    label: "General Construction", 
    icon: Building,
    description: "Construction and renovation"
  },
  { 
    id: "roofing", 
    label: "Roofing Services", 
    icon: Home,
    description: "Roof repair and replacement"
  },
  { 
    id: "painting", 
    label: "Painting & Decorating", 
    icon: Paintbrush,
    description: "Interior and exterior painting"
  },
  { 
    id: "landscaping", 
    label: "Landscaping & Lawn Care", 
    icon: Trees,
    description: "Outdoor maintenance and design"
  },
  { 
    id: "security", 
    label: "Security Systems", 
    icon: Shield,
    description: "Security installation and monitoring"
  },
  { 
    id: "moving", 
    label: "Moving Services", 
    icon: Truck,
    description: "Residential and commercial moving"
  },
  { 
    id: "handyman", 
    label: "General Handyman", 
    icon: Hammer,
    description: "Multi-service home maintenance"
  }
];

interface NicheConfigProps {
  userId?: string;
}

interface ProfileData {
  business_niche?: string;
  [key: string]: any;
}

export function NicheConfig({ userId }: NicheConfigProps) {
  const [currentNiche, setCurrentNiche] = useState<string>("");
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const filteredNiches = businessNiches.filter(niche =>
    niche.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    niche.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchCurrentNiche = async () => {
      if (!userId) return;
      
      try {
        // Fetch from both profiles and company_settings to ensure we have the latest
        const [profileResult, settingsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('business_niche')
            .eq('id', userId)
            .single(),
          supabase
            .from('company_settings')
            .select('business_niche')
            .eq('user_id', userId)
            .single()
        ]);
        
        // Use profile niche as primary source, fallback to company settings
        const niche = profileResult.data?.business_niche || 
                     settingsResult.data?.business_niche || 
                     "handyman";
                     
        setCurrentNiche(niche);
        setSelectedNiche(niche);
      } catch (error) {
        console.error("Error fetching current niche:", error);
        toast.error("Failed to load your business niche settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrentNiche();
  }, [userId]);

  const handleSwitchNiche = async () => {
    if (!userId || selectedNiche === currentNiche || !selectedNiche) {
      return;
    }
    
    setIsSwitching(true);
    try {
      // Update the profile (this will trigger the sync to company_settings)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          business_niche: selectedNiche,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;

      // Import and use the enhanced niche data loader
      const { loadEnhancedNicheData } = await import("@/utils/enhanced-niche-data-loader");
      const success = await loadEnhancedNicheData(selectedNiche);
      
      if (!success) {
        throw new Error("Failed to load niche data");
      }

      setCurrentNiche(selectedNiche);
      toast.success("Business niche updated successfully! New products and settings have been loaded.");
      
      // Reload after a short delay to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error switching niche:", error);
      toast.error("Failed to update business niche");
      // Reset selection on error
      setSelectedNiche(currentNiche);
    } finally {
      setIsSwitching(false);
    }
  };

  const currentNicheData = businessNiches.find(n => n.id === currentNiche);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Business Niche</h2>
        <p className="text-muted-foreground">
          Select your business niche to customize the application with appropriate products, 
          job types, tags, and other settings specific to your industry.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Alert variant="default" className="bg-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Switching your business niche will load new products, tags, and job types specific to that industry.
              Your existing data will remain intact, and you can switch back at any time.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Current business niche:</h3>
              <Card className="bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  {currentNicheData && (
                    <>
                      <currentNicheData.icon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{currentNicheData.label}</p>
                        <p className="text-sm text-muted-foreground">{currentNicheData.description}</p>
                      </div>
                    </>
                  )}
                  {!currentNicheData && <p>Not set</p>}
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Select new business niche:</h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search business types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <RadioGroup 
                value={selectedNiche} 
                onValueChange={setSelectedNiche} 
                className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
              >
                {filteredNiches.map((niche) => {
                  const Icon = niche.icon;
                  return (
                    <Card 
                      key={niche.id} 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedNiche === niche.id && "border-primary shadow-md"
                      )}
                      onClick={() => setSelectedNiche(niche.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem 
                            value={niche.id} 
                            id={`niche-${niche.id}`}
                            checked={selectedNiche === niche.id}
                          />
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <Label 
                              htmlFor={`niche-${niche.id}`} 
                              className="cursor-pointer font-medium"
                            >
                              {niche.label}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {niche.description}
                            </p>
                            {niche.id === currentNiche && (
                              <Badge variant="secondary" className="mt-2">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>
            </div>
            
            <Button 
              onClick={handleSwitchNiche} 
              disabled={isSwitching || selectedNiche === currentNiche || !selectedNiche}
              className="w-full sm:w-auto"
            >
              {isSwitching ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating Business Niche...
                </>
              ) : "Update Business Niche"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
