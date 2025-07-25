import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Building, Mail, MapPin, Clock, Info } from "lucide-react";
import { EmailConfiguration } from "./EmailConfiguration";
import { useCompanySettings } from "./hooks/useCompanySettingsForm";
import { generateFromEmail, formatCompanyNameForEmail } from "@/utils/emailUtils";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { BusinessHoursEditor } from "@/components/connect/BusinessHoursEditor";
import { DEFAULT_BUSINESS_HOURS } from "@/types/businessHours";

export const SettingsCompany = () => {
  const { settings, loading, saving, updateSettings, saveSettings, hasChanges } = useCompanySettings();
  const { user } = useAuth();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string | number) => {
    console.log(`SettingsCompany - updating field: ${field} with value:`, value);
    updateSettings({ [field]: value });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SettingsCompany - handleLogoUpload called');
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (!user) {
      console.log('No user logged in');
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

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      updateSettings({
        company_logo_url: publicUrlData.publicUrl
      });

      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      // Reset the input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  const getAutoGeneratedEmail = () => {
    return generateFromEmail(settings?.company_name || '');
  };

  const getFormattedName = () => {
    return formatCompanyNameForEmail(settings?.company_name || '');
  };

  if (loading) {
    return <div>Loading company settings...</div>;
  }

  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="company" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="hidden sm:inline">Company</span>
        </TabsTrigger>
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Email</span>
        </TabsTrigger>
        <TabsTrigger value="locations" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Locations</span>
        </TabsTrigger>
        <TabsTrigger value="hours" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Hours</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={settings?.company_name || ''} 
                onChange={(e) => handleInputChange('company_name', e.target.value)}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800">Automatic Email Generation</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-blue-700">
                        Your email address is automatically generated from your company name:
                      </p>
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Email address:</span>
                          <code className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                            {getAutoGeneratedEmail()}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Formatted name:</span>
                          <code className="bg-gray-50 px-2 py-1 rounded text-sm">
                            {getFormattedName()}
                          </code>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600">
                        Special characters are converted to underscores, and the name is made lowercase for the email address.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Email Domain Section */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="custom-domain-name">Email Domain Name</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  id="custom-domain-name" 
                  value={settings?.custom_domain_name || ''}
                  onChange={(e) => {
                    const cleanValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    console.log('Settings - custom domain name changed to:', cleanValue);
                    handleInputChange('custom_domain_name', cleanValue);
                  }}
                  placeholder="yourcompany"
                  className="max-w-xs"
                />
                <span className="text-muted-foreground">@fixlify.app</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This will be your FROM address when sending emails (e.g., yourcompany@fixlify.app)
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-address">Address</Label>
              <Input 
                id="company-address" 
                value={settings?.company_address || ''}
                onChange={(e) => handleInputChange('company_address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-city">City</Label>
              <Input 
                id="company-city" 
                value={settings?.company_city || ''}
                onChange={(e) => handleInputChange('company_city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-state">State</Label>
              <Input 
                id="company-state" 
                value={settings?.company_state || ''}
                onChange={(e) => handleInputChange('company_state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-zip">ZIP / Postal Code</Label>
              <Input 
                id="company-zip" 
                value={settings?.company_zip || ''}
                onChange={(e) => handleInputChange('company_zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-country">Country</Label>
              <Input 
                id="company-country" 
                value={settings?.company_country || ''}
                onChange={(e) => handleInputChange('company_country', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Owner Phone Number</Label>
              <Input 
                id="company-phone" 
                value={settings?.company_phone || ''}
                onChange={(e) => handleInputChange('company_phone', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your personal contact number. Business numbers are in Phone Numbers.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input 
                id="company-email" 
                type="email" 
                value={settings?.company_email || ''}
                onChange={(e) => handleInputChange('company_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <Input 
                id="company-website" 
                value={settings?.company_website || ''}
                onChange={(e) => handleInputChange('company_website', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-tax-id">Tax ID / EIN</Label>
              <Input 
                id="company-tax-id" 
                value={settings?.tax_id || ''}
                onChange={(e) => handleInputChange('tax_id', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {settings?.company_logo_url ? (
                  <div className="space-y-4">
                    <img 
                      src={settings.company_logo_url} 
                      alt="Company Logo" 
                      className="mx-auto h-32 w-32 object-contain"
                    />
                    <p className="text-sm text-gray-600">Current logo</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">No logo uploaded</p>
                  </div>
                )}
                
                {/* Simple file input with custom styling */}
                <label className="inline-flex items-center gap-2 px-3 py-1.5 mt-4 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="sr-only"
                  />
                  <Upload className="h-4 w-4" />
                  {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </label>
                
                <p className="text-xs text-muted-foreground mt-2">
                  PNG or JPG only, Max 500KB
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-tagline">Company Tagline</Label>
                <Input 
                  id="company-tagline" 
                  value={settings?.company_tagline || ''}
                  onChange={(e) => handleInputChange('company_tagline', e.target.value)}
                  placeholder="Your company's tagline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-description">Description</Label>
                <Textarea 
                  id="company-description" 
                  className="resize-none" 
                  rows={4}
                  value={settings?.company_description || ''}
                  onChange={(e) => handleInputChange('company_description', e.target.value)}
                  placeholder="Brief description of your company..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            className="bg-fixlyfy hover:bg-fixlyfy/90" 
            disabled={saving || !hasChanges}
            onClick={saveSettings}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="email">
        <EmailConfiguration />
      </TabsContent>

      <TabsContent value="locations">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Service Areas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="service-areas">Service Areas</Label>
                <Textarea 
                  id="service-areas" 
                  className="resize-none" 
                  rows={4}
                  value={settings?.service_areas || ''}
                  onChange={(e) => handleInputChange('service_areas', e.target.value)}
                  placeholder="Enter service areas..."
                />
                <p className="text-xs text-fixlyfy-text-secondary mt-1">
                  Enter ZIP codes separated by commas
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              className="bg-fixlyfy hover:bg-fixlyfy/90" 
              disabled={saving || !hasChanges}
              onClick={saveSettings}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="hours">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Business Hours</h3>
            <p className="text-muted-foreground mb-6">
              Set your business operating hours. These will be used for scheduling and customer communications.
            </p>
            
            <BusinessHoursEditor
              businessHours={settings?.business_hours || DEFAULT_BUSINESS_HOURS}
              onBusinessHoursChange={(hours) => updateSettings({ business_hours: hours })}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              className="bg-fixlyfy hover:bg-fixlyfy/90" 
              disabled={saving || !hasChanges}
              onClick={saveSettings}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
