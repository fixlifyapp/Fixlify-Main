
export interface AiSuggestion {
  id: number;
  tip: string;
  type: "info" | "recommendation" | "insight" | "warning" | "upsell";
  category?: "revenue" | "efficiency" | "customer" | "sales" | "upsell";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface QuickAction {
  id: number;
  name: string;
  variant: string;
  className: string;
  // Updated icon type to match Lucide React's type
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
}

export interface AiFinanceInsight {
  id: number;
  tip: string;
  type: "info" | "recommendation" | "insight" | "warning" | "upsell";
  category: "revenue" | "efficiency" | "customer" | "sales" | "upsell";
  action?: {
    label: string;
    onClick: () => void;
  };
  date: string;
}
