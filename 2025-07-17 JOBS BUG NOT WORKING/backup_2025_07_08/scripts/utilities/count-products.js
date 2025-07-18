import fs from 'fs';

// Read the niche products file
const content = fs.readFileSync('src/data/niche-products.ts', 'utf8');

// Count products for each niche
const niches = {
  "Deck Builder": 0,
  "Drain Repair": 0,
  "Electrical Services": 0,
  "Moving Services": 0,
  "Plumbing Services": 0,
  "Waterproofing": 0
};

// Count products by finding each niche section
Object.keys(niches).forEach(nicheName => {
  const regex = new RegExp(`"${nicheName}":\\s*\\[([\\s\\S]*?)\\]`, 'g');
  const match = regex.exec(content);
  if (match) {
    const products = match[1].match(/\{[^}]+\}/g);
    niches[nicheName] = products ? products.length : 0;
  }
});

console.log("Current product count per niche:");
Object.entries(niches).forEach(([niche, count]) => {
  console.log(`${niche}: ${count} products`);
});

// Check appliance repair products
if (fs.existsSync('src/data/appliance-repair-products.ts')) {
  const applianceContent = fs.readFileSync('src/data/appliance-repair-products.ts', 'utf8');
  const applianceProducts = applianceContent.match(/\{[^}]+\}/g);
  console.log(`\nAppliance Repair: ${applianceProducts ? applianceProducts.length : 0} products`);
}
