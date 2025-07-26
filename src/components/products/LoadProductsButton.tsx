import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface LoadProductsButtonProps {
  onProductsLoaded?: () => void;
}

export const LoadProductsButton = ({ onProductsLoaded }: LoadProductsButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadResult, setLoadResult] = useState<any>(null);
  const { user } = useAuth();

  const handleLoadProducts = async () => {
    if (!user) {
      toast.error("You must be logged in to load products");
      return;
    }

    setIsLoading(true);
    setLoadResult(null);

    try {
      // Call the server function to load products
      const { data, error } = await supabase.rpc('load_my_niche_products');

      if (error) {
        console.error('Error loading products:', error);
        toast.error(`Failed to load products: ${error.message}`);
        setLoadResult({ success: false, error: error.message });
        return;
      }

      setLoadResult(data);

      if ((data as any)?.success) {
        toast.success(
          (data as any)?.message || `Successfully loaded ${(data as any)?.inserted_count || 0} products for ${(data as any)?.business_niche}`
        );
        
        // Call callback if provided
        if (onProductsLoaded) {
          onProductsLoaded();
        }
      } else {
        toast.error('Failed to load products. Please check your business niche settings.');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred while loading products');
      setLoadResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // If products already exist, show a different message
  if (loadResult?.message?.includes('already exist')) {
    return (
      <Alert className="mb-4">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          You already have {loadResult.product_count} products loaded for your {loadResult.business_niche} business.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {!loadResult && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            If you don't see any products, click the button below to load the default products for your business niche.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleLoadProducts}
        disabled={isLoading}
        variant="outline"
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Products...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Load Products for My Business
          </>
        )}
      </Button>

      {loadResult && !loadResult.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {loadResult.error || 'Failed to load products. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {loadResult && loadResult.success && loadResult.inserted_count > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Successfully loaded {loadResult.inserted_count} products for your {loadResult.business_niche} business!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
