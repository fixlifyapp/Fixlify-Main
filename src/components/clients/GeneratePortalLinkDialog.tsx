
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Link, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratePortalLinkDialogProps {
  clientId: string;
  clientName: string;
  children: React.ReactNode;
}

const GeneratePortalLinkDialog: React.FC<GeneratePortalLinkDialogProps> = ({
  clientId,
  clientName,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [hoursValid, setHoursValid] = useState('24');
  const [domainRestriction, setDomainRestriction] = useState('');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowUploads, setAllowUploads] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    try {
      // Call the generate portal link function
      const { data, error } = await supabase.rpc('generate_portal_access_link', {
        p_client_id: clientId,
        p_hours_valid: parseInt(hoursValid),
        p_domain: domainRestriction || null,
        p_permissions: {
          downloads: allowDownloads,
          uploads: allowUploads
        }
      });

      if (error) throw error;

      const baseUrl = window.location.origin;
      const portalLink = `${baseUrl}/portal/${data}`;
      setGeneratedLink(portalLink);
      toast.success('Portal link generated successfully!');
    } catch (error) {
      console.error('Error generating portal link:', error);
      toast.error('Failed to generate portal link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const openLink = () => {
    window.open(generatedLink, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Portal Link</DialogTitle>
          <DialogDescription>
            Create a secure access link for {clientName} to view their documents and project details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="hours-valid">Link Valid For (Hours)</Label>
            <Select value={hoursValid} onValueChange={setHoursValid}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Hour</SelectItem>
                <SelectItem value="6">6 Hours</SelectItem>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="72">3 Days</SelectItem>
                <SelectItem value="168">1 Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="domain-restriction">Domain Restriction (Optional)</Label>
            <Input
              id="domain-restriction"
              value={domainRestriction}
              onChange={(e) => setDomainRestriction(e.target.value)}
              placeholder="example.com"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-downloads">Allow Downloads</Label>
              <Switch
                id="allow-downloads"
                checked={allowDownloads}
                onCheckedChange={setAllowDownloads}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-uploads">Allow Uploads</Label>
              <Switch
                id="allow-uploads"
                checked={allowUploads}
                onCheckedChange={setAllowUploads}
              />
            </div>
          </div>

          {!generatedLink ? (
            <Button 
              onClick={generateLink} 
              disabled={isGenerating}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Portal Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm break-all">{generatedLink}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyLink} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={openLink} variant="outline" className="flex-1">
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

export default GeneratePortalLinkDialog;
