import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Comprehensive product data for each niche
const nicheProducts = {
  appliance_repair: [
    // Refrigerator Parts
    { name: "Refrigerator Compressor", category: "Parts", price: 350.00, unit: "each" },
    { name: "Refrigerator Door Seal", category: "Parts", price: 75.00, unit: "each" },
    { name: "Refrigerator Thermostat", category: "Parts", price: 45.00, unit: "each" },
    { name: "Refrigerator Water Filter", category: "Parts", price: 35.00, unit: "each" },
    { name: "Refrigerator Ice Maker", category: "Parts", price: 125.00, unit: "each" },
    // Washer Parts
    { name: "Washer Pump", category: "Parts", price: 85.00, unit: "each" },
    { name: "Washer Belt", category: "Parts", price: 25.00, unit: "each" },
    { name: "Washer Control Board", category: "Parts", price: 225.00, unit: "each" },
    { name: "Washer Door Lock", category: "Parts", price: 65.00, unit: "each" },
    { name: "Washer Agitator", category: "Parts", price: 95.00, unit: "each" },
    // Dryer Parts
    { name: "Dryer Heating Element", category: "Parts", price: 125.00, unit: "each" },
    { name: "Dryer Belt", category: "Parts", price: 20.00, unit: "each" },
    { name: "Dryer Thermal Fuse", category: "Parts", price: 15.00, unit: "each" },
    { name: "Dryer Drum Roller", category: "Parts", price: 35.00, unit: "each" },
    { name: "Dryer Vent Kit", category: "Parts", price: 45.00, unit: "each" },
    // Dishwasher Parts
    { name: "Dishwasher Pump", category: "Parts", price: 145.00, unit: "each" },
    { name: "Dishwasher Spray Arm", category: "Parts", price: 35.00, unit: "each" },
    { name: "Dishwasher Door Latch", category: "Parts", price: 55.00, unit: "each" },
    { name: "Dishwasher Control Panel", category: "Parts", price: 185.00, unit: "each" },
    { name: "Dishwasher Rack", category: "Parts", price: 75.00, unit: "each" },
    // Services
    { name: "Diagnostic Fee", category: "Service", price: 85.00, unit: "service" },
    { name: "Labor - Basic Repair", category: "Service", price: 125.00, unit: "hour" },
    { name: "Labor - Complex Repair", category: "Service", price: 175.00, unit: "hour" },
    { name: "Installation Service", category: "Service", price: 150.00, unit: "service" },
    { name: "Maintenance Service", category: "Service", price: 95.00, unit: "service" },
    { name: "Emergency Service", category: "Service", price: 225.00, unit: "service" },
    { name: "Haul Away Service", category: "Service", price: 50.00, unit: "service" }
  ],
  
  garage_door: [
    // Springs & Hardware
    { name: "Torsion Spring", category: "Parts", price: 125.00, unit: "each" },
    { name: "Extension Spring", category: "Parts", price: 85.00, unit: "pair" },
    { name: "Spring Safety Cable", category: "Parts", price: 25.00, unit: "set" },
    { name: "Garage Door Cable", category: "Parts", price: 35.00, unit: "each" },
    { name: "Cable Drum", category: "Parts", price: 45.00, unit: "each" },
    // Openers & Motors
    { name: "Chain Drive Opener", category: "Equipment", price: 325.00, unit: "each" },
    { name: "Belt Drive Opener", category: "Equipment", price: 425.00, unit: "each" },
    { name: "Direct Drive Opener", category: "Equipment", price: 525.00, unit: "each" },
    { name: "Opener Remote", category: "Parts", price: 45.00, unit: "each" },
    { name: "Keypad Entry", category: "Parts", price: 65.00, unit: "each" },
    // Tracks & Rollers
    { name: "Garage Door Track", category: "Parts", price: 85.00, unit: "section" },
    { name: "Track Bracket", category: "Parts", price: 15.00, unit: "each" },
    { name: "Nylon Roller", category: "Parts", price: 12.00, unit: "each" },
    { name: "Steel Roller", category: "Parts", price: 8.00, unit: "each" },
    { name: "Roller Hinge", category: "Parts", price: 18.00, unit: "each" },
    // Sensors & Safety
    { name: "Safety Sensor Set", category: "Parts", price: 85.00, unit: "pair" },
    { name: "Sensor Bracket", category: "Parts", price: 15.00, unit: "each" },
    { name: "Emergency Release", category: "Parts", price: 35.00, unit: "each" },
    // Services
    { name: "Spring Replacement", category: "Service", price: 275.00, unit: "service" },
    { name: "Opener Installation", category: "Service", price: 225.00, unit: "service" },
    { name: "Track Alignment", category: "Service", price: 175.00, unit: "service" },
    { name: "Annual Maintenance", category: "Service", price: 125.00, unit: "service" },
    { name: "Emergency Service", category: "Service", price: 325.00, unit: "service" }
  ],
  
  hvac: [
    // AC Units & Components
    { name: "AC Capacitor", category: "Parts", price: 125.00, unit: "each" },
    { name: "AC Contactor", category: "Parts", price: 85.00, unit: "each" },
    { name: "Blower Motor", category: "Parts", price: 325.00, unit: "each" },
    { name: "Evaporator Coil", category: "Parts", price: 825.00, unit: "each" },
    { name: "Condenser Coil", category: "Parts", price: 925.00, unit: "each" },
    // Filters & Maintenance
    { name: "Standard Air Filter", category: "Parts", price: 15.00, unit: "each" },
    { name: "HEPA Filter", category: "Parts", price: 45.00, unit: "each" },
    { name: "UV Light System", category: "Equipment", price: 425.00, unit: "each" },
    { name: "Refrigerant R410A", category: "Materials", price: 125.00, unit: "pound" },
    { name: "Thermostat - Basic", category: "Parts", price: 125.00, unit: "each" },
    { name: "Thermostat - Smart", category: "Parts", price: 325.00, unit: "each" },
    // Ductwork
    { name: "Flexible Duct", category: "Materials", price: 8.50, unit: "foot" },
    { name: "Sheet Metal Duct", category: "Materials", price: 12.50, unit: "foot" },
    { name: "Duct Insulation", category: "Materials", price: 3.50, unit: "sq ft" },
    { name: "Duct Sealant", category: "Materials", price: 25.00, unit: "gallon" },
    // Services
    { name: "AC Tune-Up", category: "Service", price: 175.00, unit: "service" },
    { name: "Duct Cleaning", category: "Service", price: 425.00, unit: "service" },
    { name: "System Installation", category: "Service", price: 2500.00, unit: "service" },
    { name: "Emergency Repair", category: "Service", price: 325.00, unit: "service" },
    { name: "Maintenance Plan", category: "Service", price: 325.00, unit: "year" }
  ],
  
  plumbing: [
    // Pipes & Fittings
    { name: "Copper Pipe 1/2\"", category: "Materials", price: 4.50, unit: "foot" },
    { name: "PVC Pipe 2\"", category: "Materials", price: 2.25, unit: "foot" },
    { name: "PEX Tubing", category: "Materials", price: 1.75, unit: "foot" },
    { name: "Pipe Fitting Set", category: "Parts", price: 35.00, unit: "set" },
    { name: "Shut-off Valve", category: "Parts", price: 25.00, unit: "each" },
    // Fixtures
    { name: "Kitchen Faucet", category: "Fixtures", price: 225.00, unit: "each" },
    { name: "Bathroom Faucet", category: "Fixtures", price: 175.00, unit: "each" },
    { name: "Toilet - Standard", category: "Fixtures", price: 325.00, unit: "each" },
    { name: "Toilet - High Efficiency", category: "Fixtures", price: 425.00, unit: "each" },
    { name: "Sink - Kitchen", category: "Fixtures", price: 275.00, unit: "each" },
    { name: "Sink - Bathroom", category: "Fixtures", price: 175.00, unit: "each" },
    // Water Heaters
    { name: "Water Heater - 40 Gal", category: "Equipment", price: 825.00, unit: "each" },
    { name: "Water Heater - Tankless", category: "Equipment", price: 1825.00, unit: "each" },
    { name: "Water Heater Element", category: "Parts", price: 45.00, unit: "each" },
    // Drain & Sewer
    { name: "Drain Snake", category: "Tools", price: 125.00, unit: "each" },
    { name: "P-Trap", category: "Parts", price: 15.00, unit: "each" },
    { name: "Wax Ring", category: "Parts", price: 8.00, unit: "each" },
    // Services
    { name: "Drain Cleaning", category: "Service", price: 225.00, unit: "service" },
    { name: "Leak Detection", category: "Service", price: 275.00, unit: "service" },
    { name: "Water Heater Install", category: "Service", price: 425.00, unit: "service" },
    { name: "Emergency Service", category: "Service", price: 325.00, unit: "service" }
  ],
  
  electrical: [
    // Panels & Breakers
    { name: "Circuit Breaker 20A", category: "Parts", price: 45.00, unit: "each" },
    { name: "Circuit Breaker 30A", category: "Parts", price: 55.00, unit: "each" },
    { name: "Main Panel 200A", category: "Equipment", price: 825.00, unit: "each" },
    { name: "Sub Panel 100A", category: "Equipment", price: 425.00, unit: "each" },
    // Wiring & Cable
    { name: "Romex 12-2 Wire", category: "Materials", price: 125.00, unit: "250ft" },
    { name: "Romex 14-2 Wire", category: "Materials", price: 95.00, unit: "250ft" },
    { name: "THHN Wire #10", category: "Materials", price: 0.85, unit: "foot" },
    { name: "Conduit 1/2\"", category: "Materials", price: 2.25, unit: "foot" },
    // Outlets & Switches
    { name: "Duplex Outlet", category: "Parts", price: 8.50, unit: "each" },
    { name: "GFCI Outlet", category: "Parts", price: 25.00, unit: "each" },
    { name: "Light Switch", category: "Parts", price: 6.50, unit: "each" },
    { name: "Dimmer Switch", category: "Parts", price: 35.00, unit: "each" },
    { name: "Smart Switch", category: "Parts", price: 55.00, unit: "each" },
    // Lighting
    { name: "Recessed Light", category: "Fixtures", price: 45.00, unit: "each" },
    { name: "Ceiling Fan", category: "Fixtures", price: 225.00, unit: "each" },
    { name: "LED Bulb Pack", category: "Parts", price: 25.00, unit: "4-pack" },
    // Services
    { name: "Panel Upgrade", category: "Service", price: 1825.00, unit: "service" },
    { name: "Outlet Installation", category: "Service", price: 125.00, unit: "each" },
    { name: "Troubleshooting", category: "Service", price: 175.00, unit: "hour" },
    { name: "Emergency Service", category: "Service", price: 325.00, unit: "service" }
  ],
  
  handyman: [
    // General Hardware
    { name: "Drywall Sheet", category: "Materials", price: 15.00, unit: "sheet" },
    { name: "Joint Compound", category: "Materials", price: 18.00, unit: "bucket" },
    { name: "Wood Stud 2x4", category: "Materials", price: 8.50, unit: "each" },
    { name: "Plywood Sheet", category: "Materials", price: 45.00, unit: "sheet" },
    { name: "Screws Assortment", category: "Materials", price: 25.00, unit: "box" },
    // Paint & Supplies
    { name: "Interior Paint", category: "Materials", price: 35.00, unit: "gallon" },
    { name: "Exterior Paint", category: "Materials", price: 45.00, unit: "gallon" },
    { name: "Primer", category: "Materials", price: 25.00, unit: "gallon" },
    { name: "Paint Roller Set", category: "Tools", price: 25.00, unit: "set" },
    { name: "Drop Cloth", category: "Materials", price: 15.00, unit: "each" },
    // Flooring
    { name: "Laminate Flooring", category: "Materials", price: 3.50, unit: "sq ft" },
    { name: "Vinyl Plank", category: "Materials", price: 4.50, unit: "sq ft" },
    { name: "Carpet Tile", category: "Materials", price: 2.50, unit: "sq ft" },
    { name: "Floor Underlayment", category: "Materials", price: 0.75, unit: "sq ft" },
    // Services
    { name: "Hourly Rate", category: "Service", price: 85.00, unit: "hour" },
    { name: "Minimum Service", category: "Service", price: 125.00, unit: "service" },
    { name: "Emergency Call", category: "Service", price: 225.00, unit: "service" },
    { name: "Project Consultation", category: "Service", price: 95.00, unit: "hour" }
  ],
  
  roofing: [
    // Shingles & Materials
    { name: "Asphalt Shingles", category: "Materials", price: 35.00, unit: "bundle" },
    { name: "Architectural Shingles", category: "Materials", price: 45.00, unit: "bundle" },
    { name: "Metal Roofing", category: "Materials", price: 125.00, unit: "sheet" },
    { name: "Clay Tiles", category: "Materials", price: 85.00, unit: "sq ft" },
    { name: "Slate Tiles", category: "Materials", price: 125.00, unit: "sq ft" },
    { name: "Cedar Shakes", category: "Materials", price: 350.00, unit: "square" },
    // Underlayment & Protection
    { name: "Felt Paper 15#", category: "Materials", price: 25.00, unit: "roll" },
    { name: "Synthetic Underlayment", category: "Materials", price: 125.00, unit: "roll" },
    { name: "Ice & Water Shield", category: "Materials", price: 85.00, unit: "roll" },
    { name: "Drip Edge", category: "Materials", price: 8.50, unit: "10ft" },
    { name: "Ridge Vent", category: "Materials", price: 45.00, unit: "10ft" },
    // Flashing & Sealants
    { name: "Step Flashing", category: "Materials", price: 2.50, unit: "piece" },
    { name: "Valley Flashing", category: "Materials", price: 12.50, unit: "foot" },
    { name: "Pipe Boot", category: "Materials", price: 15.00, unit: "each" },
    { name: "Roofing Cement", category: "Materials", price: 25.00, unit: "gallon" },
    { name: "Roofing Sealant", category: "Materials", price: 12.00, unit: "tube" },
    // Gutters & Accessories
    { name: "K-Style Gutter", category: "Materials", price: 8.50, unit: "foot" },
    { name: "Downspout", category: "Materials", price: 12.50, unit: "10ft" },
    { name: "Gutter Guard", category: "Materials", price: 15.00, unit: "foot" },
    // Services
    { name: "Roof Inspection", category: "Service", price: 250.00, unit: "service" },
    { name: "Roof Repair", category: "Service", price: 450.00, unit: "service" },
    { name: "Complete Tear-Off", category: "Service", price: 350.00, unit: "square" },
    { name: "Roof Installation", category: "Service", price: 425.00, unit: "square" },
    { name: "Emergency Tarping", category: "Service", price: 325.00, unit: "service" },
    { name: "Gutter Installation", category: "Service", price: 12.50, unit: "foot" },
    { name: "Gutter Cleaning", category: "Service", price: 225.00, unit: "service" }
  ],
  
  deck_builder: [
    // Lumber & Materials
    { name: "Pressure Treated 2x6", category: "Materials", price: 12.50, unit: "board" },
    { name: "Pressure Treated 2x8", category: "Materials", price: 18.50, unit: "board" },
    { name: "Composite Decking", category: "Materials", price: 45.00, unit: "board" },
    { name: "Cedar Decking", category: "Materials", price: 35.00, unit: "board" },
    { name: "Deck Posts 4x4", category: "Materials", price: 25.00, unit: "each" },
    { name: "Deck Posts 6x6", category: "Materials", price: 45.00, unit: "each" },
    // Hardware & Fasteners
    { name: "Joist Hangers", category: "Hardware", price: 3.50, unit: "each" },
    { name: "Post Brackets", category: "Hardware", price: 12.50, unit: "each" },
    { name: "Deck Screws 5lb", category: "Hardware", price: 35.00, unit: "box" },
    { name: "Hidden Fasteners", category: "Hardware", price: 85.00, unit: "box" },
    { name: "Concrete Footings", category: "Materials", price: 15.00, unit: "bag" },
    // Railings & Accessories
    { name: "Wood Railing Kit", category: "Materials", price: 125.00, unit: "section" },
    { name: "Aluminum Railing", category: "Materials", price: 225.00, unit: "section" },
    { name: "Deck Stairs", category: "Materials", price: 325.00, unit: "set" },
    { name: "Post Caps", category: "Accessories", price: 15.00, unit: "each" },
    { name: "Deck Lighting", category: "Accessories", price: 45.00, unit: "fixture" },
    // Finishes & Protection
    { name: "Deck Stain", category: "Materials", price: 45.00, unit: "gallon" },
    { name: "Wood Sealer", category: "Materials", price: 35.00, unit: "gallon" },
    { name: "Deck Cleaner", category: "Materials", price: 25.00, unit: "gallon" },
    // Services
    { name: "Deck Design", category: "Service", price: 500.00, unit: "service" },
    { name: "Deck Installation", category: "Service", price: 75.00, unit: "sq ft" },
    { name: "Deck Repair", category: "Service", price: 325.00, unit: "service" },
    { name: "Deck Refinishing", category: "Service", price: 8.50, unit: "sq ft" },
    { name: "Permit Assistance", category: "Service", price: 250.00, unit: "service" }
  ],
  
  moving: [
    // Packing Materials
    { name: "Small Moving Box", category: "Materials", price: 2.50, unit: "each" },
    { name: "Medium Moving Box", category: "Materials", price: 3.50, unit: "each" },
    { name: "Large Moving Box", category: "Materials", price: 4.50, unit: "each" },
    { name: "Wardrobe Box", category: "Materials", price: 15.00, unit: "each" },
    { name: "Dish Pack Box", category: "Materials", price: 8.50, unit: "each" },
    { name: "Bubble Wrap Roll", category: "Materials", price: 25.00, unit: "roll" },
    { name: "Packing Paper", category: "Materials", price: 35.00, unit: "bundle" },
    { name: "Packing Tape", category: "Materials", price: 4.50, unit: "roll" },
    { name: "Furniture Pads", category: "Materials", price: 15.00, unit: "each" },
    { name: "Stretch Wrap", category: "Materials", price: 18.00, unit: "roll" },
    // Moving Equipment
    { name: "Dolly Rental", category: "Equipment", price: 25.00, unit: "day" },
    { name: "Furniture Straps", category: "Equipment", price: 35.00, unit: "set" },
    { name: "Moving Blankets", category: "Equipment", price: 85.00, unit: "dozen" },
    // Services
    { name: "Local Move (2 movers)", category: "Service", price: 120.00, unit: "hour" },
    { name: "Local Move (3 movers)", category: "Service", price: 160.00, unit: "hour" },
    { name: "Long Distance Move", category: "Service", price: 0.85, unit: "pound/mile" },
    { name: "Packing Service", category: "Service", price: 85.00, unit: "hour" },
    { name: "Unpacking Service", category: "Service", price: 75.00, unit: "hour" },
    { name: "Furniture Assembly", category: "Service", price: 95.00, unit: "hour" },
    { name: "Piano Moving", category: "Service", price: 325.00, unit: "service" },
    { name: "Storage Service", category: "Service", price: 125.00, unit: "month" }
  ],
  
  air_conditioning: [
    // AC Units & Systems
    { name: "Window AC Unit", category: "Equipment", price: 425.00, unit: "each" },
    { name: "Portable AC Unit", category: "Equipment", price: 525.00, unit: "each" },
    { name: "Split System AC", category: "Equipment", price: 2850.00, unit: "system" },
    { name: "Central AC Unit", category: "Equipment", price: 3850.00, unit: "system" },
    // Parts & Components
    { name: "AC Capacitor", category: "Parts", price: 125.00, unit: "each" },
    { name: "AC Contactor", category: "Parts", price: 85.00, unit: "each" },
    { name: "Fan Motor", category: "Parts", price: 325.00, unit: "each" },
    { name: "Compressor", category: "Parts", price: 1250.00, unit: "each" },
    { name: "Evaporator Coil", category: "Parts", price: 825.00, unit: "each" },
    { name: "Condenser Coil", category: "Parts", price: 925.00, unit: "each" },
    { name: "Refrigerant R410A", category: "Materials", price: 125.00, unit: "pound" },
    { name: "Thermostat", category: "Parts", price: 225.00, unit: "each" },
    { name: "Air Filter", category: "Parts", price: 25.00, unit: "each" },
    { name: "Drain Pan", category: "Parts", price: 85.00, unit: "each" },
    // Services
    { name: "AC Installation", category: "Service", price: 850.00, unit: "service" },
    { name: "AC Repair", category: "Service", price: 225.00, unit: "service" },
    { name: "AC Tune-Up", category: "Service", price: 175.00, unit: "service" },
    { name: "Refrigerant Recharge", category: "Service", price: 325.00, unit: "service" },
    { name: "Coil Cleaning", category: "Service", price: 225.00, unit: "service" },
    { name: "Emergency Service", category: "Service", price: 425.00, unit: "service" },
    { name: "Maintenance Plan", category: "Service", price: 325.00, unit: "year" }
  ],
  
  waterproofing: [
    // Waterproofing Materials
    { name: "Waterproof Membrane", category: "Materials", price: 2.50, unit: "sq ft" },
    { name: "Hydraulic Cement", category: "Materials", price: 25.00, unit: "bag" },
    { name: "Waterproof Coating", category: "Materials", price: 85.00, unit: "5 gallon" },
    { name: "Crack Injection Resin", category: "Materials", price: 125.00, unit: "gallon" },
    { name: "Bentonite Clay", category: "Materials", price: 18.00, unit: "bag" },
    { name: "Drainage Mat", category: "Materials", price: 3.50, unit: "sq ft" },
    { name: "Vapor Barrier", category: "Materials", price: 0.85, unit: "sq ft" },
    // Drainage Systems
    { name: "French Drain Pipe", category: "Materials", price: 4.50, unit: "foot" },
    { name: "Sump Pump", category: "Equipment", price: 325.00, unit: "each" },
    { name: "Backup Sump Pump", category: "Equipment", price: 525.00, unit: "each" },
    { name: "Drain Tile", category: "Materials", price: 3.50, unit: "foot" },
    { name: "Gravel", category: "Materials", price: 45.00, unit: "ton" },
    { name: "Window Well", category: "Materials", price: 125.00, unit: "each" },
    // Sealants & Repairs
    { name: "Foundation Sealant", category: "Materials", price: 35.00, unit: "tube" },
    { name: "Concrete Patch", category: "Materials", price: 25.00, unit: "bag" },
    { name: "Expansion Joint", category: "Materials", price: 8.50, unit: "foot" },
    // Services
    { name: "Basement Waterproofing", category: "Service", price: 125.00, unit: "linear ft" },
    { name: "Foundation Repair", category: "Service", price: 425.00, unit: "crack" },
    { name: "Sump Pump Install", category: "Service", price: 1250.00, unit: "service" },
    { name: "French Drain Install", category: "Service", price: 85.00, unit: "linear ft" },
    { name: "Moisture Assessment", category: "Service", price: 325.00, unit: "service" },
    { name: "Emergency Water Removal", category: "Service", price: 525.00, unit: "service" }
  ],
  
  drain_repair: [
    // Drain Cleaning Equipment
    { name: "Drain Snake 25ft", category: "Equipment", price: 125.00, unit: "each" },
    { name: "Drain Snake 50ft", category: "Equipment", price: 225.00, unit: "each" },
    { name: "Power Auger", category: "Equipment", price: 525.00, unit: "each" },
    { name: "Hydro Jetter", category: "Equipment", price: 3250.00, unit: "each" },
    { name: "Drain Camera", category: "Equipment", price: 1850.00, unit: "each" },
    // Drain Parts & Materials
    { name: "P-Trap", category: "Parts", price: 15.00, unit: "each" },
    { name: "S-Trap", category: "Parts", price: 18.00, unit: "each" },
    { name: "Drain Pipe 2\"", category: "Materials", price: 8.50, unit: "foot" },
    { name: "Drain Pipe 4\"", category: "Materials", price: 12.50, unit: "foot" },
    { name: "Cleanout Cap", category: "Parts", price: 12.00, unit: "each" },
    { name: "Floor Drain", category: "Parts", price: 85.00, unit: "each" },
    { name: "Drain Grate", category: "Parts", price: 35.00, unit: "each" },
    // Chemicals & Treatments
    { name: "Enzyme Cleaner", category: "Materials", price: 25.00, unit: "gallon" },
    { name: "Root Killer", category: "Materials", price: 35.00, unit: "container" },
    { name: "Grease Dissolver", category: "Materials", price: 28.00, unit: "gallon" },
    // Services
    { name: "Drain Cleaning", category: "Service", price: 225.00, unit: "service" },
    { name: "Camera Inspection", category: "Service", price: 325.00, unit: "service" },
    { name: "Hydro Jetting", category: "Service", price: 425.00, unit: "service" },
    { name: "Drain Line Repair", category: "Service", price: 125.00, unit: "foot" },
    { name: "Emergency Service", category: "Service", price: 325.00, unit: "service" },
    { name: "Preventive Maintenance", category: "Service", price: 175.00, unit: "service" }
  ],
  
  painting: [
    // Paint Products
    { name: "Interior Paint - Premium", category: "Paint", price: 65.00, unit: "gallon" },
    { name: "Interior Paint - Standard", category: "Paint", price: 45.00, unit: "gallon" },
    { name: "Exterior Paint - Premium", category: "Paint", price: 75.00, unit: "gallon" },
    { name: "Exterior Paint - Standard", category: "Paint", price: 55.00, unit: "gallon" },
    { name: "Primer - Interior", category: "Paint", price: 35.00, unit: "gallon" },
    { name: "Primer - Exterior", category: "Paint", price: 40.00, unit: "gallon" },
    { name: "Wood Stain", category: "Stain", price: 45.00, unit: "gallon" },
    { name: "Deck Stain", category: "Stain", price: 50.00, unit: "gallon" },
    { name: "Polyurethane Finish", category: "Finish", price: 38.00, unit: "gallon" },
    { name: "Varnish", category: "Finish", price: 42.00, unit: "gallon" },
    // Tools & Equipment
    { name: "Paint Brushes Set", category: "Tools", price: 25.00, unit: "set" },
    { name: "Paint Rollers & Trays", category: "Tools", price: 18.00, unit: "set" },
    { name: "Paint Sprayer", category: "Equipment", price: 450.00, unit: "each" },
    { name: "Extension Pole", category: "Tools", price: 35.00, unit: "each" },
    { name: "Ladder - 8ft", category: "Equipment", price: 185.00, unit: "each" },
    { name: "Ladder - 12ft", category: "Equipment", price: 285.00, unit: "each" },
    // Supplies
    { name: "Drop Cloths", category: "Supplies", price: 12.00, unit: "each" },
    { name: "Painter's Tape", category: "Supplies", price: 8.00, unit: "roll" },
    { name: "Sandpaper Set", category: "Supplies", price: 15.00, unit: "set" },
    { name: "Caulk & Sealant", category: "Supplies", price: 12.00, unit: "tube" },
    { name: "Wallpaper", category: "Materials", price: 35.00, unit: "roll" },
    { name: "Wallpaper Adhesive", category: "Supplies", price: 22.00, unit: "gallon" },
    { name: "Paint Thinner", category: "Supplies", price: 18.00, unit: "gallon" },
    // Services
    { name: "Interior Room Painting", category: "Service", price: 350.00, unit: "room" },
    { name: "Exterior House Painting", category: "Service", price: 2500.00, unit: "house" },
    { name: "Cabinet Painting", category: "Service", price: 1200.00, unit: "kitchen" },
    { name: "Trim & Baseboard Painting", category: "Service", price: 185.00, unit: "room" },
    { name: "Wallpaper Installation", category: "Service", price: 450.00, unit: "room" },
    { name: "Wallpaper Removal", category: "Service", price: 285.00, unit: "room" },
    { name: "Pressure Washing", category: "Service", price: 285.00, unit: "service" },
    { name: "Color Consultation", category: "Service", price: 125.00, unit: "consultation" },
    { name: "Surface Preparation", category: "Service", price: 85.00, unit: "room" },
    { name: "Deck Staining", category: "Service", price: 425.00, unit: "deck" }
  ],
  
  landscaping: [
    // Plants & Materials
    { name: "Grass Seed - Premium", category: "Materials", price: 45.00, unit: "bag" },
    { name: "Grass Seed - Standard", category: "Materials", price: 28.00, unit: "bag" },
    { name: "Sod - Premium", category: "Materials", price: 0.85, unit: "sq ft" },
    { name: "Mulch - Hardwood", category: "Materials", price: 35.00, unit: "yard" },
    { name: "Mulch - Cedar", category: "Materials", price: 42.00, unit: "yard" },
    { name: "Topsoil", category: "Materials", price: 28.00, unit: "yard" },
    { name: "Compost", category: "Materials", price: 32.00, unit: "yard" },
    { name: "Fertilizer - Lawn", category: "Materials", price: 25.00, unit: "bag" },
    { name: "Fertilizer - Garden", category: "Materials", price: 22.00, unit: "bag" },
    { name: "Weed Killer", category: "Chemicals", price: 35.00, unit: "gallon" },
    { name: "Pesticide", category: "Chemicals", price: 28.00, unit: "gallon" },
    // Tools & Equipment
    { name: "Lawn Mower - Push", category: "Equipment", price: 385.00, unit: "each" },
    { name: "Lawn Mower - Riding", category: "Equipment", price: 2850.00, unit: "each" },
    { name: "String Trimmer", category: "Equipment", price: 185.00, unit: "each" },
    { name: "Leaf Blower", category: "Equipment", price: 225.00, unit: "each" },
    { name: "Hedge Trimmer", category: "Equipment", price: 165.00, unit: "each" },
    { name: "Chainsaw", category: "Equipment", price: 285.00, unit: "each" },
    { name: "Shovel Set", category: "Tools", price: 45.00, unit: "set" },
    { name: "Rake Set", category: "Tools", price: 35.00, unit: "set" },
    { name: "Pruning Shears", category: "Tools", price: 25.00, unit: "each" },
    { name: "Garden Hose", category: "Tools", price: 55.00, unit: "each" },
    { name: "Sprinkler System", category: "Equipment", price: 185.00, unit: "zone" },
    // Services
    { name: "Lawn Mowing", category: "Service", price: 45.00, unit: "service" },
    { name: "Lawn Care Package", category: "Service", price: 125.00, unit: "month" },
    { name: "Landscape Design", category: "Service", price: 485.00, unit: "design" },
    { name: "Tree Trimming", category: "Service", price: 185.00, unit: "tree" },
    { name: "Tree Removal", category: "Service", price: 685.00, unit: "tree" },
    { name: "Sod Installation", category: "Service", price: 1.25, unit: "sq ft" },
    { name: "Mulch Installation", category: "Service", price: 85.00, unit: "yard" },
    { name: "Irrigation Install", category: "Service", price: 285.00, unit: "zone" },
    { name: "Seasonal Cleanup", category: "Service", price: 225.00, unit: "service" }
  ],
  
  construction: [
    // Building Materials
    { name: "Lumber - 2x4x8", category: "Materials", price: 8.50, unit: "each" },
    { name: "Lumber - 2x6x8", category: "Materials", price: 12.50, unit: "each" },
    { name: "Lumber - 2x8x8", category: "Materials", price: 18.50, unit: "each" },
    { name: "Plywood - 4x8 Sheet", category: "Materials", price: 45.00, unit: "sheet" },
    { name: "Drywall - 4x8 Sheet", category: "Materials", price: 22.00, unit: "sheet" },
    { name: "Insulation - Fiberglass", category: "Materials", price: 1.25, unit: "sq ft" },
    { name: "Concrete Mix", category: "Materials", price: 5.50, unit: "bag" },
    { name: "Rebar", category: "Materials", price: 8.50, unit: "foot" },
    { name: "Roofing Shingles", category: "Materials", price: 125.00, unit: "square" },
    { name: "Siding - Vinyl", category: "Materials", price: 3.85, unit: "sq ft" },
    { name: "Windows - Standard", category: "Materials", price: 285.00, unit: "each" },
    { name: "Doors - Interior", category: "Materials", price: 185.00, unit: "each" },
    { name: "Doors - Exterior", category: "Materials", price: 385.00, unit: "each" },
    // Tools & Equipment
    { name: "Circular Saw", category: "Tools", price: 185.00, unit: "each" },
    { name: "Drill Set", category: "Tools", price: 125.00, unit: "set" },
    { name: "Hammer Set", category: "Tools", price: 85.00, unit: "set" },
    { name: "Level - 4ft", category: "Tools", price: 65.00, unit: "each" },
    { name: "Measuring Tape", category: "Tools", price: 25.00, unit: "each" },
    { name: "Safety Equipment", category: "Safety", price: 125.00, unit: "set" },
    { name: "Scaffolding Rental", category: "Equipment", price: 85.00, unit: "day" },
    // Hardware
    { name: "Nails - Framing", category: "Hardware", price: 45.00, unit: "box" },
    { name: "Screws - Drywall", category: "Hardware", price: 35.00, unit: "box" },
    { name: "Bolts & Fasteners", category: "Hardware", price: 55.00, unit: "set" },
    // Services
    { name: "Foundation Work", category: "Service", price: 25.00, unit: "sq ft" },
    { name: "Framing", category: "Service", price: 15.00, unit: "sq ft" },
    { name: "Roofing Installation", category: "Service", price: 8.50, unit: "sq ft" },
    { name: "Siding Installation", category: "Service", price: 6.50, unit: "sq ft" },
    { name: "Drywall Installation", category: "Service", price: 2.85, unit: "sq ft" },
    { name: "Flooring Installation", category: "Service", price: 5.50, unit: "sq ft" },
    { name: "Kitchen Remodel", category: "Service", price: 15000.00, unit: "kitchen" },
    { name: "Bathroom Remodel", category: "Service", price: 8500.00, unit: "bathroom" },
    { name: "Room Addition", category: "Service", price: 125.00, unit: "sq ft" },
    { name: "Permit & Planning", category: "Service", price: 850.00, unit: "project" }
  ]
};

