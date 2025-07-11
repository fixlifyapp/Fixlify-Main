
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalInfoCard } from "./profile/PersonalInfoCard";
import { CompanyInfoCard } from "./profile/CompanyInfoCard";
import { BrandingCard } from "./profile/BrandingCard";
import { SystemSettingsCard } from "./profile/SystemSettingsCard";
import { TaxSettingsCard } from "./profile/TaxSettingsCard";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const SettingsUserCompany = () => {
  const { user } = useAuth();
  const { settings: companySettings, loading: companyLoading, updateSettings: updateCompanySettings } = useCompanySettings();
  const { settings: userSettings, loading: userLoading, updateSettings: updateUserSettings } = useUserSettings();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for pending changes
  const [pendingUserChanges, setPendingUserChanges] = useState<any>({});
  const [pendingCompanyChanges, setPendingCompanyChanges] = useState<any>({});

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save user settings changes if any
      if (Object.keys(pendingUserChanges).length > 0) {
        // Handle profile changes separately
        if (pendingUserChanges.profile_changes) {
          const profileChanges = pendingUserChanges.profile_changes;
          
          // Update profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              name: `${profileChanges.first_name} ${profileChanges.last_name}`.trim(),
              phone: profileChanges.phone,
              ...(profileChanges.avatar_url && { avatar_url: profileChanges.avatar_url })
            })
            .eq('id', user?.id);

          if (profileError) throw profileError;
          
          // Remove profile_changes from user settings updates
          const { profile_changes, ...userSettingsUpdates } = pendingUserChanges;
          
          if (Object.keys(userSettingsUpdates).length > 0) {
            await updateUserSettings(userSettingsUpdates);
          }
        } else {
          await updateUserSettings(pendingUserChanges);
        }
        setPendingUserChanges({});
      }
      
      // Save company settings changes if any
      if (Object.keys(pendingCompanyChanges).length > 0) {
        console.log('Saving company changes:', pendingCompanyChanges);
        await updateCompanySettings(pendingCompanyChanges);
        setPendingCompanyChanges({});
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePendingUserSettings = (updates: any) => {
    setPendingUserChanges((prev: any) => ({ ...prev, ...updates }));
  };

  const updatePendingCompanySettings = (updates: any) => {
    console.log('Updating pending company settings:', updates);
    setPendingCompanyChanges((prev: any) => ({ ...prev, ...updates }));
  };

  // Merge current settings with pending changes for display
  const currentUserSettings = { ...userSettings, ...pendingUserChanges };
  const currentCompanySettings = { ...companySettings, ...pendingCompanyChanges };

  // Check if there are any changes to save
  const hasChanges = Object.keys(pendingUserChanges).length > 0 || Object.keys(pendingCompanyChanges).length > 0;

  if (companyLoading || userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="fixlyfy-card p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-fixlyfy-text">Profile & Company Settings</h2>
          <p className="text-fixlyfy-text-secondary">Manage your personal and company information</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="bg-fixlyfy hover:bg-fixlyfy/90"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalInfoCard 
          userSettings={currentUserSettings}
          updateUserSettings={updatePendingUserSettings}
        />
        
        <CompanyInfoCard 
          companyInfo={{
            company_name: currentCompanySettings.company_name || '',
            company_address: currentCompanySettings.company_address || '',
            company_city: currentCompanySettings.company_city || '',
            company_state: currentCompanySettings.company_state || '',
            company_zip: currentCompanySettings.company_zip || '',
            company_country: currentCompanySettings.company_country || '',
            company_phone: currentCompanySettings.company_phone || '',
            company_email: currentCompanySettings.company_email || '',
            company_website: currentCompanySettings.company_website || '',
            company_description: currentCompanySettings.company_description || '',
            custom_domain_name: currentCompanySettings.custom_domain_name || '',
            email_from_name: currentCompanySettings.email_from_name || '',
            email_from_address: currentCompanySettings.email_from_address || ''
          }}
          onUpdate={updatePendingCompanySettings}
        />
        
        <BrandingCard 
          companySettings={currentCompanySettings}
          updateCompanySettings={updatePendingCompanySettings}
        />
        
        <SystemSettingsCard 
          userSettings={currentUserSettings}
          updateUserSettings={updatePendingUserSettings}
        />

        <TaxSettingsCard 
          userSettings={currentUserSettings}
          updateUserSettings={updatePendingUserSettings}
        />
      </div>
    </div>
  );
};
