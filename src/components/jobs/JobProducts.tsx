
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";

interface JobProductsProps {
  jobId: string;
}

interface ProductInsertResult {
  success: boolean;
  inserted_count?: number;
  business_niche?: string;
  message?: string;
  product_count?: number;
}

export const JobProducts = ({ jobId }: JobProductsProps) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNiche, setIsLoadingNiche] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNicheProducts = async () => {
    if (!user) return;

    try {
      setIsLoadingNiche(true);
      
      // Call the RPC function to load niche-specific products
      const { data, error } = await supabase.rpc('load_my_niche_products');

      if (error) throw error;

      // Type assertion with proper checking
      const result = data as unknown;
      
      if (typeof result === 'object' && result !== null) {
        const typedResult = result as ProductInsertResult;
        
        if (typedResult.success && typedResult.inserted_count) {
          toast.success(`Added ${typedResult.inserted_count} products for ${typedResult.business_niche}`);
        } else if (typedResult.message && typedResult.product_count !== undefined) {
          toast.info(`${typedResult.message} (${typedResult.product_count} products for ${typedResult.business_niche})`);
        } else {
          toast.success('Products updated successfully');
        }
      } else {
        toast.success('Products loaded successfully');
      }

      // Refresh the products list
      fetchProducts();
    } catch (error) {
      console.error('Error loading niche products:', error);
      toast.error('Failed to load niche products');
    } finally {
      setIsLoadingNiche(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products & Services
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadNicheProducts}
              disabled={isLoadingNiche}
            >
              {isLoadingNiche ? 'Loading...' : 'Load Niche Products'}
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products added yet</p>
            <p className="text-sm">Add products to use in estimates and invoices</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{product.category}</Badge>
                      <span className="font-medium">${product.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
