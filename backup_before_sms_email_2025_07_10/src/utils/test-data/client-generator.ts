
import { supabase } from "@/integrations/supabase/client";
import { 
  getRandomElement, 
  getRandomName, 
  getRandomBusinessName, 
  getRandomLocation, 
  getRandomInt 
} from "./helpers";

export const generateTestClients = async (count: number = 20): Promise<string[]> => {
  const clients: any[] = [];
  const clientIds: string[] = [];
  
  // Check for existing clients first to avoid duplicating test data
  console.log("Checking for existing clients...");
  const { data: existingClients, error: checkError } = await supabase
    .from('clients')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error("Error checking existing clients:", checkError);
    throw checkError;
  }
  
  if (existingClients && existingClients.length > 0) {
    console.log("Clients already exist - fetching existing IDs");
    const { data: allClientIds, error } = await supabase
      .from('clients')
      .select('id')
      .limit(count);
      
    if (error) {
      console.error("Error fetching existing client IDs:", error);
      throw error;
    }
    
    if (allClientIds && allClientIds.length > 0) {
      return allClientIds.map(client => client.id);
    }
  }
  
  console.log(`Generating ${count} test clients...`);
  
  // Generate individual clients (70%)
  const individualCount = Math.floor(count * 0.7);
  for (let i = 0; i < individualCount; i++) {
    const name = getRandomName();
    const emailName = name.toLowerCase().replace(' ', '.').replace(/[^a-z\.]/g, '');
    const location = getRandomLocation();
    
    clients.push({
      name: name,
      email: `${emailName}@example.com`,
      phone: `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      address: `${getRandomInt(1, 999)} ${getRandomElement(["Main", "Oak", "Maple", "Pine", "Cedar", "Elm", "Yonge", "Bloor", "Queen", "King", "Dundas"])} ${getRandomElement(["St", "Ave", "Rd", "Blvd", "Dr", "Cres", "Lane"])}`,
      city: location.city,
      state: location.province,
      zip: location.postalCode,
      country: "USA",
      type: "Residential",
      rating: getRandomInt(3, 5),
      status: getRandomElement(["active", "active", "active", "inactive"]), // Weighted towards active
      notes: getRandomElement([undefined, "Prefers afternoon appointments", "Has pets", "Senior citizen", "Repeat customer"])
    });
  }
  
  // Generate business clients (30%)
  const businessCount = count - individualCount;
  for (let i = 0; i < businessCount; i++) {
    const name = getRandomBusinessName();
    const emailName = name.toLowerCase().replace(' ', '.').replace(/[^a-z\.]/g, '');
    const location = getRandomLocation();
    
    clients.push({
      name: name,
      email: `info@${emailName.toLowerCase()}.com`,
      phone: `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      address: `${getRandomInt(1, 999)} ${getRandomElement(["Business", "Commerce", "Industrial", "Corporate", "Enterprise", "Tech", "Market"])} ${getRandomElement(["Park", "Plaza", "Center", "Square", "Campus"])}`,
      city: location.city,
      state: location.province,
      zip: location.postalCode,
      country: "USA",
      type: getRandomElement(["Commercial", "Property Manager", "Commercial"]),
      rating: getRandomInt(3, 5),
      status: getRandomElement(["active", "active", "active", "inactive"]), // Weighted towards active
      notes: getRandomElement([undefined, "Large account", "Multiple locations", "Annual contract", "Preferred pricing"])
    });
  }
  
  try {
    console.log("Inserting test clients into database...");
    console.log("Sample client data:", clients[0]);
    
    // Insert into Supabase
    const { data, error } = await supabase.from('clients').insert(clients).select('id');
    
    if (error) {
      console.error("Error generating test clients:", error);
      throw error;
    }
    
    if (data) {
      clientIds.push(...data.map(client => client.id));
      console.log(`Successfully created ${data.length} clients with IDs:`, clientIds);
    } else {
      console.log("No clients were created. Data is null.");
    }
    
    return clientIds;
  } catch (error) {
    console.error("Error generating test clients:", error);
    throw error;
  }
};
