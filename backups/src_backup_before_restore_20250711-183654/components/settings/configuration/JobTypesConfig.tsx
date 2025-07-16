
import { ConfigItemCard } from "./ConfigItemCard";
import { useJobTypes } from "@/hooks/useConfigItems";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import * as z from "zod";

const jobTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  is_default: z.boolean().optional(),
});

export function JobTypesConfig() {
  const {
    items: jobTypes,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage,
    refreshItems
  } = useJobTypes();

  const renderItemDialogFields = ({ form }: { form: any; fieldType?: string }) => (
    <>
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (optional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter description" />
            </FormControl>
          </FormItem>
        )}
      />
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
      <FormField
        control={form.control}
        name="is_default"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Set as default job type
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );

  return (
    <ConfigItemCard
      title="Job Types"
      description="Manage job types used when creating jobs"
      items={jobTypes}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      refreshItems={refreshItems}
      renderCustomColumns={(type) => (
        <span className="text-sm">
          {type.is_default ? 'Default' : ''}
        </span>
      )}
      schema={jobTypeSchema}
      itemDialogFields={renderItemDialogFields}
    />
  );
}
