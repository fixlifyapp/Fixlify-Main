
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Copy, Clock, Share } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratePortalLinkDialogProps {
  clientId: string;
  clientName: string;
  children: React.ReactNode;
}

export const GeneratePortalLinkDialog = ({ clientId, clientName, children }: GeneratePortalLinkDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentType, setDocumentType] = useState<'estimate' | 'invoice'>('estimate');
  const [documentId, setDocumentId] = useState('');
  const [expirationHours, setExpirationHours] = useState('24');
  const [generatedLink, setGeneratedLink] = useState('');

  const generatePortalLink = async () => {
    if (!documentId.trim()) {
      toast.error('Please enter a document ID');
      return;
    }

    setIsGenerating(true);
    try {
      // Use client-side generation since the edge function doesn't exist
      const accessToken = `token_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expirationHours));

      // Insert portal access record
      const { error: insertError } = await supabase
        .from('client_portal_access')
        .insert({
          access_token: accessToken,
          client_id: clientId,
          document_id: documentId,
          document_type: documentType,
          expires_at: expiresAt.toISOString(),
          max_uses: 10,
          permissions: {
            can_view: true,
            can_approve: documentType === 'estimate',
            can_pay: documentType === 'invoice'
          }
        });

      if (insertError) throw insertError;

      // Generate the portal link
      const baseUrl = window.location.origin;
      const portalLink = `${baseUrl}/portal/${accessToken}`;
      
      setGeneratedLink(portalLink);
      toast.success('Portal link generated successfully!');

    } catch (error: any) {
      console.error('Error generating portal link:', error);
      toast.error(`Failed to generate portal link: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setGeneratedLink('');
    setDocumentId('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share className="w-5 h-5" />
            <span>Generate Portal Link</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Generate a secure portal link for <strong>{clientName}</strong> to view their document.
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={(value: 'estimate' | 'invoice') => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentId">Document ID</Label>
              <Input
                id="documentId"
                placeholder="Enter document ID"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration">Link Expiration</Label>
              <Select value={expirationHours} onValueChange={setExpirationHours}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generatePortalLink}
              disabled={isGenerating || !documentId.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Generate Portal Link
                </>
              )}
            </Button>
          </div>

          {generatedLink && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Label>Generated Portal Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This link will expire in {expirationHours} hour{expirationHours !== '1' ? 's' : ''}.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
