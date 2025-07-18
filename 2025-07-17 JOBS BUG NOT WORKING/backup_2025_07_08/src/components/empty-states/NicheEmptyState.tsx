import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Wrench, Users, FileText, Calendar, Plus,
  Thermometer, Droplets, Zap, Home, Hammer,
  Package, Phone, TrendingUp
} from "lucide-react";

interface NicheEmptyStateProps {
  type: 'jobs' | 'clients' | 'invoices' | 'estimates' | 'schedule';
  businessType: string;
}

const getNicheIcon = (businessType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "HVAC Services": <Thermometer className="w-12 h-12 text-blue-500" />,
    "Plumbing Services": <Droplets className="w-12 h-12 text-blue-500" />,
    "Electrical Services": <Zap className="w-12 h-12 text-yellow-500" />,
    "Appliance Repair": <Package className="w-12 h-12 text-gray-500" />,
    "Roofing Services": <Home className="w-12 h-12 text-orange-500" />,
    "General": <Wrench className="w-12 h-12 text-gray-500" />
  };
  
  return iconMap[businessType] || iconMap["General"];
};

const getEmptyStateContent = (type: string, businessType: string) => {
  const content: Record<string, Record<string, any>> = {
    "HVAC Services": {
      jobs: {
        title: "No HVAC service calls yet",
        description: "Start scheduling maintenance visits or repair calls",
        primaryAction: { label: "Create Service Call", href: "/jobs/new" },
        secondaryAction: { label: "Add Client", href: "/clients/new" }
      },      clients: {
        title: "No HVAC customers yet",
        description: "Add your first customer to start tracking their equipment",
        primaryAction: { label: "Add Customer", href: "/clients/new" },
        secondaryAction: { label: "Import Customers", href: "/clients/import" }
      },
      invoices: {
        title: "No invoices created",
        description: "Complete a service call to generate your first invoice",
        primaryAction: { label: "Create Invoice", href: "/invoices/new" },
        secondaryAction: { label: "View Jobs", href: "/jobs" }
      }
    },
    "Plumbing Services": {
      jobs: {
        title: "No plumbing jobs scheduled",
        description: "Add your first repair job or service call",
        primaryAction: { label: "Schedule Job", href: "/jobs/new" },
        secondaryAction: { label: "Add Client", href: "/clients/new" }
      },
      clients: {
        title: "No plumbing customers yet",
        description: "Start building your customer database",
        primaryAction: { label: "Add Customer", href: "/clients/new" },
        secondaryAction: null
      }
    },
    // Default fallback
    "Default": {
      jobs: {
        title: "No jobs yet",
        description: "Create your first job to get started",
        primaryAction: { label: "Create Job", href: "/jobs/new" },
        secondaryAction: { label: "Add Client", href: "/clients/new" }
      },      clients: {
        title: "No clients yet",
        description: "Add your first client to start managing your business",
        primaryAction: { label: "Add Client", href: "/clients/new" },
        secondaryAction: null
      },
      invoices: {
        title: "No invoices yet",
        description: "Complete jobs to generate invoices",
        primaryAction: { label: "View Jobs", href: "/jobs" },
        secondaryAction: null
      }
    }
  };
  
  const businessContent = content[businessType] || content["Default"];
  return businessContent[type] || businessContent.jobs;
};

export const NicheEmptyState: React.FC<NicheEmptyStateProps> = ({ type, businessType }) => {
  const navigate = useNavigate();
  const content = getEmptyStateContent(type, businessType);
  const icon = getNicheIcon(businessType);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
        <p className="text-muted-foreground mb-6">{content.description}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            onClick={() => navigate(content.primaryAction.href)}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            {content.primaryAction.label}
          </Button>
          
          {content.secondaryAction && (
            <Button 
              variant="outline"
              onClick={() => navigate(content.secondaryAction.href)}
              className="flex-1"
            >
              {content.secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};