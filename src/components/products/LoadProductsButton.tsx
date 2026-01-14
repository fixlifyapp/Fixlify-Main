import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { loadEnhancedNicheData } from "@/utils/enhanced-niche-data-loader";

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
      // Get user's business niche from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('business_niche')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.business_niche) {
        console.error('Error fetching profile:', profileError);
        toast.error('Please set your business type in settings first');
        setLoadResult({ success: false, error: 'Business niche not set' });
        return;
      }

      // Use client-side loader to load niche products
      const success = await loadEnhancedNicheData(profile.business_niche);

      if (success) {
        // Count products to show in result
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setLoadResult({
          success: true,
          business_niche: profile.business_niche,
          product_count: count || 0,
          message: `Products loaded for ${profile.business_niche}`
        });

        toast.success(`Successfully loaded products for ${profile.business_niche}`);

        // Call callback if provided
        if (onProductsLoaded) {
          onProductsLoaded();
        }
      } else {
        toast.error('Failed to load products. Please try again.');
        setLoadResult({ success: false, error: 'Loading failed' });
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
