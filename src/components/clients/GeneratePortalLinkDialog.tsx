import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Mail, MessageSquare, ExternalLink, Settings } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratePortalLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
}

export const GeneratePortalLinkDialog = ({
  open,
  onOpenChange,
  clientId,
  clientName,
  clientEmail,
  clientPhone
}: GeneratePortalLinkDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [portalLink, setPortalLink] = useState<string>("");
  const [sendMethod, setSendMethod] = useState<"copy" | "email" | "sms">("copy");
  const [customMessage, setCustomMessage] = useState("");
  const [validHours, setValidHours] = useState(72);
  const [permissions, setPermissions] = useState({
    view_estimates: true,
    view_invoices: true,
    make_payments: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generatePortalLink = async () => {
    try {
      setIsGenerating(true);
      
      // Use the Supabase RPC function to generate portal access
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_portal_access', {
          p_client_id: clientId,
          p_permissions: permissions,
          p_hours_valid: validHours,
          p_domain_restriction: 'hub.fixlify.app'
        });

      if (tokenError || !tokenData) throw tokenError;
      
      // Generate the portal URL for hub.fixlify.app
      const portalUrl = `https://hub.fixlify.app/portal/${tokenData}`;
      setPortalLink(portalUrl);
      
      toast.success('Portal link generated successfully!');
    } catch (err: any) {
      console.error('Generate portal link error:', err);
      toast.error('Failed to generate portal link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalLink);
    toast.success('Link copied to clipboard!');
  };

  const sendPortalLink = async () => {
    if (!portalLink) return;

    try {
      const message = customMessage || `Hi ${clientName}! Access your secure client portal here: ${portalLink}`;

      // Get current user ID for message storage
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (sendMethod === "email" && clientEmail) {
        // Use send-email function for actual email sending
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: clientEmail,
            subject: 'Your Client Portal Access',
            html: `<p>${message}</p>`,
            client_id: clientId
          }
        });
        
        if (error) throw error;
        toast.success('Portal link sent via email!');
      } else if (sendMethod === "sms" && clientPhone) {
        const { error } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            recipientPhone: clientPhone,
            message,
            client_id: clientId,
            job_id: '',
            user_id: userId
          }
        });
        
        if (error) throw error;
        toast.success('Portal link sent via SMS!');
      }
      
      onOpenChange(false);
    } catch (err: any) {
      console.error('Send portal link error:', err);
      toast.error('Failed to send portal link');
    }
  };

  const openPortalLink = () => {
    if (portalLink) {
      window.open(portalLink, '_blank');
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Client Portal Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            Generate a secure access link for <strong>{clientName}</strong> to access their client portal at{" "}
            <span className="font-mono text-blue-600">hub.fixlify.app</span>
          </div>

          {!portalLink && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="validHours">Link Valid For (hours)</Label>
                  <Input
                    id="validHours"
                    type="number"
                    value={validHours}
                    onChange={(e) => setValidHours(parseInt(e.target.value) || 72)}
                    min="1"
                    max="168"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 72 hours (3 days)</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Client Permissions</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      {showAdvanced ? 'Hide' : 'Show'} Advanced
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="view_estimates"
                        checked={permissions.view_estimates}
                        onCheckedChange={(checked) => handlePermissionChange('view_estimates', checked as boolean)}
                      />
                      <Label htmlFor="view_estimates">View Estimates</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="view_invoices"
                        checked={permissions.view_invoices}
                        onCheckedChange={(checked) => handlePermissionChange('view_invoices', checked as boolean)}
                      />
                      <Label htmlFor="view_invoices">View Invoices</Label>
                    </div>

                    {showAdvanced && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="make_payments"
                          checked={permissions.make_payments}
                          onCheckedChange={(checked) => handlePermissionChange('make_payments', checked as boolean)}
                        />
                        <Label htmlFor="make_payments">Make Payments (Coming Soon)</Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={generatePortalLink}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Portal Link"}
              </Button>
            </>
          )}

          {portalLink && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <Input 
                    value={portalLink} 
                    readOnly 
                    className="text-xs"
                  />
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={openPortalLink}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  <p>Valid for {validHours} hours • Domain: hub.fixlify.app</p>
                  <p>Permissions: {Object.entries(permissions).filter(([_, value]) => value).map(([key]) => key.replace('_', ' ')).join(', ')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Send Method</Label>
                <RadioGroup value={sendMethod} onValueChange={(value: any) => setSendMethod(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="copy" id="copy" />
                    <Label htmlFor="copy">Copy to clipboard only</Label>
                  </div>
                  
                  {clientPhone && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Send via SMS ({clientPhone})
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </div>

              {sendMethod === "sms" && (
                <div className="space-y-2">
                  <Label>Custom Message (optional)</Label>
                  <Input
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={`Hi ${clientName}! Access your secure client portal here: ${portalLink}`}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                {sendMethod !== "copy" ? (
                  <Button onClick={sendPortalLink} className="flex-1">
                    Send Link
                  </Button>
                ) : (
                  <Button onClick={copyToClipboard} className="flex-1">
                    Copy Link
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
