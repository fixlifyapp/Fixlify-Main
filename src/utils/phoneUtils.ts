export const formatPhoneForTelnyx = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already has + at the beginning, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Check if it's a valid length for US numbers
  if (cleaned.length === 10) {
    // 10 digits - assume US number without country code
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // 11 digits starting with 1 - US number with country code
    return `+${cleaned}`;
  } else {
    // For any other format, just add + if not present
    // This allows international numbers to pass through
    return `+${cleaned}`;
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's at least 10 digits (minimum for most phone numbers)
  // Allow up to 15 digits (maximum international phone number length)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // US phone number formatting
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const withoutCountryCode = cleaned.slice(1);
    return `+1 (${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
  }
  
  // For international numbers, just format with spaces every 3-4 digits
  if (phone.startsWith('+') && cleaned.length > 11) {
    // Keep the + and format the rest
    const countryCode = cleaned.slice(0, cleaned.length > 12 ? 3 : 2);
    const rest = cleaned.slice(countryCode.length);
    
    // Format the rest in groups
    const formatted = rest.match(/.{1,4}/g)?.join(' ') || rest;
    return `+${countryCode} ${formatted}`;
  }
  
  return phone; // Return original if format doesn't match
};

// New utility to detect if a phone number needs a country code
export const needsCountryCode = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return !phone.startsWith('+') && cleaned.length >= 10;
};

// Utility to suggest adding country code
export const suggestCountryCode = (phone: string): string => {
  if (needsCountryCode(phone)) {
    return "Tip: Include country code for international SMS (e.g., +1 for US/Canada, +34 for Spain)";
  }
  return "";
};