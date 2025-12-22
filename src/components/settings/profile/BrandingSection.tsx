import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogoUpload } from "./LogoUpload";

interface BrandingSectionProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
  isEditing?: boolean;
}

export const BrandingSection = ({ companySettings, updateCompanySettings, isEditing = true }: BrandingSectionProps) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateDescriptionWithAI = async () => {
    if (!companySettings.company_name && !companySettings.business_type) {
      toast.error('Please enter company name and business type first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const prompt = `Write a professional company description for ${companySettings.company_name || 'a company'}${
        companySettings.business_type ? ` in the ${companySettings.business_type} industry` : ''
      }. The description should be 2-3 sentences, highlighting key services and value proposition. Make it engaging and customer-focused.`;

      const { data, error } = await supabase.functions.invoke('generate-ai-message', {
        body: {
          prompt,
          systemContext: 'You are a professional copywriter creating compelling company descriptions. Keep it concise but impactful.',
          mode: 'text',
          temperature: 0.7,
          maxTokens: 150
        }
      });

      if (error) throw error;

      const generatedDescription = data?.generatedText || '';
      if (generatedDescription) {
        updateCompanySettings({ company_description: generatedDescription.trim() });
        toast.success('Description generated successfully!');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Branding</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Company Logo</Label>
          {isEditing ? (
            <LogoUpload
              currentLogoUrl={companySettings.company_logo_url}
              onUploadSuccess={(url) => updateCompanySettings({ company_logo_url: url })}
              companyName={companySettings.company_name}
            />
          ) : (
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center">
              <div className="mb-4 h-20 w-20 rounded-md overflow-hidden">
                {companySettings.company_logo_url ? (
                  <img 
                    src={companySettings.company_logo_url} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-fixlyfy to-fixlyfy-light flex items-center justify-center text-white font-bold text-3xl">
                    {companySettings.company_name ? companySettings.company_name.charAt(0).toUpperCase() : 'F'}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Company logo
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-tagline">Company Tagline</Label>
            <Input 
              id="company-tagline" 
              value={companySettings.company_tagline || ''}
              onChange={(e) => updateCompanySettings({ company_tagline: e.target.value })}
              disabled={!isEditing}
              placeholder="Smart Solutions for Field Service Businesses"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="company-desc">Company Description</Label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateDescriptionWithAI}
                  disabled={isGeneratingDescription}
                  className="gap-1"
                >
                  <Sparkles className={`w-3 h-3 ${isGeneratingDescription ? 'animate-pulse' : ''}`} />
                  {isGeneratingDescription ? 'Generating...' : 'Write with AI'}
                </Button>
              )}
            </div>
            <Textarea 
              id="company-desc" 
              className="resize-none" 
              rows={4}
              value={companySettings.company_description || ''}
              onChange={(e) => updateCompanySettings({ company_description: e.target.value })}
              disabled={!isEditing}
              placeholder="Describe your company's services and what makes you unique..."
            />
            <p className="text-xs text-muted-foreground">
              A compelling description helps customers understand your value proposition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
