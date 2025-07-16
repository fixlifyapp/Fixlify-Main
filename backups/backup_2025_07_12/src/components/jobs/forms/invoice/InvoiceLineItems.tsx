
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { InvoiceFormValues } from "./schema";
import { Plus, Trash } from "lucide-react";

interface InvoiceLineItemsProps {
  form: UseFormReturn<InvoiceFormValues>;
  previousItems?: any[];
}

export const InvoiceLineItems = ({ form, previousItems }: InvoiceLineItemsProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const addItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, ourPrice: 0, taxable: true });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Items</h3>
        {previousItems && previousItems.length > 0 && (
          <span className="text-sm text-muted-foreground italic">
            Items loaded from previous estimate/invoice
          </span>
        )}
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-3 mb-4">
          <div className="col-span-3">
            <FormItem>
              {index === 0 && <FormLabel>Product Name</FormLabel>}
              <FormControl>
                <Input 
                  placeholder="Enter product name" 
                  {...form.register(`items.${index}.description`)}
                />
              </FormControl>
              {form.formState.errors.items?.[index]?.description && (
                <FormMessage>{form.formState.errors.items?.[index]?.description?.message}</FormMessage>
              )}
            </FormItem>
          </div>
          <div className="col-span-2">
            <FormItem>
              {index === 0 && <FormLabel>Quantity</FormLabel>}
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  step="1" 
                  {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </FormControl>
              {form.formState.errors.items?.[index]?.quantity && (
                <FormMessage>{form.formState.errors.items?.[index]?.quantity?.message}</FormMessage>
              )}
            </FormItem>
          </div>
          <div className="col-span-2">
            <FormItem>
              {index === 0 && <FormLabel>Client Price ($)</FormLabel>}
              <FormControl>
                <Input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
              </FormControl>
              {form.formState.errors.items?.[index]?.unitPrice && (
                <FormMessage>{form.formState.errors.items?.[index]?.unitPrice?.message}</FormMessage>
              )}
            </FormItem>
          </div>
          <div className="col-span-2">
            <FormItem>
              {index === 0 && <FormLabel>Our Price ($)</FormLabel>}
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  {...form.register(`items.${index}.ourPrice`, { valueAsNumber: true })}
                  className="bg-yellow-50"
                  title="Internal use only - not shown on invoice"
                />
              </FormControl>
              {form.formState.errors.items?.[index]?.ourPrice && (
                <FormMessage>{form.formState.errors.items?.[index]?.ourPrice?.message}</FormMessage>
              )}
              {index === 0 && (
                <p className="text-xs text-muted-foreground italic">Internal only - not visible to client</p>
              )}
            </FormItem>
          </div>
          <div className="col-span-2">
            <FormItem className="flex flex-row items-end space-x-3 pt-6">
              {index === 0 && <div className="absolute -top-6 text-sm font-medium">Taxable</div>}
              <FormControl>
                <Checkbox
                  checked={form.watch(`items.${index}.taxable`)}
                  onCheckedChange={(checked) => {
                    form.setValue(`items.${index}.taxable`, Boolean(checked));
                  }}
                />
              </FormControl>
              <div className="text-sm">
                {form.watch(`items.${index}.taxable`) ? 'Yes' : 'No'}
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => remove(index)}
                className="text-fixlyfy-text-secondary ml-3"
                disabled={fields.length <= 1}
              >
                <Trash size={18} />
              </Button>
            </FormItem>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-1"
          onClick={addItem}
        >
          <Plus size={16} />
          <span>Add Item</span>
        </Button>
      </div>
    </div>
  );
};
