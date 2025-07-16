
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator,
  Package,
  Edit
} from 'lucide-react';
import { LineItem, Product } from '../../builder/types';
import { ProductCatalog } from '../../builder/ProductCatalog';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { CustomItemForm } from './components/CustomItemForm';
import { LineItemsTable } from './components/LineItemsTable';
import { DocumentTotals } from './components/DocumentTotals';
import { NotesSection } from './components/NotesSection';

interface LineItemsManagerProps {
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onLineItemsChange: (items: LineItem[]) => void;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  documentType: 'estimate' | 'invoice';
}

export const LineItemsManager = ({
  lineItems,
  notes,
  onLineItemsChange,
  onNotesChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  documentType
}: LineItemsManagerProps) => {
  
  const handleAddLineItem = (newItem: LineItem) => {
    console.log('LineItemsManager: Adding line item:', newItem);
    const updatedItems = [...lineItems, newItem];
    console.log('LineItemsManager: Updated items list:', updatedItems);
    onLineItemsChange(updatedItems);
    toast.success(`Item added to ${documentType}`);
  };

  const handleProductSelect = (product: Product) => {
    console.log('LineItemsManager: Adding product:', product);
    
    // Create line item with product data including ourPrice
    const lineItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      ourPrice: product.ourPrice || product.ourprice || product.cost || 0,
      taxable: product.taxable !== undefined ? product.taxable : true,
      total: product.price,
      name: product.name,
      price: product.price
    };
    
    handleAddLineItem(lineItem);
    toast.success(`${product.name} added to ${documentType}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Add Items & Services
        </h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Total: {formatCurrency(calculateGrandTotal())}
        </Badge>
      </div>

      {/* Add Items Options */}
      <Card>
        <CardHeader>
          <CardTitle>Add Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Add Custom Item
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Add from Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="mt-4">
              <CustomItemForm onAddItem={handleAddLineItem} />
            </TabsContent>

            <TabsContent value="products" className="mt-4">
              <div className="border rounded-lg p-4">
                <ProductCatalog onAddProduct={handleProductSelect} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Line Items List */}
      <LineItemsTable
        lineItems={lineItems}
        onRemoveLineItem={onRemoveLineItem}
        onUpdateLineItem={onUpdateLineItem}
      />

      {/* Totals Section - only show if there are line items */}
      {lineItems.length > 0 && (
        <Card>
          <CardContent>
            <DocumentTotals
              calculateSubtotal={calculateSubtotal}
              calculateTotalTax={calculateTotalTax}
              calculateGrandTotal={calculateGrandTotal}
            />
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <NotesSection notes={notes} onNotesChange={onNotesChange} />
    </div>
  );
};
