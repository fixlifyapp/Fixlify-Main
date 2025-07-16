import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientEstimateView } from "@/components/jobs/estimates/ClientEstimateView";
import { Estimate } from "@/hooks/useEstimates";

const EstimateViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!id) {
        setError("No estimate ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch estimate data
        const { data: estimateData, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', id)
          .single();

        if (estimateError) {
          throw estimateError;
        }

        // Fetch related job data to get client info
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*, clients(*)')
          .eq('id', estimateData.job_id)
          .single();

        if (jobError) {
          console.warn('Could not fetch job data:', jobError);
        }

        // Fetch line items
        const { data: lineItems, error: lineItemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', id)
          .eq('parent_type', 'estimate');

        if (lineItemsError) {
          throw lineItemsError;
        }

        // Map line items to estimate format
        const items = lineItems?.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          taxable: item.taxable,
          total: item.quantity * item.unit_price
        })) || [];

        // Create estimate object
        const estimateWithItems: Estimate = {
          ...estimateData,
          number: estimateData.estimate_number,
          amount: estimateData.total,
          date: estimateData.created_at,
          status: estimateData.status as Estimate['status'], // Cast to proper type
          items: items
        };

        setEstimate(estimateWithItems);
      } catch (err: any) {
        console.error('Error fetching estimate:', err);
        setError(err.message || 'Failed to fetch estimate');
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !estimate) {
    return (
      <PageLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground mt-2">{error || 'Estimate not found'}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ClientEstimateView estimate={estimate} />
    </PageLayout>
  );
};

export default EstimateViewPage;
