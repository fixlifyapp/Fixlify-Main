
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceData {
  description: string;
  amount: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onSubmit: () => void;
}

export const InvoiceModal = ({
  isOpen,
  onOpenChange,
  clientName,
  invoiceData,
  setInvoiceData,
  onSubmit
}: InvoiceModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for client {clientName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Enter invoice description"
              value={invoiceData.description}
              onChange={(e) => setInvoiceData({...invoiceData, description: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <Input 
                id="amount" 
                placeholder="0.00" 
                type="number"
                value={invoiceData.amount}
                onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-fixlyfy hover:bg-fixlyfy/90" 
            onClick={onSubmit}
          >
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
