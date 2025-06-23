
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Pencil, Search, X, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { ProductEditDialog } from "./dialogs/ProductEditDialog";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { useProducts, Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface JobProductsProps {
  jobId: string;
  onDeleteProduct?: (productId: string) => void;
}

export const JobProducts = ({ jobId, onDeleteProduct }: JobProductsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const { 
    products, 
    categories, 
    isLoading, 
    isDeleting,
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsCreateDialogOpen(true);
  };

  const handleSaveProduct = async (product: any) => {
    if (selectedProduct) {
      // Editing existing product
      await updateProduct(product.id, product);
    } else {
      // Creating new product
      // Make sure cost has a default value for new products
      const newProduct = {
        ...product,
        cost: product.cost ?? 0
      };
      await createProduct(newProduct);
    }
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (onDeleteProduct) {
      onDeleteProduct(productId);
    } else {
      setProductToDelete(productId);
      setIsDeleteConfirmOpen(true);
    }
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete);
      if (success) {
        setIsDeleteConfirmOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const getMarginPercentage = (product: Product) => {
    const margin = product.price - (product.ourPrice || 0);
    return margin > 0 ? ((margin / product.price) * 100).toFixed(0) : "0";
  };

  const getMarginColor = (percentage: number) => {
    if (percentage < 20) return "text-red-500";
    if (percentage < 40) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Product Catalog</h3>
          <Button onClick={handleCreateProduct} className="gap-2">
            <PlusCircle size={16} />
            New Product
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="search-products" className="sr-only">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-products"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Our Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags && product.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-[10px] py-0 h-5 bg-muted/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(product.ourPrice || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={getMarginColor(parseInt(getMarginPercentage(product)))}>
                      {getMarginPercentage(product)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.taxable ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No products found. Try adjusting your search or filters.</p>
          </div>
        )}
        
        <ProductEditDialog
          open={isEditDialogOpen || isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            setIsCreateDialogOpen(open);
          }}
          product={selectedProduct}
          onSave={handleSaveProduct}
          categories={categories}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DeleteConfirmDialog 
            title="Delete Product"
            description="Are you sure you want to delete this product? This action cannot be undone."
            onOpenChange={setIsDeleteConfirmOpen}
            onConfirm={confirmDeleteProduct}
            isDeleting={isDeleting}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
};
