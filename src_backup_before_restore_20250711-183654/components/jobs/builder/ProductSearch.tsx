import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProducts, Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect: (product: Product) => void;
}

export const ProductSearch = ({ open, onOpenChange, onProductSelect }: ProductSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, categories, isLoading } = useProducts();

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    return products.filter(product => {
      const matchesSearch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === null || 
        (selectedCategory === "frequently-used" ? 
          ["prod-1", "prod-4", "prod-5"].includes(product.id) : 
          product.category === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Function to handle row click which now immediately adds the product and closes dialog
  const handleRowClick = useCallback((product: Product) => {
    onProductSelect(product);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedProduct(null);
  }, [onProductSelect, onOpenChange]);

  // Keep the original functions for backward compatibility
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleAddProduct = useCallback(() => {
    if (selectedProduct) {
      onProductSelect(selectedProduct);
      onOpenChange(false);
      setSelectedProduct(null);
      setSearchQuery("");
    }
  }, [selectedProduct, onProductSelect, onOpenChange]);
  
  // Keep the quick add function for the plus button
  const handleQuickAddProduct = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from selecting the product
    onProductSelect(product);
    onOpenChange(false);
    setSelectedProduct(null);
    setSearchQuery("");
  }, [onProductSelect, onOpenChange]);

  // Get frequently used products - in a real app this would come from analytics
  const frequentlyUsed = useMemo(() => products.slice(0, 3), [products]);

  // Reset search when dialog closes
  const handleDialogClose = useCallback((isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setSearchQuery("");
      setSelectedCategory(null);
      setSelectedProduct(null);
    }
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Select a Product</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="product-search" className="sr-only">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder="Search by name, description or tag..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={selectedCategory === "frequently-used" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("frequently-used")}
              className="rounded-full"
            >
              Frequently Used
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="border rounded-md overflow-hidden bg-white">
            {isLoading && products.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-16" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    (selectedCategory === "frequently-used" ? frequentlyUsed : filteredProducts).map((product) => (
                      <TableRow 
                        key={product.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(product)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.tags && product.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs py-0 px-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleQuickAddProduct(product, e)}
                            title="Quick add"
                          >
                            <Plus size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {isLoading ? "Loading products..." : "No products found matching your search."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        
        <DialogFooter className="border-t p-4">
          <Button variant="outline" onClick={() => handleDialogClose(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddProduct}
            disabled={!selectedProduct}
            className="gap-2"
          >
            <Plus size={16} />
            Add Selected Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
