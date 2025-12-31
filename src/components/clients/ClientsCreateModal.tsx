import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClientsOptimized } from "@/hooks/useClientsOptimized";
import type { Client } from "@/types/core/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Building2, FileText, AlertTriangle } from "lucide-react";
import { formatPhoneForTelnyx } from "@/utils/phoneUtils";

interface ClientsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: Client) => void;
}

export const ClientsCreateModal = ({ open, onOpenChange, onSuccess }: ClientsCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState<Client[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingClientData, setPendingClientData] = useState<Record<string, string> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { addClient, checkForDuplicates } = useClientsOptimized();

  const createClient = async (clientData: Record<string, string>) => {
    try {
      const newClient = await addClient(clientData);

      onOpenChange(false);
      toast.success("Client added successfully");

      if (onSuccess && newClient) {
        onSuccess(newClient);
      }

      formRef.current?.reset();
      setPendingClientData(null);
      setDuplicates([]);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('clientsRefresh'));
      }, 100);
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isCheckingDuplicates) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;

    if (!name || name.trim() === '') {
      toast.error("Client name is required");
      return;
    }

    if (!phone || phone.trim() === '') {
      toast.error("Phone number is required for messaging and communication");
      return;
    }

    const formattedPhone = formatPhoneForTelnyx(phone);

    const clientData = {
      name,
      phone: formattedPhone,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
      country: formData.get('country') as string,
      type: formData.get('clientType') as string,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string,
    };

    // Check for duplicates before creating
    setIsCheckingDuplicates(true);
    try {
      const foundDuplicates = await checkForDuplicates(phone, email);

      if (foundDuplicates.length > 0) {
        setDuplicates(foundDuplicates);
        setPendingClientData(clientData);
        setShowDuplicateWarning(true);
        setIsCheckingDuplicates(false);
        return;
      }

      // No duplicates, proceed with creation
      setIsSubmitting(true);
      await createClient(clientData);
    } catch (error) {
      console.error("Error checking duplicates:", error);
      // If duplicate check fails, proceed with creation anyway
      setIsSubmitting(true);
      await createClient(clientData);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleProceedAnyway = async () => {
    setShowDuplicateWarning(false);
    if (pendingClientData) {
      setIsSubmitting(true);
      await createClient(pendingClientData);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false);
    setPendingClientData(null);
    setDuplicates([]);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-6 border-b bg-gradient-to-r from-fixlyfy/5 to-fixlyfy/10">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-fixlyfy flex items-center gap-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
            Add New Client
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-fixlyfy-text-secondary">
            Fill in the details below to add a new client to your database. Phone number is required for messaging and communication.
          </DialogDescription>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-grow overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
              
              {/* Client Type & Status */}
              <Card className="border-fixlyfy/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-fixlyfy" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientType" className="text-sm font-medium">Client Type *</Label>
                      <Select name="clientType" defaultValue="residential" required>
                        <SelectTrigger id="clientType" className="h-10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="property-manager">Property Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                      <Select name="status" defaultValue="active" required>
                        <SelectTrigger id="status" className="h-10">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="border-fixlyfy/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-fixlyfy" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Enter full name or business name" 
                      required 
                      className="h-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-fixlyfy/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4 text-fixlyfy" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fixlyfy-text-secondary" />
                        <Input 
                          id="phone" 
                          name="phone" 
                          placeholder="Phone number" 
                          required 
                          className="h-10 pl-10"
                        />
                      </div>
                      <p className="text-xs text-fixlyfy-text-secondary">Automatically formatted</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="altPhone" className="text-sm font-medium">Alternative Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fixlyfy-text-secondary" />
                        <Input 
                          id="altPhone" 
                          name="altPhone" 
                          placeholder="Alternative phone" 
                          className="h-10 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fixlyfy-text-secondary" />
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="client@example.com" 
                        className="h-10 pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="border-fixlyfy/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-fixlyfy" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Street Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fixlyfy-text-secondary" />
                      <Input 
                        id="address" 
                        name="address" 
                        placeholder="123 Main Street" 
                        required 
                        className="h-10 pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        placeholder="City" 
                        required 
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        placeholder="State" 
                        required 
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-sm font-medium">ZIP Code *</Label>
                      <Input 
                        id="zip" 
                        name="zip" 
                        placeholder="12345" 
                        required 
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">Country *</Label>
                    <Input 
                      id="country" 
                      name="country" 
                      placeholder="Country" 
                      defaultValue="United States" 
                      required 
                      className="h-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="border-fixlyfy/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4 text-fixlyfy" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                    <Textarea 
                      id="notes" 
                      name="notes"
                      placeholder="Add any additional notes about this client..."
                      className="resize-none min-h-[80px]"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

            </div>
          </ScrollArea>
          
          <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-fixlyfy-bg-interface/50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isSubmitting}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isCheckingDuplicates}
                className="w-full sm:w-auto bg-fixlyfy hover:bg-fixlyfy/90 order-1 sm:order-2"
              >
                {isCheckingDuplicates ? "Checking..." : isSubmitting ? "Adding Client..." : "Add Client"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Duplicate Warning Dialog */}
      <AlertDialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Possible Duplicate Client
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>We found existing clients with similar contact information:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {duplicates.map((client) => (
                    <div key={client.id} className="p-2 bg-muted rounded-md text-sm">
                      <div className="font-medium">{client.name}</div>
                      {client.phone && <div className="text-muted-foreground">{client.phone}</div>}
                      {client.email && <div className="text-muted-foreground">{client.email}</div>}
                      {client.address && <div className="text-muted-foreground text-xs">{client.address}</div>}
                    </div>
                  ))}
                </div>
                <p className="text-sm">Do you want to create a new client anyway?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDuplicate}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProceedAnyway} className="bg-amber-600 hover:bg-amber-700">
              Create Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
