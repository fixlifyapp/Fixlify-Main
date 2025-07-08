
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[$,]/g, '')) || 0;
};
