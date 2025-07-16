
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, ArrowRight, Trash, Edit } from "lucide-react";
import { ProductCatalog } from "../builder/ProductCatalog";
import { Product } from "../builder/types";
import { ProductEditInEstimateDialog } from "../dialogs/ProductEditInEstimateDialog";

interface InvoiceProductSelectorProps {
  selectedProducts: any[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (id: string) => void;
  onUpdateProduct: (id: string, updatedProduct: any) => void;
}

export const InvoiceProductSelector = ({
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
}: InvoiceProductSelectorProps) => {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);

  const handleProductSelect = (product: Product) => {
    onAddProduct(product);
    setIsProductDialogOpen(false);
  };
  
  const handleEditProduct = (product: any) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description || product.name,
      category: "",
      price: product.unitPrice,
      cost: product.ourPrice || 0,
      ourPrice: product.ourPrice || 0,
      taxable: product.taxable,
      quantity: product.quantity,
      tags: []
    });
    setIsProductEditDialogOpen(true);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    if (selectedProduct) {
      onUpdateProduct(selectedProduct.id, {
        name: updatedProduct.name,
        description: updatedProduct.description,
        quantity: updatedProduct.quantity || 1,
        unitPrice: updatedProduct.price,
        ourPrice: updatedProduct.ourPrice || 0,
        taxable: updatedProduct.taxable
      });
    }
    setIsProductEditDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-4">
        <Button 
          onClick={() => setIsProductDialogOpen(true)}
          variant="outline"
          className="w-full justify-start"
        >
          <Plus className="mr-2" size={16} />
          Add products
        </Button>
      </div>

      {selectedProducts.length > 0 && (
        <div className="mt-6 border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 text-xs">
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-center w-16">Qty</th>
                <th className="px-4 py-2 text-right w-24">Price</th>
                <th className="px-4 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {selectedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && product.description !== product.name && (
                        <p className="text-xs text-muted-foreground">{product.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{product.quantity}</td>
                  <td className="px-4 py-3 text-right">${product.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onRemoveProduct(product.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
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

      <ProductEditInEstimateDialog
        open={isProductEditDialogOpen}
        onOpenChange={setIsProductEditDialogOpen}
        product={selectedProduct}
        onSave={handleProductUpdate}
      />
    </div>
  );
};
