
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileText, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ApprovalData {
  id: string;
  approval_token: string;
  document_type: string;
  document_id: string;
  document_number: string;
  client_name: string;
  client_id: string;
  status: string;
  expires_at: string;
  estimate?: any;
  invoice?: any;
}

const ApprovalPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApprovalData();
  }, [token]);

  const fetchApprovalData = async () => {
    if (!token) {
      setError("No approval token provided");
      setLoading(false);
      return;
    }

    try {
      // First get the approval record with new RLS policies
      const { data: approval, error: approvalError } = await supabase
        .from('document_approvals')
        .select('*')
        .eq('approval_token', token)
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      if (approvalError) {
        setError("Failed to load approval data");
        setLoading(false);
        return;
      }

      if (!approval) {
        setError("Invalid or expired approval link");
        setLoading(false);
        return;
      }

      // Check if expired
      if (new Date(approval.expires_at) < new Date()) {
        setError("This approval link has expired");
        setLoading(false);
        return;
      }

      // Check if already processed
      if (approval.status !== 'pending') {
        setError(`This approval has already been ${approval.status}`);
        setLoading(false);
        return;
      }

      // Get document details based on type
      let documentData = null;
      if (approval.document_type === 'estimate') {
        const { data, error: docError } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', approval.document_id)
          .maybeSingle();
        
        if (docError) {
          console.warn("⚠️ Could not fetch estimate details:", docError);
        }
        documentData = { estimate: data };
      } else {
        const { data, error: docError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', approval.document_id)
          .maybeSingle();
        
        if (docError) {
          console.warn("⚠️ Could not fetch invoice details:", docError);
        }
        documentData = { invoice: data };
      }

      setApprovalData({ ...approval, ...documentData });

    } catch (error) {
      setError("An unexpected error occurred while loading the approval");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action: 'approved' | 'rejected') => {
    if (!approvalData || !token) return;

    setSubmitting(true);
    try {
      // Update approval record
      const { error: updateError } = await supabase
        .from('document_approvals')
        .update({
          status: action,
          client_response: comments,
          approved_at: new Date().toISOString(),
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent
        })
        .eq('approval_token', token);

      if (updateError) {
        throw new Error('Failed to update approval status');
      }

      // Update document status
      const tableName = approvalData.document_type === 'estimate' ? 'estimates' : 'invoices';
      const { error: docError } = await supabase
        .from(tableName)
        .update({ status: action })
        .eq('id', approvalData.document_id);

      // docError is non-critical since the approval was already processed

      toast.success(`${approvalData.document_type} ${action} successfully!`);

      // Redirect to success page
      navigate(`/approve/${token}/success?action=${action}`);

    } catch (error: any) {
      toast.error(`Failed to process your response: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading approval details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!approvalData) return null;

  const document = approvalData.estimate || approvalData.invoice;
  const isEstimate = approvalData.document_type === 'estimate';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            {isEstimate ? 'Estimate' : 'Invoice'} Approval
          </h1>
          <p className="text-gray-600 mt-2">
            Please review the {isEstimate ? 'estimate' : 'invoice'} below and provide your response
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{isEstimate ? 'Estimate' : 'Invoice'} #{approvalData.document_number}</span>
              <span className="text-2xl font-bold text-green-600">
                ${document?.total?.toFixed(2) || '0.00'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium text-gray-700">Client:</Label>
                <p className="text-gray-900">{approvalData.client_name}</p>
              </div>
              <div>
                <Label className="font-medium text-gray-700">
                  {isEstimate ? 'Valid Until:' : 'Due Date:'}
                </Label>
                <p className="text-gray-900">
                  {isEstimate 
                    ? document?.valid_until ? new Date(document.valid_until).toLocaleDateString() : 'N/A'
                    : document?.due_date ? new Date(document.due_date).toLocaleDateString() : 'N/A'
                  }
                </p>
              </div>
            </div>

            {document?.description && (
              <div>
                <Label className="font-medium text-gray-700">Description:</Label>
                <p className="text-gray-900 mt-1">{document.description}</p>
              </div>
            )}

            {document?.items && document.items.length > 0 && (
              <div>
                <Label className="font-medium text-gray-700">Items:</Label>
                <div className="mt-2 space-y-2">
                  {document.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.unit_price}</p>
                      </div>
                      <p className="font-medium">${(item.quantity * item.unit_price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">${document?.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments or questions..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleApproval('approved')}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {submitting ? 'Processing...' : `Approve ${isEstimate ? 'Estimate' : 'Invoice'}`}
              </Button>
              
              <Button
                onClick={() => handleApproval('rejected')}
                disabled={submitting}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <XCircle className="h-5 w-5 mr-2" />
                {submitting ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This approval link expires on {new Date(approvalData.expires_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;
