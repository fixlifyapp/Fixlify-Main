
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Shield, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientWarrantyViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warranty: {
    id: string;
    name: string;
    description: string;
    price: number;
  } | null;
  techniciansNote?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const ClientWarrantyViewDialog = ({
  open,
  onOpenChange,
  warranty,
  techniciansNote,
  onAccept,
  onDecline
}: ClientWarrantyViewDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept();
      toast.success("Warranty accepted");
      onOpenChange(false);
    } catch (error) {
      console.error("Error accepting warranty:", error);
      toast.error("Failed to accept warranty");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await onDecline();
      toast.success("Warranty declined");
      onOpenChange(false);
    } catch (error) {
      console.error("Error declining warranty:", error);
      toast.error("Failed to decline warranty");
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!warranty) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="text-primary" size={20} />
            Recommended Warranty
          </DialogTitle>
          <DialogDescription>
            Your technician recommends the following warranty for your protection
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
              <h3 className="text-lg font-semibold text-primary">{warranty.name}</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 md:ml-auto">
                ${warranty.price.toFixed(2)}
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {warranty.description}
            </p>
            
            {techniciansNote && (
              <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium block mb-1">Technician's note:</span>
                  {techniciansNote}
                </p>
              </div>
            )}
            
            <div className="flex flex-col xs:flex-row gap-3 mt-4">
              <Button 
                onClick={handleAccept} 
                disabled={isProcessing} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle size={16} className="mr-2" /> 
                Accept Warranty
              </Button>
              <Button 
                onClick={handleDecline} 
                disabled={isProcessing}
                variant="outline" 
                className="flex-1 border-red-200 hover:bg-red-50 text-red-600"
              >
                <X size={16} className="mr-2" /> 
                Decline
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Why get a warranty?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Protection against unexpected repair costs</li>
              <li>• Expedited service when you need repairs</li>
              <li>• Peace of mind knowing your appliance is covered</li>
              <li>• Often pays for itself with just one repair visit</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
