import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients, Client } from "@/hooks/useClients";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Building2, FileText } from "lucide-react";

interface ClientsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: Client) => void;
}

export const ClientsCreateModal = ({ open, onOpenChange, onSuccess }: ClientsCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addClient } = useClients();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get('name') as string;
      const phone = formData.get('phone') as string;
      
      // Ensure we have the required name field
      if (!name || name.trim() === '') {
        toast.error("Client name is required");
        setIsSubmitting(false);
        return;
      }
      
      // Ensure we have phone number for messaging
      if (!phone || phone.trim() === '') {
        toast.error("Phone number is required for messaging and communication");
        setIsSubmitting(false);
        return;
      }
      
      // Create client data with required name and phone fields and optional fields
      const clientData = {
        name,
        phone,
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
      
      const newClient = await addClient(clientData);
      
      onOpenChange(false);
      toast.success("Client added successfully");
      
      // Call the onSuccess callback if provided
      if (onSuccess && newClient) {
        onSuccess(newClient);
      }
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      
      // Force a small delay to ensure database transaction is complete
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
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
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
                          placeholder="(555) 123-4567" 
                          required 
                          className="h-10 pl-10"
                        />
                      </div>
                      <p className="text-xs text-fixlyfy-text-secondary">Required for SMS messaging</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="altPhone" className="text-sm font-medium">Alternative Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fixlyfy-text-secondary" />
                        <Input 
                          id="altPhone" 
                          name="altPhone" 
                          placeholder="(555) 987-6543" 
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
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-fixlyfy hover:bg-fixlyfy/90 order-1 sm:order-2"
              >
                {isSubmitting ? "Adding Client..." : "Add Client"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
