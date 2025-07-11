
import { Button } from "@/components/ui/button";
import { Printer, Send } from "lucide-react";
import { toast } from "sonner";

interface InvoicePreviewFooterProps {
  onClose: () => void;
  onSend: () => void;
}

export const InvoicePreviewFooter = ({ onClose, onSend }: InvoicePreviewFooterProps) => {
  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  return (
    <div className="flex-shrink-0 flex justify-between items-center pt-4 px-6 border-t">
      <div className="flex gap-2">
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" onClick={onSend} className="gap-2">
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>

      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    </div>
  );
};
