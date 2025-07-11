
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_zip: string;
  company_country: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_description: string;
  custom_domain_name: string;
  email_from_name: string;
  email_from_address: string;
}

interface CompanyInfoCardProps {
  companyInfo: CompanyInfo;
  onUpdate: (updatedInfo: Partial<CompanyInfo>) => void;
  isLoading?: boolean;
}

export const CompanyInfoCard = ({ companyInfo, onUpdate, isLoading }: CompanyInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CompanyInfo>(companyInfo);

  const handleSave = async () => {
    try {
      console.log('Saving company info with custom_domain_name:', formData.custom_domain_name);
      
      // Ensure we're passing the correct field name for custom domain
      const updateData = {
        company_name: formData.company_name,
        company_address: formData.company_address,
        company_city: formData.company_city,
        company_state: formData.company_state,
        company_zip: formData.company_zip,
        company_country: formData.company_country,
        company_phone: formData.company_phone,
        company_email: formData.company_email,
        company_website: formData.company_website,
        company_description: formData.company_description,
        custom_domain_name: formData.custom_domain_name, // This is the key fix
        email_from_name: formData.email_from_name,
        email_from_address: formData.email_from_address
      };
      
      console.log('Update data being sent:', updateData);
      await onUpdate(updateData);
      setIsEditing(false);
      toast.success('Company information updated successfully');
    } catch (error) {
      console.error('Error updating company info:', error);
      toast.error('Failed to update company information');
    }
  };

  const handleCancel = () => {
    setFormData(companyInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomDomainNameChange = (value: string) => {
    // Clean the input to only allow letters, numbers, and hyphens
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    handleInputChange('custom_domain_name', cleanValue);
  };

  // Update form data when companyInfo changes
  React.useEffect(() => {
    console.log('CompanyInfo updated:', companyInfo);
    setFormData(companyInfo);
  }, [companyInfo]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Company Information</CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            disabled={!isEditing}
            placeholder="Your Company Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_address">Address</Label>
          <Input
            id="company_address"
            value={formData.company_address}
            onChange={(e) => handleInputChange('company_address', e.target.value)}
            disabled={!isEditing}
            placeholder="123 Business Street, Suite 100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_city">City</Label>
            <Input
              id="company_city"
              value={formData.company_city}
              onChange={(e) => handleInputChange('company_city', e.target.value)}
              disabled={!isEditing}
              placeholder="San Francisco"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_state">State</Label>
            <Input
              id="company_state"
              value={formData.company_state}
              onChange={(e) => handleInputChange('company_state', e.target.value)}
              disabled={!isEditing}
              placeholder="CA"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_zip">ZIP Code</Label>
            <Input
              id="company_zip"
              value={formData.company_zip}
              onChange={(e) => handleInputChange('company_zip', e.target.value)}
              disabled={!isEditing}
              placeholder="94103"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_phone">Owner Phone Number</Label>
            <Input
              id="company_phone"
              value={formData.company_phone}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              disabled={!isEditing}
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_email">Email</Label>
            <Input
              id="company_email"
              type="email"
              value={formData.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              disabled={!isEditing}
              placeholder="contact@yourcompany.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_website">Website</Label>
          <Input
            id="company_website"
            value={formData.company_website}
            onChange={(e) => handleInputChange('company_website', e.target.value)}
            disabled={!isEditing}
            placeholder="https://www.yourcompany.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_description">Description</Label>
          <Textarea
            id="company_description"
            value={formData.company_description}
            onChange={(e) => handleInputChange('company_description', e.target.value)}
            disabled={!isEditing}
            placeholder="Brief description of your company and services..."
            rows={3}
          />
        </div>

        {/* Email Configuration Section */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Email Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom_domain_name">Email Domain Name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="custom_domain_name"
                  value={formData.custom_domain_name || ''}
                  onChange={(e) => handleCustomDomainNameChange(e.target.value)}
                  disabled={!isEditing}
                  placeholder="nicksappliancerepair"
                />
                <span className="text-sm text-muted-foreground">@fixlify.app</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This will be used as the FROM address: {formData.custom_domain_name || 'yourdomain'}@fixlify.app
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email_from_name">From Name</Label>
              <Input
                id="email_from_name"
                value={formData.email_from_name}
                onChange={(e) => handleInputChange('email_from_name', e.target.value)}
                disabled={!isEditing}
                placeholder="Support Team"
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="email_from_address">Alternative From Address</Label>
            <Input
              id="email_from_address"
              type="email"
              value={formData.email_from_address}
              onChange={(e) => handleInputChange('email_from_address', e.target.value)}
              disabled={!isEditing}
              placeholder="support@yourcompany.com"
            />
            <p className="text-xs text-muted-foreground">
              Only used if Email Domain Name is not set. Must be verified with Mailgun.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
