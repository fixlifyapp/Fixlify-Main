
export interface BusinessHours {
  [key: string]: { open: string; close: string; enabled: boolean };
  monday: { open: string; close: string; enabled: boolean };
  tuesday: { open: string; close: string; enabled: boolean };
  wednesday: { open: string; close: string; enabled: boolean };
  thursday: { open: string; close: string; enabled: boolean };
  friday: { open: string; close: string; enabled: boolean };
  saturday: { open: string; close: string; enabled: boolean };
  sunday: { open: string; close: string; enabled: boolean };
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: '07:00', close: '22:00', enabled: true },
  tuesday: { open: '07:00', close: '22:00', enabled: true },
  wednesday: { open: '07:00', close: '22:00', enabled: true },
  thursday: { open: '07:00', close: '22:00', enabled: true },
  friday: { open: '07:00', close: '22:00', enabled: true },
  saturday: { open: '07:00', close: '22:00', enabled: true },
  sunday: { open: '07:00', close: '22:00', enabled: true }
};
