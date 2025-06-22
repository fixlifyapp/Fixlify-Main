import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  FileText, 
  Calculator,
  Save,
  ArrowRight
} from 'lucide-react';
import { useUnifiedDocumentBuilder } from './unified/useUnifiedDocumentBuilder';
import { Estimate } from '@/hooks/useEstimates';
import { Invoice } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useEstimates } from '@/hooks/useEstimates';

export type DocumentType = 'estimate' | 'invoice';

interface UnifiedDocumentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  onDocumentCreated?: (document?: Estimate | Invoice) => void;
}

export const UnifiedDocumentBuilder = ({
  open,
  onOpenChange,
  documentType,
  existingDocument,
  jobId,
  onDocumentCreated
}: UnifiedDocumentBuilderProps) => {
  const { convertEstimateToInvoice } = useEstimates(jobId);
  
  const {
    formData,
    jobData,
    lineItems,
    taxRate,
    notes,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveDocumentChanges
  } = useUnifiedDocumentBuilder({
    documentType,
    existingDocument,
    jobId,
    open
  });

  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemOurPrice, setNewItemOurPrice] = useState(0);
  const [newItemTaxable, setNewItemTaxable] = useState(true);

  const handleAddLineItem = () => {
    if (!newItemDescription.trim() || newItemPrice <= 0) {
      toast.error('Please enter valid item details');
      return;
    }

    const newItem = {
      id: `temp-${Date.now()}`,
      description: newItemDescription,
      quantity: newItemQuantity,
      unitPrice: newItemPrice,
      ourPrice: newItemOurPrice,
      taxable: newItemTaxable,
      discount: 0,
      name: newItemDescription,
      price: newItemPrice,
      total: newItemQuantity * newItemPrice
    };

    setLineItems(prev => [...prev, newItem]);
    
    // Reset form
    setNewItemDescription('');
    setNewItemQuantity(1);
    setNewItemPrice(0);
    setNewItemOurPrice(0);
    setNewItemTaxable(true);
    
    console.log('Added new line item:', newItem);
  };

  const handleSave = async () => {
    console.log('Saving document:', { documentType, lineItems, notes });
    
    if (lineItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      const savedDocument = await saveDocumentChanges();
      if (savedDocument && onDocumentCreated) {
        onDocumentCreated(savedDocument);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  const handleConvert = async () => {
    console.log('Converting estimate to invoice');
    if (documentType !== 'estimate' || !existingDocument) return;
    
    try {
      const success = await convertEstimateToInvoice(existingDocument.id);
      if (success) {
        toast.success('Estimate converted to invoice successfully');
        if (onDocumentCreated) {
          // We don't have the new invoice object here, so just trigger a refresh
          onDocumentCreated();
        }
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('Failed to convert to invoice');
    }
  };

  const isEstimate = documentType === 'estimate';
  const title = isEstimate 
    ? (existingDocument ? 'Edit Estimate' : 'Create Estimate')
    : (existingDocument ? 'Edit Invoice' : 'Create Invoice');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEstimate ? (
                <FileText className="h-6 w-6 text-blue-600" />
              ) : (
                <DollarSign className="h-6 w-6 text-green-600" />
              )}
              <div>
                <DialogTitle className="text-xl">{title}</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {jobData?.title || 'Service Request'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {formData.documentNumber || `${isEstimate ? 'EST' : 'INV'}-NEW`}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 p-1">
          {/* Line Items Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Items & Services
            </h3>

            {/* Add New Item Form */}
            <div className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="col-span-4">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Service or product description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="quantity">Qty</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="price">Customer Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="ourPrice">Our Price</Label>
                <Input
                  id="ourPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItemOurPrice}
                  onChange={(e) => setNewItemOurPrice(parseFloat(e.target.value) || 0)}
                  className="bg-yellow-50"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="taxable">Taxable</Label>
                <Select value={newItemTaxable.toString()} onValueChange={(value) => setNewItemTaxable(value === 'true')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 flex items-end">
                <Button onClick={handleAddLineItem} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Line Items List */}
            {lineItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Customer Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Our Price</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Taxable</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <Input
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            className="border-0 p-0 h-auto bg-transparent"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.ourPrice || 0}
                            onChange={(e) => handleUpdateLineItem(item.id, 'ourPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 text-right bg-yellow-50"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Select 
                            value={item.taxable.toString()} 
                            onValueChange={(value) => handleUpdateLineItem(item.id, 'taxable', value === 'true')}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          <div>
                            <div>{formatCurrency(item.quantity * item.unitPrice)}</div>
                            {item.ourPrice && item.ourPrice > 0 && (
                              <div className="text-xs text-green-600">
                                M: {formatCurrency((item.unitPrice - item.ourPrice) * item.quantity)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (13%):</span>
                <span>{formatCurrency(calculateTotalTax())}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(calculateGrandTotal())}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting || lineItems.length === 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : `Save ${isEstimate ? 'Estimate' : 'Invoice'}`}
            </Button>

            {isEstimate && existingDocument && (
              <Button 
                onClick={handleConvert} 
                disabled={isSubmitting}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4" />
                Convert to Invoice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
