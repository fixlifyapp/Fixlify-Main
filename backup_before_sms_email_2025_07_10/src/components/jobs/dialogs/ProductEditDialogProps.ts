
import { Product } from "../builder/types";

export interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: any) => Promise<void>;
  categories?: string[];
}
