import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface BrandingCardProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
}

export const BrandingCard = ({ companySettings, updateCompanySettings }: BrandingCardProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get the current session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    getSession();
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    updateCompanySettings({ [field]: value });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('BrandingCard - handleLogoUpload called');
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Check for user from both sources
    const activeUser = user || currentUser;
    
    if (!activeUser) {
      console.log('No user logged in', { user, currentUser });
      toast.error('Please log in to upload a logo');
      return;
    }

    // Check file type - only PNG and JPG allowed
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file format. Only PNG and JPG files are allowed.');
      return;
    }

    // Check file size - max 500KB
    const maxSize = 500 * 1024; // 500KB in bytes
    if (file.size > maxSize) {
      const fileSizeKB = Math.round(file.size / 1024);
      toast.error(`File size too large (${fileSizeKB}KB). Maximum allowed size is 500KB.`);
      return;
    }

    setIsUploading(true);
    try {
      // Get fresh session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error. Please refresh the page and try again.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/logo.${fileExt}`;

      console.log('Uploading to:', fileName);

      // First, try to remove existing file if any
      try {
        const { error: removeError } = await supabase.storage
          .from('company-logos')
          .remove([fileName]);
        
        if (removeError) {
          console.log('No existing file to remove or error removing:', removeError);
        }
      } catch (e) {
        console.log('Error removing old file:', e);
      }

      // Upload the new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // If error is about file already existing, try to update it
        if (uploadError.message?.includes('already exists')) {
          const { data: updateData, error: updateError } = await supabase.storage
            .from('company-logos')
            .update(fileName, file, {
              contentType: file.type,
              upsert: true
            });
            
          if (updateError) {
            throw updateError;
          }
        } else {
          throw uploadError;
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Add timestamp to URL to force refresh
      const urlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`;

      updateCompanySettings({
        company_logo_url: urlWithTimestamp
      });

      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      // Reset the input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  return (
    <Card className="fixlyfy-card">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <Palette className="h-5 w-5 text-fixlyfy mr-2" />
        <CardTitle className="text-lg">Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Company Logo</Label>
            <div className="mt-2 border-2 border-dashed border-fixlyfy-border rounded-lg p-6 text-center">
              {companySettings.company_logo_url ? (
                <div className="mx-auto h-16 w-16 rounded-lg overflow-hidden mb-3">
                  <img 
                    src={companySettings.company_logo_url} 
                    alt="Company Logo" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Error loading logo image');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="mx-auto h-16 w-16 rounded-lg bg-gradient-to-br from-fixlyfy to-fixlyfy-light flex items-center justify-center text-white font-bold text-2xl mb-3">
                  {companySettings.company_name?.[0] || 'F'}
                </div>
              )}
              
              {/* File input with label */}
              <div className="flex flex-col items-center gap-2">
                <label 
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md 
                    border border-input bg-background hover:bg-accent hover:text-accent-foreground 
                    cursor-pointer transition-colors
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="sr-only"
                  />
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload Logo'}
                </label>
                
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-2">
                    User ID: {(user || currentUser)?.id || 'Not logged in'}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-fixlyfy-text-secondary mt-2">
                PNG or JPG only, Max 500KB
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-tagline">Company Tagline</Label>
            <Input 
              id="company-tagline" 
              value={companySettings.company_tagline || ''}
              onChange={(e) => handleFieldChange('company_tagline', e.target.value)}
              placeholder="Your company's tagline"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-description">Company Description</Label>
            <Textarea 
              id="company-description" 
              className="resize-none" 
              rows={3}
              value={companySettings.company_description || ''}
              onChange={(e) => handleFieldChange('company_description', e.target.value)}
              placeholder="Brief description of your company..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
