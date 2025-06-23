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
        
        // Check for jobs that might need updating
        const { data: jobsNeedingUpdate } = await supabase.rpc(
          'get_jobs_with_outdated_config',
          { p_user_id: userId }
        );
        
        if (jobsNeedingUpdate) {
          setOutdatedJobs(jobsNeedingUpdate);
        }
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
        // Fall back to old function if new one doesn't exist
        const { error: fallbackError } = await supabase.rpc(
          'initialize_user_data_complete',
          { 
            p_user_id: userId,
            p_business_niche: dbNicheValue
          }
        );
        if (fallbackError) {
          console.error('Fallback function error:', fallbackError);
          // Try the original function as last resort
          const { error: originalError } = await supabase.rpc(
            'initialize_user_data',
            { 
              p_user_id: userId,
              p_business_niche: dbNicheValue
            }
          );
          if (originalError) {
            console.error('Original function error:', originalError);
            throw originalError;
          }
        }
      }

      console.log('Initialization completed successfully', initData);

      setCurrentNiche(selectedNiche);
      toast.dismiss(loadingToast);
      toast.success("Business niche updated successfully! Your products, tags, lead sources, and job types have been completely replaced with niche-specific options. Job statuses and payment methods remain unchanged.");
      
      // Check if user has jobs that might need updating
      const { data: outdatedJobs } = await supabase.rpc(
        'get_jobs_with_outdated_config',
        { p_user_id: userId }
      );
      
      if (outdatedJobs && outdatedJobs.length > 0) {
        setTimeout(() => {
          toast.info(
            `Found ${outdatedJobs.length} job(s) that may need updating. Check your jobs to update tags, job types, or lead sources to match your new niche.`,
            { duration: 8000 }
          );
        }, 3000);
      }
      
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
              Changing your business niche will completely replace your current products, tags, lead sources, and job types 
              with new ones specific to the selected industry. Your existing jobs, clients, invoices, job statuses, and payment methods will remain unchanged.
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
                  Each business niche comes with pre-configured products, tags, job types, and lead sources 
                  tailored to that industry. This helps you get started quickly with relevant options for your business.
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

      {/* Jobs Needing Updates Section */}
      {!isLoading && outdatedJobs.length > 0 && (
        <div className="mt-8 space-y-4">
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Jobs May Need Updates</AlertTitle>
            <AlertDescription className="text-blue-700">
              Found {outdatedJobs.length} job(s) with tags, job types, or lead sources that no longer match your current configuration. 
              You can update these manually in the Jobs section.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jobs Needing Updates</CardTitle>
              <CardDescription>
                These jobs have configuration values that don't match your current niche settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {outdatedJobs.slice(0, 10).map((job: any, index: number) => (
                  <div key={job.job_id} className="flex justify-between items-start p-3 border rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{job.job_title || `Job ${job.job_id}`}</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {job.current_job_type && (
                          <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">
                            Job Type: {job.current_job_type}
                          </span>
                        )}
                        {job.current_lead_source && (
                          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
                            Lead: {job.current_lead_source}
                          </span>
                        )}
                        {job.current_tags && job.current_tags.length > 0 && (
                          <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Tags: {job.current_tags.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to job details
                        window.open(`/jobs/${job.job_id}`, '_blank');
                      }}
                    >
                      Update
                    </Button>
                  </div>
                ))}
                {outdatedJobs.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    And {outdatedJobs.length - 10} more jobs. Visit the Jobs page to update them all.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm Business Niche Change
            </DialogTitle>
            <DialogDescription className="text-left space-y-3">
              <p>
                Are you sure you want to change your business niche? This action will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Replace all your products</strong> with niche-specific ones</li>
                <li><strong>Replace all your tags</strong> with industry-appropriate tags</li>
                <li><strong>Replace all your lead sources</strong> with relevant marketing channels</li>
                <li><strong>Replace all your job types</strong> with niche-specific service types</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
                <p className="text-green-800 font-medium text-sm">
                  📋 What you'll get for {businessNiches.find(n => n.id === selectedNiche)?.label}:
                </p>
                <ul className="text-green-700 text-sm mt-1 space-y-1">
                  <li>• <strong>Products:</strong> Industry-specific products and services</li>
                  <li>• <strong>Tags:</strong> Relevant tags for your business type</li>
                  <li>• <strong>Job Types:</strong> Service categories specific to your niche</li>
                  <li>• <strong>Lead Sources:</strong> Marketing channels relevant to your industry</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                <p className="text-blue-800 font-medium text-sm">
                  ℹ️ What happens to existing data:
                </p>
                <ul className="text-blue-700 text-sm mt-1 space-y-1">
                  <li>• <strong>Jobs, clients, invoices</strong> remain unchanged</li>
                  <li>• <strong>Existing job types/tags</strong> in jobs will be preserved but may not match new configuration</li>
                  <li>• <strong>Payment methods</strong> will remain unchanged</li>
                  <li>• <strong>Job statuses</strong> will remain unchanged</li>
                  <li>• You can manually update individual jobs later if needed</li>
                </ul>
              </div>
              <p className="text-orange-600 font-medium">
                Your existing jobs, clients, and invoices will remain unchanged, but the configuration options will be completely replaced.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowConfirmDialog(false);
                setSelectedNiche(currentNiche); // Reset selection
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmNicheChange}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            >
              Yes, Change Niche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
