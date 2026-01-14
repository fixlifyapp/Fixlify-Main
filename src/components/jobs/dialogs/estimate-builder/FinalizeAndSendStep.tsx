import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Send,
  ChevronDown,
  Shield,
  FileText,
  Mail,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpsellSettings } from "@/hooks/useUpsellSettings";
import { useUpsellAnalytics } from "@/hooks/useUpsellAnalytics";
import { useDocumentSending } from "@/hooks/useDocumentSending";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { needsCountryCode, suggestCountryCode } from "@/utils/phoneUtils";
import { sanitizeInput } from "@/utils/security";

interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
  isAutoAdded?: boolean;
  costPrice?: number;
  isTopSeller?: boolean;
  conversionHint?: string;
}

interface FinalizeAndSendStepProps {
  documentId: string;
  documentNumber: string;
  documentTotal: number;
  onBack: () => void;
  onSuccess: () => void;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  jobContext?: {
    job_type?: string;
    service_category?: string;
    job_value?: number;
    client_history?: any;
    estimateId?: string;
  };
  existingNotes?: string;
}

export const FinalizeAndSendStep = ({
  documentId,
  documentNumber,
  documentTotal,
  onBack,
  onSuccess,
  contactInfo,
  jobContext,
  existingNotes = ""
}: FinalizeAndSendStepProps) => {
  // Warranty state
  const [warrantiesOpen, setWarrantiesOpen] = useState(false);
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([]);
  const [isSavingWarranty, setIsSavingWarranty] = useState(false);
  const autoSelectApplied = useRef(false);
  const shownTracked = useRef(false);

  // Notes state
  const [notes, setNotes] = useState(existingNotes);

  // Send state
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [validationError, setValidationError] = useState("");

  // Hooks - use admin-configured upsell products, not hardcoded "Warranty" category
  const { config, getProductsForAmount, isLoading: isLoadingConfig } = useUpsellSettings();
  const { trackEvent } = useUpsellAnalytics();
  const { sendDocument, isProcessing: isSending } = useDocumentSending();

  // Initialize send destination based on contact info
  useEffect(() => {
    if (sendMethod === "email" && contactInfo.email) {
      setSendTo(contactInfo.email);
    } else if (sendMethod === "sms" && contactInfo.phone) {
      setSendTo(contactInfo.phone);
    } else {
      setSendTo("");
    }
    setValidationError("");
  }, [sendMethod, contactInfo]);

  // Get upsell products based on document total (uses conditional rules if configured)
  const upsellProducts = getProductsForAmount(documentTotal, 'estimates');

  // Convert admin-configured upsell products to upsell items
  // Preserve existing selection state when products are reloaded
  useEffect(() => {
    setUpsellItems(prevItems => {
      const prevSelections = new Map(prevItems.map(item => [item.id, item]));

      return upsellProducts.map(product => {
        const existing = prevSelections.get(product.id);
        return {
          id: product.id,
          title: product.name,
          description: product.description || "",
          price: product.price,
          icon: Shield,
          selected: existing?.selected ?? false,
          isAutoAdded: existing?.isAutoAdded ?? false
        };
      });
    });
  }, [upsellProducts]);

  // Track "shown" events when upsell products are first displayed
  useEffect(() => {
    if (
      shownTracked.current ||
      !documentId ||
      upsellItems.length === 0 ||
      isLoadingConfig ||
      !warrantiesOpen
    ) {
      return;
    }

    shownTracked.current = true;

    upsellItems.forEach(item => {
      trackEvent({
        documentType: 'estimate',
        documentId,
        productId: item.id,
        productName: item.title,
        productPrice: item.price,
        eventType: 'shown',
        jobType: jobContext?.job_type,
        clientId: jobContext?.client_history?.id
      });
    });
  }, [documentId, upsellItems, isLoadingConfig, warrantiesOpen, trackEvent, jobContext]);

  // Auto-select products based on admin configuration
  // Uses upsellProducts (from getProductsForAmount) to respect conditional rules
  useEffect(() => {
    if (
      autoSelectApplied.current ||
      isLoadingConfig ||
      !config?.estimates?.auto_select ||
      upsellProducts.length === 0 ||
      upsellItems.length === 0 ||
      !documentId
    ) {
      return;
    }

    autoSelectApplied.current = true;

    // Use upsellProducts (filtered by conditional rules) for auto-select
    const autoSelectProductIds = upsellProducts.map(p => p.id);
    const itemsToAutoAdd = upsellItems.filter(
      item => autoSelectProductIds.includes(item.id) && !item.selected
    );

    if (itemsToAutoAdd.length === 0) return;

    const autoAddProducts = async () => {
      setIsSavingWarranty(true);
      const newAutoAddedIds = new Set<string>();

      try {
        for (const item of itemsToAutoAdd) {
          const { error: lineItemError } = await supabase
            .from('line_items')
            .insert({
              parent_id: documentId,
              parent_type: 'estimate',
              description: item.title + (item.description ? ` - ${item.description}` : ''),
              quantity: 1,
              unit_price: item.price,
              taxable: false
            });

          if (!lineItemError) {
            newAutoAddedIds.add(item.id);
          }
        }

        if (newAutoAddedIds.size > 0) {
          setUpsellItems(prev => prev.map(item => ({
            ...item,
            selected: newAutoAddedIds.has(item.id) ? true : item.selected,
            isAutoAdded: newAutoAddedIds.has(item.id)
          })));

          // Open warranties section to show auto-added items
          setWarrantiesOpen(true);
          toast.success(`${newAutoAddedIds.size} product(s) auto-added`);
        }
      } catch (error) {
        console.error('Error auto-adding products:', error);
      } finally {
        setIsSavingWarranty(false);
      }
    };

    autoAddProducts();
  }, [config, upsellProducts, upsellItems, documentId, isLoadingConfig]);

  const handleWarrantyToggle = async (itemId: string) => {
    if (isSavingWarranty || isSending) return;

    const item = upsellItems.find(item => item.id === itemId);
    if (!item || !documentId) {
      toast.error("Unable to save warranty - missing information");
      return;
    }

    const newSelectedState = !item.selected;

    // Optimistic update
    setUpsellItems(prev => prev.map(upsellItem =>
      upsellItem.id === itemId ? { ...upsellItem, selected: newSelectedState } : upsellItem
    ));

    setIsSavingWarranty(true);

    try {
      if (newSelectedState) {
        const { error: lineItemError } = await supabase
          .from('line_items')
          .insert({
            parent_id: documentId,
            parent_type: 'estimate',
            description: item.title + (item.description ? ` - ${item.description}` : ''),
            quantity: 1,
            unit_price: item.price,
            taxable: false
          });

        if (lineItemError) {
          setUpsellItems(prev => prev.map(upsellItem =>
            upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
          ));
          toast.error(`Failed to add ${item.title}`);
          return;
        }

        trackEvent({
          documentType: 'estimate',
          documentId,
          productId: item.id,
          productName: item.title,
          productPrice: item.price,
          eventType: 'accepted',
          jobType: jobContext?.job_type,
          clientId: jobContext?.client_history?.id
        });

        toast.success(`${item.title} added`);
      } else {
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', documentId)
          .eq('parent_type', 'estimate')
          .eq('description', item.title + (item.description ? ` - ${item.description}` : ''));

        if (deleteError) {
          setUpsellItems(prev => prev.map(upsellItem =>
            upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
          ));
          toast.error(`Failed to remove ${item.title}`);
          return;
        }

        trackEvent({
          documentType: 'estimate',
          documentId,
          productId: item.id,
          productName: item.title,
          productPrice: item.price,
          eventType: 'removed',
          jobType: jobContext?.job_type,
          clientId: jobContext?.client_history?.id
        });

        toast.success(`${item.title} removed`);
      }
    } catch (error) {
      console.error('Error toggling warranty:', error);
      setUpsellItems(prev => prev.map(upsellItem =>
        upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
      ));
      toast.error('Failed to update warranty');
    } finally {
      setIsSavingWarranty(false);
    }
  };

  const handleNotesChange = (value: string) => {
    const sanitizedNotes = sanitizeInput(value, 2000);
    setNotes(sanitizedNotes);
  };

  // Validation
  const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const validateInput = (): boolean => {
    if (!sendTo.trim()) {
      setValidationError(`Please enter ${sendMethod === "email" ? "an email address" : "a phone number"}`);
      return false;
    }

    if (sendMethod === "email" && !isValidEmail(sendTo)) {
      setValidationError("Please enter a valid email address");
      return false;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
      setValidationError("Please enter a valid phone number (10-15 digits)");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSend = async () => {
    if (!validateInput()) return;

    try {
      // Save notes if any
      if (notes.trim() && documentId) {
        const { error: notesError } = await supabase
          .from('estimates')
          .update({ notes: notes.trim() })
          .eq('id', documentId);

        if (notesError) {
          console.error('Error saving notes:', notesError);
        }
      }

      // Send document
      const result = await sendDocument({
        documentType: 'estimate',
        documentId,
        sendMethod,
        sendTo,
        contactInfo
      });

      if (result.success) {
        toast.success(`Estimate sent successfully via ${sendMethod === 'email' ? 'email' : 'SMS'}!`);
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate');
    }
  };

  // Calculate totals
  const selectedUpsells = upsellItems.filter(item => item.selected);
  const upsellTotal = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = documentTotal + upsellTotal;

  const hasValidEmail = contactInfo.email && isValidEmail(contactInfo.email);
  const hasValidPhone = contactInfo.phone && isValidPhoneNumber(contactInfo.phone);
  const hasUpsellProducts = upsellProducts.length > 0;

  const isProcessing = isSending || isSavingWarranty;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">Finalize & Send</h3>
        <p className="text-sm text-muted-foreground">Add optional extras and send to your client</p>
      </div>

      {/* Upsell Products Section - Collapsible */}
      {hasUpsellProducts && (
        <Collapsible open={warrantiesOpen} onOpenChange={setWarrantiesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-auto py-3 px-4",
                warrantiesOpen && "border-violet-300 bg-violet-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-full p-2",
                  warrantiesOpen ? "bg-violet-200" : "bg-slate-100"
                )}>
                  <Shield className={cn(
                    "h-4 w-4",
                    warrantiesOpen ? "text-violet-600" : "text-slate-500"
                  )} />
                </div>
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    Recommended Products
                    {selectedUpsells.length > 0 && (
                      <Badge className="bg-emerald-500 text-white">
                        {selectedUpsells.length} added • +${upsellTotal.toFixed(0)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {upsellProducts.length} options available
                  </div>
                </div>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                warrantiesOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <Card className="border-violet-200 bg-violet-50/50">
              <CardContent className="p-3 space-y-2">
                {isLoadingConfig ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
                  </div>
                ) : (
                  upsellItems.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        item.selected
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-violet-200"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Shield className={cn(
                          "h-4 w-4 flex-shrink-0",
                          item.selected ? "text-emerald-600" : "text-slate-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{item.title}</span>
                            {item.isAutoAdded && (
                              <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-violet-100 text-violet-700">
                                <Zap className="h-2.5 w-2.5 mr-0.5" />
                                Auto
                              </Badge>
                            )}
                          </div>
                          <span className={cn(
                            "text-sm font-semibold",
                            item.selected ? "text-emerald-600" : "text-slate-600"
                          )}>
                            +${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={item.selected}
                        onCheckedChange={() => handleWarrantyToggle(item.id)}
                        disabled={isProcessing}
                        className={cn(item.selected && "data-[state=checked]:bg-emerald-600")}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Notes Section - Collapsible */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-slate-100">
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-left">
                <div className="font-medium">Add Notes</div>
                <div className="text-xs text-muted-foreground">
                  {notes.trim() ? `${notes.length} characters` : "Optional instructions"}
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add special notes or instructions for the client..."
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{notes.length}/2000</p>
        </CollapsibleContent>
      </Collapsible>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-slate-50 to-violet-50 border-violet-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base Estimate</span>
            <span className="font-medium">${documentTotal.toFixed(2)}</span>
          </div>
          {upsellTotal > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Add-ons ({selectedUpsells.length})
              </span>
              <span className="font-medium text-emerald-600">+${upsellTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-violet-600">${grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Send Section - Inline */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 font-medium text-blue-900">
            <Send className="h-4 w-4" />
            Send Estimate #{documentNumber}
          </div>

          {/* Send Method */}
          <RadioGroup value={sendMethod} onValueChange={(v) => setSendMethod(v as "email" | "sms")} className="grid grid-cols-2 gap-3">
            <div className={cn(
              "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
              sendMethod === "email" ? "border-blue-400 bg-white" : "border-slate-200 bg-slate-50/50",
              !hasValidEmail && "opacity-50"
            )}>
              <RadioGroupItem value="email" id="email" disabled={!hasValidEmail && !sendTo} />
              <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer text-sm">
                <Mail className="h-4 w-4" />
                Email
              </Label>
            </div>
            <div className={cn(
              "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all",
              sendMethod === "sms" ? "border-blue-400 bg-white" : "border-slate-200 bg-slate-50/50",
              !hasValidPhone && "opacity-50"
            )}>
              <RadioGroupItem value="sms" id="sms" disabled={!hasValidPhone && !sendTo} />
              <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer text-sm">
                <MessageSquare className="h-4 w-4" />
                SMS
              </Label>
            </div>
          </RadioGroup>

          {/* Recipient */}
          <div className="space-y-2">
            <Label className="text-sm">{sendMethod === "email" ? "Email Address" : "Phone Number"}</Label>
            <Input
              type={sendMethod === "email" ? "email" : "tel"}
              placeholder={sendMethod === "email" ? "client@example.com" : "Phone number"}
              value={sendTo}
              onChange={(e) => {
                setSendTo(e.target.value);
                if (e.target.value.trim()) {
                  if (sendMethod === "email" && !isValidEmail(e.target.value)) {
                    setValidationError("Please enter a valid email address");
                  } else if (sendMethod === "sms" && !isValidPhoneNumber(e.target.value)) {
                    setValidationError("Please enter a valid phone number");
                  } else {
                    setValidationError("");
                  }
                } else {
                  setValidationError("");
                }
              }}
              className={cn(validationError && "border-red-500")}
            />
            {validationError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError}
              </p>
            )}
            {sendMethod === "sms" && sendTo && needsCountryCode(sendTo) && (
              <p className="text-xs text-amber-600">{suggestCountryCode(sendTo)}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="text-xs text-muted-foreground bg-white/50 rounded p-2">
            Sending to: <strong>{contactInfo.name}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
        <Button
          onClick={handleSend}
          disabled={isProcessing || !sendTo.trim() || !!validationError}
          className="gap-2 bg-violet-600 hover:bg-violet-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isSending ? "Sending..." : "Processing..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Estimate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
