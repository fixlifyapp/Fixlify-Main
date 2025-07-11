
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { LineItem } from '../../../builder/types';
import { toast } from 'sonner';

interface CustomItemFormProps {
  onAddItem: (item: LineItem) => void;
}

export const CustomItemForm = ({ onAddItem }: CustomItemFormProps) => {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [ourPrice, setOurPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (unitPrice <= 0) {
      toast.error('Please enter a valid unit price');
      return;
    }

    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      description: description.trim(),
      quantity,
      unitPrice,
      ourPrice,
      taxable,
      total: quantity * unitPrice,
      name: description.trim(),
      price: unitPrice
    };

    onAddItem(newItem);
    
    // Reset form
    setDescription('');
    setQuantity(1);
    setUnitPrice(0);
    setOurPrice(0);
    setTaxable(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter item description"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="unitPrice">Customer Price ($)</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="ourPrice">Our Price ($)</Label>
          <Input
            id="ourPrice"
            type="number"
            min="0"
            step="0.01"
            value={ourPrice}
            onChange={(e) => setOurPrice(parseFloat(e.target.value) || 0)}
            className="bg-yellow-50"
            title="Internal use only"
          />
        </div>
        
        <div>
          <Label htmlFor="taxable">Taxable</Label>
          <Select value={taxable.toString()} onValueChange={(value) => setTaxable(value === 'true')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Item
      </Button>
    </form>
  );
};
