// Tax regions organized by country
export const TAX_COUNTRIES = {
  'Canada': {
    name: 'Canada',
    provinces: [
      { value: 'Alberta', label: 'Alberta', rate: 5.00, taxLabel: 'GST' },
      { value: 'British Columbia', label: 'British Columbia', rate: 12.00, taxLabel: 'GST+PST' },
      { value: 'Manitoba', label: 'Manitoba', rate: 12.00, taxLabel: 'GST+PST' },
      { value: 'New Brunswick', label: 'New Brunswick', rate: 15.00, taxLabel: 'HST' },
      { value: 'Nova Scotia', label: 'Nova Scotia', rate: 15.00, taxLabel: 'HST' },
      { value: 'Ontario', label: 'Ontario', rate: 13.00, taxLabel: 'HST' },
      { value: 'Prince Edward Island', label: 'Prince Edward Island', rate: 15.00, taxLabel: 'HST' },
      { value: 'Quebec', label: 'Quebec', rate: 14.975, taxLabel: 'GST+QST' },
      { value: 'Saskatchewan', label: 'Saskatchewan', rate: 11.00, taxLabel: 'GST+PST' }
    ]
  },
  'United States': {
    name: 'United States',
    provinces: [
      { value: 'Alabama', label: 'Alabama', rate: 4.00, taxLabel: 'Sales Tax' },
      { value: 'Alaska', label: 'Alaska', rate: 0.00, taxLabel: 'Sales Tax' },
      { value: 'Arizona', label: 'Arizona', rate: 5.60, taxLabel: 'Sales Tax' },
      { value: 'California', label: 'California', rate: 7.25, taxLabel: 'Sales Tax' },
      { value: 'Florida', label: 'Florida', rate: 6.00, taxLabel: 'Sales Tax' },
      { value: 'New York', label: 'New York', rate: 4.00, taxLabel: 'Sales Tax' },
      { value: 'Texas', label: 'Texas', rate: 6.25, taxLabel: 'Sales Tax' }
    ]
  }
};

// Legacy support - flatten all regions for backward compatibility
export const TAX_REGIONS = Object.values(TAX_COUNTRIES).flatMap(country => 
  country.provinces.map(province => ({
    value: province.value,
    label: `${province.label} (${province.rate}% ${province.taxLabel})`,
    rate: province.rate,
    taxLabel: province.taxLabel,
    country: country.name
  }))
);

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

// Helper function to get tax details by country and region
export const getTaxDetailsByCountryAndRegion = (country: string, region: string) => {
  const countryData = TAX_COUNTRIES[country as keyof typeof TAX_COUNTRIES];
  if (!countryData) return null;
  
  return countryData.provinces.find(p => p.value === region);
};

// Helper function to get tax details by region (legacy support)
export const getTaxDetailsByRegion = (region: string) => {
  return TAX_REGIONS.find(r => r.value === region) || TAX_REGIONS.find(r => r.value === 'Ontario');
};