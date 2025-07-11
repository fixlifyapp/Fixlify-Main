// List of all timezones with their UTC offsets
export const TIMEZONES = [
  // North America
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)', offset: '-05:00', group: 'North America' },
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: '-05:00', group: 'North America' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: '-06:00', group: 'North America' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: '-07:00', group: 'North America' },
  { value: 'America/Phoenix', label: 'Phoenix (MST)', offset: '-07:00', group: 'North America' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: '-08:00', group: 'North America' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)', offset: '-09:00', group: 'North America' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)', offset: '-10:00', group: 'North America' },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)', offset: '-08:00', group: 'North America' },
  { value: 'America/Edmonton', label: 'Edmonton (MST/MDT)', offset: '-07:00', group: 'North America' },
  { value: 'America/Winnipeg', label: 'Winnipeg (CST/CDT)', offset: '-06:00', group: 'North America' },
  { value: 'America/Halifax', label: 'Halifax (AST/ADT)', offset: '-04:00', group: 'North America' },
  { value: 'America/St_Johns', label: "St. John's (NST/NDT)", offset: '-03:30', group: 'North America' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', offset: '-06:00', group: 'North America' },
  
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: '+00:00', group: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Brussels', label: 'Brussels (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Oslo', label: 'Oslo (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (CET/CEST)', offset: '+01:00', group: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET/EEST)', offset: '+02:00', group: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)', offset: '+02:00', group: 'Europe' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)', offset: '+03:00', group: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: '+03:00', group: 'Europe' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: '+04:00', group: 'Asia' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)', offset: '+05:00', group: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)', offset: '+05:30', group: 'Asia' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', offset: '+06:00', group: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: '+07:00', group: 'Asia' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)', offset: '+07:00', group: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+08:00', group: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: '+08:00', group: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00', group: 'Asia' },
  { value: 'Asia/Taipei', label: 'Taipei (CST)', offset: '+08:00', group: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: '+09:00', group: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00', group: 'Asia' },
  
  // Oceania
  { value: 'Australia/Perth', label: 'Perth (AWST)', offset: '+08:00', group: 'Oceania' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)', offset: '+09:30', group: 'Oceania' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', offset: '+10:00', group: 'Oceania' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: '+10:00', group: 'Oceania' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)', offset: '+10:00', group: 'Oceania' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: '+12:00', group: 'Oceania' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT/FJST)', offset: '+12:00', group: 'Oceania' },
  
  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)', offset: '-03:00', group: 'South America' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', offset: '-03:00', group: 'South America' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)', offset: '-04:00', group: 'South America' },
  { value: 'America/Lima', label: 'Lima (PET)', offset: '-05:00', group: 'South America' },
  { value: 'America/Bogota', label: 'Bogotá (COT)', offset: '-05:00', group: 'South America' },
  { value: 'America/Caracas', label: 'Caracas (VET)', offset: '-04:00', group: 'South America' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)', offset: '+02:00', group: 'Africa' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', offset: '+01:00', group: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', offset: '+02:00', group: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', offset: '+03:00', group: 'Africa' },
  { value: 'Africa/Casablanca', label: 'Casablanca (WET/WEST)', offset: '+00:00', group: 'Africa' },
  
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00', group: 'UTC' }
];

// Default timezone is Toronto, Canada
export const DEFAULT_TIMEZONE = 'America/Toronto';

// Helper function to get timezone by value
export const getTimezoneByValue = (value: string) => {
  return TIMEZONES.find(tz => tz.value === value) || TIMEZONES.find(tz => tz.value === DEFAULT_TIMEZONE);
};

// Helper function to group timezones by region
export const getTimezonesGrouped = () => {
  const groups: Record<string, typeof TIMEZONES> = {};
  
  TIMEZONES.forEach(timezone => {
    if (!groups[timezone.group]) {
      groups[timezone.group] = [];
    }
    groups[timezone.group].push(timezone);
  });
  
  return groups;
};

// Helper function to get current time in a specific timezone
export const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    const date = new Date();
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid timezone';
  }
};
