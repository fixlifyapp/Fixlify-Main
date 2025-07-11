
export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
}

export interface UpsellStepProps {
  onContinue: (upsells: UpsellItem[], notes: string) => void;
  onBack: () => void;
  documentTotal: number;
  existingUpsellItems?: UpsellItem[];
  estimateToConvert?: any;
  jobContext?: {
    job_type?: string;
    service_category?: string;
    job_value?: number;
    client_history?: any;
    estimateId?: string;
    invoiceId?: string;
  };
}
