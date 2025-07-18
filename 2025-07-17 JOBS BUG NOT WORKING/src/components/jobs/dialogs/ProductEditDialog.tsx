
import React, { useState, useEffect } from "react";
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
import { ProductEditDialogProps } from "./ProductEditDialogProps";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ProductEditDialog = ({
  open,
  onOpenChange,
  product,
  onSave,
  categories = []
}: ProductEditDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [ourPrice, setOurPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);

  // Default categories if none provided
  const defaultCategories = [
    "Maintenance Plans",
    "Repairs", 
    "Parts",
    "Services",
    "Warranty",
    "Accessories"
  ];

  const availableCategories = categories.length > 0 ? categories : defaultCategories;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setCategory(product.category || "");
      setPrice(product.price);
      setOurPrice(product.ourPrice || product.ourprice || product.cost || 0);
      setTaxable(product.taxable !== undefined ? product.taxable : true);
    } else {
      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setPrice(0);
      setOurPrice(0);
      setTaxable(true);
    }
  }, [product, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }
    
    const updatedProduct: Product = {
      id: product?.id || '',
      name,
      description,
      category,
      price,
      ourPrice,
      ourprice: ourPrice, // For database compatibility
      cost: ourPrice,
      taxable,
      quantity: 1,
      tags: []
    };
    
    await onSave(updatedProduct);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

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
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="product-our-price">Our Price ($)</Label>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="taxable">Taxable Item</Label>
            <Switch
              id="taxable"
              checked={taxable}
              onCheckedChange={setTaxable}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
