
import { CheckCircle, Bell } from "lucide-react";
import { AiSuggestion, QuickAction } from "./types";
import { toast } from "sonner";

// Initial AI suggestions categorized by type
export const initialAiSuggestions: AiSuggestion[] = [
  {
    id: 1,
    tip: "This is a returning customer with 5+ jobs. Consider offering a loyalty discount.",
    type: "info",
    category: "customer",
    action: {
      label: "Create Discount",
      onClick: () => toast.success("Loyalty discount created")
    }
  }, 
  {
    id: 2,
    tip: "The appliance is 8 years old. Suggest a maintenance plan for better performance.",
    type: "recommendation",
    category: "upsell",
    action: {
      label: "Add to Estimate",
      onClick: () => toast.success("Maintenance plan added to estimate")
    }
  }, 
  {
    id: 3,
    tip: "Similar jobs typically require these additional parts: air filter, capacitor.",
    type: "insight",
    category: "efficiency",
    action: {
      label: "Order Parts",
      onClick: () => toast.success("Parts ordered")
    }
  }, 
  {
    id: 4,
    tip: "Estimates-to-invoice conversion for this client type is only 42% — consider adjusting your pricing approach.",
    type: "warning",
    category: "sales",
    action: {
      label: "View Conversion Insights",
      onClick: () => toast.success("Viewing detailed conversion insights")
    }
  }, 
  {
    id: 5,
    tip: "Adding a 1-Year Warranty increases estimate acceptance by 94% for this job type.",
    type: "upsell",
    category: "sales",
    action: {
      label: "Include Warranty",
      onClick: () => toast.success("1-Year Warranty included in estimate")
    }
  }
];

export const quickActions: QuickAction[] = [
  {
    id: 1,
    name: "Complete Job",
    variant: "default",
    className: "bg-fixlyfy hover:bg-fixlyfy/90 w-full",
    icon: CheckCircle
  }, 
  {
    id: 2,
    name: "Send Reminder",
    variant: "outline",
    className: "w-full",
    icon: Bell
  }
];
