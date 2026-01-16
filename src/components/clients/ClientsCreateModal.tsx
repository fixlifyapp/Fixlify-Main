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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClientsOptimized } from "@/hooks/useClientsOptimized";
import type { Client } from "@/types/core/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User, Phone, Mail, MapPin, Building2, FileText, AlertTriangle,
  Plus, Home, ChevronDown, Users
} from "lucide-react";
import { formatPhoneForTelnyx } from "@/utils/phoneUtils";
import { AddressAutocomplete, type AddressData } from "@/components/shared/AddressAutocomplete";
import { AddressPreviewCard } from "@/components/shared/AddressPreviewCard";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ClientsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: Client) => void;
}

interface PropertyFormData {
  property_name: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  is_billing_contact?: boolean;
  can_approve_work?: boolean;
}

export const ClientsCreateModal = ({ open, onOpenChange, onSuccess }: ClientsCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState<Client[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingClientData, setPendingClientData] = useState<Record<string, any> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { addClient, checkForDuplicates } = useClientsOptimized();

  // Form state
  const [clientType, setClientType] = useState<string>('residential');
  const [status, setStatus] = useState<string>('active');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Address state (from autocomplete)
  const [addressData, setAddressData] = useState<AddressData | null>(null);

  // Property creation state
  const [showPropertySection, setShowPropertySection] = useState(false);
  const [useBillingAddress, setUseBillingAddress] = useState(true);
  const [propertyData, setPropertyData] = useState<PropertyFormData>({
    property_name: '',
    property_type: 'Residential',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const resetForm = () => {
    setClientType('residential');
    setStatus('active');
    setName('');
    setPhone('');
    setAltPhone('');
    setEmail('');
    setNotes('');
    setAddressData(null);
    setShowPropertySection(false);
    setUseBillingAddress(true);
    setPropertyData({
      property_name: '',
      property_type: 'Residential',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    });
    setPendingClientData(null);
    setDuplicates([]);
  };

  const handleAddressSelect = (data: AddressData) => {
    setAddressData(data);
  };

  const handlePropertyAddressSelect = (data: AddressData) => {
    setPropertyData(prev => ({
      ...prev,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      formatted_address: data.formatted_address,
    }));
  };

  const createClient = async (clientData: Record<string, any>) => {
    try {
      const newClient = await addClient(clientData);

      // If property section is expanded and we have property data, create property
      if (showPropertySection && newClient) {
        await createPropertyForClient(newClient.id);
      }

      onOpenChange(false);
      toast.success("Client added successfully");

      if (onSuccess && newClient) {
        onSuccess(newClient);
      }

      resetForm();

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

  const createPropertyForClient = async (clientId: string) => {
    try {
      // Determine address to use
      const propAddress = useBillingAddress ? addressData : {
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zip: propertyData.zip,
        country: propertyData.country,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        formatted_address: propertyData.formatted_address,
      };

      if (!propAddress?.address) {
        return; // No address to create property with
      }

      const propertyName = propertyData.property_name || propAddress.address || 'Primary Location';

      const { data: property, error: propertyError } = await supabase
        .from('client_properties')
        .insert({
          client_id: clientId,
          property_name: propertyName,
          property_type: propertyData.property_type || 'Residential',
          address: propAddress.address,
          city: propAddress.city,
          state: propAddress.state,
          zip: propAddress.zip,
          country: propAddress.country,
          latitude: propAddress.latitude,
          longitude: propAddress.longitude,
          formatted_address: propAddress.formatted_address,
          geocoded_at: propAddress.latitude ? new Date().toISOString() : null,
          is_primary: true,
          // Tenant info directly on property
          tenant_name: propertyData.tenant_name || null,
          tenant_phone: propertyData.tenant_phone || null,
          tenant_email: propertyData.tenant_email || null,
        })
        .select()
        .single();

      if (propertyError) {
        console.error("Error creating property:", propertyError);
        toast.error("Client created but property creation failed");
        return;
      }

      // If tenant info provided for property manager, create property_contact
      if (clientType === 'property-manager' && propertyData.tenant_name && property) {
        // First, create tenant as a client (or link existing)
        // For now, just record in property_contacts with the owner client
        const { error: contactError } = await supabase
          .from('property_contacts')
          .insert({
            property_id: property.id,
            client_id: clientId,
            role: 'owner',
            is_billing_contact: !propertyData.is_billing_contact,
            is_primary_contact: true,
            receives_invoices: true,
            receives_estimates: true,
            can_approve_work: !propertyData.can_approve_work,
          });

        if (contactError) {
          console.error("Error creating property contact:", contactError);
        }
      }

      toast.success("Property added successfully");
    } catch (error) {
      console.error("Error in createPropertyForClient:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isCheckingDuplicates) return;

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
      name: name.trim(),
      phone: formattedPhone,
      email: email.trim() || null,
      address: addressData?.address || null,
      city: addressData?.city || null,
      state: addressData?.state || null,
      zip: addressData?.zip || null,
      country: addressData?.country || 'Canada',
      type: clientType,
      status: status,
      notes: notes.trim() || null,
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

  // Get label based on client type
  const getNameLabel = () => {
    switch (clientType) {
      case 'commercial':
        return 'Business Name';
      case 'property-manager':
        return 'Company Name';
      default:
        return 'Full Name';
    }
  };

  const getNamePlaceholder = () => {
    switch (clientType) {
      case 'commercial':
        return 'Enter business name';
      case 'property-manager':
        return 'Enter property management company name';
      default:
        return 'Enter full name';
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
            Fill in the details below. Phone number is required for messaging.
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
                      <Select value={clientType} onValueChange={setClientType}>
                        <SelectTrigger id="clientType" className="h-10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">
                            <span className="flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              Residential
                            </span>
                          </SelectItem>
                          <SelectItem value="commercial">
                            <span className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              Commercial
                            </span>
                          </SelectItem>
                          <SelectItem value="property-manager">
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Property Manager
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {clientType === 'property-manager' && (
                        <p className="text-xs text-muted-foreground">
                          Property managers can have multiple properties with tenants
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                      <Select value={status} onValueChange={setStatus}>
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
                    {clientType === 'commercial' ? 'Business Details' :
                     clientType === 'property-manager' ? 'Company Details' : 'Personal Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">{getNameLabel()} *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={getNamePlaceholder()}
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
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
                          value={altPhone}
                          onChange={(e) => setAltPhone(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="client@example.com"
                        className="h-10 pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information - Now with Autocomplete */}
              <Card className="border-fixlyfy/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-fixlyfy" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Address *</Label>
                    <AddressAutocomplete
                      placeholder="Start typing address..."
                      onSelect={handleAddressSelect}
                      autoGeocode
                    />
                    <p className="text-xs text-muted-foreground">
                      Type to search - address will be verified automatically
                    </p>
                  </div>

                  {/* Address Preview */}
                  {addressData && (
                    <AddressPreviewCard
                      address={addressData}
                      showGeocodeStatus
                    />
                  )}
                </CardContent>
              </Card>

              {/* Optional Property Creation Section */}
              <Card className="border-fixlyfy/20">
                <Collapsible open={showPropertySection} onOpenChange={setShowPropertySection}>
                  <CardHeader className="pb-3">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        type="button"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent"
                      >
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Plus className="h-4 w-4 text-fixlyfy" />
                          Add Service Location (Optional)
                        </CardTitle>
                        <ChevronDown className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          showPropertySection && "rotate-180"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                    {!showPropertySection && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Add a service location now or do it later
                      </p>
                    )}
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {/* Use Billing Address Checkbox */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useBillingAddress"
                          checked={useBillingAddress}
                          onCheckedChange={(checked) => setUseBillingAddress(checked === true)}
                        />
                        <Label htmlFor="useBillingAddress" className="text-sm">
                          Same as billing address
                        </Label>
                      </div>

                      {/* Property Name & Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="propertyName" className="text-sm font-medium">
                            Property Name
                          </Label>
                          <Input
                            id="propertyName"
                            value={propertyData.property_name}
                            onChange={(e) => setPropertyData(prev => ({
                              ...prev,
                              property_name: e.target.value
                            }))}
                            placeholder="e.g., Home, Main Office"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="propertyType" className="text-sm font-medium">
                            Property Type
                          </Label>
                          <Select
                            value={propertyData.property_type}
                            onValueChange={(value) => setPropertyData(prev => ({
                              ...prev,
                              property_type: value
                            }))}
                          >
                            <SelectTrigger id="propertyType" className="h-10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Residential">Residential</SelectItem>
                              <SelectItem value="Commercial">Commercial</SelectItem>
                              <SelectItem value="Industrial">Industrial</SelectItem>
                              <SelectItem value="Office">Office</SelectItem>
                              <SelectItem value="Retail">Retail</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Different Address Input (if not using billing) */}
                      {!useBillingAddress && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Property Address</Label>
                          <AddressAutocomplete
                            placeholder="Start typing address..."
                            onSelect={handlePropertyAddressSelect}
                            autoGeocode
                          />
                          {propertyData.address && (
                            <AddressPreviewCard
                              address={propertyData}
                              showGeocodeStatus
                              compact
                            />
                          )}
                        </div>
                      )}

                      {/* Tenant Info Section - Only for Property Managers */}
                      {clientType === 'property-manager' && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-fixlyfy" />
                            Tenant Information (Optional)
                          </h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="tenantName" className="text-sm">Tenant Name</Label>
                              <Input
                                id="tenantName"
                                value={propertyData.tenant_name || ''}
                                onChange={(e) => setPropertyData(prev => ({
                                  ...prev,
                                  tenant_name: e.target.value
                                }))}
                                placeholder="Tenant's full name"
                                className="h-10"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="tenantPhone" className="text-sm">Tenant Phone</Label>
                                <Input
                                  id="tenantPhone"
                                  value={propertyData.tenant_phone || ''}
                                  onChange={(e) => setPropertyData(prev => ({
                                    ...prev,
                                    tenant_phone: e.target.value
                                  }))}
                                  placeholder="Phone number"
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="tenantEmail" className="text-sm">Tenant Email</Label>
                                <Input
                                  id="tenantEmail"
                                  value={propertyData.tenant_email || ''}
                                  onChange={(e) => setPropertyData(prev => ({
                                    ...prev,
                                    tenant_email: e.target.value
                                  }))}
                                  placeholder="Email address"
                                  className="h-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="tenantBilling"
                                  checked={propertyData.is_billing_contact || false}
                                  onCheckedChange={(checked) => setPropertyData(prev => ({
                                    ...prev,
                                    is_billing_contact: checked === true
                                  }))}
                                />
                                <Label htmlFor="tenantBilling" className="text-sm">
                                  Tenant receives billing (invoices)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="tenantApprove"
                                  checked={propertyData.can_approve_work || false}
                                  onCheckedChange={(checked) => setPropertyData(prev => ({
                                    ...prev,
                                    can_approve_work: checked === true
                                  }))}
                                />
                                <Label htmlFor="tenantApprove" className="text-sm">
                                  Tenant can approve work
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
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
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
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
                type="button"
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
