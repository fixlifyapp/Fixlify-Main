
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { ProductCatalog } from "@/components/jobs/builder/ProductCatalog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash, Plus, Package, Pencil } from "lucide-react";
import { ProductEditInEstimateDialog } from "../dialogs/ProductEditInEstimateDialog";
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog";

interface EstimateProductSelectorProps {
  selectedProducts: any[];
  onAddProduct: (product: any) => void;
  onRemoveProduct: (productId: string) => void;
  onUpdateProduct?: (productId: string, updatedProduct: any) => void;
}

export function EstimateProductSelector({
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct
}: EstimateProductSelectorProps) {
  const { products, isLoading } = useProducts();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Calculate total estimate amount
  const estimateTotal = selectedProducts.reduce((sum, product) => 
    sum + product.price, 0
  );
  
  const handleOpenProductDialog = () => {
    setIsProductDialogOpen(true);
  };

  const handleProductSelect = (product: any) => {
    onAddProduct(product);
    setIsProductDialogOpen(false);
  };
  
  const handleEditProduct = (product: any) => {
    setProductToEdit(product);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateProduct = (updatedProduct: any) => {
    if (onUpdateProduct && updatedProduct.id) {
      onUpdateProduct(updatedProduct.id, updatedProduct);
    }
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteConfirmOpen(true);
  };
  
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      onRemoveProduct(productToDelete);
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Products & Services</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handleOpenProductDialog}
            >
              <Plus size={16} />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedProducts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </div>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className="text-[10px] py-0 h-4"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8"
                            title="Edit product"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(product.id)}
                            className="h-8 w-8"
                            title="Remove product"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">
                  ${estimateTotal.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p>No products added yet</p>
              <p className="text-sm">Click "Add Product" to add products to this estimate</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Product selection dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] p-4">
            <ProductCatalog
              onAddProduct={handleProductSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Product edit dialog for estimate-specific edits */}
      <ProductEditInEstimateDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={productToEdit}
        onSave={handleUpdateProduct}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DeleteConfirmDialog 
          title="Remove Product"
          description="Are you sure you want to remove this product from the estimate?"
          onOpenChange={setIsDeleteConfirmOpen}
          onConfirm={confirmDeleteProduct}
          isDeleting={false}
          confirmText="Remove"
        />
      </Dialog>
    </div>
  );
};
