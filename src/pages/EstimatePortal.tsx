import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Job {
  id: string;
  title: string;
  client_id: string;
}

interface Estimate {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  valid_until: string;
  created_at: string;
  items: any[];
  job_id: string;
}

interface EstimateWithRelations extends Estimate {
  job?: Job;
  client?: Client;
}

export default function EstimatePortal() {
  const { estimateId } = useParams();
  const [estimate, setEstimate] = useState<EstimateWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEstimate();
  }, [estimateId]);

  const loadEstimate = async () => {
    try {
      // First, fetch the estimate
      const { data: estimateData, error: estimateError } = await supabase
        .from("estimates")
        .select("*")
        .eq("id", estimateId)
        .maybeSingle();

      if (estimateError) {
        console.error("Error loading estimate:", estimateError);
        throw estimateError;
      }

      if (!estimateData) {
        throw new Error("Estimate not found");
      }

      // Then fetch the job if we have a job_id
      let jobData = null;
      let clientData = null;

      if (estimateData.job_id) {
        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", estimateData.job_id)
          .maybeSingle();

        if (!jobError && job) {
          jobData = job;

          // Fetch the client if we have a client_id
          if (job.client_id) {
            const { data: client, error: clientError } = await supabase
              .from("clients")
              .select("*")
              .eq("id", job.client_id)
              .maybeSingle();

            if (!clientError && client) {
              clientData = client;
            }
          }
        }
      }

      // Combine the data
      const combinedData: EstimateWithRelations = {
        ...estimateData,
        job: jobData,
        client: clientData
      };
      
      setEstimate(combinedData);
    } catch (err: any) {
      console.error("Error loading estimate:", err);
      setError(err.message || "Failed to load estimate");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      const { error } = await supabase
        .from("estimates")
        .update({ status: "accepted" })
        .eq("id", estimateId);
      
      if (error) throw error;
      
      // Reload estimate
      await loadEstimate();
      alert("Estimate accepted successfully!");
    } catch (err: any) {
      alert("Failed to accept estimate: " + err.message);
    }
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert("PDF download coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              {error || "Estimate not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const client = estimate.client;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Estimate</h1>
          <p className="text-gray-600">Review and accept your service estimate</p>
        </div>

        {/* Estimate Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  Estimate #{estimate.estimate_number}
                </CardTitle>
                <p className="mt-2 opacity-90">
                  {client?.name || "Customer"}
                </p>
              </div>
              <Badge 
                className={
                  estimate.status === "accepted" 
                    ? "bg-green-100 text-green-800" 
                    : estimate.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {estimate.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Client Details */}
            {client && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Prepared For:</h3>
                <p className="font-medium">{client.name}</p>
                {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
              </div>
            )}

            {/* Estimate Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Estimate Date</p>
                <p className="font-medium">
                  {format(new Date(estimate.created_at), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium">
                  {estimate.valid_until 
                    ? format(new Date(estimate.valid_until), "MMM dd, yyyy")
                    : "30 days"
                  }
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.description || item.name}</p>
                        {item.quantity && (
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.price}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${(item.total || item.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 font-semibold">Total Estimate</td>
                    <td className="px-4 py-3 text-right font-semibold text-lg">
                      ${(estimate.total || 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {estimate.status === "draft" && (
                <Button 
                  onClick={handleAccept}
                  className="flex-1"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Accept Estimate
                </Button>
              )}
              <Button 
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className={estimate.status === "accepted" ? "flex-1" : ""}
              >
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
            </div>

            {estimate.status === "accepted" && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-800 font-medium">
                  ✓ This estimate has been accepted
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Powered by Fixlify • Business Automation Platform</p>
        </div>
      </div>
    </div>
  );
}