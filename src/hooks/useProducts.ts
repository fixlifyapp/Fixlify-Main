import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  ourPrice?: number;
  taxable: boolean;
  tags?: string[];
  sku?: string;
  created_at?: string;
  updated_at?: string;
  // Advanced upsell fields
  cost_price?: number;       // For profit margin calculation
  is_featured?: boolean;     // Top seller / featured product
  conversion_hint?: string;  // Hint text like "High adoption rate"
}

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      // Only show loading if we don't have products yet
      if (products.length === 0) {
        setIsLoading(true);
      }
      
      try {
        let query = supabase
          .from('products')
          .select('*');
        
        // Filter by user_id to ensure data isolation
        if (user?.id) {
          query = query.eq('user_id', user.id);
        }
          
        if (category) {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw error;
        
        const formattedProducts = data?.map(item => ({
          ...item,
          ourPrice: item.ourprice || item.cost || 0
        })) || [];
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Only show toast error if this is the initial load
        if (products.length === 0) {
          toast.error('Failed to load products');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, refreshTrigger, user?.id]);

  // Get unique categories from products - memoized for performance
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [products]);

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Adding product:", product);
      
      // Transform ourPrice to ourprice for the database
      const dbProduct: any = {
        ...product,
        ourprice: product.ourPrice,
        user_id: user?.id,
        created_by: user?.id
      };
      
      // Remove ourPrice as it's not a column in the database
      delete dbProduct.ourPrice;
      
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform the returned data to include ourPrice
      const formattedProduct = {
        ...data,
        ourPrice: data.ourprice || data.cost || 0
      };
      
      setProducts(prev => [formattedProduct, ...prev]);
      toast.success('Product added successfully');
      return formattedProduct;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(`Failed to add product: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      // Transform ourPrice to ourprice for the database
      const dbUpdates: any = { ...updates };
      
      if ('ourPrice' in updates) {
        dbUpdates.ourprice = updates.ourPrice;
        delete dbUpdates.ourPrice;
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform the returned data to include ourPrice
      const formattedProduct = {
        ...data,
        ourPrice: data.ourprice || data.cost || 0
      };
      
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, ...formattedProduct } : product
      ));
      
      toast.success('Product updated successfully');
      return formattedProduct;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(`Failed to update product: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setIsDeleting(true);
      
      // Check for dependencies in line_items, not estimate_items
      const { data: lineItems, error: checkError } = await supabase
        .from('line_items')
        .select('id')
        .eq('id', id)
        .limit(1);
        
      if (checkError) throw checkError;
      
      // If product is used in any line items, warn the user
      if (lineItems && lineItems.length > 0) {
        toast.error('Cannot delete product as it is being used in estimates');
        return false;
      }
      
      // If no dependencies, proceed with deletion
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Alias addProduct to createProduct for backward compatibility
  const createProduct = addProduct;

  return {
    products,
    isLoading,
    isDeleting,
    categories,
    addProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: () => setRefreshTrigger(prev => prev + 1)
  };
};
