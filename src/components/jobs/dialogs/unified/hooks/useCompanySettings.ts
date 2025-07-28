import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompanyInfo {
  name: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logoUrl: string;
  tagline: string;
  description: string;
  emailDomainName: string;
  emailFromName: string;
  emailFromAddress: string;
}

export const useCompanySettings = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchCompanySettings = async () => {
    try {
      console.log('=== useCompanySettings - Starting fetch ===');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      if (!user) {
        console.log('No user found, setting loading to false');
        setLoading(false);
        return;
      }

      console.log('Querying company_settings for user:', user.id);
      const { data: companySettings, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Also query profiles for company name (newer data source)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_name, company_email, company_phone, company_address')
        .eq('id', user.id)
        .single();
      
      console.log('Company settings query result:', { companySettings, error });
      console.log('Profile data query result:', { profileData, profileError });
      
      if (companySettings) {
        console.log('Found company settings, setting company info');
        setCompanyInfo({
            // Use profile company name if available, otherwise fall back to company_settings
            name: profileData?.company_name || companySettings.company_name,
            businessType: companySettings.business_type,
            address: companySettings.company_address,
            city: companySettings.company_city,
            state: companySettings.company_state,
            zip: companySettings.company_zip,
            country: companySettings.company_country,
            phone: companySettings.company_phone,
            email: companySettings.company_email,
            website: companySettings.company_website,
            taxId: companySettings.tax_id,
            logoUrl: companySettings.company_logo_url,
            tagline: companySettings.company_tagline,
            description: companySettings.company_description,
            emailDomainName: companySettings.custom_domain_name || '',
            emailFromName: companySettings.email_from_name || '',
            emailFromAddress: companySettings.email_from_address || ''
          });
        } else {
          // Fallback company info with all required properties
          setCompanyInfo({
            name: 'Fixlify Services',
            businessType: 'Professional Service Solutions',
            address: '456 Professional Ave, Suite 100',
            city: 'Business City',
            state: 'BC',
            zip: 'V1V 1V1',
            country: 'United States',
            phone: '(555) 123-4567',
            email: 'info@fixlify.com',
            website: 'www.fixlify.com',
            taxId: '',
            logoUrl: '',
            tagline: 'Professional Service You Can Trust',
            description: 'Licensed & Insured Professional Services',
            emailDomainName: '',
            emailFromName: 'Support Team',
            emailFromAddress: ''
          });
        }
      } catch (error) {
        console.error('Error fetching company settings:', error);
        // Set fallback data on error with all required properties
        setCompanyInfo({
          name: 'Fixlify Services',
          businessType: 'Professional Service Solutions',
          phone: '(555) 123-4567',
          email: 'info@fixlyfy.com',
          address: '456 Professional Ave, Suite 100',
          city: 'Business City',
          state: 'BC',
          zip: 'V1V 1V1',
          country: 'Canada',
          website: 'www.fixlyfy.com',
          taxId: '',
          logoUrl: '',
          tagline: 'Professional Service You Can Trust',
          description: 'Licensed & Insured Professional Services',
          emailDomainName: '',
          emailFromName: 'Support Team',
          emailFromAddress: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanySettings();
  }, []);

  return { companyInfo, loading };
};
