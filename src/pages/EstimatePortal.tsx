import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle, Printer, Send, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DocumentHeader,
  DocumentItemsTable,
  DocumentTotals,
  DocumentNotes
} from "@/components/documents/DocumentComponents";

export default function EstimatePortal() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      loadEstimateData();
    }
  }, [token]);

  const loadEstimateData = async () => {
    try {
      setLoading(true);
      
      // Load estimate by portal access token
      const { data: estimateData, error: estimateError } = await supabase
        .from("estimates")
        .select("*")
        .eq("portal_access_token", token)
        .maybeSingle();

      if (estimateError || !estimateData) {
        throw new Error("Estimate not found or invalid access token");
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

      // Load company settings
      const { data: companyData } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (companyData) {
        setCompany({
          name: companyData.company_name,
          email: companyData.company_email,
          phone: companyData.company_phone,
          website: companyData.company_website,
          address: companyData.company_address,
          city: companyData.company_city,
          state: companyData.company_state,
          zip: companyData.company_zip,
          logo: companyData.company_logo_url
        });
      }
    } catch (error) {
      console.error("Error loading estimate:", error);
      toast.error("Failed to load estimate. Please check your link and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info("PDF download feature will be available soon. You can print this page using your browser's print function.");
    window.print();
  };

  const handleAccept = () => {
    toast.info("Online estimate acceptance will be available soon. Please contact us to accept this estimate.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading estimate...</p>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Estimate Not Found</h2>
            <p className="text-gray-600">The estimate you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const lineItems = estimate.items || [];
  // Filter out tax items from line items
  const productItems = lineItems.filter((item: any) => 
    !item.name?.toLowerCase().includes('tax') && 
    !item.description?.toLowerCase().includes('tax')
  );
  const subtotal = productItems.reduce((sum: number, item: any) => {
    const amount = parseFloat(item.total || item.amount || '0');
    return sum + amount;
  }, 0);
  const taxRate = parseFloat(estimate.tax_rate) || 0;
  const taxAmount = parseFloat(estimate.tax_amount) || (subtotal * taxRate / 100);
  const discountAmount = parseFloat(estimate.discount_amount) || 0;
  const total = parseFloat(estimate.total) || subtotal + taxAmount - discountAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Estimate #{estimate.estimate_number}
            </h1>
            <div className="flex items-center gap-3">
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
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with Company and Client Info */}
          <DocumentHeader
            type="estimate"
            documentNumber={estimate.estimate_number}
            date={estimate.created_at}
            status={estimate.status}
            company={company}
            client={client}
          />

          {/* Job Information */}
          {job && (
            <div className="px-8 py-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Job Reference</h3>
                  <p className="mt-1 text-lg text-gray-900">{job.title}</p>
                </div>
                {estimate.valid_until && (
                  <div className="text-right">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Valid Until</h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {new Date(estimate.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {estimate.description && (
            <div className="px-8 py-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{estimate.description}</p>
            </div>
          )}

          {/* Line Items */}
          {productItems.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Items</h3>
              <DocumentItemsTable items={productItems} />
            </div>
          )}

          {/* Totals and Notes */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Notes */}
              <div>
                {estimate.notes && (
                  <DocumentNotes
                    title="Notes"
                    content={estimate.notes}
                    type="info"
                  />
                )}
                {estimate.terms && (
                  <DocumentNotes
                    title="Terms & Conditions"
                    content={estimate.terms}
                    type="warning"
                  />
                )}
              </div>

              {/* Totals */}
              <div>
                <DocumentTotals
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  taxRate={taxRate}
                  discountAmount={discountAmount}
                  total={total}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center">
            <p className="text-sm">
              Thank you for considering our services. We look forward to working with you!
            </p>
            {company?.email && (
              <p className="text-sm mt-2 opacity-90">
                Questions? Contact us at {company.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
