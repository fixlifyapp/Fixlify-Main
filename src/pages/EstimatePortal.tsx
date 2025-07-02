import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle, Clock, FileText, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function EstimatePortal() {
  const { estimateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (estimateId) {
      loadEstimateData();
    }
  }, [estimateId]);

  const loadEstimateData = async () => {
    try {
      setLoading(true);
      
      // Load estimate
      const { data: estimateData, error: estimateError } = await supabase
        .from("estimates")
        .select("*")
        .eq("id", estimateId)
        .maybeSingle();

      if (estimateError || !estimateData) {
        throw new Error("Estimate not found");
      }

      setEstimate(estimateData);

      // Load job if exists
      if (estimateData.job_id) {
        const { data: jobData } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", estimateData.job_id)
          .maybeSingle();
        
        if (jobData) {
          setJob(jobData);
        }
      }

      // Load client if exists
      if (estimateData.client_id) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("*")
          .eq("id", estimateData.client_id)
          .maybeSingle();
        
        if (clientData) {
          setClient(clientData);
        }
      }
    } catch (error) {
      console.error("Error loading estimate:", error);
      toast({
        title: "Error",
        description: "Failed to load estimate details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download feature will be available soon. You can print this page using your browser's print function.",
    });
    window.print();
  };

  const handleAccept = () => {
    toast({
      title: "Coming Soon",
      description: "Online estimate acceptance will be available soon. Please contact us to accept this estimate.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading estimate...</p>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Estimate Not Found</h2>
            <p className="text-gray-600">The estimate you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lineItems = estimate.line_items || [];
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
  const taxAmount = parseFloat(estimate.tax_amount) || 0;
  const total = parseFloat(estimate.total) || subtotal + taxAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Estimate #{estimate.estimate_number}</h1>
              <p className="text-gray-600">Created on {format(new Date(estimate.created_at), "MMMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={estimate.status === 'accepted' ? 'default' : estimate.status === 'sent' ? 'secondary' : 'outline'}
              className="text-sm"
            >
              {estimate.status === 'accepted' && <CheckCircle className="h-4 w-4 mr-1" />}
              {estimate.status === 'sent' && <Clock className="h-4 w-4 mr-1" />}
              {estimate.status || 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">Estimate</CardTitle>
                {job && <p className="text-purple-100">Job: {job.title}</p>}
              </div>
              <div className="text-right">
                <Sparkles className="h-8 w-8 text-purple-300 ml-auto mb-2" />
                <p className="text-3xl font-bold">{formatCurrency(total)}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Client Info */}
            {client && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">{client.name}</p>
                  {client.email && <p>{client.email}</p>}
                  {client.phone && <p>{client.phone}</p>}
                  {client.address && (
                    <p>
                      {client.address}
                      {client.city && `, ${client.city}`}
                      {client.state && `, ${client.state}`}
                      {client.zip && ` ${client.zip}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {estimate.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600">{estimate.description}</p>
              </div>
            )}

            {/* Line Items */}
            {lineItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700 font-medium">Description</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-medium">Quantity</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-medium">Rate</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-600">{item.description}</td>
                          <td className="py-3 px-4 text-gray-600 text-right">{item.quantity || 1}</td>
                          <td className="py-3 px-4 text-gray-600 text-right">
                            {formatCurrency(item.rate || item.amount)}
                          </td>
                          <td className="py-3 px-4 text-gray-900 font-medium text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {estimate.notes && (
              <div className="mt-8 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-600 text-sm">{estimate.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              {estimate.status !== 'accepted' && (
                <Button 
                  onClick={handleAccept}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Estimate
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
