
// Define global tags that can be used across the application
export const globalTags = [
  { id: 1, name: 'HVAC', color: 'text-blue-600 border-blue-300' },
  { id: 2, name: 'Commercial', color: 'text-purple-600 border-purple-300' },
  { id: 3, name: 'Residential', color: 'text-teal-600 border-teal-300' },
  { id: 4, name: 'Property Manager', color: 'text-indigo-600 border-indigo-300' },
  { id: 5, name: 'Plumbing', color: 'text-cyan-600 border-cyan-300' },
  { id: 6, name: 'Electrical', color: 'text-amber-600 border-amber-300' },
  { id: 7, name: 'Maintenance', color: 'text-green-600 border-green-300' },
  { id: 8, name: 'Installation', color: 'text-lime-600 border-lime-300' },
  { id: 9, name: 'Repair', color: 'text-orange-600 border-orange-300' },
  { id: 10, name: 'Inspection', color: 'text-sky-600 border-sky-300' },
  { id: 11, name: 'Canceled', color: 'text-gray-600 border-gray-300' },
  { id: 12, name: 'Upgrade', color: 'text-rose-600 border-rose-300' },
  { id: 13, name: 'Major Project', color: 'text-red-600 border-red-300' },
  { id: 14, name: 'Ventilation', color: 'text-blue-600 border-blue-300' },
];

// Get a color class for a tag based on its name
export const getTagColor = (tag: string): string => {
  const lowerTag = tag.toLowerCase();
  
  if (lowerTag.includes('hvac') || lowerTag === 'ventilation') {
    return 'text-blue-600 border-blue-300';
  } else if (lowerTag === 'commercial') {
    return 'text-purple-600 border-purple-300';
  } else if (lowerTag === 'residential') {
    return 'text-teal-600 border-teal-300';
  } else if (lowerTag === 'property manager') {
    return 'text-indigo-600 border-indigo-300';
  } else if (lowerTag.includes('plumbing')) {
    return 'text-cyan-600 border-cyan-300';
  } else if (lowerTag.includes('electrical')) {
    return 'text-amber-600 border-amber-300';
  } else if (lowerTag.includes('maintenance')) {
    return 'text-green-600 border-green-300';
  } else if (lowerTag.includes('installation')) {
    return 'text-lime-600 border-lime-300';
  } else if (lowerTag.includes('repair')) {
    return 'text-orange-600 border-orange-300';
  } else if (lowerTag.includes('inspection')) {
    return 'text-sky-600 border-sky-300';
  } else if (lowerTag.includes('canceled') || lowerTag.includes('cancelled')) {
    return 'text-gray-600 border-gray-300';
  } else if (lowerTag.includes('upgrade')) {
    return 'text-rose-600 border-rose-300';
  } else if (lowerTag.includes('major')) {
    return 'text-red-600 border-red-300';
  } else {
    return 'text-gray-600 border-gray-300';
  }
};
