import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Package, CheckCircle2, Loader2, SkipForward } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Profile } from "@/types/profile";
import { businessTypes, referralSources } from "@/utils/business-niches";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    referralSource: "",
    setupProducts: true,
    setupTags: true
  });

  const totalSteps = 2;
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

  const handleSkipOnboarding = async () => {
    try {
      setIsSkipping(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Mark onboarding as completed without setting up data
      const { error: onboardingError } = await supabase
        .from('profiles')
        .update({
          has_completed_onboarding: true,
          business_niche: 'General'
        })
        .eq('id', user.id);

      if (onboardingError) {
        console.error('Skip onboarding error:', onboardingError);
        throw onboardingError;
      }

      // Initialize default data for skipped onboarding
      const { error: defaultsError } = await supabase.rpc(
        'initialize_user_defaults',
        { 
          p_user_id: user.id
        }
      );

      if (defaultsError) {
        console.error('Error initializing default data:', defaultsError);
      }

      toast.info("Onboarding skipped. You can configure your business settings later in Settings.");
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast.error("Failed to skip onboarding. Please try again.");
    } finally {
      setIsSkipping(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Update profile with business information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.businessName,
          business_niche: formData.businessType,
          referral_source: formData.referralSource
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update company settings
      const { error: settingsError } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          company_name: formData.businessName,
          business_type: formData.businessType
        });

      if (settingsError) {
        console.error('Company settings error:', settingsError);
        throw settingsError;
      }

      // Initialize user defaults (job statuses, lead sources, payment methods)
      const { error: defaultsError } = await supabase.rpc(
        'initialize_user_defaults',
        { p_user_id: user.id }
      );

      if (defaultsError) {
        console.error('Error initializing defaults:', defaultsError);
        // Don't throw - continue with niche data
      }

      // Initialize niche-specific data
      const { error: initError } = await supabase.rpc(
        'initialize_user_data_with_enhanced_niche_data',
        { 
          p_user_id: user.id,
          p_business_niche: formData.businessType
        }
      );

      if (initError) {
        console.error('Error initializing niche data:', initError);
        // Don't throw - continue to load client-side data
      }

      // Load enhanced niche data from client
      try {
        const { initializeNicheData } = await import('@/utils/enhanced-niche-data-loader');
        await initializeNicheData(formData.businessType);
      } catch (error) {
        console.error('Error loading enhanced niche data:', error);
      }

      // Update onboarding status
      const { error: onboardingError } = await supabase
        .from('profiles')
        .update({
          has_completed_onboarding: true
        })
        .eq('id', user.id);

      if (onboardingError) {
        console.error('Onboarding status error:', onboardingError);
        throw onboardingError;
      }

      toast.success("Welcome! Your account has been set up successfully.");
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
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

          {/* Step 2: Setup Options */}
          {currentStep === 2 && (
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
                        <p className="font-medium">Set up default products (20-30 items)</p>
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
                        <p className="font-medium">Set up default tags (15 items)</p>
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
              disabled={currentStep === 1 || isLoading || isSkipping}
            >
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!formData.businessName || !formData.businessType)) ||
                  isLoading || isSkipping
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={isLoading || isSkipping}
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

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkipOnboarding}
            disabled={isLoading || isSkipping}
            className="text-muted-foreground hover:text-foreground"
          >
            {isSkipping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Skipping...
              </>
            ) : (
              <>
                <SkipForward className="mr-2 h-4 w-4" />
                Skip for now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 