
// Helper functions used across test data generators

// List of GTA cities/areas
export const gtaLocations = [
  { city: "Toronto", postalCodes: ["M5V 2A8", "M5S 1A1", "M4W 1A7", "M5T 1T4", "M6J 2Z4"] },
  { city: "Mississauga", postalCodes: ["L5B 2C9", "L4W 4Y4", "L5R 3G5", "L5N 1P6", "L4Z 1H8"] },
  { city: "Markham", postalCodes: ["L3R 5A4", "L3P 2J3", "L6B 0N2", "L3T 7N6", "L6E 1J1"] },
  { city: "Brampton", postalCodes: ["L6Y 4R9", "L6T 3X6", "L6P 0B2", "L6X 5A5", "L7A 0P5"] },
  { city: "Vaughan", postalCodes: ["L4H 1M9", "L4K 4V8", "L6A 3P2", "L4L 8K5", "L4J 7V6"] },
  { city: "Richmond Hill", postalCodes: ["L4C 5H2", "L4B 3N9", "L4S 1Y9", "L4E 4Y8", "L4C 9T8"] }
];

// Service types
export const serviceTypes = [
  "HVAC Installation", "HVAC Repair", "Furnace Maintenance", 
  "AC Repair", "Duct Cleaning", "Water Heater Replacement",
  "Plumbing Repair", "Electrical Service", "Emergency Repair",
  "Ventilation System", "Thermostat Installation", "Home Inspection"
];

// Random data generators
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getRandomLocation = () => {
  const location = getRandomElement(gtaLocations);
  return {
    city: location.city,
    postalCode: getRandomElement(location.postalCodes),
    province: "Ontario"
  };
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const getRandomName = (): string => {
  const firstNames = ["James", "Robert", "John", "Michael", "David", "Sarah", "Jennifer", "Emily", "Jessica", "Ava", "Muhammad", "Wei", "Chen", "Priya", "Ananya", "Omar", "Zara", "Carlos", "Sofia", "Olivia"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Patel", "Wang", "Kim", "Singh", "Lee", "Khan", "Zhang", "Chen", "Nguyen", "Ahmed"];
  
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
};

export const getRandomBusinessName = (): string => {
  const prefixes = ["Superior", "Elite", "Premier", "Advanced", "Toronto", "GTA", "Professional", "Modern", "Quality", "Eastern", "Western", "Northern", "Southern", "Central"];
  const types = ["Properties", "Management", "Construction", "Buildings", "Developments", "Enterprises", "Holdings", "Industries", "Commercial", "Services", "Solutions"];
  
  return `${getRandomElement(prefixes)} ${getRandomElement(types)}`;
};
