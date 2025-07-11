import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  MoreHorizontal, 
  Send, 
  Trash2, 
  FileText, 
  Edit, 
  Phone,
  Mail
} from "lucide-react";
import { Estimate } from "@/hooks/useEstimates";
import { SendEstimateDialog } from "./SendEstimateDialog";

interface EstimateActionsProps {
  estimate: Estimate;
  onSend: (estimateId: string) => Promise<boolean>;
  onSendSMS: (estimateId: string, phoneNumber: string) => Promise<boolean>;
  onDelete: (estimate: Estimate) => Promise<boolean>;
  onConvertToInvoice: (estimate: Estimate) => Promise<boolean>;
  onEdit: (estimate: Estimate) => void;
  isLoading: boolean;
  clientPhone?: string;
  clientEmail?: string;
}

export const EstimateActions = ({ 
  estimate, 
  onSend, 
  onSendSMS,
  onDelete, 
  onConvertToInvoice, 
  onEdit,
  isLoading,
  clientPhone,
  clientEmail
}: EstimateActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'converted': 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSendEmail = async () => {
    await onSend(estimate.id);
  };

  const handleSendSMS = async (phoneNumber: string) => {
    await onSendSMS(estimate.id, phoneNumber);
  };

  const handleDelete = async () => {
    const success = await onDelete(estimate);
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  const handleConvert = async () => {
    const success = await onConvertToInvoice(estimate);
    if (success) {
      setShowConvertDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {getStatusBadge(estimate.status)}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(estimate)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            
            {estimate.status !== 'converted' && (
              <>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setShowSendDialog(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </DropdownMenuItem>
                
                {clientEmail && (
                  <DropdownMenuItem onClick={handleSendEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send via Email
                  </DropdownMenuItem>
                )}
                
                {clientPhone && (
                  <DropdownMenuItem onClick={() => handleSendSMS(clientPhone)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Send via SMS
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setShowConvertDialog(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Convert to Invoice
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Send Dialog */}
      <SendEstimateDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        estimate={estimate}
        clientEmail={clientEmail}
        clientPhone={clientPhone}
        onSendEmail={handleSendEmail}
        onSendSMS={handleSendSMS}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete estimate {estimate.estimate_number}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Confirmation Dialog */}
      <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              This will convert estimate {estimate.estimate_number} to an invoice. 
              The estimate status will be marked as converted and cannot be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvert}>
              Convert to Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
