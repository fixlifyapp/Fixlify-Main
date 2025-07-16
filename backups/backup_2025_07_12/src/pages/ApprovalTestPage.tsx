
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ExternalLink, TestTube } from "lucide-react";
import { toast } from "sonner";

const ApprovalTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [approvalLink, setApprovalLink] = useState("");
  const [formData, setFormData] = useState({
    documentType: "estimate" as "estimate" | "invoice",
    documentNumber: "EST-001",
    clientName: "Cris Palmer",
    clientEmail: "boomymarketing.com@gmail.com",
    clientPhone: "+16474242323",
    total: "344.99"
  });

  const generateTestApprovalLink = async () => {
    try {
      setLoading(true);
      console.log("🧪 Generating test approval token...");

      // Generate a test UUID for document ID
      const testDocumentId = crypto.randomUUID();
      const testClientId = "C-1012";

      // Call the generate_approval_token function
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_approval_token', {
          p_document_type: formData.documentType,
          p_document_id: testDocumentId,
          p_document_number: formData.documentNumber,
          p_client_id: testClientId,
          p_client_name: formData.clientName,
          p_client_email: formData.clientEmail,
          p_client_phone: formData.clientPhone
        });

      if (tokenError || !tokenData) {
        console.error('❌ Failed to generate approval token:', tokenError);
        throw new Error('Failed to generate approval token');
      }

      const testApprovalLink = `https://hub.fixlify.app/approve/${tokenData}`;
      setApprovalLink(testApprovalLink);
      
      console.log('✅ Test approval token generated:', tokenData);
      console.log('🔗 Test approval link:', testApprovalLink);
      
      toast.success("Test approval link generated successfully!");
    } catch (error: any) {
      console.error("❌ Error generating test approval link:", error);
      toast.error(`Failed to generate test link: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (approvalLink) {
      navigator.clipboard.writeText(approvalLink);
      toast.success("Link copied to clipboard!");
    }
  };

  const openLink = () => {
    if (approvalLink) {
      window.open(approvalLink, '_blank');
    }
  };

  const testCurrentDomain = () => {
    const currentDomain = window.location.origin;
    const testLink = `${currentDomain}/approve/test-token-123`;
    window.open(testLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-blue-600" />
              Approval Link Test Page - Cris Palmer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p><strong>Purpose:</strong> Generate test approval links for Cris Palmer to debug the approval system.</p>
              <p><strong>Client ID:</strong> C-1012</p>
              <p><strong>Current Domain:</strong> {window.location.origin}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select 
                  value={formData.documentType} 
                  onValueChange={(value: "estimate" | "invoice") => 
                    setFormData(prev => ({ ...prev, documentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estimate">Estimate</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="total">Total Amount</Label>
                <Input
                  id="total"
                  value={formData.total}
                  onChange={(e) => setFormData(prev => ({ ...prev, total: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={generateTestApprovalLink}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Test Approval Link for Cris Palmer"}
            </Button>

            {approvalLink && (
              <div className="space-y-3">
                <Label>Generated Approval Link:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={approvalLink} 
                    readOnly 
                    className="text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={openLink}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Quick Tests:</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testCurrentDomain}
                  className="w-full"
                >
                  Test Current Domain (/approve/test-token-123)
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://hub.fixlify.app/approve/test-token-456', '_blank')}
                  className="w-full"
                >
                  Test hub.fixlify.app Domain
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Cris Palmer's Info:</strong></p>
              <p>• Name: {formData.clientName}</p>
              <p>• Email: {formData.clientEmail}</p>
              <p>• Phone: {formData.clientPhone}</p>
              <p>• Client ID: C-1012</p>
              <p>• Last Estimate: #175 ($344.99)</p>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Debug Info:</strong></p>
              <p>• Current URL: {window.location.href}</p>
              <p>• Origin: {window.location.origin}</p>
              <p>• Protocol: {window.location.protocol}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApprovalTestPage;
