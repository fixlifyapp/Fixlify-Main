
import { toast } from "@/components/ui/sonner";

export { toast };
export const useToast = () => ({
  toast,
  dismiss: () => {},
  toasts: []
});