// Enhanced tags for each niche
const nicheTags = {
  appliance_repair: [
    { name: "Refrigerator", category: "Appliance", color: "text-blue-600 border-blue-300" },
    { name: "Washer", category: "Appliance", color: "text-green-600 border-green-300" },
    { name: "Dryer", category: "Appliance", color: "text-purple-600 border-purple-300" },
    { name: "Dishwasher", category: "Appliance", color: "text-yellow-600 border-yellow-300" },
    { name: "Oven", category: "Appliance", color: "text-red-600 border-red-300" },
    { name: "Microwave", category: "Appliance", color: "text-orange-600 border-orange-300" },
    { name: "Freezer", category: "Appliance", color: "text-cyan-600 border-cyan-300" },
    { name: "Ice Maker", category: "Appliance", color: "text-indigo-600 border-indigo-300" },
    { name: "Garbage Disposal", category: "Appliance", color: "text-pink-600 border-pink-300" },
    { name: "Repair", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Installation", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Warranty", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Same Day", category: "Priority", color: "text-orange-600 border-orange-300" }
  ],
  
  garage_door: [
    { name: "Residential", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Commercial", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Spring Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Motor Replacement", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Track Alignment", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Sensor Adjustment", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Remote Programming", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Installation", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Safety Inspection", category: "Service", color: "text-green-600 border-green-300" }
  ],
  
  hvac: [
    { name: "AC Repair", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Heating", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Ventilation", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Installation", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Maintenance", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Duct Cleaning", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Filter Change", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Thermostat", category: "Component", color: "text-teal-600 border-teal-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Energy Audit", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Seasonal", category: "Type", color: "text-cyan-600 border-cyan-300" }
  ],
  
  plumbing: [
    { name: "Leak Repair", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Drain Cleaning", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Water Heater", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Toilet Repair", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Faucet Install", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Pipe Repair", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Sewer Line", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Preventive", category: "Type", color: "text-green-600 border-green-300" },
    { name: "Commercial", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Residential", category: "Type", color: "text-cyan-600 border-cyan-300" }
  ],
  
  electrical: [
    { name: "Panel Upgrade", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Outlet Install", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Lighting", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Wiring", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Circuit Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Switch Install", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "GFCI", category: "Component", color: "text-indigo-600 border-indigo-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Safety Check", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Smart Home", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Commercial", category: "Type", color: "text-cyan-600 border-cyan-300" }
  ],
  
  handyman: [
    { name: "Drywall", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Painting", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Carpentry", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Assembly", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Mounting", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Repair", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Maintenance", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Small Job", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Indoor", category: "Location", color: "text-cyan-600 border-cyan-300" },
    { name: "Outdoor", category: "Location", color: "text-green-600 border-green-300" }
  ],
  
  roofing: [
    { name: "Shingle Roof", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Metal Roof", category: "Type", color: "text-gray-600 border-gray-300" },
    { name: "Tile Roof", category: "Type", color: "text-orange-600 border-orange-300" },
    { name: "Flat Roof", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Roof Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "New Installation", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Gutter Service", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Storm Damage", category: "Issue", color: "text-yellow-600 border-yellow-300" },
    { name: "Leak Repair", category: "Issue", color: "text-blue-600 border-blue-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Inspection", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Warranty", category: "Service", color: "text-purple-600 border-purple-300" }
  ],
  
  deck_builder: [
    { name: "Wood Deck", category: "Type", color: "text-brown-600 border-brown-300" },
    { name: "Composite Deck", category: "Type", color: "text-gray-600 border-gray-300" },
    { name: "New Build", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Deck Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Refinishing", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Railing Install", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Permit Required", category: "Status", color: "text-orange-600 border-orange-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Warranty", category: "Service", color: "text-purple-600 border-purple-300" }
  ],
  
  moving: [
    { name: "Local Move", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Long Distance", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Packing", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Storage", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Fragile Items", category: "Special", color: "text-red-600 border-red-300" },
    { name: "Heavy Items", category: "Special", color: "text-gray-600 border-gray-300" },
    { name: "Same Day", category: "Priority", color: "text-green-600 border-green-300" },
    { name: "Weekend", category: "Schedule", color: "text-cyan-600 border-cyan-300" },
    { name: "Insurance", category: "Service", color: "text-pink-600 border-pink-300" }
  ],
  
  air_conditioning: [
    { name: "Central AC", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Window Unit", category: "Type", color: "text-gray-600 border-gray-300" },
    { name: "Split System", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Installation", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Maintenance", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Energy Efficient", category: "Feature", color: "text-green-600 border-green-300" },
    { name: "Warranty", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "24/7 Service", category: "Availability", color: "text-orange-600 border-orange-300" }
  ],
  
  waterproofing: [
    { name: "Basement", category: "Location", color: "text-blue-600 border-blue-300" },
    { name: "Foundation", category: "Location", color: "text-gray-600 border-gray-300" },
    { name: "Crawl Space", category: "Location", color: "text-purple-600 border-purple-300" },
    { name: "Interior", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Exterior", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Sump Pump", category: "Service", color: "text-green-600 border-green-300" },
    { name: "French Drain", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Mold Prevention", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Commercial", category: "Type", color: "text-cyan-600 border-cyan-300" },
    { name: "Residential", category: "Type", color: "text-pink-600 border-pink-300" },
    { name: "Warranty", category: "Service", color: "text-purple-600 border-purple-300" }
  ],
  
  drain_repair: [
    { name: "Kitchen Drain", category: "Location", color: "text-blue-600 border-blue-300" },
    { name: "Bathroom Drain", category: "Location", color: "text-purple-600 border-purple-300" },
    { name: "Main Line", category: "Location", color: "text-gray-600 border-gray-300" },
    { name: "Floor Drain", category: "Location", color: "text-teal-600 border-teal-300" },
    { name: "Clog Removal", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Camera Inspection", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Hydro Jetting", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Preventive", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Commercial", category: "Type", color: "text-cyan-600 border-cyan-300" },
    { name: "Residential", category: "Type", color: "text-pink-600 border-pink-300" }
  ],
  
  painting: [
    { name: "Interior Paint", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Exterior Paint", category: "Type", color: "text-green-600 border-green-300" },
    { name: "Primer", category: "Product", color: "text-gray-600 border-gray-300" },
    { name: "Wallpaper", category: "Product", color: "text-purple-600 border-purple-300" },
    { name: "Stain", category: "Product", color: "text-orange-600 border-orange-300" },
    { name: "Varnish", category: "Product", color: "text-yellow-600 border-yellow-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Touch-up", category: "Service", color: "text-pink-600 border-pink-300" },
    { name: "Full Room", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Trim Work", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Pressure Wash", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Deck Staining", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Cabinet Paint", category: "Service", color: "text-purple-600 border-purple-300" }
  ],
  
  landscaping: [
    { name: "Lawn Care", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Tree Service", category: "Service", color: "text-brown-600 border-brown-300" },
    { name: "Landscape Design", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Irrigation", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Hardscaping", category: "Service", color: "text-gray-600 border-gray-300" },
    { name: "Seasonal Cleanup", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Mulching", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Front Yard", category: "Location", color: "text-cyan-600 border-cyan-300" },
    { name: "Back Yard", category: "Location", color: "text-pink-600 border-pink-300" },
    { name: "Maintenance", category: "Type", color: "text-red-600 border-red-300" },
    { name: "Installation", category: "Type", color: "text-green-600 border-green-300" }
  ],
  
  construction: [
    { name: "New Construction", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Renovation", category: "Type", color: "text-green-600 border-green-300" },
    { name: "Addition", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Kitchen Remodel", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Bathroom Remodel", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Basement Finish", category: "Service", color: "text-gray-600 border-gray-300" },
    { name: "Framing", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Roofing", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Siding", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Flooring", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Residential", category: "Type", color: "text-pink-600 border-pink-300" },
    { name: "Commercial", category: "Type", color: "text-brown-600 border-brown-300" },
    { name: "Permit Required", category: "Status", color: "text-orange-600 border-orange-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" }
  ]
};

// Enhanced job types for each niche
const nicheJobTypes = {
  appliance_repair: [
    { name: "Diagnostic", description: "Diagnose appliance issues", is_default: true },
    { name: "Repair", description: "Fix broken appliances" },
    { name: "Installation", description: "Install new appliances" },
    { name: "Maintenance", description: "Preventive maintenance service" },
    { name: "Part Replacement", description: "Replace specific parts" },
    { name: "Emergency Repair", description: "Urgent repair service" },
    { name: "Warranty Service", description: "Service under warranty" },
    { name: "Haul Away", description: "Remove old appliances" }
  ],
  
  garage_door: [
    { name: "Spring Repair", description: "Replace or repair springs", is_default: true },
    { name: "Motor Service", description: "Repair or replace opener motor" },
    { name: "Installation", description: "Install new garage door" },
    { name: "Track Repair", description: "Fix or align door tracks" },
    { name: "Sensor Service", description: "Adjust or replace safety sensors" },
    { name: "Remote Setup", description: "Program remotes and keypads" },
    { name: "Maintenance", description: "Annual maintenance service" },
    { name: "Emergency Service", description: "24/7 emergency repairs" }
  ],
  
  hvac: [
    { name: "AC Service", description: "Service air conditioning unit", is_default: true },
    { name: "Heating Service", description: "Service heating system" },
    { name: "Installation", description: "Install new HVAC system" },
    { name: "Duct Service", description: "Clean or repair ductwork" },
    { name: "Maintenance", description: "Seasonal maintenance" },
    { name: "Filter Service", description: "Replace or clean filters" },
    { name: "Thermostat", description: "Install or repair thermostat" },
    { name: "Emergency Repair", description: "Emergency HVAC service" }
  ],
  
  plumbing: [
    { name: "Leak Repair", description: "Fix water leaks", is_default: true },
    { name: "Drain Service", description: "Clear clogged drains" },
    { name: "Water Heater", description: "Service or install water heater" },
    { name: "Fixture Install", description: "Install plumbing fixtures" },
    { name: "Pipe Repair", description: "Repair or replace pipes" },
    { name: "Sewer Service", description: "Sewer line service" },
    { name: "Inspection", description: "Plumbing system inspection" },
    { name: "Emergency", description: "24/7 emergency plumbing" }
  ],
  
  electrical: [
    { name: "Troubleshooting", description: "Diagnose electrical issues", is_default: true },
    { name: "Panel Service", description: "Service or upgrade panel" },
    { name: "Wiring", description: "Install or repair wiring" },
    { name: "Outlet/Switch", description: "Install outlets or switches" },
    { name: "Lighting", description: "Install lighting fixtures" },
    { name: "Circuit Work", description: "Add or repair circuits" },
    { name: "Inspection", description: "Electrical safety inspection" },
    { name: "Emergency", description: "Emergency electrical service" }
  ],
  
  handyman: [
    { name: "General Repair", description: "Various home repairs", is_default: true },
    { name: "Assembly", description: "Furniture or equipment assembly" },
    { name: "Drywall", description: "Drywall repair or installation" },
    { name: "Painting", description: "Interior or exterior painting" },
    { name: "Carpentry", description: "Wood work and repairs" },
    { name: "Mounting", description: "TV, shelf, or picture mounting" },
    { name: "Maintenance", description: "Regular home maintenance" },
    { name: "Small Projects", description: "Minor home improvements" }
  ],
  
  roofing: [
    { name: "Roof Inspection", description: "Inspect roof condition and identify issues", is_default: true },
    { name: "Roof Repair", description: "Repair damaged or leaking roofs" },
    { name: "New Installation", description: "Install new roofing system" },
    { name: "Re-roofing", description: "Complete roof replacement" },
    { name: "Gutter Service", description: "Install or repair gutters and downspouts" },
    { name: "Emergency Repair", description: "24/7 emergency roof repairs" },
    { name: "Storm Damage", description: "Assess and repair storm damage" },
    { name: "Maintenance", description: "Preventive roof maintenance" }
  ],
  
  deck_builder: [
    { name: "Deck Design", description: "Design and plan new deck construction", is_default: true },
    { name: "New Installation", description: "Build new deck from scratch" },
    { name: "Deck Repair", description: "Fix damaged boards, railings, or structure" },
    { name: "Refinishing", description: "Sand, stain, and seal existing deck" },
    { name: "Railing Install", description: "Install or replace deck railings" },
    { name: "Permit Service", description: "Handle permits and inspections" },
    { name: "Deck Extension", description: "Expand existing deck area" },
    { name: "Emergency Repair", description: "Urgent deck safety repairs" }
  ],
  
  moving: [
    { name: "Local Move", description: "Move within the same city or area", is_default: true },
    { name: "Long Distance", description: "Move to another city or state" },
    { name: "Office Move", description: "Commercial or office relocation" },
    { name: "Packing Only", description: "Professional packing services" },
    { name: "Loading/Unloading", description: "Load or unload rental truck" },
    { name: "Specialty Items", description: "Move pianos, artwork, or fragile items" },
    { name: "Storage Move", description: "Move items to/from storage" },
    { name: "Emergency Move", description: "Last-minute moving services" }
  ],
  
  air_conditioning: [
    { name: "AC Repair", description: "Fix air conditioning problems", is_default: true },
    { name: "New Installation", description: "Install new AC system" },
    { name: "AC Tune-Up", description: "Seasonal maintenance service" },
    { name: "Refrigerant Service", description: "Check and recharge refrigerant" },
    { name: "Coil Cleaning", description: "Clean evaporator and condenser coils" },
    { name: "Duct Service", description: "Clean or repair AC ductwork" },
    { name: "Emergency Repair", description: "24/7 emergency AC service" },
    { name: "System Replacement", description: "Replace old AC system" }
  ],
  
  waterproofing: [
    { name: "Basement Waterproofing", description: "Seal and protect basement from water", is_default: true },
    { name: "Foundation Repair", description: "Fix cracks and foundation issues" },
    { name: "Sump Pump Install", description: "Install or replace sump pump system" },
    { name: "French Drain", description: "Install interior/exterior drainage" },
    { name: "Moisture Control", description: "Address humidity and moisture issues" },
    { name: "Crawl Space", description: "Waterproof crawl space areas" },
    { name: "Emergency Service", description: "Emergency water removal and drying" },
    { name: "Mold Prevention", description: "Prevent mold with waterproofing" }
  ],
  
  drain_repair: [
    { name: "Drain Cleaning", description: "Clear clogged drains", is_default: true },
    { name: "Camera Inspection", description: "Video inspection of drain lines" },
    { name: "Hydro Jetting", description: "High-pressure drain cleaning" },
    { name: "Line Repair", description: "Repair or replace drain pipes" },
    { name: "Main Line Service", description: "Service main sewer line" },
    { name: "Rooter Service", description: "Remove tree roots from drains" },
    { name: "Emergency Service", description: "24/7 emergency drain clearing" },
    { name: "Preventive Service", description: "Regular drain maintenance" }
  ],
  
  painting: [
    { name: "Interior Painting", description: "Paint interior rooms and spaces", is_default: true },
    { name: "Exterior Painting", description: "Paint exterior walls and surfaces" },
    { name: "Cabinet Painting", description: "Paint kitchen and bathroom cabinets" },
    { name: "Trim & Molding", description: "Paint trim, baseboards, and molding" },
    { name: "Wallpaper Installation", description: "Install wallpaper and wall coverings" },
    { name: "Wallpaper Removal", description: "Remove old wallpaper and adhesive" },
    { name: "Deck Staining", description: "Stain and seal outdoor decks" },
    { name: "Pressure Washing", description: "Clean surfaces before painting" },
    { name: "Color Consultation", description: "Help choose colors and finishes" },
    { name: "Surface Preparation", description: "Prep surfaces for painting" },
    { name: "Touch-up Work", description: "Small paint touch-ups and repairs" },
    { name: "Faux Finishing", description: "Decorative painting techniques" }
  ],
  
  landscaping: [
    { name: "Lawn Mowing", description: "Regular grass cutting and maintenance", is_default: true },
    { name: "Landscape Design", description: "Design outdoor spaces and gardens" },
    { name: "Tree Trimming", description: "Prune and trim trees and shrubs" },
    { name: "Tree Removal", description: "Remove unwanted or dangerous trees" },
    { name: "Sod Installation", description: "Install new grass sod" },
    { name: "Irrigation Install", description: "Install sprinkler and watering systems" },
    { name: "Mulch Installation", description: "Apply mulch to garden beds" },
    { name: "Seasonal Cleanup", description: "Fall and spring yard cleanup" },
    { name: "Fertilization", description: "Apply fertilizer and lawn treatments" },
    { name: "Weed Control", description: "Remove weeds and apply prevention" },
    { name: "Hardscaping", description: "Install patios, walkways, and retaining walls" },
    { name: "Garden Maintenance", description: "Ongoing garden care and upkeep" }
  ],
  
  construction: [
    { name: "Kitchen Remodel", description: "Complete kitchen renovation", is_default: true },
    { name: "Bathroom Remodel", description: "Complete bathroom renovation" },
    { name: "Room Addition", description: "Add new rooms to existing structure" },
    { name: "Basement Finishing", description: "Convert basement to living space" },
    { name: "New Construction", description: "Build new residential or commercial structures" },
    { name: "Foundation Work", description: "Pour and repair foundations" },
    { name: "Framing", description: "Build structural framework" },
    { name: "Roofing Installation", description: "Install new roofing systems" },
    { name: "Siding Installation", description: "Install exterior siding" },
    { name: "Flooring Installation", description: "Install various types of flooring" },
    { name: "Drywall Installation", description: "Install and finish drywall" },
    { name: "General Renovation", description: "Various home improvement projects" }
  ]
};

// Function to safely create entities with proper error handling
async function safeCreateEntity(
  tableName: string,
  data: any[],
  uniqueField: string = 'name',
  userId?: string
): Promise<boolean> {
  try {
    // Get the current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error(`No authenticated user for ${tableName}`);
        return false;
      }
      userId = user.id;
    }

    // Add user_id to all records
    const dataWithUserId = data.map(item => ({
      ...item,
      user_id: userId
    }));

    // First, delete any existing data for this user to ensure clean slate
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('user_id', userId);

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error(`Error deleting existing ${tableName}:`, deleteError);
    }

    // Try batch insert first
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(dataWithUserId)
      .select();

    if (error) {
      console.error(`Batch insert failed for ${tableName}:`, error);
      console.log(`Attempting individual inserts for ${tableName}...`);
      
      // Try inserting one by one if batch fails
      let successCount = 0;
      let failedItems: string[] = [];
      
      for (const item of dataWithUserId) {
        try {
          const { error: singleError, data: singleData } = await supabase
            .from(tableName)
            .insert(item)
            .select()
            .single();
          
          if (!singleError && singleData) {
            successCount++;
          } else {
            // If it's a unique violation, consider it a success (data already exists)
            if (singleError?.code === '23505') {
              successCount++;
              console.log(`${tableName} item already exists:`, item[uniqueField]);
            } else {
              failedItems.push(item[uniqueField] || 'Unknown');
              console.error(`Failed to insert ${tableName} item:`, item[uniqueField], singleError);
            }
          }
        } catch (err) {
          failedItems.push(item[uniqueField] || 'Unknown');
          console.error(`Exception inserting ${tableName} item:`, item[uniqueField], err);
        }
      }
      
      console.log(`Created ${successCount}/${dataWithUserId.length} ${tableName} individually`);
      
      if (failedItems.length > 0) {
        console.warn(`Failed items for ${tableName}:`, failedItems.join(', '));
      }
      
      return successCount > 0;
    }

    console.log(`Successfully created ${insertedData?.length || 0} ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating ${tableName}:`, error);
    return false;
  }
}

// Helper function to get niche-specific data
function getNicheData(businessNiche: string): { products: any[], tags: any[], jobTypes: any[] } | null {
  // Map business niche names to data keys
  const nicheKeyMap: { [key: string]: string } = {
    "Painting & Decorating": "painting",
    "Appliance Repair": "appliance_repair",
    "Garage Door Services": "garage_door",
    "HVAC Services": "hvac",
    "Plumbing Services": "plumbing",
    "Electrical Services": "electrical", 
    "General Handyman": "handyman",
    "General Contracting": "construction",
    "Landscaping & Lawn Care": "landscaping",
    "Roofing Services": "roofing",
    "Deck Builder": "deck_builder",
    "Moving Services": "moving",
    "Air Conditioning": "air_conditioning",
    "Waterproofing": "waterproofing",
    "Drain Repair": "drain_repair"
  };

  const nicheKey = nicheKeyMap[businessNiche] || businessNiche.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  
  const tags = nicheTags[nicheKey as keyof typeof nicheTags] || nicheTags.handyman;
  const jobTypes = nicheJobTypes[nicheKey as keyof typeof nicheJobTypes] || nicheJobTypes.handyman;
  const products = nicheProducts[nicheKey as keyof typeof nicheProducts] || nicheProducts.handyman;

  if (!tags || !jobTypes || !products) {
    console.log(`No data found for niche key: ${nicheKey} (from business niche: ${businessNiche})`);
    return null;
  }

  // Add default fields to products
  const productsWithDefaults = products.map(product => ({ 
    ...product, 
    stock_quantity: 0,
    low_stock_threshold: 5
  }));

  return {
    products: productsWithDefaults,
    tags,
    jobTypes
  };
}

// Enhanced function to load niche-specific data
export async function loadEnhancedNicheData(businessNiche: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user");
      return false;
    }

    console.log(`Loading enhanced data for niche: ${businessNiche}`);

    // First, create default data that's the same for all users
    const defaultJobStatuses = [
      { name: 'New', color: '#3B82F6' },
      { name: 'In Progress', color: '#F59E0B' },
      { name: 'Completed', color: '#10B981' },
      { name: 'Cancelled', color: '#EF4444' },
      { name: 'On Hold', color: '#6B7280' }
    ];

    const defaultLeadSources = [
      { name: 'Website' },
      { name: 'Phone Call' },
      { name: 'Email' },
      { name: 'Referral' },
      { name: 'Social Media' },
      { name: 'Walk-in' }
    ];

    // Create default job statuses
    await safeCreateEntity('job_statuses', defaultJobStatuses, 'name', user.id);
    
    // Create default lead sources
    await safeCreateEntity('lead_sources', defaultLeadSources, 'name', user.id);

    // Get niche-specific data
    const nicheData = getNicheData(businessNiche);
    if (!nicheData) {
      console.error(`No data found for niche: ${businessNiche}`);
      return false;
    }

    // Create entities in parallel for better performance
    const results = await Promise.all([
      safeCreateEntity('products', nicheData.products, 'name', user.id),
      safeCreateEntity('tags', nicheData.tags, 'name', user.id),
      safeCreateEntity('job_types', nicheData.jobTypes, 'name', user.id)
    ]);

    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      console.log(`Successfully loaded all enhanced data for ${businessNiche}`);
    } else {
      console.warn(`Some data failed to load for ${businessNiche}`);
    }

    return allSuccessful;
  } catch (error) {
    console.error("Error loading enhanced niche data:", error);
    return false;
  }
}

// Main function to initialize niche data - this is what gets called from NicheConfig
export async function initializeNicheData(businessNiche: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    console.log('Initializing niche data for:', businessNiche);
    
    // Map business niche names to data keys
    const nicheKeyMap: { [key: string]: string } = {
      "Painting & Decorating": "painting",
      "Appliance Repair": "appliance_repair",
      "Garage Door Services": "garage_door",
      "HVAC Services": "hvac",
      "Plumbing Services": "plumbing",
      "Electrical Services": "electrical", 
      "General Handyman": "handyman",
      "General Contracting": "construction",
      "Landscaping & Lawn Care": "landscaping",
      "Roofing Services": "roofing",
      "Deck Builder": "deck_builder",
      "Moving Services": "moving",
      "Air Conditioning": "air_conditioning",
      "Waterproofing": "waterproofing",
      "Drain Repair": "drain_repair"
    };

    const nicheKey = nicheKeyMap[businessNiche] || "handyman";
    console.log('Using niche key:', nicheKey);

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Get niche-specific data
    const products = nicheProducts[nicheKey as keyof typeof nicheProducts] || [];
    const tags = nicheTags[nicheKey as keyof typeof nicheTags] || [];
    const jobTypes = nicheJobTypes[nicheKey as keyof typeof nicheJobTypes] || [];

    console.log('Data counts:', {
      products: products.length,
      tags: tags.length,
      jobTypes: jobTypes.length
    });

    // Initialize products
    if (products.length > 0) {
      const success = await safeCreateEntity('products', products, 'name', user.id);
      if (!success) {
        console.warn('Failed to create some products, but continuing...');
      }
    }

    // Initialize tags
    if (tags.length > 0) {
      const success = await safeCreateEntity('tags', tags, 'name', user.id);
      if (!success) {
        console.warn('Failed to create some tags, but continuing...');
      }
    }

    // Initialize job types
    if (jobTypes.length > 0) {
      const success = await safeCreateEntity('job_types', jobTypes, 'name', user.id);
      if (!success) {
        console.warn('Failed to create some job types, but continuing...');
      }
    }

    return { 
      success: true, 
      message: `Successfully initialized ${businessNiche} data: ${products.length} products, ${tags.length} tags, ${jobTypes.length} job types` 
    };

  } catch (error) {
    console.error('Error in initializeNicheData:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 