
import { Estimate } from "@/types/documents";

export interface EstimatePreviewWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate;
  onConvertToInvoice?: (estimate: Estimate) => Promise<void>;
}
