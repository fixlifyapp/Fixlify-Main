import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  useOrganizationDocumentSettings,
  replaceTemplateVariables,
  TEMPLATE_VARIABLES,
  DEFAULT_DOCUMENT_SETTINGS
} from "@/hooks/useOrganizationDocumentSettings";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Eye,
  RotateCcw,
  Save,
  Info,
  Globe,
  Clock,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DocumentsConfig() {
  const { settings, isLoading, updateSettings, isUpdating, resetToDefaults, isResetting } = useOrganizationDocumentSettings();
  const { companySettings } = useCompanySettings();

  // Form state
  const [formData, setFormData] = useState({
    footer_thank_you_message: settings.footer_thank_you_message,
    footer_confidentiality_text: settings.footer_confidentiality_text,
    footer_contact_text: settings.footer_contact_text,
    footer_show_website: settings.footer_show_website,
    estimate_validity_days: settings.estimate_validity_days,
    estimate_terms_text: settings.estimate_terms_text,
    invoice_payment_terms: settings.invoice_payment_terms,
    invoice_late_fee_text: settings.invoice_late_fee_text || '',
    default_tax_rate: settings.default_tax_rate,
    show_company_logo: settings.show_company_logo,
  });

  // Section collapse states
  const [footerOpen, setFooterOpen] = useState(true);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  // Update form when settings load
  useEffect(() => {
    setFormData({
      footer_thank_you_message: settings.footer_thank_you_message,
      footer_confidentiality_text: settings.footer_confidentiality_text,
      footer_contact_text: settings.footer_contact_text,
      footer_show_website: settings.footer_show_website,
      estimate_validity_days: settings.estimate_validity_days,
      estimate_terms_text: settings.estimate_terms_text,
      invoice_payment_terms: settings.invoice_payment_terms,
      invoice_late_fee_text: settings.invoice_late_fee_text || '',
      default_tax_rate: settings.default_tax_rate,
      show_company_logo: settings.show_company_logo,
    });
    setHasChanges(false);
  }, [settings]);

  // Handle form changes
  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Preview values for template substitution
  const previewValues = useMemo(() => ({
    company_name: companySettings?.company_name || 'Your Company',
    document_type: 'estimate' as const,
    phone: companySettings?.company_phone || '(555) 123-4567',
    email: companySettings?.company_email || 'info@company.com',
    website: companySettings?.website || 'https://www.company.com',
    validity_days: formData.estimate_validity_days,
  }), [companySettings, formData.estimate_validity_days]);

  // Handle save
  const handleSave = () => {
    updateSettings({
      footer_thank_you_message: formData.footer_thank_you_message,
      footer_confidentiality_text: formData.footer_confidentiality_text,
      footer_contact_text: formData.footer_contact_text,
      footer_show_website: formData.footer_show_website,
      estimate_validity_days: formData.estimate_validity_days,
      estimate_terms_text: formData.estimate_terms_text,
      invoice_payment_terms: formData.invoice_payment_terms,
      invoice_late_fee_text: formData.invoice_late_fee_text || null,
      default_tax_rate: formData.default_tax_rate,
      show_company_logo: formData.show_company_logo,
    });
    setHasChanges(false);
  };

  // Handle reset
  const handleReset = () => {
    if (confirm('Reset all document settings to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Variables Reference */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
            <Info className="h-4 w-4" />
            Available Template Variables
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_VARIABLES.map((variable) => (
              <Badge
                key={variable.key}
                variant="secondary"
                className="font-mono text-xs cursor-help bg-white hover:bg-blue-50"
                title={`${variable.label}: ${variable.example}`}
              >
                {variable.key}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click to copy. These variables will be replaced with actual values when documents are generated.
          </p>
        </CardContent>
      </Card>

      {/* Footer Settings */}
      <Card>
        <Collapsible open={footerOpen} onOpenChange={setFooterOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {footerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <FileText className="h-5 w-5 text-violet-500" />
                  <CardTitle>Document Footer</CardTitle>
                </div>
                <Badge variant="outline">All Documents</Badge>
              </div>
              <CardDescription className="ml-9">
                Customize the footer that appears on all estimates and invoices
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="footer_thank_you">Thank You Message</Label>
                <Input
                  id="footer_thank_you"
                  value={formData.footer_thank_you_message}
                  onChange={(e) => handleChange('footer_thank_you_message', e.target.value)}
                  placeholder="Thank you for choosing {{company_name}}!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_confidentiality">Confidentiality Text</Label>
                <Textarea
                  id="footer_confidentiality"
                  value={formData.footer_confidentiality_text}
                  onChange={(e) => handleChange('footer_confidentiality_text', e.target.value)}
                  rows={2}
                  placeholder="This {{document_type}} contains confidential information."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_contact">Contact Information</Label>
                <Textarea
                  id="footer_contact"
                  value={formData.footer_contact_text}
                  onChange={(e) => handleChange('footer_contact_text', e.target.value)}
                  rows={2}
                  placeholder="For questions, contact us at {{phone}} or {{email}}."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="footer_show_website" className="cursor-pointer">
                    Show website in footer
                  </Label>
                </div>
                <Switch
                  id="footer_show_website"
                  checked={formData.footer_show_website}
                  onCheckedChange={(checked) => handleChange('footer_show_website', checked)}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Estimate Settings */}
      <Card>
        <Collapsible open={estimateOpen} onOpenChange={setEstimateOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {estimateOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Clock className="h-5 w-5 text-blue-500" />
                  <CardTitle>Estimate Settings</CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Estimates Only
                </Badge>
              </div>
              <CardDescription className="ml-9">
                Configure validity period and terms for estimates
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="estimate_validity_days">Default Validity Period (days)</Label>
                <Input
                  id="estimate_validity_days"
                  type="number"
                  min={1}
                  max={365}
                  value={formData.estimate_validity_days}
                  onChange={(e) => handleChange('estimate_validity_days', parseInt(e.target.value) || 30)}
                />
                <p className="text-xs text-muted-foreground">
                  Estimates will be valid for this many days from the issue date
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimate_terms">Terms Text</Label>
                <Textarea
                  id="estimate_terms"
                  value={formData.estimate_terms_text}
                  onChange={(e) => handleChange('estimate_terms_text', e.target.value)}
                  rows={2}
                  placeholder="This estimate is valid for {{validity_days}} days from the issue date."
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Invoice Settings */}
      <Card>
        <Collapsible open={invoiceOpen} onOpenChange={setInvoiceOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {invoiceOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  <CardTitle>Invoice Settings</CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Invoices Only
                </Badge>
              </div>
              <CardDescription className="ml-9">
                Configure payment terms and late fees for invoices
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="invoice_payment_terms">Payment Terms</Label>
                <Textarea
                  id="invoice_payment_terms"
                  value={formData.invoice_payment_terms}
                  onChange={(e) => handleChange('invoice_payment_terms', e.target.value)}
                  rows={2}
                  placeholder="Payment is due within 30 days of the invoice date."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_late_fee">Late Fee Text (optional)</Label>
                <Textarea
                  id="invoice_late_fee"
                  value={formData.invoice_late_fee_text}
                  onChange={(e) => handleChange('invoice_late_fee_text', e.target.value)}
                  rows={2}
                  placeholder="A late fee of 2% will be applied to overdue balances."
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Preview Section */}
      <Card className="border-violet-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-violet-500" />
            <CardTitle>Footer Preview</CardTitle>
          </div>
          <CardDescription>
            How the footer will appear on your documents (for estimates)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg border p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="text-center space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  {replaceTemplateVariables(formData.footer_thank_you_message, previewValues)}
                </h4>

                <div className="text-sm text-gray-600 space-y-2 max-w-2xl mx-auto">
                  <p>
                    {replaceTemplateVariables(formData.footer_confidentiality_text, previewValues)}
                  </p>
                  <p>
                    {replaceTemplateVariables(formData.footer_contact_text, previewValues)}
                  </p>
                  <p className="font-medium text-blue-700">
                    {replaceTemplateVariables(formData.estimate_terms_text, previewValues)}
                  </p>
                </div>

                {formData.footer_show_website && previewValues.website && (
                  <p className="text-sm text-gray-500 pt-2">
                    Visit us at {previewValues.website}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isResetting}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>

        <Button
          onClick={handleSave}
          disabled={isUpdating || !hasChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
