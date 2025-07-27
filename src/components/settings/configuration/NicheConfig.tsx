import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Search, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { businessNiches, getIdFromDbValue, getDbValueFromId } from "@/utils/business-niches";

// Helper function to get preview data for a niche
const getNichePreviewData = (nicheDbValue: string) => {
  const previewData: { [key: string]: { products: number, tags: number, jobTypes: number } } = {
    "Appliance Repair": { products: 10, tags: 12, jobTypes: 6 },
    "HVAC Services": { products: 10, tags: 11, jobTypes: 6 },
    "Plumbing Services": { products: 9, tags: 11, jobTypes: 6 },
    "Electrical Services": { products: 9, tags: 11, jobTypes: 6 },
    "Garage Door Services": { products: 9, tags: 11, jobTypes: 6 },
    "General Handyman": { products: 7, tags: 11, jobTypes: 6 },
    "General Contracting": { products: 32, tags: 14, jobTypes: 12 },
    "Landscaping & Lawn Care": { products: 29, tags: 13, jobTypes: 12 },
    "Painting & Decorating": { products: 33, tags: 14, jobTypes: 12 },
    "Roofing Services": { products: 28, tags: 14, jobTypes: 8 },
    "Deck Builder": { products: 24, tags: 11, jobTypes: 8 },
    "Moving Services": { products: 21, tags: 11, jobTypes: 8 },
    "Air Conditioning": { products: 21, tags: 12, jobTypes: 8 },
    "Waterproofing": { products: 22, tags: 12, jobTypes: 8 },
    "Drain Repair": { products: 21, tags: 11, jobTypes: 8 }
  };
  
  return previewData[nicheDbValue] || { products: 7, tags: 11, jobTypes: 6 };
};

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
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [outdatedJobs, setOutdatedJobs] = useState<any[]>([]);

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
        const dbNiche = profileResult.data?.business_niche || 
                       settingsResult.data?.business_niche || 
                       "Other";
        
        // Convert DB value to niche ID
        const nicheId = getIdFromDbValue(dbNiche);
        setCurrentNiche(nicheId);
        setSelectedNiche(nicheId);
        
      } catch (error) {
        console.error("Error fetching current niche:", error);
        toast.error("Failed to load your business niche settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrentNiche();
  }, [userId]);

  const handleNicheSelectionChange = (newNiche: string) => {
    setSelectedNiche(newNiche);
    // Show confirmation dialog if user is changing from an existing niche
    if (currentNiche && newNiche !== currentNiche) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmNicheChange = async () => {
    setShowConfirmDialog(false);
    await performNicheSwitch();
  };

  const handleSwitchNiche = async () => {
    if (!userId || selectedNiche === currentNiche || !selectedNiche) {
      return;
    }
    
    // If there's an existing niche and user is changing it, show confirmation
    if (currentNiche && selectedNiche !== currentNiche) {
      setShowConfirmDialog(true);
      return;
    }
    
    // If no existing niche, proceed directly
    await performNicheSwitch();
  };

  const performNicheSwitch = async () => {
    if (!userId || !selectedNiche) return;
    
    setIsSwitching(true);
    const loadingToast = toast.loading("Switching business niche and updating your data...");
    
    try {
      // Get the DB value from the selected niche ID
      const dbNicheValue = getDbValueFromId(selectedNiche);
      
      console.log('Switching niche:', { selectedNiche, dbNicheValue, userId });
      
      // Update the profile first
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          business_niche: dbNicheValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      // Also update company_settings to keep them in sync
      const { error: settingsError } = await supabase
        .from('company_settings')
        .update({ 
          business_niche: dbNicheValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (settingsError) {
        console.error('Company settings update error:', settingsError);
        // Don't throw here, just log the error as company_settings might not exist
      }

      console.log('Profile updated, now calling initialization function...');

      // Use the enhanced initialization function to replace all data
      const { error: initError, data: initData } = await supabase.rpc(
        'initialize_user_data_complete_enhanced',
        { 
          p_user_id: userId,
          p_business_niche: dbNicheValue
        }
      );

      if (initError) {
        console.error('Enhanced initialization function error:', initError);
        console.error('Error details:', {
          code: initError.code,
          message: initError.message,
          details: initError.details,
          hint: initError.hint
        });
        throw initError;
      }

      console.log('Database initialization completed:', initData);

      setCurrentNiche(selectedNiche);
      toast.dismiss(loadingToast);
      toast.success("Business niche updated successfully! Your products, tags, and job types have been updated with niche-specific options. Lead sources, job statuses, and payment methods remain unchanged.");
      
      // Reload after a short delay to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error switching niche:", error);
      toast.dismiss(loadingToast);
      
      // Provide more specific error message
      let errorMessage = "Failed to update business niche. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Failed to update business niche: ${error.message}`;
      }
      
      toast.error(errorMessage);
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
          <Alert variant="default" className="bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Important Notice</AlertTitle>
            <AlertDescription className="text-orange-700">
              Changing your business niche will completely replace your current products, tags, and job types 
              with new ones specific to the selected industry. Your existing jobs, clients, invoices, job statuses, lead sources, and payment methods will remain unchanged.
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
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm font-medium mb-1">💡 What's included with each niche:</p>
                <p className="text-blue-700 text-xs">
                  Each business niche comes with pre-configured products, tags, and job types 
                  tailored to that industry. Lead sources remain universal across all niches. This helps you get started quickly with relevant options for your business.
                </p>
              </div>
              
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
                onValueChange={handleNicheSelectionChange} 
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
                      onClick={() => handleNicheSelectionChange(niche.id)}
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Business Niche Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your business niche? This will completely replace your current:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Products</li>
                <li>Tags</li>
                <li>Job types</li>
              </ul>
              <p className="mt-2 font-medium text-orange-600">
                This action cannot be undone. Your jobs, clients, invoices, job statuses, lead sources, and payment methods will remain unchanged.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmNicheChange}>
              Yes, Change Niche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
