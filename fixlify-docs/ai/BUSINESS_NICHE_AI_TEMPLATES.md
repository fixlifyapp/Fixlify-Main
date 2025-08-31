# Business Niche Templates for AI Assistant

## Available Niches (15 Total)

### 1. 🔥 HVAC Services
```javascript
capabilities: `
1. Diagnose heating and cooling issues
2. Schedule seasonal maintenance (AC tune-ups, furnace inspections)  
3. Quote system replacements and repairs
4. Explain energy efficiency options and rebates
5. Handle emergency no-heat/no-cool situations
6. Schedule air quality assessments
7. Provide filter replacement reminders
`
```

### 2. 💧 Plumbing Services
```javascript
capabilities: `
1. Handle emergency plumbing requests (leaks, clogs, burst pipes)
2. Schedule routine maintenance (drain cleaning, water heater service)
3. Provide water conservation tips
4. Quote common repairs (faucet replacement, toilet repair)
5. Identify urgent issues requiring immediate attention
6. Offer 24/7 emergency service information
7. Check permit requirements for major work
`
```

### 3. ⚡ Electrical Services
```javascript
capabilities: `
1. Handle electrical emergency calls safely
2. Schedule electrical inspections and panel upgrades
3. Quote outlets, switches, and lighting work
4. Explain electrical safety concerns
5. Check permit requirements
6. Schedule EV charger installations
7. Provide energy audit information
`
```

### 4. 🔧 Appliance Repair
```javascript
capabilities: `
1. Diagnose appliance issues (refrigerator, washer, dryer, dishwasher, oven)
2. Provide troubleshooting steps for simple problems
3. Quote repair costs based on appliance type and issue
4. Schedule same-day or next-day service
5. Check warranty status and coverage
6. Offer maintenance tips
7. Transfer to specialized technician for complex repairs
`
```

### 5. 🏗️ General Contracting
```javascript
capabilities: `
1. Schedule project consultations and estimates
2. Discuss renovation and remodeling options
3. Provide rough cost estimates for common projects
4. Check permit requirements
5. Coordinate multi-trade projects
6. Schedule project phases
7. Handle warranty and follow-up inquiries
`
```

### 6. 🚗 Garage Door Services
```javascript
capabilities: `
1. Diagnose garage door issues (opener, springs, tracks)
2. Schedule emergency repairs for stuck doors
3. Quote new door installations
4. Provide maintenance recommendations
5. Handle safety sensor issues
6. Schedule annual tune-ups
7. Offer smart garage door upgrade options
`
```

### 7. 🏠 Roofing Services
```javascript
capabilities: `
1. Schedule roof inspections after storms
2. Provide estimates for repairs and replacements
3. Explain roofing material options
4. Handle insurance claim assistance
5. Schedule emergency leak repairs
6. Provide maintenance recommendations
7. Quote gutter installation and repair
`
```

### 8. 🎨 Painting & Decorating
```javascript
capabilities: `
1. Schedule color consultations
2. Quote interior and exterior painting projects
3. Discuss surface preparation requirements
4. Provide timeline estimates
5. Explain paint type options
6. Schedule wallpaper installation/removal
7. Handle cabinet refinishing inquiries
`
```

### 9. 🌳 Landscaping & Lawn Care
```javascript
capabilities: `
1. Schedule lawn maintenance services
2. Quote landscaping design projects
3. Discuss seasonal services (spring/fall cleanup)
4. Handle irrigation system inquiries
5. Schedule tree and shrub care
6. Provide fertilization schedules
7. Quote hardscaping projects
`
```

### 10. 🔨 General Handyman
```javascript
capabilities: `
1. Handle various home repair requests
2. Schedule small to medium projects
3. Provide rough estimates for common repairs
4. Coordinate multiple small tasks
5. Handle furniture assembly requests
6. Schedule drywall and painting touch-ups
7. Manage general maintenance inquiries
`
```

### 11. 🪵 Deck Builder
```javascript
capabilities: `
1. Schedule deck design consultations
2. Quote new deck construction
3. Handle deck repair and staining requests
4. Discuss material options (wood, composite)
5. Check permit requirements
6. Schedule seasonal maintenance
7. Provide warranty information
`
```

### 12. 🚚 Moving Services
```javascript
capabilities: `
1. Quote local and long-distance moves
2. Schedule packing and unpacking services
3. Provide moving date availability
4. Discuss insurance options
5. Handle special item moving requests
6. Coordinate storage solutions
7. Schedule furniture delivery services
`
```

### 13. ❄️ Air Conditioning
```javascript
capabilities: `
1. Handle emergency AC breakdowns
2. Schedule seasonal AC tune-ups
3. Quote new AC system installations
4. Explain SEER ratings and efficiency
5. Provide maintenance plan information
6. Schedule duct cleaning services
7. Handle refrigerant leak repairs
`
```

### 14. 🛡️ Waterproofing
```javascript
capabilities: `
1. Schedule free basement inspections
2. Explain waterproofing solutions (interior, exterior, French drains)
3. Provide seasonal maintenance reminders
4. Quote based on square footage and severity
5. Discuss warranty options (lifetime, transferable)
6. Handle insurance claim assistance
7. Schedule emergency water damage assessments
`
```

### 15. 🚿 Drain Repair
```javascript
capabilities: `
1. Handle emergency drain blockages
2. Schedule camera inspections
3. Quote drain cleaning and repair services
4. Explain hydro jetting options
5. Provide preventive maintenance tips
6. Schedule sewer line repairs
7. Handle root intrusion issues
`
```

## Implementation in Phone Config

```typescript
// When user selects a business niche, auto-populate capabilities
const nicheCapabilities = {
  'hvac': hvacCapabilities,
  'plumbing': plumbingCapabilities,
  'electrical': electricalCapabilities,
  'appliance_repair': applianceCapabilities,
  'construction': contractingCapabilities,
  'garage_door': garageDoorCapabilities,
  'roofing': roofingCapabilities,
  'painting': paintingCapabilities,
  'landscaping': landscapingCapabilities,
  'handyman': handymanCapabilities,
  'deck_builder': deckCapabilities,
  'moving': movingCapabilities,
  'air_conditioning': acCapabilities,
  'waterproofing': waterproofingCapabilities,
  'drain_repair': drainCapabilities
};

// When niche changes, update the config
const handleNicheChange = (nicheId: string) => {
  const capabilities = nicheCapabilities[nicheId];
  setConfig({
    ...config,
    ai_config: {
      ...config.ai_config,
      business_niche: getNicheById(nicheId)?.dbValue,
      capabilities: capabilities
    }
  });
};
```

## Default Services by Niche

Each niche also has default services that can be auto-populated:

- **HVAC**: "Heating Repair, AC Repair, Furnace Installation, AC Installation, Maintenance Plans"
- **Plumbing**: "Leak Repair, Drain Cleaning, Water Heater Service, Toilet Repair, Emergency Service"
- **Electrical**: "Panel Upgrades, Outlet Installation, Lighting, EV Chargers, Inspections"
- **Appliance Repair**: "Refrigerator, Washer, Dryer, Dishwasher, Oven, Microwave Repair"
- **And so on...**
