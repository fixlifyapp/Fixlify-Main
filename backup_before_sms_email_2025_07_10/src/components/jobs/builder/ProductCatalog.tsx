
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Search } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCatalogProps {
  onAddProduct: (product: Product) => void;
}

export const ProductCatalog = ({ onAddProduct }: ProductCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const { products, categories, isLoading } = useProducts();
  
  // Memoize filtered products to prevent unnecessary re-calculations
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      const matchesCategory = selectedCategory === null || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleSearchClick = () => {
    setShowProducts(true);
  };

  const handleProductAdd = (product: Product) => {
    onAddProduct(product);
    setShowProducts(false);
    setSearchQuery("");
    setSelectedCategory(null);
  };

  // Show loading state immediately when products are being loaded
  if (isLoading && products.length === 0) {
    return (
      <div className="border rounded-md overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h4 className="font-medium mb-4">Product Catalog</h4>
          <div className="space-y-3">
            <Skeleton className="w-full h-9" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full h-12" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h4 className="font-medium mb-4">Product Catalog</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-products" className="sr-only">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-products"
                placeholder="Click to search and add products..."
                className="pl-8 cursor-pointer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={handleSearchClick}
                onFocus={handleSearchClick}
              />
            </div>
          </div>

          {showProducts && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-xs h-7 px-2"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs h-7 px-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showProducts && (
        <div className="max-h-[300px] overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <ul className="divide-y">
              {filteredProducts.map(product => (
                <li 
                  key={product.id} 
                  className="p-3 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => handleProductAdd(product)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{product.name}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      <p className="text-xs mt-1 font-medium">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Edit product", product);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductAdd(product);
                        }}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-[10px] py-0 h-5 bg-muted/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isLoading ? (
                <div className="space-y-2">
                  <div>Loading products...</div>
                  <Skeleton className="w-full h-4" />
                </div>
              ) : (
                "No products found"
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
