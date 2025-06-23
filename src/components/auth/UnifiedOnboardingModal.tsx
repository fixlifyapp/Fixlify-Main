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
  "General Contracting",
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
      console.log("Starting onboarding data initialization for user:", userId);

      // Update user profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          business_niche: formData.businessType,
          referral_source: formData.referralSource,
          has_completed_onboarding: true
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update company settings
      const { error: companyError } = await supabase
        .from('company_settings')
        .update({
          company_name: formData.businessName,
          business_type: formData.businessType,
          business_niche: formData.businessType
        })
        .eq('user_id', userId);

      if (companyError) throw companyError;

      // Initialize products with proper user_id
      if (formData.setupProducts && formData.businessType) {
        console.log("Initializing products for business type:", formData.businessType);
        
        // First, check if user already has products
        const { data: existingProducts } = await supabase
          .from('products')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (!existingProducts || existingProducts.length === 0) {
          // Load niche-specific products
          const module = await import(`@/utils/niche-data/${formData.businessType.toLowerCase().replace(/\s+/g, '-')}.ts`)
            .catch(() => import('@/utils/niche-data/default.ts'));
          
          const products = module.products || [];
          
          if (products.length > 0) {
            // Insert products with user_id
            const productsWithUserId = products.map((product: any) => ({
              ...product,
              user_id: userId,
              created_by: userId
            }));

            const { error: productsError } = await supabase
              .from('products')
              .insert(productsWithUserId);

            if (productsError) {
              console.error("Error creating products:", productsError);
              throw productsError;
            }
            console.log(`Created ${products.length} products for user`);
          }
        }
      }

      // Initialize tags with proper user_id
      if (formData.setupTags && formData.businessType) {
        console.log("Initializing tags for business type:", formData.businessType);
        
        // Check if user already has tags
        const { data: existingTags } = await supabase
          .from('tags')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (!existingTags || existingTags.length === 0) {
          // Load niche-specific tags
          const module = await import(`@/utils/niche-data/${formData.businessType.toLowerCase().replace(/\s+/g, '-')}.ts`)
            .catch(() => import('@/utils/niche-data/default.ts'));
          
          const tags = module.tags || [];
          
          if (tags.length > 0) {
            // Insert tags with user_id
            const tagsWithUserId = tags.map((tag: any) => ({
              ...tag,
              user_id: userId,
              created_by: userId
            }));

            const { error: tagsError } = await supabase
              .from('tags')
              .insert(tagsWithUserId);

            if (tagsError) {
              console.error("Error creating tags:", tagsError);
              throw tagsError;
            }
            console.log(`Created ${tags.length} tags for user`);
          }
        }
      }

      toast.success("Welcome to Fixlify! Your account is all set up.");
      onComplete();
      navigate('/dashboard');
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error("Failed to complete setup. Please try again.");
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