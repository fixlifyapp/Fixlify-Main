
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface JobProductsProps {
  jobId: string;
}

const JobProducts: React.FC<JobProductsProps> = ({ jobId }) => {
  const handleLoadProducts = async () => {
    try {
      const { data, error } = await supabase
        .rpc('load_my_niche_products');

      if (error) throw error;

      const result = data as any;
      
      if (result && typeof result === 'object') {
        if (result.success) {
          toast({
            description: `Added ${result.inserted_count || 0} products for ${result.business_niche || 'your business'}`
          });
        } else {
          toast({
            description: `${result.message || 'No products to add'}. Current count: ${result.product_count || 0} for ${result.business_niche || 'your business'}`
          });
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Job Products</h3>
        <Button onClick={handleLoadProducts}>
          Load Products
        </Button>
      </div>
      
      <div>
        <p className="text-gray-500">Product management for job {jobId}</p>
      </div>
    </div>
  );
};

export default JobProducts;
export { JobProducts };
