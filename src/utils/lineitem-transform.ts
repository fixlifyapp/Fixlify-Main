// Utility to transform line items between different formats
export const transformToStandardLineItem = (item: any) => ({
  id: item.id || `item-${Math.random()}`,
  name: item.name || item.description || '',
  description: item.description || item.name || '',
  quantity: Number(item.quantity) || 1,
  unit_price: Number(item.unit_price || item.unitPrice || item.price) || 0,
  unitPrice: Number(item.unitPrice || item.unit_price || item.price) || 0,
  taxable: item.taxable !== false,
  total: Number(item.total) || (Number(item.quantity) || 1) * (Number(item.unit_price || item.unitPrice || item.price) || 0),
  discount: Number(item.discount) || 0,
  ourPrice: Number(item.ourPrice) || 0,
  price: Number(item.price || item.unit_price || item.unitPrice) || 0
});

export const transformLineItemsArray = (items: any[]) => {
  if (!Array.isArray(items)) return [];
  return items.map(transformToStandardLineItem);
};