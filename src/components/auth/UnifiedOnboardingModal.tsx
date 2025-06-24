import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Package, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NicheDataInitializer } from "@/services/nicheDataInitializer";

interface UnifiedOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userRole: string;
  userId: string;
}

const businessTypes = [
  "HVAC Services",
  "Plumbing Services",
  "Electrical Services",
  "Appliance Repair",
  "Roofing Services",
  "Deck Builder",
  "Moving Services",
  "Air Conditioning",
  "Waterproofing",
  "Drain Repair",
  "Painting & Decorating",
  "Landscaping & Lawn Care",
  "General Contracting",
  "Cleaning Services",
  "Other"
];

const referralSources = [
  "Search Engine",
  "Social Media",
  "Friend/Colleague",
  "Advertisement",
  "Other"
];

export const UnifiedOnboardingModal = ({ 
  isOpen, 
  onComplete, 
  userRole,
  userId 
}: UnifiedOnboardingModalProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    referralSource: "",
    teamSize: "1-5",
    setupProducts: true,
    setupTags: true
  });

  // Skip onboarding for non-admin users
  useEffect(() => {
    if (userRole !== 'admin') {
      console.log("Non-admin user, skipping onboarding");
      onComplete();
    }
  }, [userRole, onComplete]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const initializeUserData = async () => {
    try {
      setIsLoading(true);
      console.log("Starting enhanced onboarding for user:", userId);
      console.log("Business type selected:", formData.businessType);

      // Step 1: Update user profile
      console.log("Updating profile...");
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          business_niche: formData.businessType,
          referral_source: formData.referralSource,
          has_completed_onboarding: true
        })
        .eq('id', userId);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }
      console.log("Profile updated successfully");

      // Step 2: Handle company settings
      console.log("Checking for existing company settings...");
      const { data: existingCompany, error: selectError } = await supabase
        .from('company_settings')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is ok
        console.error("Error checking company settings:", selectError);
        throw selectError;
      }

      const companyData = {
        company_name: formData.businessName,
        business_type: formData.businessType,
        business_niche: formData.businessType,
        team_size: formData.teamSize
      };

      if (existingCompany) {
        // Update existing record
        console.log("Updating existing company settings...");
        const { error: companyError } = await supabase
          .from('company_settings')
          .update(companyData)
          .eq('user_id', userId);

        if (companyError) {
          console.error('Company settings update error:', companyError);
          throw companyError;
        }
        console.log("Company settings updated successfully");
      } else {
        // Insert new record
        console.log("Inserting new company settings...");
        const { error: companyError } = await supabase
          .from('company_settings')
          .insert({ ...companyData, user_id: userId });

        if (companyError) {
          console.error('Company settings insert error:', companyError);
          throw companyError;
        }
        console.log("Company settings inserted successfully");
      }

      // Step 3: Initialize user defaults (job statuses, lead sources, payment methods)
      console.log("Initializing user defaults...");
      const { error: defaultsError } = await supabase.rpc(
        'initialize_user_defaults',
        { p_user_id: userId }
      );

      if (defaultsError) {
        console.error('Error initializing defaults:', defaultsError);
        // Don't throw - continue with niche data
      } else {
        console.log("User defaults initialized successfully");
      }

      // Step 4: Use the new NicheDataInitializer for enhanced setup
      console.log("Initializing niche-specific data with NicheDataInitializer...");
      const nicheInitializer = new NicheDataInitializer(userId, formData.businessType);
      
      const initResults = await nicheInitializer.initializeAllData({
        setupProducts: formData.setupProducts,
        setupTags: formData.setupTags,
        setupCustomFields: true,
        setupAutomations: true,
        setupEmailTemplates: true
      });

      console.log("Niche initialization results:", initResults);

      // Step 5: Also run the existing enhanced niche data RPC for compatibility
      console.log("Running enhanced niche data RPC...");
      const { error: initError } = await supabase.rpc(
        'initialize_user_data_with_enhanced_niche_data',
        { 
          p_user_id: userId,
          p_business_niche: formData.businessType
        }
      );

      if (initError) {
        console.error('Error in enhanced niche data RPC:', initError);
        // Don't throw - continue
      }

      // Step 6: Load client-side enhanced niche data
      try {
        console.log("Loading client-side enhanced niche data...");
        const { initializeNicheData } = await import('@/utils/enhanced-niche-data-loader');
        await initializeNicheData(formData.businessType);
        console.log("Client-side niche data loaded successfully");
      } catch (error) {
        console.error('Error loading client-side niche data:', error);
      }

      // Step 7: Verify data was created successfully
      console.log("Verifying initialization...");
      const [products, tags] = await Promise.all([
        supabase.from('products').select('count').eq('user_id', userId),
        supabase.from('tags').select('count').eq('user_id', userId)
      ]);
      
      console.log(`Created ${products.data?.[0]?.count || 0} products`);
      console.log(`Created ${tags.data?.[0]?.count || 0} tags`);

      // Success!
      toast.success(`Welcome to Fixlify! Your ${formData.businessType} workspace is ready.`);
      onComplete();
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error during onboarding:", error);
      
      // More specific error messages
      let errorMessage = "Failed to complete setup. Please try again.";
      
      if (error.message?.includes('company_settings')) {
        errorMessage = "Failed to save company information. Please try again.";
      } else if (error.message?.includes('profiles')) {
        errorMessage = "Failed to update profile. Please try again.";
      } else if (error.message?.includes('products')) {
        errorMessage = "Failed to create products. Manual setup may be required.";
      } else if (error.message?.includes('tags')) {
        errorMessage = "Failed to create tags. You can add them manually later.";
      } else if (error.message?.includes('niche')) {
        errorMessage = "Failed to initialize business data. Please try again.";
      } else if (error.message?.includes('defaults')) {
        errorMessage = "Failed to set up defaults. Please try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    // Validate required fields
    if (!formData.businessName || !formData.businessType) {
      toast.error("Please fill in all required fields");
      return;
    }

    await initializeUserData();
  };

  // Don't render for non-admin users
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome to Fixlify! Let's set up your account
          </DialogTitle>
          <DialogDescription>
            This will only take a minute and helps us personalize your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  <p className="text-sm text-muted-foreground">Tell us about your business</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Enter your business name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleInputChange('businessType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="referralSource">How did you hear about us?</Label>
                  <Select
                    value={formData.referralSource}
                    onValueChange={(value) => handleInputChange('referralSource', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select referral source" />
                    </SelectTrigger>
                    <SelectContent>
                      {referralSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Size */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Team Size</h3>
                  <p className="text-sm text-muted-foreground">How many people are on your team?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {["Just me", "1-5", "6-10", "11-20", "21-50", "50+"].map((size) => (
                  <Card
                    key={size}
                    className={`cursor-pointer transition-all ${
                      formData.teamSize === size 
                        ? "border-primary ring-2 ring-primary ring-opacity-20" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleInputChange('teamSize', size)}
                  >
                    <CardContent className="p-4 text-center">
                      <p className="font-medium">{size}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Setup Options */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Initial Setup</h3>
                  <p className="text-sm text-muted-foreground">We can set up some defaults for you</p>
                </div>
              </div>

              <div className="space-y-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    formData.setupProducts 
                      ? "border-primary ring-2 ring-primary ring-opacity-20" 
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleInputChange('setupProducts', !formData.setupProducts)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`h-5 w-5 ${formData.setupProducts ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">Set up default products</p>
                        <p className="text-sm text-muted-foreground">
                          We'll add common products for {formData.businessType || "your business"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    formData.setupTags 
                      ? "border-primary ring-2 ring-primary ring-opacity-20" 
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleInputChange('setupTags', !formData.setupTags)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`h-5 w-5 ${formData.setupTags ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">Set up default tags</p>
                        <p className="text-sm text-muted-foreground">
                          Tags help you organize clients and jobs
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
            >
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!formData.businessName || !formData.businessType)) ||
                  isLoading
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 