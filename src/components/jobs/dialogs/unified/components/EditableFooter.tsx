import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  FileText,
  RotateCcw,
  Edit3,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOrganizationDocumentSettings,
  replaceTemplateVariables,
  TEMPLATE_VARIABLES
} from "@/hooks/useOrganizationDocumentSettings";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export interface FooterOverrides {
  thankYouMessage?: string;
  confidentialityText?: string;
  contactText?: string;
  showWebsite?: boolean;
  termsText?: string;
}

interface EditableFooterProps {
  documentType: "estimate" | "invoice";
  onChange: (overrides: FooterOverrides | undefined) => void;
  initialOverrides?: FooterOverrides;
}

export const EditableFooter = ({
  documentType,
  onChange,
  initialOverrides
}: EditableFooterProps) => {
  const { settings, isLoading } = useOrganizationDocumentSettings();
  const { companySettings } = useCompanySettings();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasCustomizations, setHasCustomizations] = useState(false);

  // Local form state
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [confidentialityText, setConfidentialityText] = useState("");
  const [contactText, setContactText] = useState("");
  const [termsText, setTermsText] = useState("");
  const [showWebsite, setShowWebsite] = useState(true);

  // Initialize from settings when loaded
  useEffect(() => {
    if (!isLoading) {
      if (initialOverrides) {
        // Use existing overrides if provided
        setThankYouMessage(initialOverrides.thankYouMessage ?? settings.footer_thank_you_message);
        setConfidentialityText(initialOverrides.confidentialityText ?? settings.footer_confidentiality_text);
        setContactText(initialOverrides.contactText ?? settings.footer_contact_text);
        setTermsText(initialOverrides.termsText ?? (
          documentType === 'estimate'
            ? settings.estimate_terms_text
            : settings.invoice_payment_terms
        ));
        setShowWebsite(initialOverrides.showWebsite ?? settings.footer_show_website);
        setHasCustomizations(true);
      } else {
        // Use defaults from organization settings
        setThankYouMessage(settings.footer_thank_you_message);
        setConfidentialityText(settings.footer_confidentiality_text);
        setContactText(settings.footer_contact_text);
        setTermsText(
          documentType === 'estimate'
            ? settings.estimate_terms_text
            : settings.invoice_payment_terms
        );
        setShowWebsite(settings.footer_show_website);
        setHasCustomizations(false);
      }
    }
  }, [isLoading, settings, documentType, initialOverrides]);

  // Preview values for template substitution
  const previewValues = useMemo(() => ({
    company_name: companySettings?.company_name || 'Your Company',
    document_type: documentType,
    phone: companySettings?.company_phone || '(555) 123-4567',
    email: companySettings?.company_email || 'info@company.com',
    website: companySettings?.website || 'https://www.company.com',
    validity_days: settings.estimate_validity_days,
  }), [companySettings, documentType, settings.estimate_validity_days]);

  // Handle changes - detect if different from defaults
  const handleFieldChange = (field: string, value: string | boolean) => {
    let updated = false;

    switch (field) {
      case 'thankYouMessage':
        setThankYouMessage(value as string);
        updated = value !== settings.footer_thank_you_message;
        break;
      case 'confidentialityText':
        setConfidentialityText(value as string);
        updated = value !== settings.footer_confidentiality_text;
        break;
      case 'contactText':
        setContactText(value as string);
        updated = value !== settings.footer_contact_text;
        break;
      case 'termsText':
        setTermsText(value as string);
        updated = value !== (documentType === 'estimate' ? settings.estimate_terms_text : settings.invoice_payment_terms);
        break;
      case 'showWebsite':
        setShowWebsite(value as boolean);
        updated = value !== settings.footer_show_website;
        break;
    }

    // Check if any field has customizations
    const newHasCustomizations =
      thankYouMessage !== settings.footer_thank_you_message ||
      confidentialityText !== settings.footer_confidentiality_text ||
      contactText !== settings.footer_contact_text ||
      termsText !== (documentType === 'estimate' ? settings.estimate_terms_text : settings.invoice_payment_terms) ||
      showWebsite !== settings.footer_show_website ||
      updated;

    setHasCustomizations(newHasCustomizations);

    // Send overrides to parent
    if (newHasCustomizations) {
      onChange({
        thankYouMessage,
        confidentialityText,
        contactText,
        termsText,
        showWebsite,
        [field]: value
      });
    } else {
      onChange(undefined);
    }
  };

  // Reset to organization defaults
  const handleReset = () => {
    setThankYouMessage(settings.footer_thank_you_message);
    setConfidentialityText(settings.footer_confidentiality_text);
    setContactText(settings.footer_contact_text);
    setTermsText(
      documentType === 'estimate'
        ? settings.estimate_terms_text
        : settings.invoice_payment_terms
    );
    setShowWebsite(settings.footer_show_website);
    setHasCustomizations(false);
    onChange(undefined);
  };

  if (isLoading) {
    return null; // Or a skeleton loader
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between h-auto py-3 px-4",
            isOpen && "border-violet-300 bg-violet-50",
            hasCustomizations && !isOpen && "border-amber-300 bg-amber-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-full p-2",
              isOpen ? "bg-violet-200" : hasCustomizations ? "bg-amber-200" : "bg-slate-100"
            )}>
              <FileText className={cn(
                "h-4 w-4",
                isOpen ? "text-violet-600" : hasCustomizations ? "text-amber-600" : "text-slate-500"
              )} />
            </div>
            <div className="text-left">
              <div className="font-medium flex items-center gap-2">
                Customize Footer
                {hasCustomizations && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-amber-100 text-amber-700">
                    <Edit3 className="h-2.5 w-2.5 mr-0.5" />
                    Customized
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {hasCustomizations ? "Using custom footer for this document" : "Using organization defaults"}
              </div>
            </div>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-3">
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-4">
            {/* Edit/Preview Toggle */}
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 text-xs"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={!isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-7 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
              {hasCustomizations && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to Defaults
                </Button>
              )}
            </div>

            {isEditing ? (
              /* Edit Form */
              <div className="space-y-4">
                {/* Template Variables Info */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-blue-50 rounded-md">
                  <span className="text-[10px] text-blue-600 font-medium">Variables:</span>
                  {TEMPLATE_VARIABLES.slice(0, 4).map((v) => (
                    <Badge
                      key={v.key}
                      variant="secondary"
                      className="text-[10px] h-4 font-mono bg-white cursor-help"
                      title={v.example}
                    >
                      {v.key}
                    </Badge>
                  ))}
                </div>

                {/* Thank You Message */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Thank You Message</Label>
                  <Input
                    value={thankYouMessage}
                    onChange={(e) => handleFieldChange('thankYouMessage', e.target.value)}
                    placeholder="Thank you for choosing {{company_name}}!"
                    className="text-sm"
                  />
                </div>

                {/* Confidentiality Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Confidentiality Text</Label>
                  <Textarea
                    value={confidentialityText}
                    onChange={(e) => handleFieldChange('confidentialityText', e.target.value)}
                    placeholder="This {{document_type}} contains confidential information."
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Contact Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Contact Information</Label>
                  <Textarea
                    value={contactText}
                    onChange={(e) => handleFieldChange('contactText', e.target.value)}
                    placeholder="For questions, contact us at {{phone}} or {{email}}."
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Terms Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {documentType === 'estimate' ? 'Estimate Terms' : 'Payment Terms'}
                  </Label>
                  <Textarea
                    value={termsText}
                    onChange={(e) => handleFieldChange('termsText', e.target.value)}
                    placeholder={documentType === 'estimate'
                      ? "This estimate is valid for {{validity_days}} days."
                      : "Payment is due within 30 days."
                    }
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Show Website Toggle */}
                <div className="flex items-center justify-between py-2">
                  <Label className="text-xs font-medium">Show Website</Label>
                  <Switch
                    checked={showWebsite}
                    onCheckedChange={(checked) => handleFieldChange('showWebsite', checked)}
                  />
                </div>
              </div>
            ) : (
              /* Preview */
              <div className="bg-gray-50 rounded-lg border p-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-center space-y-3">
                    <h4 className="text-base font-semibold text-gray-900">
                      {replaceTemplateVariables(thankYouMessage, previewValues)}
                    </h4>
                    <div className="text-xs text-gray-600 space-y-1.5 max-w-md mx-auto">
                      <p>
                        {replaceTemplateVariables(confidentialityText, previewValues)}
                        {' '}
                        {replaceTemplateVariables(contactText, previewValues)}
                      </p>
                      <p className={cn(
                        "font-medium",
                        documentType === 'estimate' ? "text-blue-700" : "text-green-700"
                      )}>
                        {replaceTemplateVariables(termsText, previewValues)}
                      </p>
                    </div>
                    {showWebsite && previewValues.website && (
                      <p className="text-xs text-gray-500 pt-1">
                        Visit us at {previewValues.website}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
