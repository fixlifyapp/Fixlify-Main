import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Building, Home, Users, Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RoleBadge, PaysBadge, CopyBadge } from "@/components/documents/shared/RoleBadge";
import { normalizeRole, getRoleStyles } from "@/lib/document-design-tokens";
import { cn } from "@/lib/utils";

export interface BillToOption {
  id: string;
  type: "client" | "landlord" | "tenant" | "property_contact";
  label: string;
  name: string;
  company?: string;
  address?: string;
  email?: string;
  phone?: string;
  clientType?: string;
  isBillingContact?: boolean;
  receivesInvoices?: boolean;
  canApproveWork?: boolean;
}

interface BillToSelectorProps {
  jobId?: string;
  clientId?: string;
  propertyId?: string;
  currentClient?: {
    id: string;
    name: string;
    company?: string;
    type?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    email?: string;
    phone?: string;
  };
  onSelect: (option: BillToOption) => void;
  onCCChange?: (ccRecipients: BillToOption[]) => void;
  initialSelection?: BillToOption;
  initialCC?: BillToOption[];
  disabled?: boolean;
  showCCOption?: boolean;
}

export const BillToSelector = ({
  jobId,
  clientId,
  propertyId,
  currentClient,
  onSelect,
  onCCChange,
  initialSelection,
  initialCC = [],
  disabled = false,
  showCCOption = true
}: BillToSelectorProps) => {
  const [options, setOptions] = useState<BillToOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>(initialSelection?.id || "");
  const [ccRecipients, setCCRecipients] = useState<string[]>(initialCC.map(cc => cc.id));
  const [isLoading, setIsLoading] = useState(false);

  // Build full address from client
  const buildAddress = (client: any) => {
    const parts = [
      client.address,
      client.city,
      client.state,
      client.zip
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Fetch property contacts and build options
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      const allOptions: BillToOption[] = [];

      // 1. Add main client as default option
      if (currentClient) {
        allOptions.push({
          id: `client-${currentClient.id}`,
          type: "client",
          label: currentClient.type ? `${currentClient.type}` : "Client",
          name: currentClient.name,
          company: currentClient.company || undefined,
          address: buildAddress(currentClient),
          email: currentClient.email || undefined,
          phone: currentClient.phone || undefined,
          clientType: currentClient.type || undefined
        });

        // If client has a specific type, create a typed option
        if (currentClient.type === "Landlord") {
          allOptions[0].type = "landlord";
          allOptions[0].label = "Landlord";
        } else if (currentClient.type === "Tenant") {
          allOptions[0].type = "tenant";
          allOptions[0].label = "Tenant";
        }
      }

      // 2. Fetch property contacts if we have a property
      if (propertyId) {
        const { data: propertyContacts, error } = await supabase
          .from("property_contacts")
          .select(`
            id,
            role,
            is_billing_contact,
            is_primary_contact,
            clients!inner (
              id,
              name,
              company,
              type,
              address,
              city,
              state,
              zip,
              email,
              phone
            )
          `)
          .eq("property_id", propertyId);

        if (!error && propertyContacts) {
          propertyContacts.forEach((contact: any) => {
            const client = contact.clients;

            // Skip if this is the same as our main client
            if (clientId && client.id === clientId) {
              // But update the main client option if this is billing contact
              if (contact.is_billing_contact) {
                const mainIdx = allOptions.findIndex(o => o.id === `client-${clientId}`);
                if (mainIdx >= 0) {
                  allOptions[mainIdx].label = `${allOptions[mainIdx].label} (Billing)`;
                }
              }
              return;
            }

            // Add property contact as option
            const option: BillToOption = {
              id: `contact-${contact.id}`,
              type: "property_contact",
              label: contact.role || "Property Contact",
              name: client.name,
              company: client.company || undefined,
              address: buildAddress(client),
              email: client.email || undefined,
              phone: client.phone || undefined,
              clientType: client.type || undefined
            };

            // Determine type based on role or client type
            if (contact.role === "Landlord" || client.type === "Landlord") {
              option.type = "landlord";
              option.label = "Landlord";
            } else if (contact.role === "Tenant" || client.type === "Tenant") {
              option.type = "tenant";
              option.label = "Tenant";
            }

            if (contact.is_billing_contact) {
              option.label = `${option.label} (Billing)`;
            }

            allOptions.push(option);
          });
        }
      }

      setOptions(allOptions);

      // Smart default selection
      if (!selectedId && allOptions.length > 0) {
        let defaultOption = allOptions[0];

        // Priority 1: Property contact with is_billing_contact = true
        const billingContact = allOptions.find(o =>
          o.label.includes("(Billing)") && o.type === "property_contact"
        );
        if (billingContact) {
          defaultOption = billingContact;
        }
        // Priority 2: Landlord type (property owner)
        else {
          const landlord = allOptions.find(o => o.type === "landlord");
          if (landlord) {
            defaultOption = landlord;
          }
        }

        setSelectedId(defaultOption.id);
        onSelect(defaultOption);
      }

      setIsLoading(false);
    };

    fetchOptions();
  }, [clientId, propertyId, currentClient]);

  // Handle selection change
  const handleSelect = (value: string) => {
    setSelectedId(value);
    const selected = options.find(o => o.id === value);
    if (selected) {
      onSelect(selected);
    }
    // Remove from CC if it was selected as primary
    if (ccRecipients.includes(value)) {
      const newCC = ccRecipients.filter(id => id !== value);
      setCCRecipients(newCC);
      if (onCCChange) {
        onCCChange(options.filter(o => newCC.includes(o.id)));
      }
    }
  };

  // Handle CC recipient toggle
  const handleCCToggle = (optionId: string, checked: boolean) => {
    let newCC: string[];
    if (checked) {
      newCC = [...ccRecipients, optionId];
    } else {
      newCC = ccRecipients.filter(id => id !== optionId);
    }
    setCCRecipients(newCC);
    if (onCCChange) {
      onCCChange(options.filter(o => newCC.includes(o.id)));
    }
  };

  // Get icon based on type
  const getTypeIcon = (type: BillToOption["type"]) => {
    const normalizedType = normalizeRole(type);
    const styles = getRoleStyles(normalizedType);
    switch (type) {
      case "landlord":
        return <Building className={cn("h-4 w-4", styles.text)} />;
      case "tenant":
        return <Home className={cn("h-4 w-4", styles.text)} />;
      case "property_contact":
        return <Users className={cn("h-4 w-4", styles.text)} />;
      default:
        return <User className="h-4 w-4 text-slate-500" />;
    }
  };

  const selectedOption = useMemo(() =>
    options.find(o => o.id === selectedId),
    [options, selectedId]
  );

  // Get available CC options (all options except the selected primary)
  const ccOptions = useMemo(() =>
    options.filter(o => o.id !== selectedId && o.email),
    [options, selectedId]
  );

  if (options.length <= 1) {
    // Don't show selector if there's only one option
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Primary Bill To Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Bill To
          </Label>
          <PaysBadge />
        </div>
        <Select
          value={selectedId}
          onValueChange={handleSelect}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select recipient"}>
              {selectedOption && (
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedOption.type)}
                  <span className="truncate font-medium">{selectedOption.name}</span>
                  <RoleBadge role={selectedOption.type} size="sm" />
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => {
              const normalizedType = normalizeRole(option.type);
              const styles = getRoleStyles(normalizedType);
              return (
                <SelectItem key={option.id} value={option.id}>
                  <div className={cn(
                    "flex items-center gap-2 py-1.5 px-1 rounded-md -mx-1",
                    option.isBillingContact && styles.lightBg
                  )}>
                    {getTypeIcon(option.type)}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{option.name}</span>
                        <RoleBadge role={option.type} size="sm" showLabel={false} />
                        {option.isBillingContact && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      {option.company && (
                        <span className="text-xs text-muted-foreground truncate">{option.company}</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Show selected contact details in a card */}
        {selectedOption && (
          <div className="rounded-lg border bg-card p-3 space-y-1.5">
            {selectedOption.company && (
              <p className="font-medium text-sm">{selectedOption.company}</p>
            )}
            {selectedOption.address && (
              <p className="text-sm text-muted-foreground">{selectedOption.address}</p>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {selectedOption.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {selectedOption.email}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CC Recipients Section */}
      {showCCOption && ccOptions.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Send Copy To
            </Label>
            <CopyBadge />
          </div>
          <div className="space-y-2">
            {ccOptions.map((option) => {
              const isChecked = ccRecipients.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors",
                    isChecked
                      ? "bg-slate-50 border-slate-300"
                      : "bg-card hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCCToggle(option.id, checked as boolean)}
                    disabled={disabled}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getTypeIcon(option.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{option.name}</span>
                        <RoleBadge role={option.type} size="sm" showLabel={false} />
                      </div>
                      {option.email && (
                        <p className="text-xs text-muted-foreground truncate">{option.email}</p>
                      )}
                    </div>
                  </div>
                  {isChecked && (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                </label>
              );
            })}
          </div>
          {ccRecipients.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {ccRecipients.length} recipient{ccRecipients.length !== 1 ? 's' : ''} will receive a copy
            </p>
          )}
        </div>
      )}
    </div>
  );
};
