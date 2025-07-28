import { supabase } from '@/integrations/supabase/client';

interface EmailSettings {
  default_from_email: string;
  default_from_name: string;
  mailgun_domain: string;
  email_enabled: boolean;
}

/**
 * Generates a personalized email address based on company/user name
 * Examples: kyky@fixlify.app, company_name@fixlify.app
 */
export function generatePersonalizedEmail(
  companyName: string, 
  userName?: string,
  baseDomain: string = 'fixlify.app'
): string {
  // Clean and format the name for email
  const cleanName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric chars
      .substring(0, 20); // Limit length
  };

  // Use userName if provided, otherwise use company name
  const emailPrefix = userName ? cleanName(userName) : cleanName(companyName);
  
  // Fallback to 'team' if cleaning results in empty string
  const finalPrefix = emailPrefix || 'team';
  
  return `${finalPrefix}@${baseDomain}`;
}

/**
 * Gets or creates email settings for a user with personalized email
 */
export async function getOrCreateEmailSettings(userId: string): Promise<EmailSettings> {
  try {
    // First check if email settings exist
    const { data: existingSettings } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSettings) {
      return existingSettings;
    }

    // Get user's company information to generate personalized email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .maybeSingle();

    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('company_name')
      .eq('user_id', userId)
      .maybeSingle();

    // Generate personalized email
    const companyName = companySettings?.company_name || 'Company';
    const userName = profile ? `${profile.first_name}${profile.last_name}` : undefined;
    const personalizedEmail = generatePersonalizedEmail(companyName, userName);

    // Create new email settings
    const newSettings: Partial<EmailSettings> = {
      default_from_email: personalizedEmail,
      default_from_name: companyName,
      mailgun_domain: 'fixlify.app',
      email_enabled: true
    };

    const { data: createdSettings, error } = await supabase
      .from('email_settings')
      .insert({ ...newSettings, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error creating email settings:', error);
      // Return default settings if creation fails
      return {
        default_from_email: personalizedEmail,
        default_from_name: companyName,
        mailgun_domain: 'fixlify.app',
        email_enabled: true
      };
    }

    return createdSettings;
  } catch (error) {
    console.error('Error in getOrCreateEmailSettings:', error);
    // Return default fallback
    return {
      default_from_email: 'team@fixlify.app',
      default_from_name: 'Fixlify Team',
      mailgun_domain: 'fixlify.app',
      email_enabled: true
    };
  }
}

/**
 * Updates email settings for a user
 */
export async function updateEmailSettings(
  userId: string, 
  settings: Partial<EmailSettings>
): Promise<EmailSettings | null> {
  try {
    const { data, error } = await supabase
      .from('email_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating email settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateEmailSettings:', error);
    return null;
  }
}