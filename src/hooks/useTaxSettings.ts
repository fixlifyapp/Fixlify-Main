
import { useUserSettings, UserSettings } from './useUserSettings';
import { getTaxDetailsByRegion } from '@/utils/taxRegions';

export interface TaxConfiguration {
  rate: number;
  region: string;
  label: string;
  displayText: string;
}

export const useTaxSettings = () => {
  const { settings, loading, updateSettings } = useUserSettings();

  // Get default tax settings for Ontario (Canada's most common business location)
  const defaultRegion = getTaxDetailsByRegion('Ontario');
  
  const taxConfig: TaxConfiguration = {
    rate: settings.default_tax_rate || defaultRegion?.rate || 13.00,
    region: settings.tax_region || 'Ontario',
    label: settings.tax_label || defaultRegion?.taxLabel || 'HST',
    displayText: `${settings.tax_label || defaultRegion?.taxLabel || 'HST'} (${settings.default_tax_rate || defaultRegion?.rate || 13}%)`
  };

  const updateTaxSettings = async (updates: Partial<Pick<UserSettings, 'default_tax_rate' | 'tax_region' | 'tax_label'>>) => {
    console.log('useTaxSettings - Updating tax settings with:', updates);
    try {
      await updateSettings(updates);
      console.log('useTaxSettings - Tax settings updated successfully');
    } catch (error) {
      console.error('useTaxSettings - Error updating tax settings:', error);
      throw error;
    }
  };

  return {
    taxConfig,
    loading,
    updateTaxSettings
  };
};
