// Utility function to generate a unique company email address
export function generateCompanyEmailAddress(companyName: string): string {
  // Remove special characters and convert to lowercase
  const sanitized = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  // Take first 10 characters if too long
  const base = sanitized.substring(0, 10) || 'company';
  
  // Generate a random suffix if needed
  const randomSuffix = Math.random().toString(36).substring(2, 5);
  
  return `${base}${randomSuffix}@fixlify.app`;
}

// Sanitize company name to create email prefix
export function sanitizeCompanyName(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
    .substring(0, 15) || 'company';
}

// Check if email address is available
export async function isEmailAddressAvailable(
  supabase: any,
  emailAddress: string
): Promise<boolean> {
  // Check in profiles table
  const { data: profileExists } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_email_address', emailAddress)
    .single();
    
  if (profileExists) return false;
  
  // Check in company_settings table
  const { data: companyExists } = await supabase
    .from('company_settings')
    .select('id')
    .eq('company_email_address', emailAddress)
    .single();
    
  return !companyExists;
}

// Generate a unique company email address
export async function generateUniqueCompanyEmail(
  supabase: any,
  companyName: string
): Promise<string> {
  const base = sanitizeCompanyName(companyName);
  let emailAddress = `${base}@fixlify.app`;
  
  // Check if base email is available
  if (await isEmailAddressAvailable(supabase, emailAddress)) {
    return emailAddress;
  }
  
  // Try with numbers
  for (let i = 1; i <= 10; i++) {
    emailAddress = `${base}${i}@fixlify.app`;
    if (await isEmailAddressAvailable(supabase, emailAddress)) {
      return emailAddress;
    }
  }
  
  // Use random suffix as last resort
  const randomSuffix = Math.random().toString(36).substring(2, 5);
  return `${base}${randomSuffix}@fixlify.app`;
}
