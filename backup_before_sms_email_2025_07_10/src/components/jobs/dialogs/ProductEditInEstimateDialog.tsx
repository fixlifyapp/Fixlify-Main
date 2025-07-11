
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Product } from "../builder/types";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductEditInEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

export const ProductEditInEstimateDialog = ({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductEditInEstimateDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [ourPrice, setOurPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setCategory(product.category || "");
      setPrice(product.price);
      setOurPrice(product.ourPrice || product.ourprice || product.cost || 0);
      setQuantity(product.quantity || 1);
      setTaxable(product.taxable !== undefined ? product.taxable : true);
      setTags(product.tags || []);
    } else {
      // Default values
      setName("");
      setDescription("");
      setCategory("");
      setPrice(0);
      setOurPrice(0);
      setQuantity(1);
      setTaxable(true);
      setTags([]);
    }
    setNewTag("");
  }, [product, open]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }
    
    if (!product) {
      toast.error("No product to edit");
      return;
    }
    
    const updatedProduct: Product = {
      ...product,
      name,
      description,
      category,
      price,
      quantity,
      cost: ourPrice, // Set cost to ourPrice
      ourPrice,
      ourprice: ourPrice, // For database compatibility
      taxable,
      tags
    };
    
    onSave(updatedProduct);
    toast.success("Product updated in estimate");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Calculate profit margin
  const margin = price - ourPrice;
  const marginPercentage = price > 0 ? (margin / price) * 100 : 0;

  // Categories list (typically you would fetch this from your backend)
  const categories = [
    "Maintenance Plans",
    "Repairs",
    "Parts",
    "Services",
    "Warranty",
    "Accessories"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow px-6 py-4 max-h-[60vh] overflow-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Input
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price">Customer Price ($)</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-our-price">
                  Our Price ($) <span className="text-sm text-muted-foreground">(Internal)</span>
                </Label>
                <Input
                  id="product-our-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={ourPrice}
                  onChange={(e) => setOurPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-md border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profit Margin:</span>
                <span className="font-medium">${margin.toFixed(2)} ({marginPercentage.toFixed(0)}%)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-quantity">Quantity</Label>
              <Input
                id="product-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="taxable" className="cursor-pointer">Taxable Item</Label>
              <Switch
                id="taxable"
                checked={taxable}
                onCheckedChange={setTaxable}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="product-tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tag and press Enter"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
