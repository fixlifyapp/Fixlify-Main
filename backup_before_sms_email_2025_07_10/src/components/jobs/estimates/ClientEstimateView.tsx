
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Estimate } from "@/types/documents";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ClientEstimateViewProps {
  estimate: Estimate;
  showActions?: boolean;
  onApprove?: (estimate: Estimate) => void;
  onReject?: (estimate: Estimate) => void;
}

export const ClientEstimateView = ({
  estimate,
  showActions = false,
  onApprove,
  onReject
}: ClientEstimateViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lineItems, setLineItems] = useState<any[]>([]);

  useEffect(() => {
    fetchLineItems();
  }, [estimate.id]);

  const fetchLineItems = async () => {
    try {
      const { data: items, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', estimate.id);

      if (error) {
        console.error('Error fetching line items:', error);
        return;
      }

      setLineItems(items || []);
    } catch (error) {
      console.error('Error in fetchLineItems:', error);
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    
    setIsLoading(true);
    try {
      await onApprove(estimate);
      toast.success('Estimate approved successfully');
    } catch (error) {
      console.error('Error approving estimate:', error);
      toast.error('Failed to approve estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    
    setIsLoading(true);
    try {
      await onReject(estimate);
      toast.success('Estimate rejected');
    } catch (error) {
      console.error('Error rejecting estimate:', error);
      toast.error('Failed to reject estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxRate = 13; // 13% tax
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Estimate #{estimate.estimate_number}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusIcon(estimate.status)}
                <Badge className={getStatusColor(estimate.status)}>
                  {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(total)}
              </div>
              <div className="text-sm text-muted-foreground">
                Created {format(new Date(estimate.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={item.id || index} className="flex justify-between items-start p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.description}</h4>
                  <div className="text-sm text-muted-foreground mt-1">
                    Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </div>
                  {item.taxable && (
                    <div className="text-xs text-muted-foreground">Taxable</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({taxRate}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {estimate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{estimate.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {showActions && estimate.status === 'sent' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Estimate
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isLoading}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Estimate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
