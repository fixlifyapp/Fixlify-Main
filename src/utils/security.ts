
export const sanitizeHtml = (content: string): string => {
  // Basic HTML sanitization to prevent XSS
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone number validation - allows various formats
  const phoneRegex = /^[+]?[1-9]\d{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-().]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10 && cleanPhone.length <= 16;
};

export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

export const validateSessionToken = (token: string): boolean => {
  // Basic token validation - should be base64 and reasonable length
  if (!token || typeof token !== 'string') return false;
  if (token.length < 16 || token.length > 512) return false;
  
  try {
    // Check if it's valid base64
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    return decoded.length > 0;
  } catch {
    return false;
  }
};

export const getPortalDomain = (): string => {
  // Make portal domain configurable with fallback
  return process.env.PORTAL_DOMAIN || 'https://hub.fixlify.app';
};

export const validatePortalDomain = (domain: string): boolean => {
  try {
    const url = new URL(domain);
    return url.protocol === 'https:' && url.hostname.length > 0;
  } catch {
    return false;
  }
};
