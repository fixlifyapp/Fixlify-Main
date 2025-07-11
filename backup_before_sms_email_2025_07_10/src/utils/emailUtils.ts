
export const generateFromEmail = (companyName: string): string => {
  // Generate a clean email format from company name
  const cleanName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .substring(0, 20); // Limit length
  
  return `${cleanName}@fixlify.app`;
};

export const formatCompanyNameForEmail = (companyName: string): string => {
  // Format company name for email display (clean but readable)
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 20); // Limit length
};

export const formatEmailPreview = (content: string, maxLength: number = 100): string => {
  if (!content) return 'No content';
  
  // Strip HTML tags
  const textContent = content.replace(/<[^>]*>/g, '');
  
  // Truncate if necessary
  if (textContent.length > maxLength) {
    return textContent.substring(0, maxLength) + '...';
  }
  
  return textContent;
};

export const getEmailStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'bg-fixlyfy-success/20 text-fixlyfy-success';
    case 'sent':
      return 'bg-fixlyfy-info/20 text-fixlyfy-info';
    case 'failed':
      return 'bg-fixlyfy-error/20 text-fixlyfy-error';
    case 'pending':
      return 'bg-fixlyfy-warning/20 text-fixlyfy-warning';
    default:
      return 'bg-fixlyfy-text-muted/20 text-fixlyfy-text-muted';
  }
};
