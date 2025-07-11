
import { BusinessHours } from "@/types/businessHours";

// Helper function to safely parse string arrays from JSON
export const parseStringArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to safely parse business hours
export const parseBusinessHours = (value: any): BusinessHours => {
  if (!value) {
    return {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '15:00', enabled: true },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    };
  }
  
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // Convert any 'closed' properties to 'enabled' (inverted)
    const converted: BusinessHours = {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '15:00', enabled: true },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    };
    
    // Copy over existing values, handling both 'enabled' and 'closed' properties
    Object.keys(converted).forEach(day => {
      if (value[day]) {
        converted[day] = {
          open: value[day].open || converted[day].open,
          close: value[day].close || converted[day].close,
          enabled: value[day].hasOwnProperty('enabled') 
            ? value[day].enabled 
            : value[day].hasOwnProperty('closed') 
            ? !value[day].closed 
            : converted[day].enabled
        };
      }
    });
    
    return converted;
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseBusinessHours(parsed);
    } catch {
      return parseBusinessHours(null);
    }
  }
  
  return parseBusinessHours(null);
};

export const APPLIANCE_TYPES = [
  'HVAC Systems',
  'Plumbing',
  'Electrical',
  'Appliance Repair',
  'Water Heaters',
  'Garbage Disposals',
  'Dishwashers',
  'Washing Machines',
  'Dryers',
  'Refrigerators',
  'Ovens & Stoves'
];

export const BUSINESS_HOURS = [
  { day: 'Monday', key: 'monday' },
  { day: 'Tuesday', key: 'tuesday' },
  { day: 'Wednesday', key: 'wednesday' },
  { day: 'Thursday', key: 'thursday' },
  { day: 'Friday', key: 'friday' },
  { day: 'Saturday', key: 'saturday' },
  { day: 'Sunday', key: 'sunday' }
];
