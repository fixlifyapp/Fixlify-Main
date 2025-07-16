
import { ConfigItemCard } from "./ConfigItemCard";
import { useTags } from "@/hooks/useConfigItems";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import * as z from "zod";

const TAG_CATEGORIES = [
  "General",
  "Service Type",
  "Equipment",
  "Location",
  "Status",
  "Customer Type"
];

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  color: z.string().optional(),
});

export function TagsConfig() {
  const {
    items: tags,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage,
    refreshItems
  } = useTags();

  const renderItemDialogFields = ({ form }: { form: any; fieldType?: string }) => (
    <>
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TAG_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </>
  );

  const getInitialValues = (item?: any) => {
    if (!item) {
      return { category: 'General' };
    }
    return item;
  };

  return (
    <ConfigItemCard
      title="Tags"
      description="Manage tags used throughout the application"
      items={tags}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      refreshItems={refreshItems}
      renderCustomColumns={(tag) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {tag.category || 'General'}
          </span>
        </div>
      )}
      schema={tagSchema}
      itemDialogFields={renderItemDialogFields}
      getInitialValues={getInitialValues}
    />
  );
}
