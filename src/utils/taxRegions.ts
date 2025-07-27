// Canadian tax regions with their respective tax rates and labels
export const TAX_REGIONS = [
  { value: 'Alberta', label: 'Alberta (5% GST)', rate: 5.00, taxLabel: 'GST' },
  { value: 'British Columbia', label: 'British Columbia (12% GST+PST)', rate: 12.00, taxLabel: 'GST+PST' },
  { value: 'Manitoba', label: 'Manitoba (12% GST+PST)', rate: 12.00, taxLabel: 'GST+PST' },
  { value: 'New Brunswick', label: 'New Brunswick (15% HST)', rate: 15.00, taxLabel: 'HST' },
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador (15% HST)', rate: 15.00, taxLabel: 'HST' },
  { value: 'Northwest Territories', label: 'Northwest Territories (5% GST)', rate: 5.00, taxLabel: 'GST' },
  { value: 'Nova Scotia', label: 'Nova Scotia (15% HST)', rate: 15.00, taxLabel: 'HST' },
  { value: 'Nunavut', label: 'Nunavut (5% GST)', rate: 5.00, taxLabel: 'GST' },
  { value: 'Ontario', label: 'Ontario (13% HST)', rate: 13.00, taxLabel: 'HST' },
  { value: 'Prince Edward Island', label: 'Prince Edward Island (15% HST)', rate: 15.00, taxLabel: 'HST' },
  { value: 'Quebec', label: 'Quebec (14.975% GST+QST)', rate: 14.975, taxLabel: 'GST+QST' },
  { value: 'Saskatchewan', label: 'Saskatchewan (11% GST+PST)', rate: 11.00, taxLabel: 'GST+PST' },
  { value: 'Yukon', label: 'Yukon (5% GST)', rate: 5.00, taxLabel: 'GST' },
  { value: 'United States', label: 'United States (Variable Sales Tax)', rate: 8.50, taxLabel: 'Sales Tax' },
  { value: 'Custom', label: 'Custom/Other', rate: 0, taxLabel: 'Tax' }
];

export const TAX_LABELS = [
  { value: 'HST', label: 'HST (Harmonized Sales Tax)' },
  { value: 'GST', label: 'GST (Goods and Services Tax)' },
  { value: 'PST', label: 'PST (Provincial Sales Tax)' },
  { value: 'GST+PST', label: 'GST + PST' },
  { value: 'GST+QST', label: 'GST + QST (Quebec)' },
  { value: 'Sales Tax', label: 'Sales Tax' },
  { value: 'VAT', label: 'VAT (Value Added Tax)' },
  { value: 'Tax', label: 'Tax' }
];

// Helper function to get tax details by region
export const getTaxDetailsByRegion = (region: string) => {
  return TAX_REGIONS.find(r => r.value === region) || TAX_REGIONS.find(r => r.value === 'Ontario');
};