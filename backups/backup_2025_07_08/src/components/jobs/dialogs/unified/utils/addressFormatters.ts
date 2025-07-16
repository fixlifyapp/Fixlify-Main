
// Helper functions to build formatted addresses

export const buildClientAddress = (client: any): string => {
  const addressParts = [];
  
  if (client.address) addressParts.push(client.address);
  
  const cityStateZip = [client.city, client.state, client.zip].filter(Boolean);
  if (cityStateZip.length > 0) {
    addressParts.push(cityStateZip.join(', '));
  }
  
  if (client.country && client.country !== 'USA') {
    addressParts.push(client.country);
  }
  
  return addressParts.length > 0 ? addressParts.join('\n') : 'Address not available';
};

export const buildPropertyAddress = (property: any): string => {
  const addressParts = [];
  
  if (property.property_name) {
    addressParts.push(property.property_name);
  }
  
  if (property.address) addressParts.push(property.address);
  
  const cityStateZip = [property.city, property.state, property.zip].filter(Boolean);
  if (cityStateZip.length > 0) {
    addressParts.push(cityStateZip.join(', '));
  }
  
  return addressParts.length > 0 ? addressParts.join('\n') : 'Property address not available';
};
