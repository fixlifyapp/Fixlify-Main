export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const number = cleaned.slice(1);
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phoneNumber;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const cleanPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
};

/**
 * Convert phone number to E.164 format (+1XXXXXXXXXX)
 * Required for Telnyx API calls
 */
export const toE164 = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  // If already in E.164 format
  if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
    return phoneNumber;
  }

  const cleaned = phoneNumber.replace(/\D/g, '');

  // Handle 10-digit numbers
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Handle 11-digit numbers starting with 1
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // Return as-is if already has country code
  if (cleaned.length > 11) {
    return `+${cleaned}`;
  }

  // Return original if can't parse
  return phoneNumber;
}; 