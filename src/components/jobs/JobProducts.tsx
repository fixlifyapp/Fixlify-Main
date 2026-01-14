
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ProductEditDialog } from "./dialogs/ProductEditDialog";
import { Product } from "./builder/types";

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

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

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowEditDialog(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price || 0,
      ourPrice: product.ourprice || 0,
      taxable: product.taxable !== undefined ? product.taxable : true,
      quantity: 1,
      tags: product.tags || []
    });
    setShowEditDialog(true);
  };

  const handleSaveProduct = async (productData: Product) => {
    if (!user) return;

    try {
      const productRecord = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        ourprice: productData.ourPrice || 0,
        taxable: productData.taxable,
        user_id: user.id
      };

      if (selectedProduct?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productRecord)
          .eq('id', selectedProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productRecord);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      setShowEditDialog(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
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
            <Button onClick={handleAddProduct}>
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
              <Card
                key={product.id}
                className="hover:shadow-md hover:border-violet-200 transition-all cursor-pointer group"
                onClick={() => handleEditProduct(product)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{product.name}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* Product Edit Dialog */}
      <ProductEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={selectedProduct}
        onSave={handleSaveProduct}
        categories={categories}
      />
    </Card>
  );
};
