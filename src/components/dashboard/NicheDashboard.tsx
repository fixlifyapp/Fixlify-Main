
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Zap, 
  Droplets, 
  Thermometer, 
  Home, 
  Car,
  Paintbrush2,
  TreePine,
  Hammer,
  ShieldCheck
} from 'lucide-react';

interface NicheDashboardProps {
  niche: string;
}

const getNicheIcon = (niche: string) => {
  switch (niche?.toLowerCase()) {
    case 'appliance repair':
      return <Wrench className="w-8 h-8" />;
    case 'electrical services':
      return <Zap className="w-8 h-8" />;
    case 'plumbing services':
      return <Droplets className="w-8 h-8" />;
    case 'hvac services':
      return <Thermometer className="w-8 h-8" />;
    case 'general handyman':
      return <Home className="w-8 h-8" />;
    case 'garage door services':
      return <Car className="w-8 h-8" />;
    case 'painting & decorating':
      return <Paintbrush2 className="w-8 h-8" />;
    case 'landscaping':
      return <TreePine className="w-8 h-8" />;
    case 'roofing':
      return <ShieldCheck className="w-8 h-8" />;
    default:
      return <Hammer className="w-8 h-8" />;
  }
};

const getNicheColor = (niche: string) => {
  switch (niche?.toLowerCase()) {
    case 'appliance repair':
      return 'text-blue-600';
    case 'electrical services':
      return 'text-yellow-600';
    case 'plumbing services':
      return 'text-blue-500';
    case 'hvac services':
      return 'text-orange-600';
    case 'general handyman':
      return 'text-green-600';
    case 'garage door services':
      return 'text-gray-600';
    case 'painting & decorating':
      return 'text-purple-600';
    case 'landscaping':
      return 'text-green-500';
    case 'roofing':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const getNicheDescription = (niche: string) => {
  switch (niche?.toLowerCase()) {
    case 'appliance repair':
      return 'Specialized in repairing and maintaining household appliances including refrigerators, washers, dryers, and dishwashers.';
    case 'electrical services':
      return 'Professional electrical work including wiring, panel upgrades, outlet installation, and troubleshooting.';
    case 'plumbing services':
      return 'Complete plumbing solutions from leak repairs to water heater installation and drain cleaning.';
    case 'hvac services':
      return 'Heating, ventilation, and air conditioning services including installation, repair, and maintenance.';
    case 'general handyman':
      return 'Versatile home repair and maintenance services covering multiple trades and general fixes.';
    case 'garage door services':
      return 'Garage door installation, repair, and maintenance including springs, openers, and safety sensors.';
    case 'painting & decorating':
      return 'Interior and exterior painting services with color consultation and decorative finishes.';
    case 'landscaping':
      return 'Outdoor beautification including lawn care, garden design, and landscape maintenance.';
    case 'roofing':
      return 'Roofing installation, repair, and maintenance to protect your home from the elements.';
    default:
      return 'Professional service provider dedicated to quality work and customer satisfaction.';
  }
};

export const NicheDashboard = ({ niche }: NicheDashboardProps) => {
  const icon = getNicheIcon(niche);
  const colorClass = getNicheColor(niche);
  const description = getNicheDescription(niche);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-muted ${colorClass}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-2xl">
                {niche || 'General Services'}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            Specialized Business
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-lg">Service Focus</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Tailored for {niche?.toLowerCase() || 'general services'}
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-lg">Industry Tools</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Specialized products & pricing
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-lg">Expert Support</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Industry-specific guidance
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
