/**
 * Email utility functions for generating company-specific email addresses
 */

/**
 * Format company name for email address
 * Converts company name to a valid email-safe format
 */
export const formatCompanyNameForEmail = (companyName: string): string => {
  if (!companyName || typeof companyName !== 'string') {
    return 'support';
  }

  return companyName
    .toLowerCase()
    .trim()
    // Replace spaces, hyphens, ampersands, plus signs, dots, commas, parentheses with underscore
    .replace(/[\s\-&+.,()]+/g, '_')
    // Remove any non-alphanumeric characters except underscore
    .replace(/[^a-z0-9_]/g, '')
    // Replace multiple underscores with single underscore
    .replace(/_+/g, '_')
    // Remove leading and trailing underscores
    .replace(/^_+|_+$/g, '')
    // Limit to 30 characters
    .substring(0, 30)
    || 'support'; // Fallback if result is empty
};

/**
 * Generate company email address
 * Creates an email address based on company name
 */
export const generateCompanyEmail = (companyName: string): string => {
  const formattedName = formatCompanyNameForEmail(companyName);
  return `${formattedName}@fixlify.app`;
};

/**
 * Get support email based on company settings
 * Returns company-specific email or default support email
 */
export const getSupportEmail = (companyEmail?: string | null, companyName?: string | null): string => {
  // If company has a custom email, use it
  if (companyEmail && companyEmail.trim()) {
    return companyEmail.trim();
  }
  
  // If company has a name, generate email from it
  if (companyName && companyName.trim()) {
    return generateCompanyEmail(companyName);
  }
  
  // Default fallback
  return 'support@fixlify.app';
};
