
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";

interface GeneratePortalLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export const GeneratePortalLinkDialog = ({ open, onOpenChange, clientId, clientName }: GeneratePortalLinkDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [hoursValid, setHoursValid] = useState(24);
  const [allowDocumentUpload, setAllowDocumentUpload] = useState(true);
  const [allowPayments, setAllowPayments] = useState(true);
  const [restrictToDomain, setRestrictToDomain] = useState(false);
  const [domainRestriction, setDomainRestriction] = useState("");

  const generatePortalLink = async () => {
    try {
      setIsGenerating(true);
      
      const permissions = {
        upload_documents: allowDocumentUpload,
        make_payments: allowPayments,
      };

      const { data, error } = await supabase.rpc('generate_portal_access_token', {
        p_client_id: clientId,
        p_permissions: permissions,
        p_hours_valid: hoursValid,
        p_domain: restrictToDomain ? domainRestriction : undefined,
      });

      if (error) throw error;

      const baseUrl = window.location.origin;
      const portalUrl = `${baseUrl}/client-portal/${clientId}?token=${data.token}`;
      setGeneratedLink(portalUrl);
      
      toast.success('Portal link generated successfully!');
    } catch (error) {
      console.error('Error generating portal link:', error);
      toast.error('Failed to generate portal link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const openInNewTab = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Portal Link for {clientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hours-valid">Hours Valid</Label>
            <Input
              id="hours-valid"
              type="number"
              value={hoursValid}
              onChange={(e) => setHoursValid(Number(e.target.value))}
              min={1}
              max={168}
              placeholder="24"
            />
            <p className="text-sm text-muted-foreground">
              Link will expire after this many hours (max 168 = 1 week)
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-uploads">Allow Document Upload</Label>
              <Switch
                id="allow-uploads"
                checked={allowDocumentUpload}
                onCheckedChange={setAllowDocumentUpload}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allow-payments">Allow Payments</Label>
              <Switch
                id="allow-payments"
                checked={allowPayments}
                onCheckedChange={setAllowPayments}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="restrict-domain">Restrict to Domain</Label>
              <Switch
                id="restrict-domain"
                checked={restrictToDomain}
                onCheckedChange={setRestrictToDomain}
              />
            </div>

            {restrictToDomain && (
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={domainRestriction}
                  onChange={(e) => setDomainRestriction(e.target.value)}
                  placeholder="example.com"
                />
              </div>
            )}
          </div>

          {!generatedLink ? (
            <Button onClick={generatePortalLink} disabled={isGenerating} className="w-full">
              {isGenerating ? 'Generating...' : 'Generate Portal Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium mb-2">Generated Portal Link:</p>
                <p className="text-sm break-all text-gray-600">{generatedLink}</p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={openInNewTab} variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Portal
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
