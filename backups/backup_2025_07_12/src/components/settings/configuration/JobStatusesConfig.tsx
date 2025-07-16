
import { ConfigItemCard } from "./ConfigItemCard";
import { useJobStatuses } from "@/hooks/useConfigItems";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import * as z from "zod";

const jobStatusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  sequence: z.number().min(1, "Sequence must be at least 1"),
  is_default: z.boolean().optional(),
});

export function JobStatusesConfig() {
  const {
    items: jobStatuses,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage,
    refreshItems
  } = useJobStatuses();

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
        name="sequence"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sequence Order</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                value={field.value || 0} 
                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
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
                Set as default status
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );

  const getInitialValues = (item?: any) => {
    if (!item) {
      return { sequence: 1 };
    }
    return item;
  };

  return (
    <ConfigItemCard
      title="Job Statuses"
      description="Manage job statuses for the job workflow"
      items={jobStatuses.sort((a, b) => (a.sequence || 0) - (b.sequence || 0))}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={(item) => {
        // Prevent updating default statuses
        if (item.is_default) {
          toast.error("Default job statuses cannot be modified");
          return Promise.resolve();
        }
        return updateItem(item);
      }}
      onDelete={(id) => {
        // Find the status being deleted
        const status = jobStatuses.find(s => s.id === id);
        if (status?.is_default) {
          toast.error("Default job statuses cannot be deleted");
          return Promise.resolve();
        }
        return deleteItem(id);
      }}
      refreshItems={refreshItems}
      renderCustomColumns={(status) => (
        <div className="flex flex-col">
          <span className="text-sm">Sequence: {status.sequence || 0}</span>
          {status.is_default && (
            <span className="text-sm text-green-600 font-medium">Default (Protected)</span>
          )}
        </div>
      )}
      schema={jobStatusSchema}
      itemDialogFields={renderItemDialogFields}
      getInitialValues={getInitialValues}
      disableEdit={(item) => item.is_default}
      disableDelete={(item) => item.is_default}
    />
  );
}
