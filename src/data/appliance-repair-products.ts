
import { Product } from "@/hooks/useProducts";

export const applianceRepairProducts: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: "Diagnostic Fee - Refrigerator",
    description: "On-site diagnostic inspection for refrigerator issues",
    category: "Diagnostic Fees",
    price: 99.99,
    cost: 45,
    ourPrice: 45,
    taxable: true,
    tags: ["diagnostic", "refrigerator", "service call"]
  },
  {
    name: "Diagnostic Fee - Washing Machine",
    description: "On-site diagnostic inspection for washing machine issues",
    category: "Diagnostic Fees",
    price: 89.99,
    cost: 40,
    ourPrice: 40,
    taxable: true,
    tags: ["diagnostic", "washing machine", "service call"]
  },
  {
    name: "Diagnostic Fee - Dryer",
    description: "On-site diagnostic inspection for dryer issues",
    category: "Diagnostic Fees",
    price: 89.99,
    cost: 40,
    ourPrice: 40,
    taxable: true,
    tags: ["diagnostic", "dryer", "service call"]
  },
  {
    name: "Diagnostic Fee - Dishwasher",
    description: "On-site diagnostic inspection for dishwasher issues",
    category: "Diagnostic Fees",
    price: 89.99,
    cost: 40,
    ourPrice: 40,
    taxable: true,
    tags: ["diagnostic", "dishwasher", "service call"]
  },
  {
    name: "Refrigerator Compressor Replacement",
    description: "Replacement of refrigerator compressor including parts and labor",
    category: "Refrigerator Repair",
    price: 499.99,
    cost: 275,
    ourPrice: 275,
    taxable: true,
    tags: ["refrigerator", "compressor", "major repair"]
  },
  {
    name: "Refrigerator Evaporator Fan Motor",
    description: "Replacement of refrigerator evaporator fan motor",
    category: "Refrigerator Repair",
    price: 249.99,
    cost: 125,
    ourPrice: 125,
    taxable: true,
    tags: ["refrigerator", "fan", "motor"]
  },
  {
    name: "Refrigerator Defrost Timer",
    description: "Replacement of refrigerator defrost timer",
    category: "Refrigerator Repair",
    price: 189.99,
    cost: 85,
    ourPrice: 85,
    taxable: true,
    tags: ["refrigerator", "defrost", "timer"]
  },
  {
    name: "Refrigerator Water Filter Replacement",
    description: "Replacement of refrigerator water filter",
    category: "Refrigerator Maintenance",
    price: 79.99,
    cost: 35,
    ourPrice: 35,
    taxable: true,
    tags: ["refrigerator", "filter", "maintenance"]
  },
  {
    name: "Washer Drive Belt Replacement",
    description: "Replacement of washing machine drive belt",
    category: "Washing Machine Repair",
    price: 159.99,
    cost: 65,
    ourPrice: 65,
    taxable: true,
    tags: ["washer", "belt", "repair"]
  },
  {
    name: "Washer Water Pump Replacement",
    description: "Replacement of washing machine water pump",
    category: "Washing Machine Repair",
    price: 229.99,
    cost: 110,
    ourPrice: 110,
    taxable: true,
    tags: ["washer", "pump", "repair"]
  },
  {
    name: "Washer Control Board Replacement",
    description: "Replacement of washing machine control board",
    category: "Washing Machine Repair",
    price: 349.99,
    cost: 185,
    ourPrice: 185,
    taxable: true,
    tags: ["washer", "control board", "electronic"]
  },
  {
    name: "Dryer Heating Element Replacement",
    description: "Replacement of dryer heating element",
    category: "Dryer Repair",
    price: 219.99,
    cost: 95,
    ourPrice: 95,
    taxable: true,
    tags: ["dryer", "heating element", "repair"]
  },
  {
    name: "Dryer Thermal Fuse Replacement",
    description: "Replacement of dryer thermal fuse",
    category: "Dryer Repair",
    price: 129.99,
    cost: 45,
    ourPrice: 45,
    taxable: true,
    tags: ["dryer", "fuse", "repair"]
  },
  {
    name: "Dryer Drum Belt Replacement",
    description: "Replacement of dryer drum belt",
    category: "Dryer Repair",
    price: 169.99,
    cost: 65,
    ourPrice: 65,
    taxable: true,
    tags: ["dryer", "belt", "repair"]
  },
  {
    name: "Dishwasher Pump Assembly Replacement",
    description: "Replacement of dishwasher pump assembly",
    category: "Dishwasher Repair",
    price: 249.99,
    cost: 120,
    ourPrice: 120,
    taxable: true,
    tags: ["dishwasher", "pump", "repair"]
  },
  {
    name: "Dishwasher Spray Arm Replacement",
    description: "Replacement of dishwasher spray arm",
    category: "Dishwasher Repair",
    price: 119.99,
    cost: 45,
    ourPrice: 45,
    taxable: true,
    tags: ["dishwasher", "spray arm", "repair"]
  },
  {
    name: "Dishwasher Control Board Replacement",
    description: "Replacement of dishwasher electronic control board",
    category: "Dishwasher Repair",
    price: 299.99,
    cost: 145,
    ourPrice: 145,
    taxable: true,
    tags: ["dishwasher", "control board", "electronic"]
  },
  {
    name: "Oven/Range Element Replacement",
    description: "Replacement of oven or range heating element",
    category: "Oven/Range Repair",
    price: 179.99,
    cost: 75,
    ourPrice: 75,
    taxable: true,
    tags: ["oven", "range", "element", "repair"]
  },
  {
    name: "Oven/Range Igniter Replacement",
    description: "Replacement of gas oven or range igniter",
    category: "Oven/Range Repair",
    price: 189.99,
    cost: 80,
    ourPrice: 80,
    taxable: true,
    tags: ["oven", "range", "igniter", "gas"]
  },
  {
    name: "Oven Temperature Sensor Replacement",
    description: "Replacement of oven temperature sensor",
    category: "Oven/Range Repair",
    price: 149.99,
    cost: 60,
    ourPrice: 60,
    taxable: true,
    tags: ["oven", "sensor", "temperature"]
  },
  {
    name: "Microwave Magnetron Replacement",
    description: "Replacement of microwave magnetron tube",
    category: "Microwave Repair",
    price: 239.99,
    cost: 115,
    ourPrice: 115,
    taxable: true,
    tags: ["microwave", "magnetron", "repair"]
  },
  {
    name: "Microwave Door Switch Replacement",
    description: "Replacement of microwave door switch",
    category: "Microwave Repair",
    price: 129.99,
    cost: 50,
    ourPrice: 50,
    taxable: true,
    tags: ["microwave", "door", "switch"]
  },
  {
    name: "Labor - Standard Hourly Rate",
    description: "Standard hourly labor rate for appliance repair",
    category: "Labor",
    price: 95,
    cost: 95,
    ourPrice: 95,
    taxable: true,
    tags: ["labor", "hourly", "service"]
  },
  {
    name: "Labor - Weekend/Holiday Rate",
    description: "Weekend or holiday hourly labor rate",
    category: "Labor",
    price: 145,
    cost: 145,
    ourPrice: 145,
    taxable: true,
    tags: ["labor", "weekend", "holiday"]
  },
  {
    name: "Labor - Emergency Service",
    description: "Emergency after-hours service rate",
    category: "Labor",
    price: 175,
    cost: 175,
    ourPrice: 175,
    taxable: true,
    tags: ["labor", "emergency", "after-hours"]
  },
  {
    name: "Annual Maintenance Plan - Basic",
    description: "Basic annual maintenance plan for one appliance",
    category: "Maintenance Plans",
    price: 149.99,
    cost: 90,
    ourPrice: 90,
    taxable: true,
    tags: ["maintenance", "plan", "annual", "basic"]
  },
  {
    name: "Annual Maintenance Plan - Premium",
    description: "Premium annual maintenance plan for up to 3 appliances",
    category: "Maintenance Plans",
    price: 299.99,
    cost: 180,
    ourPrice: 180,
    taxable: true,
    tags: ["maintenance", "plan", "annual", "premium"]
  },
  {
    name: "1-Year Extended Warranty",
    description: "1-year extended warranty coverage",
    category: "Warranties",
    price: 129.99,
    cost: 50,
    ourPrice: 50,
    taxable: true,
    tags: ["warranty", "extended", "1-year"]
  },
  {
    name: "2-Year Extended Warranty",
    description: "2-year extended warranty coverage",
    category: "Warranties",
    price: 219.99,
    cost: 85,
    ourPrice: 85,
    taxable: true,
    tags: ["warranty", "extended", "2-year"]
  },
  {
    name: "3-Year Premium Warranty",
    description: "3-year premium warranty with priority service",
    category: "Warranties",
    price: 349.99,
    cost: 125,
    ourPrice: 125,
    taxable: true,
    tags: ["warranty", "premium", "3-year", "priority"]
  },
  {
    name: "Trip Fee - Within 15 miles",
    description: "Service call trip fee for locations within 15 miles",
    category: "Service Fees",
    price: 49.99,
    cost: 49.99,
    ourPrice: 49.99,
    taxable: true,
    tags: ["fee", "trip", "service call"]
  },
  {
    name: "Trip Fee - 15-30 miles",
    description: "Service call trip fee for locations 15-30 miles away",
    category: "Service Fees",
    price: 69.99,
    cost: 69.99,
    ourPrice: 69.99,
    taxable: true,
    tags: ["fee", "trip", "service call"]
  }
];
