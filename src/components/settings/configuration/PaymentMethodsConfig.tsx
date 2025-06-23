import { ConfigItemCard } from "./ConfigItemCard";
import { usePaymentMethods } from "@/hooks/useConfigItems";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";

const paymentMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
});

export function PaymentMethodsConfig() {
  const {
    items: paymentMethods,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage,
    refreshItems
  } = usePaymentMethods();

  const renderItemDialogFields = ({ form }: { form: any; fieldType?: string }) => (
    <>
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Color</FormLabel>
            <div className="flex gap-4 items-center">
              <FormControl>
                <Input
                  type="color"
                  {...field}
                  className="w-12 h-8 p-1"
                  value={field.value || "#3b82f6"}
                />
              </FormControl>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || "#3b82f6"}
                  placeholder="#HEX"
                  className="w-full"
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </>
  );

  const getInitialValues = (item?: any) => {
    if (!item) {
      return { color: '#3b82f6' };
    }
    return item;
  };

  return (
    <ConfigItemCard
      title="Payment Methods"
      description="Manage payment methods available for transactions (8 default methods)"
      items={paymentMethods}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      refreshItems={refreshItems}
      renderCustomColumns={(method) => (
        <div className="flex items-center gap-2">
          {method.color && (
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: method.color }}
            />
          )}
        </div>
      )}
      schema={paymentMethodSchema}
      itemDialogFields={renderItemDialogFields}
      getInitialValues={getInitialValues}
    />
  );
} 